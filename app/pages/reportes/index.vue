<template>
  <section class="reportes-page">
    <v-container class="reportes-shell" fluid>
      <v-card class="reportes-board app-card" rounded="lg" border>
        <header class="board-header">
          <div class="board-heading">
            <v-icon icon="mdi-chart-box" size="30" color="primary"></v-icon>
            <div>
              <p class="board-label">Reportes de Inventario</p>
              <p class="board-subtitle">Genera y descarga reportes en PDF</p>
            </div>
          </div>
          <v-btn 
            variant="flat" 
            color="primary" 
            prepend-icon="mdi-arrow-left"
            @click="$router.push('/inventario')"
            class="back-button"
          >
            Volver al Inventario
          </v-btn>
        </header>

        <div class="reportes-grid">
          <!-- Reporte de Inventario Completo -->
          <v-card class="reporte-card" rounded="lg" border elevation="2">
            <div class="reporte-card__header">
              <v-icon icon="mdi-clipboard-list" size="40" color="success"></v-icon>
              <div>
                <h3 class="reporte-card__title">Inventario Completo</h3>
                <p class="reporte-card__desc">Listado completo de todos los productos con desperdicios</p>
              </div>
            </div>
            <div class="reporte-card__content">
              <div class="filtros-section">
                <v-select v-model="filtrosInventario.categoria_id" :items="categoriaOptions" 
                  label="Filtrar por categoría" variant="outlined" density="comfortable" 
                  placeholder="Todas las categorías" clearable></v-select>
                <v-select v-model="filtrosInventario.proveedor_id" :items="proveedorOptions" 
                  label="Filtrar por proveedor" variant="outlined" density="comfortable" 
                  placeholder="Todos los proveedores" clearable></v-select>
              </div>
            </div>
            <div class="reporte-card__actions">
              <v-btn variant="flat" color="success" prepend-icon="mdi-file-pdf-box" 
                @click="generarPDF('inventario-completo')" :loading="generandoPDF === 'inventario-completo'"
                block>
                Generar PDF
              </v-btn>
            </div>
          </v-card>

          <!-- Reporte de Stock Bajo -->
          <v-card class="reporte-card" rounded="lg" border elevation="2">
            <div class="reporte-card__header">
              <v-icon icon="mdi-alert" size="40" color="error"></v-icon>
              <div>
                <h3 class="reporte-card__title">Stock Bajo</h3>
                <p class="reporte-card__desc">Productos que necesitan reposición urgente</p>
              </div>
            </div>
            <div class="reporte-card__content">
              <div class="umbral-control">
                <v-slider v-model="umbralStock" :min="1" :max="50" :step="0.5" thumb-label="always"
                  label="Umbral de stock bajo (kg)" color="error">
                  <template v-slot:thumb-label="{ modelValue }">
                    {{ modelValue }} kg
                  </template>
                </v-slider>
                <p class="umbral-hint">
                  Productos con stock neto (bruto - desperdicio) por debajo de este umbral
                </p>
              </div>
            </div>
            <div class="reporte-card__actions">
              <v-btn variant="flat" color="error" prepend-icon="mdi-file-pdf-box" 
                @click="generarPDF('stock-bajo')" :loading="generandoPDF === 'stock-bajo'"
                block>
                Generar PDF
              </v-btn>
            </div>
          </v-card>

          <!-- Reporte de Desperdicios -->
          <v-card class="reporte-card" rounded="lg" border elevation="2">
            <div class="reporte-card__header">
              <v-icon icon="mdi-delete-alert" size="40" color="warning"></v-icon>
              <div>
                <h3 class="reporte-card__title">Desperdicios</h3>
                <p class="reporte-card__desc">Análisis de productos con pérdidas por desperdicio</p>
              </div>
            </div>
            <div class="reporte-card__content">
              <div class="filtros-section">
                <v-select v-model="filtrosDesperdicios.categoria_id" :items="categoriaOptions" 
                  label="Filtrar por categoría" variant="outlined" density="comfortable" 
                  placeholder="Todas las categorías" clearable></v-select>
                <v-select v-model="filtrosDesperdicios.proveedor_id" :items="proveedorOptions" 
                  label="Filtrar por proveedor" variant="outlined" density="comfortable" 
                  placeholder="Todos los proveedores" clearable></v-select>
              </div>
            </div>
            <div class="reporte-card__actions">
              <v-btn variant="flat" color="warning" prepend-icon="mdi-file-pdf-box" 
                @click="generarPDF('reporte-desperdicios')" :loading="generandoPDF === 'reporte-desperdicios'"
                block>
                Generar PDF
              </v-btn>
            </div>
          </v-card>

          <!-- Análisis de Rentabilidad -->
          <v-card class="reporte-card" rounded="lg" border elevation="2">
            <div class="reporte-card__header">
              <v-icon icon="mdi-chart-line" size="40" color="info"></v-icon>
              <div>
                <h3 class="reporte-card__title">Análisis de Rentabilidad</h3>
                <p class="reporte-card__desc">Margen de ganancia por producto</p>
              </div>
            </div>
            <div class="reporte-card__content">
              <div class="filtros-section">
                <v-select v-model="filtrosRentabilidad.categoria_id" :items="categoriaOptions" 
                  label="Filtrar por categoría" variant="outlined" density="comfortable" 
                  placeholder="Todas las categorías" clearable></v-select>
                <v-select v-model="filtrosRentabilidad.proveedor_id" :items="proveedorOptions" 
                  label="Filtrar por proveedor" variant="outlined" density="comfortable" 
                  placeholder="Todos los proveedores" clearable></v-select>
              </div>
            </div>
            <div class="reporte-card__actions">
              <v-btn variant="flat" color="info" prepend-icon="mdi-file-pdf-box" 
                @click="generarPDF('analisis-rentabilidad')" :loading="generandoPDF === 'analisis-rentabilidad'"
                block>
                Generar PDF
              </v-btn>
            </div>
          </v-card>
        </div>
      </v-card>
    </v-container>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_URL = 'http://localhost:8000'

