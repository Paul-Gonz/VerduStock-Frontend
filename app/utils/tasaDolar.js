// resources/js/utils/tasaDolar.js
export class TasaDolarService {
    constructor() {
        this.baseUrl = 'https://ve.dolarapi.com';
        this.cacheTime = 5 * 60 * 1000; // 5 minutos en milisegundos
        this.cache = {
            data: null,
            timestamp: 0
        };
        this.tiposDisponibles = [
            'oficial', 'blue', 'bolsa', 'ccl', 
            'cripto', 'tarjeta', 'mayorista', 'solidario'
        ];
    }

    /**
     * Obtiene la tasa de cambio desde la API
     */
    async obtenerTasa(tipo = 'oficial') {
        // Verificar caché primero
        if (this.cache.data && 
            Date.now() - this.cache.timestamp < this.cacheTime &&
            this.cache.data.nombre === tipo) {
            console.log('📊 Usando tasa desde caché:', tipo);
            return this.cache.data;
        }

        try {
            const response = await fetch(`${this.baseUrl}/v1/dolares/${tipo}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Formatear los datos
            const tasaFormateada = {
                nombre: tipo,
                fuente: data.fuente || 'DolarAPI',
                compra: parseFloat(data.compra),
                venta: parseFloat(data.venta),
                promedio: parseFloat(data.promedio) || (parseFloat(data.compra) + parseFloat(data.venta)) / 2,
                fechaActualizacion: data.fechaActualizacion || new Date().toISOString(),
                timestamp: Date.now()
            };

            // Guardar en caché
            this.cache.data = tasaFormateada;
            this.cache.timestamp = Date.now();

            console.log('✅ Tasa actualizada desde API:', tasaFormateada);
            return tasaFormateada;

        } catch (error) {
            console.error('❌ Error obteniendo tasa:', error);
            
            // Si hay caché, devolverlo aunque esté expirado
            if (this.cache.data) {
                console.warn('⚠️ Usando tasa expirada por fallo de API');
                return this.cache.data;
            }
            
            // Si no hay nada, devolver tasa por defecto
            return {
                nombre: tipo,
                fuente: 'Fallback',
                compra: 1,
                venta: 1,
                promedio: 1,
                fechaActualizacion: new Date().toISOString(),
                esFallback: true
            };
        }
    }

    /**
     * Obtiene todas las tasas disponibles
     */
    async obtenerTodasLasTasas() {
        const tasas = {};
        
        for (const tipo of this.tiposDisponibles) {
            try {
                tasas[tipo] = await this.obtenerTasa(tipo);
            } catch (error) {
                console.warn(`No se pudo obtener tasa para ${tipo}:`, error);
            }
            // Pequeña pausa para no saturar la API
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return tasas;
    }

    /**
     * Convierte un monto de USD a Bolívares
     */
    async convertirABolivares(montoUSD, tipo = 'oficial', operacion = 'venta') {
        const tasa = await this.obtenerTasa(tipo);
        const tasaCambio = operacion === 'compra' ? tasa.compra : tasa.venta;
        
        return {
            montoOriginal: montoUSD,
            monedaOriginal: 'USD',
            montoConvertido: montoUSD * tasaCambio,
            monedaConvertida: 'Bs',
            tasaAplicada: tasaCambio,
            tipoDolar: tipo,
            operacion: operacion,
            tasaInfo: tasa
        };
    }

    /**
     * Convierte un monto de Bolívares a USD
     */
    async convertirADolares(montoBs, tipo = 'oficial', operacion = 'venta') {
        const tasa = await this.obtenerTasa(tipo);
        const tasaCambio = operacion === 'compra' ? tasa.compra : tasa.venta;
        
        return {
            montoOriginal: montoBs,
            monedaOriginal: 'Bs',
            montoConvertido: montoBs / tasaCambio,
            monedaConvertida: 'USD',
            tasaAplicada: tasaCambio,
            tipoDolar: tipo,
            operacion: operacion,
            tasaInfo: tasa
        };
    }

    /**
     * Formatea un número como moneda
     */
    formatearMoneda(monto, moneda = 'Bs') {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: 'VES',
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        }).format(monto).replace('VES', moneda);
    }

    /**
     * Calcula el tiempo desde la última actualización
     */
    tiempoDesdeActualizacion(fechaISO) {
        const fecha = new Date(fechaISO);
        const ahora = new Date();
        const segundos = Math.floor((ahora - fecha) / 1000);
        
        if (segundos < 60) return 'hace unos segundos';
        if (segundos < 3600) return `hace ${Math.floor(segundos / 60)} minutos`;
        if (segundos < 86400) return `hace ${Math.floor(segundos / 3600)} horas`;
        return `hace ${Math.floor(segundos / 86400)} días`;
    }
}

// Crear instancia global solo en cliente
if (typeof window !== 'undefined') {
    window.TasaDolar = new TasaDolarService();
}