<template>
  <div class="h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-gray-100 overflow-hidden font-sans">

    <aside
      class="flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-20 shrink-0 shadow-sm relative"
      :class="drawer ? 'w-64' : 'w-18'">
      <div class="h-20 flex items-center border-b border-slate-100 dark:border-slate-800 shrink-0 transition-all duration-300 relative"
        :class="drawer ? 'px-5' : 'pl-3'">
        
        <div class="flex items-center gap-3 shrink-0">
          <img src="/logo.png" alt="Logo" class="w-8 h-8 object-contain drop-shadow-sm shrink-0 transition-all" />
          <div class="flex flex-col justify-center whitespace-nowrap overflow-hidden transition-all duration-300"
               :class="drawer ? 'opacity-100 w-auto' : 'opacity-0 w-0'">
            <h1 class="text-[15px] font-bold text-slate-800 dark:text-gray-100 leading-none">Disfruver</h1>
            <p class="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mt-1">Del campo a tu casa</p>
          </div>
        </div>

        <!-- Toggle Button (Half pill on the right edge) -->
        <button @click="drawer = !drawer"
          class="absolute top-1/2 -translate-y-1/2 w-4 h-8 bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-all duration-300 shadow-md z-50 cursor-pointer"
          :class="drawer ? 'right-0 rounded-l-lg' : '-right-4 rounded-r-lg'"
          title="Alternar menú">
          <svg class="w-3 h-3" :class="drawer ? 'ml-0.5' : 'mr-0.5'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="drawer" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
 
      <nav class="flex-1 overflow-y-auto py-5 px-3 space-y-1 overflow-x-hidden mt-1">
        <NuxtLink v-for="item in menuItems" :key="item.title" :to="item.route"
          class="flex items-center rounded-lg transition-all text-sm font-medium whitespace-nowrap" :class="[
            isActive(item.route) 
              ? 'bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-900 hover:text-green-600 dark:hover:text-green-400',
            drawer ? 'px-3 py-2.5 gap-3' : 'px-0 py-2.5 justify-center'
          ]" :title="!drawer ? item.title : ''">
          <span class="flex items-center justify-center transition-colors shrink-0"
            :class="isActive(item.route) ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'">
 
            <svg v-if="item.icon === 'mdi-home'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
 
            <svg v-else-if="item.icon === 'mdi-food-apple'" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
 
            <svg v-else-if="item.icon === 'mdi-cash'" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
 
            <svg v-else-if="item.icon === 'mdi-folder'" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
 
            <svg v-else-if="item.icon === 'mdi-truck'" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
 
            <svg v-else-if="item.icon === 'mdi-account-group'" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
 
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="2" />
            </svg>
 
          </span>
          <span v-show="drawer">{{ item.title }}</span>
        </NuxtLink>
      </nav>
 
      <div class="py-4 border-t border-slate-100 dark:border-slate-800 text-center shrink-0 whitespace-nowrap overflow-hidden">
        <div v-show="drawer">
          <p class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Sistema de Gestión v1.0</p>
          <p class="text-[9px] text-slate-300 dark:text-slate-600 mt-0.5">© 2026 LoopInf</p>
        </div>
        <div v-show="!drawer">
          <p class="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-1">V 1.0</p>
        </div>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0 transition-transform">

      <header
        class="h-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-sm relative">

        <div class="flex items-center gap-4 transition-all duration-300" :class="!drawer && 'pl-5'">

          <div class="hidden sm:flex flex-col justify-center">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-gray-100 tracking-tight leading-none mb-1.5">
              {{ pageTitle }}
            </h2>
            <p v-if="pageTitle === 'Dashboard'" class="uppercase tracking-[0.15em] text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-none">
              Resumen General
            </p>
            <p v-else class="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">
              Gestión de {{ pageTitle }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 sm:gap-5">

          <button @click="toggleDarkMode"
            class="group relative p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center overflow-hidden"
            :class="isDark 
              ? 'bg-slate-800 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.1)]' 
              : 'bg-slate-50 text-slate-500 hover:text-green-600 shadow-sm'"
            :title="isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'">
            <div class="relative w-5 h-5 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
              <svg v-if="isDark" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <span class="absolute inset-0 bg-white/10 dark:bg-black/10 opacity-0 group-active:opacity-100 transition-opacity"></span>
          </button>

          <div v-if="tasaDolar" class="relative hidden sm:flex flex-col items-end mr-2">
            <button @click="showTasaDetails = !showTasaDetails"
              class="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-800/50 border border-green-200 px-3 py-1 rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/30">
              <span class="text-[9px] uppercase font-bold tracking-widest text-green-700 dark:text-green-400 leading-none mb-0.5">Tasa
                BCV</span>
              <span class="text-[13px] font-extrabold text-green-900 dark:text-green-100 leading-none">{{ tasaTexto }}</span>
            </button>

            <div v-if="showTasaDetails"
              class="absolute top-full mt-2 right-0 w-60 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl shadow-lg p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2 border-b border-slate-100 dark:border-gray-700 pb-2">
                  <span class="flex items-center justify-center bg-green-100 dark:bg-green-900/40 rounded-full p-1.5 text-green-700 dark:text-green-400">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span class="font-bold text-slate-700 dark:text-gray-200 text-sm">Detalles de Tasa</span>
                </div>
                <div class="flex justify-between items-center px-1">
                  <span class="text-xs text-slate-500 dark:text-gray-400 font-medium whitespace-nowrap mr-2">Fuente:</span>
                  <span
                    class="text-[10px] font-bold text-slate-800 dark:text-gray-200 bg-slate-100 dark:bg-gray-700 px-2 py-0.5 rounded-md text-right">BCV</span>
                </div>
                <div class="flex justify-between items-center px-1">
                  <span class="text-xs text-slate-500 dark:text-gray-400 font-medium">Actualizado:</span>
                  <span class="text-[11px] font-semibold text-slate-600 dark:text-gray-300 text-right">{{ tasaDolar.fechaActualizacion ?
                    new Date(tasaDolar.fechaActualizacion).toLocaleString('es-VE') : 'N/A' }}</span>
                </div>
                <button @click="showTasaDetails = false"
                  class="w-full mt-1 text-xs text-center text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 py-1 transition-colors">
                  Cerrar
                </button>
              </div>
            </div>
          </div>

          <div class="relative" ref="profileMenuRef">
            <button @click="toggleProfileMenu"
              class="p-0.5 rounded-full border-2 transition-all focus:outline-none bg-slate-50 dark:bg-gray-700 text-green-600 overflow-hidden shadow-sm"
              :class="showProfileMenu ? 'border-green-200 ring-2 ring-green-100' : 'border-transparent hover:border-green-100 dark:hover:border-green-900'">
              <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 12q2.075 0 3.538-1.463Q17 9.075 17 7q0-2.075-1.462-3.538Q14.075 2 12 2T8.463 3.462Q7 5.075 7 7q0 2.075 1.463 3.537Q9.925 12 12 12Zm0 3q-3.575 0-7.312 1.838Q1 18.675 1 22h22q0-3.325-3.687-5.162Q15.575 15 12 15Z" />
              </svg>
            </button>

            <transition enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0">
              <div v-if="showProfileMenu"
                class="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-gray-700 py-1.5 z-50">
                <button @click="goToProfile"
                  class="w-full text-left px-4 py-1.5 text-[13px] text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-green-600 transition-colors">
                  Mi Perfil
                </button>
                <div class="border-t border-slate-50 dark:border-gray-700 my-1"></div>
                <button @click="confirmLogout"
                  class="w-full text-left px-4 py-1.5 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Cerrar Sesión
                </button>
              </div>
            </transition>
          </div>

        </div>
      </header>

      <main class="flex-1 overflow-y-auto bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100 scroll-smooth">
        <slot />
      </main>

    </div>

    <BaseModal :isOpen="logoutDialog" title="Cerrar Sesión" variant="danger" :loading="loggingOut"
      @close="logoutDialog = false" @confirm="logout" confirmText="Cerrar Sesión">
      <p class="text-gray-600 dark:text-gray-400 text-sm">¿Estás seguro de que deseas cerrar tu sesión?</p>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import menuConfig from './menu.json'
import { TasaDolarService } from '../utils/tasaDolar.js'
import { useTheme } from '~/composables/useTheme'

const { api } = useApi()
const token = useCookie('auth_token')

const route = useRoute()
const router = useRouter()

const drawer = ref(true)
const logoutDialog = ref(false)
const loggingOut = ref(false)
const menuItems = ref(menuConfig)
const showTasaDetails = ref(false)

const showProfileMenu = ref(false)
const profileMenuRef = ref(null)

const { isDark, toggleDark: toggleDarkMode, initTheme } = useTheme()

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

const closeMenusOnClickOutside = (event) => {
  if (profileMenuRef.value && !profileMenuRef.value.contains(event.target)) {
    showProfileMenu.value = false
  }
}

const tasaDolar = ref(null)
const tasaTimer = ref(null)
const tasaService = ref(null)
const tasaLoading = ref(true)
const tasaError = ref(false)

const isActive = (targetRoute) => route.path.startsWith(targetRoute)

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

  return tasa > 0 ? `Bs ${tasaFormatter.format(tasa)}` : ''
})

const tasaTexto = computed(() => {
  if (tasaDisplay.value) return tasaDisplay.value
  return tasaLoading.value ? 'Cargando...' : 'Sin datos'
})

const goToProfile = () => {
  showProfileMenu.value = false
  router.push('/perfil')
}

const confirmLogout = () => {
  showProfileMenu.value = false
  logoutDialog.value = true
}

const logout = async () => {
  loggingOut.value = true
  try {
    await api('/logout', { method: 'POST' })
  } catch (error) {
    console.warn("No se pudo invalidar el token en el servidor, limpiando localmente...")
  } finally {
    token.value = null
    loggingOut.value = false
    logoutDialog.value = false
    window.location.href = '/login'
  }
}

onMounted(async () => {
  initTheme()

  document.addEventListener('click', closeMenusOnClickOutside)

  if (!token.value) {
    router.push('/login')
    return
  }

  try {
    const response = await api('/check-auth')
    if (response && response.authenticated === false) {
      token.value = null
      router.push('/login')
    }
  } catch (e) {
    console.warn("Verificación de auth en espera (servidor ocupado o red lenta).")
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
  document.removeEventListener('click', closeMenusOnClickOutside)
  if (tasaTimer.value) clearInterval(tasaTimer.value)
})
</script>
