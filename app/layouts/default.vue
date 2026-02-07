<template>
    <v-app id="verdustock-app">
        <v-navigation-drawer v-model="drawer" app width="292" class="verdus-nav" border="0" elevation="2">
            <div class="nav-inner">
                <div class="brand-block">
                    <div class="brand-icon">
                        <v-img src="/logo.png" alt="Logo" class="brand-logo" contain></v-img>
                    </div>
                    <div>
                        <p class="brand-title">Disfruver</p>
                        <p class="brand-subtitle">Del campo a tu casa</p>
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

            <v-menu v-model="tasaMenu" location="bottom end" :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" variant="text" class="rate-chip"
                        :class="{ 'rate-chip--muted': tasaLoading || tasaError }" :ripple="false">
                        <v-icon icon="mdi-currency-usd" size="18" class="rate-icon"></v-icon>
                        <div>
                            <p class="rate-label">TASA BCV DEL DIA</p>
                            <p class="rate-value">{{ tasaTexto }}</p>
                        </div>
                    </v-btn>
                </template>
                <v-card class="rate-menu" rounded="lg">
                    <v-card-title class="rate-menu__title">Tasa BCV</v-card-title>
                    <v-card-text class="rate-menu__body">
                        <div class="rate-meta">
                            <div class="rate-meta__row">
                                <v-icon icon="mdi-calendar-clock" size="16"></v-icon>
                                <span>Actualizado: {{ tasaFechaTexto }}</span>
                            </div>
                            <div class="rate-meta__row" v-if="tasaDolar?.fuente">
                                <v-icon icon="mdi-database" size="16"></v-icon>
                                <span>Fuente: {{ tasaDolar.fuente }}</span>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-menu>

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
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import menuConfig from './menu.json'
import { TasaDolarService } from '../utils/tasaDolar.js'

// Router y Route
const route = useRoute()
const router = useRouter()

// Estados
const drawer = ref(true)
const logoutDialog = ref(false)
const loggingOut = ref(false)
const menuItems = ref(menuConfig)
const tasaDolar = ref(null)
const tasaTimer = ref(null)
const tasaService = ref(null)
const tasaLoading = ref(true)
const tasaError = ref(false)
const tasaMenu = ref(false)

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

const tasaFormatter = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
})

const tasaDisplay = computed(() => {
    if (!tasaDolar.value) return ''
    const candidates = [
        tasaDolar.value.venta,
        tasaDolar.value.promedio,
        tasaDolar.value.compra
    ]
    const tasa = candidates
        .map((value) => Number(value))
        .find((value) => Number.isFinite(value) && value > 0)
    if (!Number.isFinite(tasa) || tasa <= 0) return ''
    return `Bs ${tasaFormatter.format(tasa)}`
})

const tasaTexto = computed(() => {
    if (tasaDisplay.value) return tasaDisplay.value
    if (tasaLoading.value) return 'Cargando...'
    return 'Sin datos'
})

const tasaFechaTexto = computed(() => {
    if (!tasaDolar.value?.fechaActualizacion) return 'Sin fecha'
    const date = new Date(tasaDolar.value.fechaActualizacion)
    if (Number.isNaN(date.getTime())) return 'Sin fecha'
    return date.toLocaleString('es-VE')
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

onMounted(async () => {
    if (!import.meta.client) return
    tasaService.value = window?.TasaDolar || new TasaDolarService()
    const cargarTasa = async () => {
        try {
            const data = await tasaService.value.obtenerTasa('oficial')
            tasaDolar.value = data
            tasaError.value = false
        } catch (error) {
            tasaError.value = true
        } finally {
            tasaLoading.value = false
        }
    }
    await cargarTasa()
    tasaTimer.value = setInterval(cargarTasa, 5 * 60 * 1000)
})

onBeforeUnmount(() => {
    if (tasaTimer.value) clearInterval(tasaTimer.value)
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
    padding: 16px 17px;
}

.brand-block {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 5.6px;
}

.brand-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 15px;
}

.brand-title {
    font-size: 1.05rem;
    font-weight: 600;
    color: #0b5b33;
    margin: 0;
}

.brand-subtitle {
    font-size: 0.6rem;
    color: #4f7d63;
    margin-bottom: 3.5px;
    text-transform: uppercase;
}

.menu-item {
    margin-top: 9px;
    margin-bottom: 9px;
    font-weight: 650;
}

.menu-pill {
    display: flex;
    align-items: center;
    gap: 12px;
}

.menu-text {
    font-size: 0.95rem;
    font-weight: 550;
    color: #0b5b33;
}

.menu-icon {
    background: transparent !important;
    background: rgba(2, 224, 106, 0.071) !important;
    color: #178950;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.menu-icon--active {
    background: rgba(4, 158, 75, 0.18) !important;
    color: #ffffff !important;
    border-color: transparent;
}

.menu-item--active {
    background: linear-gradient(135deg, #17c364 0%, #049e4b 100%) !important;
    color: white !important;
}

.menu-item--active .v-icon,
.menu-item--active .menu-text {
    color: white !important;
}

.menu-item--active .v-text {
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
    padding: 0 20px;
    min-height: 62px;
    display: flex;
    align-items: center;
}

.verdus-app-bar :deep(.v-app-bar-nav-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
}

.verdus-app-bar :deep(.v-toolbar-title) {
    display: flex;
    align-items: center;
    margin: 0;
}

.rate-chip {
    display: flex;
    align-items: left;
    gap: 8px;
    padding: 8px 2px;
    border-radius: 14px;
    margin-right: 19px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.rate-chip.v-btn) {
    background: linear-gradient(135deg, #f8fffb 0%, #eefaf3 100%) !important;
    border: 1px solid rgba(80, 202, 137, 0.5) !important;
    box-shadow: 0 6px 16px rgba(9, 94, 57, 0.1) !important;
}

:deep(.rate-chip.v-btn:hover) {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(9, 94, 57, 0.14) !important;
}

.rate-chip--muted {
    opacity: 0.8;
}

.rate-icon {
    color: #0b5b33;
}

.rate-label {
    margin: 0;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #2e6f4a;
}

.rate-value {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 700;
    color: #0b5b33;
}

.rate-menu {
    min-width: 260px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 18px 40px rgba(7, 56, 34, 0.18);
    background: #ffffff;
}

.rate-menu__title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #0b5b33;
    padding-bottom: 0;
}

.rate-menu__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 6px;
}

.rate-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: #f5fbf7;
    border-radius: 12px;
    padding: 10px 12px;
    color: #2e6f4a;
    font-size: 0.78rem;
}

.rate-meta__row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.text-red {
    color: #d32f2f !important;
}

.main-scroll {
    height: 100vh;
    overflow-y: auto;
    background: #f2f2f2 !important;
}

:global(body, #__nuxt, .v-application) {
    background: #f2f2f2 !important;
    font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

:global(.app-card) {
    border-radius: 24px;
    padding: 24px;
    background: #ffffff;
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 10px 22px rgba(7, 56, 34, 0.08);
}

:global(.app-section) {
    margin-bottom: 24px;
}

:global(.app-title) {
    font-size: 1.8rem;
    font-weight: 400;
    color: #053b2d;
    margin: 0 0 12px;
}

:global(.v-btn:not(.v-btn--icon)) {
    min-height: 44px;
    border-radius: 14px;
    padding-inline: 22px;
    text-transform: none;
    font-weight: 600;
    font-size: 0.95rem;
    color: #ffffff !important;
    background: linear-gradient(135deg, #0cc665 0%, #06a453 100%) !important;
    box-shadow: 0 6px 16px rgba(6, 164, 83, 0.22);
}
</style>