<template>
    <div class="flex min-h-screen bg-white dark:bg-gray-900">
        <!-- Left Side: Presentation -->
        <div class="hidden md:flex md:w-1/2 relative flex-col justify-center items-center text-white"
            style="background: linear-gradient(rgba(44, 62, 80, 0.85), rgba(44, 62, 80, 0.9)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'); background-size: cover; background-position: center;">
            <div
                class="relative z-10 p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center flex flex-col items-center">
                <div class="bg-white rounded-full p-4 shadow-lg mb-6 flex items-center justify-center w-24 h-24">
                    <i class="mdi mdi-carrot text-green-500 text-6xl"></i>
                </div>
                <h1 class="text-4xl font-bold mb-2">Disfruver</h1>
                <p class="text-xl font-medium text-green-300 mb-8">
                    ❝ Del campo a tu casa ❞
                </p>

                <div class="flex justify-center flex-wrap gap-4 mt-2">
                    <div v-for="(item, i) in veggies" :key="i"
                        class="veggie-icon w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110 shadow-sm hover:shadow-xl">
                        <i :class="['mdi', item.icon, 'text-4xl']" :style="{ color: item.color }"></i>
                    </div>
                </div>
            </div>
            <!-- Background Pattern -->
            <div class="absolute inset-0 z-0 bg-repeat opacity-5"
                style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6z\' fill=\'%23ffffff\' fill-opacity=\'1\'/%3E%3C/svg%3E');">
            </div>
        </div>

        <!-- Right Side: Login Form -->
        <div class="w-full md:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-800 shadow-2xl z-10">
            <div class="w-full max-w-md">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Iniciar Sesión</h2>
                    <p class="text-gray-500 dark:text-gray-400 mt-2">Accede a tu panel de control de inventario</p>
                </div>

                <div v-if="errorMessage"
                    class="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
                    {{ errorMessage }}
                </div>

                <div v-if="successMessage"
                    class="mb-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded relative">
                    {{ successMessage }}
                </div>

                <form @submit.prevent="handleLogin" ref="loginForm">
                    <div class="mb-4">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nombre de
                            Usuario</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="mdi mdi-account text-gray-400 text-xl"></i>
                            </div>
                            <input v-model="nombre" type="text" placeholder="Ingresa tu nombre de usuario" required
                                :class="[
                                    'w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-colors',
                                    errors.nombre ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                                ]">
                        </div>
                        <p v-if="errors.nombre" class="text-red-500 text-xs italic mt-1">{{ errors.nombre }}</p>
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="mdi mdi-lock text-gray-400 text-xl"></i>
                            </div>
                            <input v-model="password" :type="showPassword ? 'text' : 'password'"
                                placeholder="Ingresa tu contraseña" required :class="[
                                    'w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-colors',
                                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                                ]">
                            <button type="button" @click="showPassword = !showPassword"
                                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                                <i :class="['mdi', showPassword ? 'mdi-eye-off' : 'mdi-eye', 'text-xl']"></i>
                            </button>
                        </div>
                        <p v-if="errors.password" class="text-red-500 text-xs italic mt-1">{{ errors.password }}</p>
                    </div>

                    <button type="submit" :disabled="loading"
                        class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed">
                        <i v-if="loading" class="mdi mdi-loading mdi-spin mr-2 text-xl"></i>
                        <i v-else class="mdi mdi-login mr-2 text-xl"></i>
                        {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
// Usamos el composable maestro y la cookie para el token
const { api } = useApi()
const token = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: '/'
})

const nombre = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const errors = ref({
    nombre: '',
    password: ''
})

definePageMeta({
    layout: false,
})

// Limpiar mensajes de error cuando el usuario escribe
watch([nombre, password], () => {
    errorMessage.value = ''
    errors.value.nombre = ''
    errors.value.password = ''
})

onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('registered')) {
        successMessage.value = '¡Registro exitoso! Por favor inicia sesión.'
    }
})

const handleLogin = async () => {
    errorMessage.value = ''
    errors.value = { nombre: '', password: '' }
    loading.value = true

    try {
        // Usamos 'api' que ya sabe dónde está el backend
        const response = await api('/login', {
            method: 'POST',
            body: {
                nombre: nombre.value,
                password: password.value,
                remember: remember.value
            }
        })

        // Si Laravel nos devuelve el token
        if (response.success && response.token) {
            console.log('Login exitoso con Token')

            // 1. Guardamos el token en la cookie
            token.value = response.token

            // 2. Redirigimos al home
            router.push('/home')
        } else {
            errorMessage.value = response.message || 'Error en el login'
        }
    } catch (error) {
        console.error('Error en login:', error)

        if (error.status === 422) {
            if (error.data?.errors) {
                const errorData = error.data.errors
                if (errorData.nombre) errors.value.nombre = Array.isArray(errorData.nombre) ? errorData.nombre.join(', ') : errorData.nombre
                if (errorData.password) errors.value.password = Array.isArray(errorData.password) ? errorData.password.join(', ') : errorData.password
            }
        } else if (error.status === 401) {
            errorMessage.value = 'Credenciales incorrectas. Verifica tu usuario y contraseña.'
        } else {
            errorMessage.value = 'Error de conexión con el servidor de VerduStock.'
        }
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.veggie-icon {
    animation: float 4s ease-in-out infinite;
}

/* Animaciones para cada vegetal con diferentes tiempos */
.veggie-icon:nth-child(1) {
    animation-delay: 0s;
}

.veggie-icon:nth-child(2) {
    animation-delay: 0.5s;
}

.veggie-icon:nth-child(3) {
    animation-delay: 1s;
}

.veggie-icon:nth-child(4) {
    animation-delay: 1.5s;
}

.veggie-icon:nth-child(5) {
    animation-delay: 2s;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(5deg);
    }
}
</style>