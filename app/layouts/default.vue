<template>
    <v-app id="verdustock-app">
        <v-navigation-drawer
            v-model="drawer"
            app
            width="292"
            class="verdus-nav"
            border="0"
            elevation="2"
        >
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
                    <v-list-item
                        v-for="item in menuItems"
                        :key="item.title"
                        :to="item.route"
                        rounded="lg"
                        class="menu-item"
                        :class="{ 'menu-item--active': isActive(item.route) }"
                    >
                        <template #prepend>
                            <div class="menu-pill">
                                <v-avatar :class="['menu-icon', { 'menu-icon--active': isActive(item.route) }]" size="40">
                                    <v-icon :icon="item.icon"></v-icon>
                                </v-avatar>
                                <span class="menu-text">
                                    {{ item.title }}
                                </span>
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
                Bienvenido
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <!-- Menú de Usuario -->
            <v-menu>
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon class="mr-2">
                        <v-avatar color="success" size="36">
                            <!-- Idealmente la inicial del usuario -->
                            <span class="white--text text-h6">U</span>
                        </v-avatar>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item title="Mi Perfil" prepend-icon="mdi-account-circle-outline"></v-list-item>
                    <v-list-item title="Cerrar Sesión" prepend-icon="mdi-logout" class="text-red"></v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-main class="bg-grey-lighten-4 main-scroll">
            <v-container fluid>
                <!-- El contenido de cada página se renderizará aquí -->
                <slot />
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from '#imports'
import menuConfig from './menu.json'


// Controla la visibilidad del menú lateral
const drawer = ref(true)
const route = useRoute()

// Estos son los items del menú. Idealmente, vendrían de un archivo menu.json
const menuItems = ref(menuConfig)

const isActive = (targetRoute) => route.path.startsWith(targetRoute)
</script>

<style scoped>
:global(html), :global(body) {
    height: 100%;
    margin: 0;
    overflow: hidden;
}

#verdustock-app {
    font-family: 'Nunito', 'Segoe UI', sans-serif;
    height: 100%;
}

.verdus-nav {
    background: linear-gradient(180deg, #f7fff9 0%, #e7f9ec 28%, #def4e6 100%);
    border-right: 1px solid rgba(5, 148, 72, 0.08) !important;
    padding: 18px 12px 26px;
}

.nav-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.brand-block {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 10px;
}

.brand-icon {
    width: 52px;
    height: 52px;
    border-radius: 18px;
    background: linear-gradient(145deg, #ecfff4 0%, #c3f5d8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 0 1.5px rgba(5, 147, 74, 0.18);
}

.brand-title {
    font-size: 1.1rem;
    margin: 0;
    font-weight: 700;
    color: #0b5b33;
}

.brand-subtitle {
    margin: 0;
    font-size: 0.78rem;
    letter-spacing: 0.04rem;
    text-transform: uppercase;
    color: #4f7d63;
}

.nav-divider {
    border-color: rgba(5, 147, 74, 0.14) !important;
    margin-inline: 6px;
}

.nav-list {
    flex: 1;
    padding-top: 6px;
    padding-right: 4px;
}

.menu-item {
    margin: 4px 4px;
    color: #1b3d2c;
    font-weight: 600;
    transition: background 0.2s ease, color 0.2s ease;
    padding-inline: 8px;
}

.menu-pill {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.menu-text {
    font-size: 0.95rem;
    white-space: nowrap;
}

.menu-icon {
    background: rgba(5, 147, 74, 0.08);
    color: #0b5b33;
}

.menu-item--active {
    background: linear-gradient(135deg, #17c364 0%, #049e4b 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 6px 20px rgba(4, 158, 75, 0.25);
}

.menu-item--active .v-list-item-title,
.menu-item--active .v-icon {
    color: #ffffff !important;
}

.menu-item--active .menu-icon {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
}

.menu-icon--active {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
}

.nav-footer {
    padding: 6px 10px 0;
    text-align: center;
    font-size: 0.78rem;
    color: #4f7d63;
}

.nav-version {
    margin: 0;
    font-weight: 600;
}

.nav-copy {
    margin: 0;
}

.verdus-app-bar {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
    background: #fefefe !important;
}

.verdus-app-bar :deep(.v-toolbar-title) {
    color: #0f3d2a;
}

.bg-grey-lighten-4 {
    background: #f8fbf8 !important;
}

.main-scroll {
    height: calc(100vh - var(--v-layout-top, 64px));
    overflow-y: auto;
}
</style>