// Estados
const categorias = ref([])
const proveedores = ref([])

// Filtros
const filtrosInventario = ref({
  categoria_id: null,
  proveedor_id: null,
  estado_stock: null
})
const filtrosRentabilidad = ref({
  categoria_id: null,
  proveedor_id: null
})
const filtrosDesperdicios = ref({
  categoria_id: null,
  proveedor_id: null
})
const umbralStock = ref(10)

// Loading states
const generandoPDF = ref(null)

// Configuración de fetch
const fetchConfig = {
  credentials: 'include',
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json'
  }
}

// Opciones de select
const categoriaOptions = computed(() => [
  { title: 'Todas las categorías', value: 'all' },
  ...categorias.value.map(cat => ({
    title: cat.nombre || 'Sin nombre',
    value: cat.id
  }))
])

const proveedorOptions = computed(() => [
  { title: 'Todos los proveedores', value: 'all' },
  ...proveedores.value.map(prov => ({
    title: prov.nombre || 'Sin nombre',
    value: prov.id
  }))
])

// Métodos de API
const fetchCategorias = async () => {
  try {
    const response = await $fetch(`${API_URL}/categorias`, {
      method: 'GET',
      params: { per_page: 100 },
      ...fetchConfig
    })
    
    // Ajustar según la respuesta de Laravel
    if (response && typeof response === 'object') {
      if (response.data && Array.isArray(response.data)) {
        categorias.value = response.data
      } else if (Array.isArray(response)) {
        categorias.value = response
      } else if (response.categorias) {
        categorias.value = response.categorias
      }
    }
  } catch (error) {
    console.error('Error cargando categorías:', error)
  }
}

const fetchProveedores = async () => {
  try {
    const response = await $fetch(`${API_URL}/proveedores`, {
      method: 'GET',
      params: { per_page: 100 },
      ...fetchConfig
    })
    
    // Ajustar según la respuesta de Laravel
    if (response && typeof response === 'object') {
      if (response.data && Array.isArray(response.data)) {
        proveedores.value = response.data
      } else if (Array.isArray(response)) {
        proveedores.value = response
      } else if (response.proveedores) {
        proveedores.value = response.proveedores
      }
    }
  } catch (error) {
    console.error('Error cargando proveedores:', error)
  }
}

