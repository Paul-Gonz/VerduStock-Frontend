<template>
    <div class="h-full w-full p-4">
        <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg border border-green-500/30 shadow-sm relative overflow-hidden">
                <div class="p-4 md:p-6 flex items-center gap-3">
                    <div class="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <div class="text-xl font-bold text-gray-800">Mi Perfil</div>
                        <div class="text-sm text-gray-500">Detalles de la cuenta</div>
                    </div>
                </div>

                <hr class="border-t border-gray-200" />

                <div class="p-4 md:p-6 relative">
                    <div v-if="loading" class="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                        <svg class="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div class="sm:col-span-4 md:col-span-3 space-y-1">
                            <label class="block text-sm font-medium text-gray-700">ID</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                <input v-model="form.id" type="text" readonly
                                    class="pl-10 block w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-500 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm cursor-default" />
                            </div>
                        </div>

                        <div class="sm:col-span-8 md:col-span-9 space-y-1">
                            <label class="block text-sm font-medium text-gray-700">Nombre de usuario</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <input v-model="form.nombre" type="text" readonly
                                    class="pl-10 block w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-500 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm cursor-default" />
                            </div>
                        </div>

                        <div v-if="errorMessage" class="col-span-1 sm:col-span-12">
                            <div class="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start">
                                <div class="shrink-0">
                                    <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-red-800">{{ errorMessage }}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const { perfil, loading, error, fetchMyProfile } = usePerfil()

onMounted(() => {
    fetchMyProfile()
})
</script>

<template>
    <div v-if="loading">Cargando...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="perfil">
        <input v-model="perfil.nombre" readonly />
    </div>
</template>