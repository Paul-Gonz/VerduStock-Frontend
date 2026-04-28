import { ref, watch } from 'vue'

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

export function useCategories() {
  // Usamos el motor centralizado
  const { api } = useApi()

  const categories = ref<Category[]>([])
  const allCategoriesBase = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)

  // Paginación y filtros
  const page = ref(1)
  const pageSize = ref(100)
  const filter = ref('')

  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  const handleError = (err: any, fallbackMsg: string) => {
    error.value = err?.data?.message ?? err?.message ?? fallbackMsg
  }

  const applyFilter = () => {
    if (!filter.value) {
      categories.value = allCategoriesBase.value
      return
    }
    const searchTerm = filter.value.toLowerCase()
    categories.value = allCategoriesBase.value.filter(cat =>
      cat.nombre.toLowerCase().includes(searchTerm) ||
      (cat.detalle && cat.detalle.toLowerCase().includes(searchTerm))
    )
  }

  watch(filter, () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => applyFilter(), 300)
  })

  // --- MÉTODOS DE API ---

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await api<{ success: boolean; data: Category[]; meta?: { total: number } }>('/categorias', {
        method: 'GET',
        query: { page: page.value, per_page: pageSize.value }
      })
      allCategoriesBase.value = res?.data ?? []
      applyFilter()
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
        body: payload
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
        body: payload
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
        method: 'DELETE'
      })
      await fetchCategories()
    } catch (err: any) {
      handleError(err, 'Error al eliminar la categoría.')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
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
    setFilter: (val: string) => { filter.value = val; page.value = 1 },
    setPage: (val: number) => { page.value = val; fetchCategories() }
  }
}