const generarPDF = async (tipo) => {
  generandoPDF.value = tipo
  
  try {
    let url = `${API_URL}/reportes/${tipo}`
    const params = new URLSearchParams()
    
    // Función para manejar filtros
    const agregarFiltro = (categoriaId, proveedorId) => {
      if (categoriaId && categoriaId !== 'all') params.append('categoria_id', categoriaId)
      if (proveedorId && proveedorId !== 'all') params.append('proveedor_id', proveedorId)
    }
    
    switch (tipo) {
      case 'inventario-completo':
        agregarFiltro(filtrosInventario.value.categoria_id, filtrosInventario.value.proveedor_id)
        break
        
      case 'stock-bajo':
        params.append('umbral', umbralStock.value)
        // También podemos aplicar filtros si se desea
        agregarFiltro(filtrosInventario.value.categoria_id, filtrosInventario.value.proveedor_id)
        break
        
      case 'reporte-desperdicios':
        agregarFiltro(filtrosDesperdicios.value.categoria_id, filtrosDesperdicios.value.proveedor_id)
        break
        
      case 'analisis-rentabilidad':
        agregarFiltro(filtrosRentabilidad.value.categoria_id, filtrosRentabilidad.value.proveedor_id)
        break
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }
    
    console.log('Generando PDF desde:', url)
    
    // Abrir PDF en nueva pestaña
    window.open(url, '_blank')
    
  } catch (error) {
    console.error('Error generando PDF:', error)
    alert('Error al generar el PDF: ' + error.message)
  } finally {
    generandoPDF.value = null
  }
}

// Lifecycle
onMounted(() => {
  console.log('Componente Reportes montado')
  fetchCategorias()
  fetchProveedores()
})
</script>

<style scoped>
.reportes-page {
  padding: 20px 16px 48px;
  background: #f8fafc;
  min-height: 100vh;
}

.reportes-shell {
  width: 100%;
  padding-inline: 0;
}

.reportes-board {
  background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.15);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.08);
  padding: 24px;
}

.board-header {
  margin-bottom: 32px;
}

.board-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.board-label {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.board-subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.95rem;
}

.reportes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.reporte-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.reporte-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
}

.reporte-card__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 16px;
}

.reporte-card__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.reporte-card__desc {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.4;
}

.reporte-card__content {
  padding: 0 24px 16px;
  flex-grow: 1;
}

.filtros-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.umbral-control {
  padding: 8px 0;
}

.umbral-hint {
  margin: 8px 0 0;
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
}

.reporte-card__actions {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .reportes-grid {
    grid-template-columns: 1fr;
  }
  
  .reporte-card__actions {
    flex-direction: column;
  }
  .back-button {
    align-self: flex-start;
  }
}

.back-button {
  margin-top: 8px;
}

.v-theme--dark .reportes-page {
  background: #0f0f0fff !important;
}

.v-theme--dark .reportes-shell {
  background: transparent !important;
}

.v-theme--dark .reportes-board {
  background: #0e1c13ff !important;
  border-color: #335539ff !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
}

.v-theme--dark .board-label {
  color: #f1f5f9 !important;
}

.v-theme--dark .board-subtitle {
  color: #94a3b8 !important;
}

.v-theme--dark .reporte-card {
  background: #062c14b3 !important;
  border-color: #335539ff !important;
}

.v-theme--dark .reporte-card:hover {
  background: #0a280330 !important;
  border-color: #1c3923ff !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
}

.v-theme--dark .reporte-card__title {
  color: #e2e8f0 !important;
}

.v-theme--dark .reporte-card__desc {
  color: #94b8a2ff !important;
}

.v-theme--dark .reporte-card__actions {
  border-top-color: #335536ff !important;
}

.v-theme--dark .umbral-hint {
  color: #648b74ff !important;
}
</style>