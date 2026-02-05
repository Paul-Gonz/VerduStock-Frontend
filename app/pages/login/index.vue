<template>
    <v-container fluid class="fill-height login-bg pa-0">
        <v-row no-gutters class="fill-height">
            <v-col cols="12" md="6"
                class="presentation-section d-none d-md-flex flex-column align-center justify-center text-white">
                <div class="presentation-content text-center">
                    <v-avatar color="white" size="100" class="elevation-10 mb-6">
                        <v-icon color="success" size="60" icon="mdi-carrot"></v-icon>
                    </v-avatar>
                    <h1 class="text-h3 font-weight-bold mb-2">Verdulería Fresca</h1>
                    <p class="text-h6 font-weight-medium text-success-lighten-3">
                        Sistema de Inventario
                    </p>

                    <div class="floating-veggies mt-10">
                        <v-icon v-for="(item, i) in veggies" :key="i" :icon="item.icon" :color="item.color"
                            class="veggie-icon mx-4" size="48"></v-icon>
                    </div>
                </div>
            </v-col>

            <v-col cols="12" md="6" class="d-flex align-center justify-center bg-white">
                <v-card flat width="100%" max-width="450" class="pa-8">
                    <div class="text-center mb-8">
                        <h2 class="text-h4 font-weight-bold text-grey-darken-3">Iniciar Sesión</h2>
                        <p class="text-grey">Accede a tu panel de control de inventario</p>
                    </div>

                    <v-alert v-if="errorMessage" type="error" class="mb-4" variant="tonal">
                        {{ errorMessage }}
                    </v-alert>

                    <v-alert v-if="successMessage" type="success" class="mb-4" variant="tonal">
                        {{ successMessage }}
                    </v-alert>

                    <v-form @submit.prevent="handleLogin" ref="loginForm">
                        <label class="text-subtitle-2 font-weight-bold mb-2 d-block">Nombre de Usuario</label>
                        <v-text-field v-model="nombre" prepend-inner-icon="mdi-account" variant="outlined"
                            placeholder="Ingresa tu nombre de usuario" rounded="lg" color="success"
                            :error-messages="errors.nombre" required></v-text-field>

                        <label class="text-subtitle-2 font-weight-bold mb-2 d-block">Contraseña</label>
                        <v-text-field v-model="password" :type="showPassword ? 'text' : 'password'"
                            prepend-inner-icon="mdi-lock" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                            variant="outlined" placeholder="Ingresa tu contraseña" rounded="lg" color="success"
                            @click:append-inner="showPassword = !showPassword" :error-messages="errors.password"
                            required></v-text-field>

                        <div class="d-flex align-center justify-space-between mt-n2 mb-4">
                            <v-checkbox v-model="remember" label="Recordar sesión" color="success"
                                hide-details></v-checkbox>
                            
                        </div>

                        <v-btn block color="success" size="x-large" type="submit"
                            class="text-none font-weight-bold elevation-4" rounded="lg" :loading="loading"
                            :disabled="loading">
                            <v-icon start icon="mdi-login"></v-icon>
                            Iniciar Sesión
                        </v-btn>

                       
                    </v-form>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
const debugAuth = async () => {
    try {
        console.log('🔐 Verificando cookies...')
        const cookies = document.cookie
        console.log('Cookies actuales:', cookies)
        
        // Verificar sesión Laravel
        const response = await $fetch('http://localhost:8000/sanctum/csrf-cookie', {
            credentials: 'include'
        })
        console.log('CSRF Cookie establecida:', response)
        
        // Verificar autenticación
        const authCheck = await $fetch('http://localhost:8000/check-auth', {
            credentials: 'include'
        })
        console.log('Auth check:', authCheck)
        
        return authCheck.authenticated
    } catch (error) {
        console.error('❌ Error en debugAuth:', error)
        return false
    }
}
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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

const veggies = [
    { icon: 'mdi-apple', color: 'red' },
    { icon: 'mdi-food-apple', color: 'orange' },
    { icon: 'mdi-chili-hot', color: 'red-accent-4' },
    { icon: 'mdi-leaf', color: 'green-lighten-1' },
    { icon: 'mdi-fruit-pineapple', color: 'yellow' }
]

definePageMeta({
    layout: false,
})

// Limpiar mensajes de error cuando el usuario escribe
watch([nombre, password], () => {
    errorMessage.value = ''
    errors.value.nombre = ''
    errors.value.password = ''
})

