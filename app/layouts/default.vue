<template>
    <v-app id="verdustock-app">
        <v-navigation-drawer v-model="drawer" app width="292" class="verdus-nav" border="0" elevation="2">
            <div class="nav-inner">
                <div class="brand-block">
                    <div class="brand-icon">
                        <v-icon icon="mdi-cube-outline" color="success"></v-icon>
                    </div>
                    <div>
                        <p class="brand-title">Verdulería</p>
                        <p class="brand-subtitle">Control total</p>
                    </div>
                </div>

                <v-divider class="nav-divider"></v-divider>

                <v-list nav class="nav-list" density="comfortable">
                    <v-list-item v-for="item in menuItems" :key="item.title" :to="item.route" rounded="lg"
                        class="menu-item" :class="{ 'menu-item--active': isActive(item.route) }">
                        <template #prepend>
                            <div class="menu-pill">
                                <v-avatar :class="['menu-icon', { 'menu-icon--active': isActive(item.route) }]"
                                    size="40">
                                    <v-icon :icon="item.icon"></v-icon>
                                </v-avatar>
                                <span class="menu-text">{{ item.title }}</span>
                            </div>
                        </template>
                    </v-list-item>
                </v-list>

                <div class="nav-footer">
                    <p class="nav-version">Sistema de Gestión v1.0</p>
                    <p class="nav-copy">© 2026 Verdulería</p>
                </div>
            </div>
        </v-navigation-drawer>

        <v-app-bar app flat class="verdus-app-bar">
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title class="font-weight-medium">
                {{ pageTitle }}
            </v-toolbar-title>
            <v-spacer></v-spacer>

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
                    <v-list-item title="Mi Perfil" prepend-icon="mdi-account-circle-outline"
                        @click="goToProfile"></v-list-item>
                    <v-divider></v-divider>
                    <v-list-item title="Cerrar Sesión" prepend-icon="mdi-logout" class="text-red"
                        @click="confirmLogout"></v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-main class="bg-grey-lighten-4 main-scroll">
            <v-container fluid>
                <slot />
            </v-container>
        </v-main>

        <v-dialog v-model="logoutDialog" max-width="400">
            <v-card rounded="lg">
                <v-card-title class="text-h6 font-weight-bold">
                    <v-icon color="warning" class="mr-2">mdi-logout</v-icon>
                    Cerrar Sesión
                </v-card-title>
                <v-card-text>
                    ¿Estás seguro de que deseas cerrar la sesión?
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="tonal" @click="logoutDialog = false">Cancelar</v-btn>
                    <v-btn color="warning" @click="logout" :loading="loggingOut" variant="flat">
                        Cerrar Sesión
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
            {{ snackbar.message }}
            <template v-slot:actions>
                <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import menuConfig from './menu.json'

// Router y Route
const route = useRoute()
const router = useRouter()

// Estados
const drawer = ref(true)
const logoutDialog = ref(false)
const loggingOut = ref(false)
const menuItems = ref(menuConfig)

const snackbar = ref({
    show: false,
    message: '',
    color: 'success'
})

// Título de página dinámico
const pageTitle = computed(() => {
    const currentItem = menuItems.value.find(item => item.route === route.path)
    return currentItem ? currentItem.title : 'VerduStock'
})

// Métodos
const isActive = (targetRoute) => route.path.startsWith(targetRoute)

const showMessage = (message, color = 'success') => {
    snackbar.value = { show: true, message, color }
}

const goToProfile = () => {
    router.push('/perfil')
}

const confirmLogout = () => {
    logoutDialog.value = true
}

const logout = async () => {
    loggingOut.value = true
    try {
        const response = await $fetch('http://localhost:8000/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })

        if (response?.success) {
            showMessage('Sesión cerrada exitosamente')
            setTimeout(() => router.push('/login'), 1500)
        }
    } catch (error) {
        if (error.status === 401 || error.status === 419) {
            router.push('/login')
        } else {
            showMessage('Error al cerrar sesión', 'error')
        }
    } finally {
        loggingOut.value = false
        logoutDialog.value = false
    }
}

// Verificación de Auth inicial
onMounted(async () => {
    try {
        const response = await $fetch('http://localhost:8000/check-auth', {
            credentials: 'include'
        })
        if (!response.authenticated) router.push('/login')
    } catch (e) {
        router.push('/login')
    }
})
</script>

<style scoped>
#verdustock-app {
    font-family: 'Nunito', sans-serif;
}

.verdus-nav {
    background: linear-gradient(180deg, #f7fff9 0%, #e7f9ec 28%, #def4e6 100%);
    border-right: 1px solid rgba(5, 148, 72, 0.08) !important;
}

.nav-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 18px 12px;
}

.brand-block {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 20px;
}

.brand-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.brand-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: #0b5b33;
    margin: 0;
}

.brand-subtitle {
    font-size: 0.7rem;
    color: #4f7d63;
    margin: 0;
    text-transform: uppercase;
}

.menu-item {
    margin-bottom: 8px;
    font-weight: 600;
}

.menu-pill {
    display: flex;
    align-items: center;
    gap: 12px;
}

.menu-item--active {
    background: linear-gradient(135deg, #17c364 0%, #049e4b 100%) !important;
    color: white !important;
}

.menu-item--active .v-icon {
    color: white !important;
}

.nav-footer {
    margin-top: auto;
    font-size: 0.75rem;
    color: #4f7d63;
    text-align: center;
}

.verdus-app-bar {
    background: white !important;
    border-bottom: 1px solid #eee !important;
}

.text-red {
    color: #d32f2f !important;
}

.main-scroll {
    height: 100vh;
    overflow-y: auto;
}
</style>