<template>
  <BaseModal :isOpen="isOpen" @close="closeModal" title="Nuevo Producto" maxWidth="max-w-[700px]">
    <div class="p-4">
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1 col-span-2">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Nombre del producto *</label>
            <input v-model="formData.nombre" type="text" required
              class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Categoría *</label>
            <select v-model="formData.categoria_id" required
              class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white">
              <option value="" disabled>Seleccione una categoría</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                {{ cat.nombre }}
              </option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Proveedor *</label>
            <select v-model="formData.proveedor_id" required
              class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white">
              <option value="" disabled>Seleccione un proveedor</option>
              <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">
                {{ prov.nombre }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Stock Mínimo *</label>
            <input v-model="formData.stock_minimo" type="number" step="0.01" required
              class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Cantidad Comprada (Kg) * <span
                class="text-xs text-gray-400 dark:text-slate-500 font-normal">Bruto</span></label>
            <input v-model="cantidadBruta" type="number" step="0.01" required
              class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Desperdicio (Kg) <span
                class="text-xs text-gray-400 dark:text-slate-500 font-normal cursor-pointer"
                title="Auto-calculado al 5% pero puedes ajustarlo">(~5%)</span></label>
            <input v-model="desperdicioKg" type="number" step="0.01"
              class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Stock Inicial (Kg) <span
                class="text-xs text-gray-400 dark:text-slate-500 font-normal">Neto</span></label>
            <input v-model="formData.kilogramos" type="number" step="0.01" required readonly
              class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-400 outline-none cursor-not-allowed" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Stock Actual (Kg) *</label>
            <input v-model="formData.stock_actual" type="number" step="0.01" required
              class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Costo Total Compra ($) *</label>
            <input v-model="costoTotalCompra" type="number" step="0.01" required
              class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white"
              placeholder="Pago total al proveedor" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Precio de Compra por Kg ($)</label>
            <input v-model="formData.precio_compra" type="number" step="0.01" required readonly
              class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-400 outline-none cursor-not-allowed" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Precio Venta por Kg ($) *</label>
            <input v-model="formData.precio_venta_kg" type="number" step="0.01" required
              class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
          </div>

          <div class="flex flex-col gap-2 col-span-2 mt-2">
            <label
              class="text-sm font-medium text-gray-700 dark:text-slate-300 border-b dark:border-slate-700 pb-1">Vencimiento</label>
            <div class="flex gap-4 items-center">
              <label class="flex items-center gap-1 text-sm cursor-pointer dark:text-slate-300">
                <input type="radio" v-model="vencimientoMode" value="Días" class="accent-green-600" /> Días
              </label>
              <label class="flex items-center gap-1 text-sm cursor-pointer dark:text-slate-300">
                <input type="radio" v-model="vencimientoMode" value="Calendario" class="accent-green-600" />
                Calendario
              </label>
              <label class="flex items-center gap-1 text-sm cursor-pointer dark:text-slate-300">
                <input type="radio" v-model="vencimientoMode" value="No aplica" class="accent-green-600" /> No aplica
              </label>
            </div>

            <div v-if="vencimientoMode === 'Días'" class="mt-1">
              <input v-model.number="vencimientoDias" type="number" min="1" placeholder="Cantidad de días"
                class="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
            </div>
            <div v-else-if="vencimientoMode === 'Calendario'" class="mt-1">
              <input v-model="vencimientoFecha" type="date"
                class="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white dark:color-scheme:dark" />
            </div>
          </div>
        </div>
      </form>
    </div>

    <template #footer>
      <div class="flex gap-3 justify-end w-full border-t border-gray-100 dark:border-slate-800 p-4">
        <button type="button" @click="closeModal"
          class="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
        <button @click="handleSubmit" :disabled="formLoading"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <span v-if="formLoading"
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Guardar
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useProductos } from '~/composables/useProductos'
import { useApi } from '~/composables/useApi'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const { createProducto } = useProductos()

const formLoading = ref(false)
const categorias = ref([])
const proveedores = ref([])

const vencimientoMode = ref('No aplica')
const vencimientoDias = ref(null)
const vencimientoFecha = ref('')

const initialFormState = {
  nombre: '',
  categoria_id: '',
  proveedor_id: '',
  stock_minimo: '',
  kilogramos: '',
  stock_actual: '',
  precio_compra: '',
  precio_venta_kg: '',
  fecha_vencimiento: ''
}
const formData = ref({ ...initialFormState })
const costoTotalCompra = ref('')
const cantidadBruta = ref('')
const desperdicioKg = ref('')
const suspendWatchers = ref(false)

// Watchers form logic (same as inventario/index.vue)
watch(() => cantidadBruta.value, (newVal) => {
  if (suspendWatchers.value) return
  if (newVal && Number(newVal) > 0) {
    desperdicioKg.value = Number((Number(newVal) * 0.05).toFixed(2))
  } else {
    desperdicioKg.value = ''
  }
})

watch([() => cantidadBruta.value, () => desperdicioKg.value], ([bruta, desp]) => {
  if (suspendWatchers.value) return
  const b = Number(bruta || 0)
  const d = Number(desp || 0)
  if (b >= d) {
    const net = (Number((b - d).toFixed(2))).toString()
    formData.value.kilogramos = net
    formData.value.stock_actual = net
  } else {
    formData.value.kilogramos = ''
    formData.value.stock_actual = ''
  }
})

watch([() => costoTotalCompra.value, () => formData.value.kilogramos], ([total, kg]) => {
  if (suspendWatchers.value) return
  if (Number(total) > 0 && Number(kg) > 0) {
    formData.value.precio_compra = (Number(total) / Number(kg)).toFixed(2)
  } else {
    formData.value.precio_compra = ''
  }
})

const loadDependencies = async () => {
  try {
    const { api } = useApi()
    const [cats, provs] = await Promise.all([
      api('/categorias').catch(() => []),
      api('/proveedores').catch(() => [])
    ])

    const extractData = (res) => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    };

    categorias.value = extractData(cats)
    proveedores.value = extractData(provs)
  } catch (error) {
    console.error('Error fetching categories or providers:', error)
  }
}

onMounted(() => {
  loadDependencies()
})

const closeModal = () => {
  emit('close')
  setTimeout(() => {
    formData.value = { ...initialFormState }
    cantidadBruta.value = ''
    desperdicioKg.value = ''
    costoTotalCompra.value = ''
    vencimientoMode.value = 'No aplica'
    vencimientoDias.value = null
    vencimientoFecha.value = ''
  }, 200)
}

const calculateFechaVencimiento = () => {
  if (vencimientoMode.value === 'No aplica') return null
  if (vencimientoMode.value === 'Calendario') return vencimientoFecha.value || null
  if (vencimientoMode.value === 'Días' && vencimientoDias.value) {
    const d = new Date()
    d.setDate(d.getDate() + vencimientoDias.value)
    return d.toISOString().split('T')[0]
  }
  return null
}

const handleSubmit = async () => {
  formLoading.value = true
  try {
    const fn_vencimiento = calculateFechaVencimiento()

    const detalleObj = {
      fecha_vencimiento: fn_vencimiento,
      stock_actual: formData.value.stock_actual
    }

    const payload = {
      ...formData.value,
      desperdicio: Number(desperdicioKg.value) || 0,
      detalle: JSON.stringify(detalleObj)
    }
    delete payload.stock_actual

    await createProducto(payload)

    emit('saved', formData.value.nombre)
    closeModal()
  } catch (error) {
    console.error('Error guardando producto:', error)
    alert('Ocurrió un error al guardar el producto')
  } finally {
    formLoading.value = false
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadDependencies()
  }
})
</script>
