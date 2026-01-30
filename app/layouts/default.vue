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

        <v-main class="bg-grey-lighten-4">
            <v-container fluid>
                <!-- El contenido de cada página se renderizará aquí -->
                <slot />
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup>
import { ref } from 'vue'
import menuConfig from './menu.json';


// Controla la visibilidad del menú lateral
const drawer = ref(true)

// Estos son los items del menú. Idealmente, vendrían de un archivo menu.json
const menuItems = ref(menuConfig)
</script>