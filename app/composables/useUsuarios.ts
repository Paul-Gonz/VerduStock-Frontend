import { ref } from 'vue'

export function useUsuarios() {
    const usuarios = ref<any[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const errorMessage = ref('')
    const deleteError = ref('')

    const fetchUsers = async () => {
        loading.value = true
        errorMessage.value = ''
        try {
            const data: any = await $fetch('http://localhost:8000/usuarios/', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            })
            usuarios.value = Array.isArray(data) ? data : (data?.data || [])
        } catch (error: any) {
            console.error('Error fetching users:', error)
            errorMessage.value = error.response?.status === 401 
                ? 'No autorizado. Por favor inicie sesión nuevamente.'
                : 'Error al cargar los usuarios. Por favor, intente nuevamente.'
        } finally {
            loading.value = false
        }
    }

    const saveUser = async (id: number | string | null, form: any) => {
        saving.value = true
        errorMessage.value = ''

        try {
            let url = 'http://localhost:8000/usuarios/'
            let method: 'POST' | 'PUT' = 'POST'
            let payload: any = {
                nombre: form.nombre,
                password: form.password,
                password_confirmation: form.password_confirmation || form.password
            }

            if (id) {
                // Editar usuario existente
                url = `http://localhost:8000/usuarios/${id}`
                method = 'PUT'
                payload.current_password = form.current_password || undefined

                if (!form.password) {
                    delete payload.password
                    delete payload.password_confirmation
                }
            }

const response: any = await $fetch(url, {
                method,
                body: payload,
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })

            await fetchUsers()
            return { success: true, message: response.message || 'Operación exitosa' }
        } catch (error: any) {
            console.error('Error guardando usuario:', error)
            
            if (error.response?.status === 422) {
                const mistakes = error.response._data?.errors || {}
                const errorMsg = Object.values(mistakes).flat().join(', ')
                errorMessage.value = errorMsg || 'Error de validación de los datos proporcionados.'
                return { success: false, message: errorMessage.value }
            }
            
            errorMessage.value = error.response?._data?.message || 'Error al guardar el usuario'
            return { success: false, message: errorMessage.value }
        } finally {
            saving.value = false
        }
    }

    const deleteUser = async (id: number | string, currentPassword?: string) => {
        deleting.value = true
        deleteError.value = ''

        try {
            const response = await $fetch(`http://localhost:8000/usuarios/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: {
                    current_password: currentPassword
                }
            })

            await fetchUsers()
            return { success: true, message: 'Usuario eliminado exitosamente' }
        } catch (error: any) {
            console.error('Error eliminando usuario:', error)
            deleteError.value = error.response?._data?.message || 'Error al eliminar el usuario'
            return { success: false, message: deleteError.value }
        } finally {
            deleting.value = false
        }
    }

    return {
        usuarios,
        loading,
        saving,
        deleting,
        errorMessage,
        deleteError,
        fetchUsers,
        saveUser,
        deleteUser
    }
}
