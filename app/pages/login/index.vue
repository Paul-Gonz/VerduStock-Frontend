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

                    <v-form @submit.prevent="handleLogin" ref="loginForm">
                        <label class="text-subtitle-2 font-weight-bold mb-2 d-block">Usuario o Correo
                            Electrónico</label>
                        <v-text-field v-model="user" prepend-inner-icon="mdi-account" variant="outlined"
                            placeholder="Ingresa tu usuario o email" rounded="lg" color="success"
                            required></v-text-field>

                        <label class="text-subtitle-2 font-weight-bold mb-2 d-block">Contraseña</label>
                        <v-text-field v-model="password" :type="showPassword ? 'text' : 'password'"
                            prepend-inner-icon="mdi-lock" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                            variant="outlined" placeholder="Ingresa tu contraseña" rounded="lg" color="success"
                            @click:append-inner="showPassword = !showPassword" required></v-text-field>

                        <div class="d-flex align-center justify-space-between mt-n2 mb-4">
                            <v-checkbox v-model="remember" label="Recordar sesión" color="success"
                                hide-details></v-checkbox>
                            <NuxtLink to="/forgot-password" class="text-caption text-secondary font-weight-bold">
                                ¿Olvidaste tu contraseña?
                            </NuxtLink>
                        </div>

                        <v-btn block color="success" size="x-large" type="submit"
                            class="text-none font-weight-bold elevation-4" rounded="lg" :loading="loading">
                            <v-icon start icon="mdi-login"></v-icon>
                            Iniciar Sesión
                        </v-btn>

                        <div class="d-flex align-center my-6">
                            <v-divider></v-divider>
                            <span class="mx-4 text-caption text-grey">O continúa con</span>
                            <v-divider></v-divider>
                        </div>

                        <div class="d-flex justify-center align-center gap-4">
                            <v-btn icon="mdi-google" color="red-darken-1" variant="flat"></v-btn>
                            <v-btn icon="mdi-facebook" color="blue-darken-2" variant="flat"></v-btn>
                        </div>

                        <p class="text-center mt-8 text-body-2 text-grey">
                            ¿No tienes una cuenta?
                            <a href="#" class="text-success font-weight-bold">Solicitar acceso</a>
                        </p>
                    </v-form>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
const user = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const loading = ref(false)

const veggies = [
    { icon: 'mdi-apple', color: 'red' },
    { icon: 'mdi-food-apple', color: 'orange' },
    { icon: 'mdi-chili-hot', color: 'red-accent-4' },
    { icon: 'mdi-leaf', color: 'green-lighten-1' },
    { icon: 'mdi-water-melon', color: 'green' }
]

const handleLogin = async () => {
    loading.value = true
    // Simulación de API
    setTimeout(() => {
        loading.value = false
        console.log('Login exitoso con:', { user: user.value, password: password.value })
    }, 2000)
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
    border-radius: 50%;
    backdrop-filter: blur(5px);
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-20px);
    }
}

.gap-4 {
    gap: 1rem;
}
</style>