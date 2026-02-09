<template>
    <v-container fluid class="pa-0">
        <section class="perfil-page">
            <v-card rounded="lg" class="section-card" border>
                <v-card-title class="pa-4 pa-md-6">
                    <div class="d-flex align-center ga-3">
                        <v-avatar color="success" size="56">
                            <v-icon size="28" color="white">mdi-account</v-icon>
                        </v-avatar>
                        <div>
                            <div class="text-h6 font-weight-bold">Mi Perfil</div>
                            <div class="text-body-2 text-medium-emphasis">Detalles de la cuenta</div>
                        </div>
                    </div>
                </v-card-title>

                <v-divider></v-divider>

                <v-card-text class="pa-4 pa-md-6">
                    <v-overlay v-model="loading" contained class="align-center justify-center">
                        <v-progress-circular indeterminate color="success"></v-progress-circular>
                    </v-overlay>

                    <v-row>
                        <v-col cols="12" sm="4" md="3">
                            <v-text-field v-model="form.id" label="ID" readonly variant="outlined" rounded="lg"
                                color="success" prepend-inner-icon="mdi-identifier" hide-details></v-text-field>
                        </v-col>

                        <v-col cols="12" sm="8" md="9">
                            <v-text-field v-model="form.nombre" label="Nombre de usuario" readonly variant="outlined"
                                rounded="lg" color="success" prepend-inner-icon="mdi-account-circle-outline"
                                hide-details></v-text-field>
                        </v-col>

                        <v-col cols="12" v-if="errorMessage">
                            <v-alert type="error" variant="tonal" rounded="lg" icon="mdi-alert-circle">
                                {{ errorMessage }}
                            </v-alert>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </section>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const form = ref({ id: '', nombre: '' })
const loading = ref(false)
const errorMessage = ref('')

const apiBase = 'http://localhost:8000'

const fetchProfile = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
        const res = await $fetch(`${apiBase}/usuarios/profile/me`, { credentials: 'include' })
        const user = (res && res.data) ? res.data : (res && res.user) ? res.user : res

        form.value.id = user.id || user._id || '---'
        form.value.nombre = user.nombre || user.name || user.username || 'Sin nombre'
    } catch (e) {
        errorMessage.value = 'No se pudo cargar la información.'
        console.error(e)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchProfile()
})
</script>

<style scoped>
.perfil-page {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 1.5rem;
}

.section-card {
    border-color: rgba(34, 197, 94, 0.3) !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05) !important;
}

/* Estilos para mantener el aspecto de solo lectura */
:deep(.v-field--variant-outlined.v-field--focused .v-field__outline) {
    --v-field-border-width: 1px !important;
}

:deep(.v-field__input) {
    cursor: default !important;
}
</style>