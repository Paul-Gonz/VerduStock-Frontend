<template>
  <div class="p-6">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-3">
          <span class="mdi mdi-chart-box text-3xl text-blue-600"></span>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Reportes de Inventario</h1>
            <p class="text-sm text-gray-500">Genera y descarga reportes en PDF</p>
          </div>
        </div>
        <button @click="$router.push('/inventario')"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          <span class="mdi mdi-arrow-left"></span>
          Volver al Inventario
        </button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        <!-- Reporte de Inventario Completo -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
          <div class="flex items-center gap-4">
            <span class="mdi mdi-clipboard-list text-4xl text-green-500"></span>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Inventario Completo</h3>
              <p class="text-sm text-gray-500">Listado completo de todos los productos con desperdicios</p>
            </div>
          </div>
          <div class="grow flex flex-col gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por categoría</label>
              <select v-model="filtrosInventario.categoria_id"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                <option :value="null">Todas las categorías</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre || 'Sin nombre' }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por proveedor</label>
              <select v-model="filtrosInventario.proveedor_id"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                <option :value="null">Todos los proveedores</option>
                <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">{{ prov.nombre || 'Sin nombre' }}
                </option>
              </select>
            </div>
          </div>
          <div class="pt-4 border-t border-gray-100">
            <button @click="generarPDF('inventario-completo')" :disabled="generandoPDF === 'inventario-completo'"
              class="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
              <span class="mdi mdi-file-pdf-box text-xl"></span>
              {{ generandoPDF === 'inventario-completo' ? 'Generando...' : 'Generar PDF' }}
            </button>
          </div>
        </div>

        <!-- Reporte de Stock Bajo -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
          <div class="flex items-center gap-4">
            <span class="mdi mdi-alert text-4xl text-red-500"></span>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Stock Bajo</h3>
              <p class="text-sm text-gray-500">Productos que necesitan reposición urgente</p>
            </div>
          </div>
          <div class="grow flex flex-col gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Umbral de stock bajo: {{ umbralStock }}
                kg</label>
              <input type="range" v-model="umbralStock" min="1" max="50" step="0.5"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500 mt-2">
              <p class="text-xs text-gray-500 mt-2">
                Productos con stock neto (bruto - desperdicio) por debajo de este umbral
              </p>
            </div>
          </div>
          <div class="pt-4 border-t border-gray-100 mt-auto">
            <button @click="generarPDF('stock-bajo')" :disabled="generandoPDF === 'stock-bajo'"
              class="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
              <span class="mdi mdi-file-pdf-box text-xl"></span>
              {{ generandoPDF === 'stock-bajo' ? 'Generando...' : 'Generar PDF' }}
            </button>
          </div>
        </div>

        <!-- Reporte de Desperdicios -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
          <div class="flex items-center gap-4">
            <span class="mdi mdi-delete-alert text-4xl text-yellow-500"></span>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Desperdicios</h3>
              <p class="text-sm text-gray-500">Análisis de productos con pérdidas por desperdicio</p>
            </div>
          </div>
          <div class="grow flex flex-col gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por categoría</label>
              <select v-model="filtrosDesperdicios.categoria_id"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                <option :value="null">Todas las categorías</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre || 'Sin nombre' }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por proveedor</label>
              <select v-model="filtrosDesperdicios.proveedor_id"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                <option :value="null">Todos los proveedores</option>
                <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">{{ prov.nombre || 'Sin nombre' }}
                </option>
              </select>
            </div>
          </div>
          <div class="pt-4 border-t border-gray-100">
            <button @click="generarPDF('reporte-desperdicios')" :disabled="generandoPDF === 'reporte-desperdicios'"
              class="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
              <span class="mdi mdi-file-pdf-box text-xl"></span>
              {{ generandoPDF === 'reporte-desperdicios' ? 'Generando...' : 'Generar PDF' }}
            </button>
          </div>
        </div>

        <!-- Análisis de Rentabilidad -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
          <div class="flex items-center gap-4">
            <span class="mdi mdi-chart-line text-4xl text-blue-500"></span>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Análisis de Rentabilidad</h3>
              <p class="text-sm text-gray-500">Margen de ganancia por producto</p>
            </div>
          </div>
          <div class="grow flex flex-col gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por categoría</label>
              <select v-model="filtrosRentabilidad.categoria_id"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option :value="null">Todas las categorías</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre || 'Sin nombre' }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por proveedor</label>
              <select v-model="filtrosRentabilidad.proveedor_id"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option :value="null">Todos los proveedores</option>
                <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">{{ prov.nombre || 'Sin nombre' }}
                </option>
              </select>
            </div>
          </div>
          <div class="pt-4 border-t border-gray-100">
            <button @click="generarPDF('analisis-rentabilidad')" :disabled="generandoPDF === 'analisis-rentabilidad'"
              class="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
              <span class="mdi mdi-file-pdf-box text-xl"></span>
              {{ generandoPDF === 'analisis-rentabilidad' ? 'Generando...' : 'Generar PDF' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const { api } = useApi()
// Ya no necesitamos API_URL porque api() ya la conoce

// Estados
const categorias = ref([])
const proveedores = ref([])

// Filtros
const filtrosInventario = ref({ categoria_id: null, proveedor_id: null, estado_stock: null })
const filtrosRentabilidad = ref({ categoria_id: null, proveedor_id: null })
const filtrosDesperdicios = ref({ categoria_id: null, proveedor_id: null })
const umbralStock = ref(10)

const generandoPDF = ref(null)

// --- MÉTODOS DE API ---

const fetchCategorias = async () => {
  try {
    const response = await api('/categorias', { params: { per_page: 100 } })
    categorias.value = response?.data || response || []
  } catch (error) {
    console.error('Error cargando categorías:', error)
  }
}

const fetchProveedores = async () => {
  try {
    const response = await api('/proveedores', { params: { per_page: 100 } })
    proveedores.value = response?.data || response || []
  } catch (error) {
    console.error('Error cargando proveedores:', error)
  }
}

const generarPDF = async (tipo) => {
  generandoPDF.value = tipo

  try {
    const queryParams = {}

    // Función para manejar filtros
    const aplicarFiltros = (filtro) => {
      if (filtro.categoria_id && filtro.categoria_id !== 'all') queryParams.categoria_id = filtro.categoria_id
      if (filtro.proveedor_id && filtro.proveedor_id !== 'all') queryParams.proveedor_id = filtro.proveedor_id
    }

    // Lógica de parámetros según el tipo
    if (tipo === 'inventario-completo') aplicarFiltros(filtrosInventario.value)
    if (tipo === 'stock-bajo') {
      queryParams.umbral = umbralStock.value
      aplicarFiltros(filtrosInventario.value)
    }
    if (tipo === 'reporte-desperdicios') aplicarFiltros(filtrosDesperdicios.value)
    if (tipo === 'analisis-rentabilidad') aplicarFiltros(filtrosRentabilidad.value)

    // HACEMOS LA PETICIÓN POR EL MOTOR API (Para incluir el Token)
    const response = await api(`/reportes/${tipo}`, {
      method: 'GET',
      params: queryParams,
      responseType: 'blob' // <--- IMPORTANTE: Recibimos el archivo binario
    })

    // CREAMOS UN LINK TEMPORAL PARA ABRIR EL PDF
    const blob = new Blob([response], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank')

    // Opcional: Liberar memoria después de un rato
    setTimeout(() => window.URL.revokeObjectURL(url), 1000)

  } catch (error) {
    console.error('Error generando PDF:', error)
    alert('No se pudo generar el PDF. Verifica que el servidor esté respondiendo.')
  } finally {
    generandoPDF.value = null
  }
}

onMounted(() => {
  fetchCategorias()
  fetchProveedores()
})
</script>