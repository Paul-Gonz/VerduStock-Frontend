import { ref } from 'vue'

export interface Category {
  id: number
  nombre: string
  detalle: string | null
  emoji: string | null
  is_deleted?: boolean
  deleted_at?: string | null
  created_at?: string
  updated_at?: string
  productos_count?: number
}

/**
 * Composable centralizado para el módulo Categorías.
 * Usa `useApi` para consumir la URL base configurada en nuxt.config (runtimeConfig).
 * Maneja automáticamente errores 401 redirigiendo al login.
 */
export function useCategories() {
  const { api } = useApi()

  const categories = ref<Category[]>([])
  const trashedCategories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)

  // Paginación y filtros
  const page = ref(1)
  const pageSize = ref(100)
  const filter = ref('')

  // Manejo centralizado de errores de la API
  // La redirección a /login la maneja el middleware auth.js — aquí solo exponemos el mensaje
  const handleError = (err: any, fallbackMsg: string) => {
    error.value = err?.data?.message ?? err?.message ?? fallbackMsg
  }

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await api<{ success: boolean; data: Category[]; meta?: { total: number } }>('/categorias', {
        method: 'GET',
        query: { search: filter.value, page: page.value, per_page: pageSize.value }
      })
      categories.value = res?.data ?? []
      total.value = res?.meta?.total ?? res?.data?.length ?? 0
    } catch (err: any) {
      handleError(err, 'No se pudieron cargar las categorías.')
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (payload: Pick<Category, 'nombre' | 'detalle' | 'emoji'>) => {
    loading.value = true
    error.value = null
    try {
      await api('/categorias', {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
      })
      await fetchCategories()
    } catch (err: any) {
      handleError(err, 'Error al crear la categoría.')
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (id: number, payload: Partial<Pick<Category, 'nombre' | 'detalle' | 'emoji'>>) => {
    loading.value = true
    error.value = null
    try {
      await api(`/categorias/${id}`, {
        method: 'PUT',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
      })
      await fetchCategories()
    } catch (err: any) {
      handleError(err, 'Error al actualizar la categoría.')
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await api(`/categorias/${id}`, {
        method: 'DELETE',
      })
      await fetchCategories()
    } catch (err: any) {
      handleError(err, 'Error al eliminar la categoría.')
      throw err
    } finally {
      loading.value = false
    }
  }


  const setFilter = (val: string) => {
    filter.value = val
    page.value = 1
    fetchCategories()
  }

  const setPage = (val: number) => {
    page.value = val
    fetchCategories()
  }

  return {
    categories,
    trashedCategories,
    loading,
    error,
    total,
    page,
    pageSize,
    filter,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setFilter,
    setPage,
  }
}