// Verificar si hay mensajes de éxito en la URL (por ejemplo, después del registro)
onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('registered')) {
        successMessage.value = '¡Registro exitoso! Por favor inicia sesión.'
    }
})

const handleLogin = async () => {
    // Resetear errores
    errorMessage.value = ''
    errors.value = { nombre: '', password: '' }
    loading.value = true

    console.log('Intentando login con:', {
        nombre: nombre.value,
        password: '***' // No mostrar contraseña real
    })

    try {
        // IMPORTANTE: Usa esta URL exacta (ajusta el puerto si es diferente)
        const apiUrl = 'http://localhost:8000/login'
        
        const response = await $fetch(apiUrl, {
            method: 'POST',
            credentials: 'include', // IMPORTANTE para cookies de sesión
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                nombre: nombre.value,
                password: password.value,
                remember: remember.value
            })
        })

        console.log('Respuesta del backend:', response)

        if (response.success) {
            console.log('Login exitoso, redirigiendo...')
            
            // Esperar un momento para que la sesión se establezca
            setTimeout(async () => {
                await router.push('/home')
            }, 500)
        } else {
            errorMessage.value = response.message || 'Error en el login'
        }
    } catch (error) {
        console.error('Error completo en login:', error)
        console.error('Detalles del error:', {
            status: error.status,
            statusText: error.statusText,
            data: error.data
        })
        
        // Mostrar información detallada del error
        if (error.status === 422) {
            // Errores de validación
            if (error.data?.errors) {
                const errorData = error.data.errors
                if (errorData.nombre) {
                    errors.value.nombre = Array.isArray(errorData.nombre) 
                        ? errorData.nombre.join(', ') 
                        : errorData.nombre
                }
                if (errorData.password) {
                    errors.value.password = Array.isArray(errorData.password) 
                        ? errorData.password.join(', ') 
                        : errorData.password
                }
                if (!errors.value.nombre && !errors.value.password) {
                    errorMessage.value = 'Datos de formulario inválidos'
                }
            }
        } else if (error.status === 401) {
            errorMessage.value = 'Credenciales incorrectas. Verifica tu usuario y contraseña.'
        } else if (error.status === 429) {
            errorMessage.value = error.data?.message || 'Demasiados intentos. Por favor espera.'
        } else if (error.status === 419) {
            errorMessage.value = 'Token CSRF expirado. Por favor, recarga la página.'
        } else if (error.status === 500) {
            errorMessage.value = 'Error del servidor. Por favor, intenta más tarde.'
        } else if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
            errorMessage.value = 'Error de conexión. Verifica que el backend esté corriendo.'
        } else {
            errorMessage.value = `Error: ${error.message || 'Error desconocido'}`
        }
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-bg {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.presentation-section {
    background: linear-gradient(rgba(44, 62, 80, 0.85), rgba(44, 62, 80, 0.9)),
        url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80');
    background-size: cover;
    background-position: center;
    position: relative;
}

/* Efecto de patrón de fondo (SVG) */
.presentation-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6z' fill='%23ffffff' fill-opacity='0.05'/%3E%3C/svg%3E");
}

.veggie-icon {
    animation: float 4s ease-in-out infinite;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 10px;
    box-sizing: content-box;
    border-radius: 50%;
    backdrop-filter: blur(5px);
}

/* Animaciones para cada vegetal con diferentes tiempos */
.veggie-icon:nth-child(1) { animation-delay: 0s; }
.veggie-icon:nth-child(2) { animation-delay: 0.5s; }
.veggie-icon:nth-child(3) { animation-delay: 1s; }
.veggie-icon:nth-child(4) { animation-delay: 1.5s; }
.veggie-icon:nth-child(5) { animation-delay: 2s; }

@keyframes float {
    0%, 100% {
        transform: translateY(0) rotate(0deg);
    }
    50% {
        transform: translateY(-20px) rotate(5deg);
    }
}

.gap-4 {
    gap: 1rem;
}

/* Estilos adicionales para mejor visualización */
.presentation-content {
    position: relative;
    z-index: 2;
    padding: 2rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.floating-veggies {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
}

/* Efecto hover en los iconos */
.veggie-icon:hover {
    transform: scale(1.1);
    transition: transform 0.3s ease;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
</style>