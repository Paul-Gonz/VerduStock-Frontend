<template>
    <v-app id="verdustock-app">
        <v-navigation-drawer v-model="drawer" app>
            <!-- Logo y Título -->
            <v-list-item class="pa-4">
                <template v-slot:prepend>
                    <v-avatar color="success-lighten-4" size="40">
                        <v-icon color="success" icon="mdi-carrot"></v-icon>
                    </v-avatar>
                </template>
                <v-list-item-title class="text-h6 font-weight-bold ml-2">
                    VerduStock
                </v-list-item-title>
            </v-list-item>

            <v-divider></v-divider>

            <!-- Menú de Navegación -->
            <v-list nav density="compact">
                <v-list-item v-for="item in menuItems" :key="item.title" :prepend-icon="item.icon" :title="item.title"
                    :to="item.route" link rounded="lg" class="mx-2 my-1" color="success"></v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar app flat border>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title class="font-weight-medium">
                {{ pageTitle }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            
            <!-- Menú de Usuario -->
            <v-menu>
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon class="mr-2">
                        <v-badge dot color="success" bordered>
                            <v-avatar color="success-lighten-4" size="36">
                                <v-icon color="success" icon="mdi-account"></v-icon>
                            </v-avatar>
                        </v-badge>
                    </v-btn>
                </template>
                <v-list density="compact">
                    <v-list-item 
                        title="Mi Perfil" 
                        prepend-icon="mdi-account-circle-outline"
                        @click="goToProfile"
                    ></v-list-item>
                    <v-divider></v-divider>
                    <v-list-item 
                        title="Cerrar Sesión" 
                        prepend-icon="mdi-logout" 
                        class="text-red"
                        @click="confirmLogout"
                    ></v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-main class="bg-grey-lighten-4">
            <v-container fluid>
                <!-- El contenido de cada página se renderizará aquí -->
                <slot />
            </v-container>
        </v-main>

        <!-- Diálogo de confirmación para logout -->
        <v-dialog v-model="logoutDialog" max-width="400">
            <v-card rounded="lg">
                <v-card-title class="text-h6 font-weight-bold">
                    <v-icon color="warning" class="mr-2">mdi-logout</v-icon>
                    Cerrar Sesión
                </v-card-title>
                <v-card-text>
                    <div class="text-body-1">
                        ¿Estás seguro de que deseas cerrar la sesión?
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="tonal" @click="logoutDialog = false">
                        Cancelar
                    </v-btn>
                    <v-btn 
                        color="warning" 
                        @click="logout"
                        :loading="loggingOut"
                        variant="flat"
                    >
                        Cerrar Sesión
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snackbar para mensajes -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
            {{ snackbar.message }}
            <template v-slot:actions>
                <v-btn variant="text" @click="snackbar.show = false">
                    Cerrar
                </v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import menuConfig from './menu.json';

// Router y Route
const route = useRoute()
const router = useRouter()

// Controla la visibilidad del menú lateral
const drawer = ref(true)

// Diálogo de logout
const logoutDialog = ref(false)
const loggingOut = ref(false)

// Snackbar para mensajes
const snackbar = ref({
    show: false,
    message: '',
    color: 'success'
})

// Items del menú
const menuItems = ref(menuConfig)

// Título de página basado en la ruta actual
const pageTitle = computed(() => {
    const currentItem = menuItems.value.find(item => item.route === route.path)
    return currentItem ? currentItem.title : 'VerduStock'
})

// Función para ir al perfil
const goToProfile = () => {
    router.push('/perfil')
    showMessage('Redirigiendo a tu perfil...', 'info')
}

// Función para confirmar logout
const confirmLogout = () => {
    logoutDialog.value = true
}

// Función para mostrar mensajes
const showMessage = (message, color = 'success') => {
    snackbar.value = {
        show: true,
        message,
        color
    }
}

// Función para cerrar sesión
const logout = async () => {
    loggingOut.value = true
    
    try {
        // Realizar la petición de logout
        const response = await $fetch('http://localhost:8000/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })

        if (response && response.success) {
            showMessage('Sesión cerrada exitosamente', 'success')
            
            // Esperar un momento antes de redirigir
            setTimeout(() => {
                router.push('/login')
            }, 1500)
        } else {
            throw new Error('Error en la respuesta del servidor')
        }
        
    } catch (error) {
        console.error('Error al cerrar sesión:', error)
        
        if (error.status === 401 || error.status === 419) {
            // La sesión ya expiró, redirigir directamente
            showMessage('Tu sesión ha expirado', 'warning')
            setTimeout(() => {
                router.push('/login')
            }, 1500)
        } else {
            showMessage('Error al cerrar sesión. Intenta nuevamente.', 'error')
        }
    } finally {
        loggingOut.value = false
        logoutDialog.value = false
    }
}

// Verificar autenticación al montar el layout
onMounted(async () => {
    try {
        const response = await $fetch('http://localhost:8000/check-auth', {
            credentials: 'include'
        })
        
        if (!response.authenticated) {
            // Si no está autenticado, redirigir al login
            router.push('/login')
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error)
        // En caso de error, redirigir al login
        router.push('/login')
    }
})
</script>

<style scoped>
/* Estilos personalizados */
.text-red {
    color: #f44336 !important;
}

.v-list-item--active {
    background-color: rgba(76, 175, 80, 0.1) !important;
    border-left: 3px solid #4caf50 !important;
}

/* Estilos para el avatar del usuario */
.v-avatar {
    transition: transform 0.2s;
}

.v-avatar:hover {
    transform: scale(1.05);
}

/* Estilos para el botón de logout en el menú */
.v-list-item--logout:hover {
    background-color: rgba(244, 67, 54, 0.1) !important;
}

/* Estilos para el diálogo de confirmación */
.v-card-title {
    padding: 20px 24px 10px;
}

.v-card-text {
    padding: 0 24px 20px;
}

.v-card-actions {
    padding: 8px 24px 20px;
}
</style>