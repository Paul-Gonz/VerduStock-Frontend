<template>
    <section class="categoria-page">
        <v-card class="mb-8 section-card" rounded="lg" border>
            <v-card-title class="d-flex align-center justify-space-between">
                <span class="text-subtitle-1 font-weight-bold">Estadísticas por Categoría</span>
                <v-btn
                    class="new-category-btn"
                    color="success"
                    variant="flat"
                    prepend-icon="mdi-plus"
                    @click="openCreateDialog"
                >
                    Nueva categoría
                </v-btn>
            </v-card-title>
            <v-card-text>
                
                <v-row>
                    <v-col v-for="item in categoryStats" :key="item.id" cols="12" md="6">
                        <v-card class="stat-card" rounded="lg" border>
                            <v-card-text>
                                <div class="d-flex align-center justify-space-between">
                                    <div class="d-flex align-center ga-3">
                                        <v-avatar color="success-lighten-4" size="44">
                                            <v-icon color="success" :icon="item.icon"></v-icon>
                                        </v-avatar>
                                        <div>
                                            <div class="text-subtitle-1 font-weight-bold">{{ item.name }}</div>
                                            <div class="text-caption text-medium-emphasis">
                                                {{ item.products }} producto(s)
                                            </div>
                                        </div>
                                    </div>
                                    <v-chip color="success" variant="tonal" size="small">{{ item.tag }}</v-chip>
                                </div>

                                <v-divider class="my-3"></v-divider>

                                <v-row class="text-body-2">
                                    <v-col cols="6">
                                        <div class="text-medium-emphasis">Cantidad total</div>
                                        <div class="font-weight-semibold">{{ item.totalQty }}</div>
                                    </v-col>
                                    <v-col cols="6">
                                        <div class="text-medium-emphasis">Valor en venta</div>
                                        <div class="font-weight-semibold">{{ formatCurrency(item.totalValue) }}</div>
                                    </v-col>
                                </v-row>

                                <v-divider class="my-2"></v-divider>

                                <div class="gain-chip d-flex align-center justify-space-between">
                                    <div class="d-flex align-center ga-2">
                                        <v-icon size="18" icon="mdi-cash-multiple"></v-icon>
                                        <span class="text-body-2 font-weight-semibold">Ganancia</span>
                                    </div>
                                    <div class="font-weight-bold">{{ formatCurrency(item.profit) }}</div>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-card class="section-card" rounded="lg" border>
            <v-card-title class="text-subtitle-1 font-weight-bold">Productos por Categoría</v-card-title>
            <v-card-text>
                <div v-for="group in productGroups" :key="group.id" class="mb-8">
                    <div class="d-flex align-center ga-2 mb-4">
                        <v-avatar color="success-lighten-4" size="36">
                            <v-icon color="success" :icon="group.icon"></v-icon>
                        </v-avatar>
                        <div class="text-subtitle-2 font-weight-bold">{{ group.name }} ({{ group.items.length }})</div>
                    </div>

                    <v-row>
                        <v-col v-for="product in group.items" :key="product.id" cols="12" md="4">
                            <v-card class="product-card" rounded="lg" border>
                                <v-card-text>
                                    <div class="d-flex align-center justify-space-between">
                                        <div class="text-subtitle-2 font-weight-bold">{{ product.name }}</div>
                                        <v-chip
                                            :color="product.stockColor"
                                            size="small"
                                            variant="tonal"
                                            :class="{ 'stock-chip--success': product.stockColor === 'success' }"
                                        >
                                            {{ product.stock }}
                                        </v-chip>
                                    </div>

                                    <div class="mt-2 text-body-2 text-medium-emphasis d-flex align-center ga-2">
                                        <span>💰 Venta: {{ formatCurrency(product.price) }}</span>
                                    </div>
                                    <div class="mt-1 text-body-2 text-medium-emphasis d-flex align-center ga-2">
                                        <span>🚛 {{ product.source }}</span>
                                    </div>

                                    <v-divider class="my-3"></v-divider>

                                    <div class="d-flex align-center justify-space-between text-body-2">
                                        <span class="text-medium-emphasis">Disponibilidad</span>
                                        <span
                                            class="font-weight-semibold"
                                            :class="{ 'availability--low': product.progressColor === 'error' }"
                                        >
                                            {{ product.availability }}
                                        </span>
                                    </div>
                                    <v-progress-linear
                                        class="mt-2"
                                        :model-value="product.progress"
                                        :color="product.progressColor"
                                        height="6"
                                        rounded
                                        :class="{ 'progress--low': product.progressColor === 'error' }"
                                    ></v-progress-linear>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
            </v-card-text>
        </v-card>

        <v-dialog v-model="showCreateDialog" max-width="520" persistent>
            <v-card class="modal-card" rounded="xl" border>
                <v-card-title class="text-subtitle-1 font-weight-bold pb-0">
                    Registrar nueva categoría
                </v-card-title>
                <v-card-text>
                    <p class="text-body-2 text-medium-emphasis mb-4">
                        Ingresa los datos básicos para crear una categoría que podrás usar al asignar productos.
                    </p>
                    <v-form ref="categoryForm" @submit.prevent="submitCategory" class="d-flex flex-column ga-4">
                        <v-text-field
                            v-model="formulario.nombre"
                            label="Nombre"
                            variant="outlined"
                            density="comfortable"
                            :rules="[requiredRule]"
                            autofocus
                        ></v-text-field>
                        <v-textarea
                            v-model="formulario.descripcion"
                            label="Descripción"
                            variant="outlined"
                            density="comfortable"
                            rows="3"
                            auto-grow
                            :rules="[requiredRule]"
                        ></v-textarea>
                        <div class="d-flex justify-end ga-3 mt-2">
                            <v-btn variant="text" color="grey" @click="closeCreateDialog">Cancelar</v-btn>
                            <v-btn
                                type="submit"
                                color="success"
                                class="submit-btn"
                                prepend-icon="mdi-content-save"
                                :loading="cargando"
                                :disabled="cargando"
                            >
                                Guardar
                            </v-btn>
                        </div>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
    </section>
</template>

<script setup>
import { ref } from 'vue'

const { secureRequest } = useApi()

const formatter = new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
})

const formatCurrency = (value) => formatter.format(value)

const createStat = (id, name, products, totalQty, totalValue, profit, icon, tag = 'Activo') => ({
    id,
    name,
    products,
    totalQty,
    totalValue,
    profit,
    icon,
    tag,
})

const createProduct = (
    id,
    name,
    price,
    source,
    stock,
    stockColor,
    availability,
    progress,
    progressColor = stockColor,
) => ({
    id,
    name,
    price,
    source,
    stock,
    stockColor,
    availability,
    progress,
    progressColor,
})

const createGroup = (id, name, icon, items) => ({ id, name, icon, items })

const categoryStats = [
    createStat(1, 'Verduras', 4, '78.00', 149.2, 70.6, 'mdi-leaf'),
    createStat(2, 'Frutas', 3, '70.00', 171, 78.4, 'mdi-food-apple'),
]

const productGroups = [
    createGroup(1, 'Verduras', 'mdi-leaf', [
        createProduct(1, 'Tomate', 2.8, 'Mercado Central', '25 kg', 'success', 'Alta', 85),
        createProduct(2, 'Lechuga', 1.5, 'Huerta Local', '30 unidad', 'success', 'Alta', 80),
        createProduct(3, 'Cebolla', 1.8, 'Mercado Central', '5 kg', 'error', 'Baja', 25, 'error'),
        createProduct(4, 'Zanahoria', 1.4, 'Huerta Local', '18 kg', 'success', 'Media', 60, 'warning'),
    ]),
    createGroup(2, 'Frutas', 'mdi-food-apple', [
        createProduct(5, 'Manzana', 2.2, 'Productor Local', '8 kg', 'warning', 'Media', 55, 'warning'),
        createProduct(6, 'Banana', 1.9, 'Importadora', '40 kg', 'success', 'Alta', 90),
        createProduct(7, 'Naranja', 2.1, 'Mercado Central', '12 kg', 'warning', 'Media', 50, 'warning'),
    ]),
]

const showCreateDialog = ref(false)
const categoryForm = ref(null)
const formulario = ref({
    nombre: '',
    descripcion: '',
})
const cargando = ref(false)

const requiredRule = (value) => !!value?.trim() || 'Este campo es obligatorio'

const resetForm = () => {
    formulario.value = {
        nombre: '',
        descripcion: '',
    }
    categoryForm.value?.resetValidation?.()
}

const openCreateDialog = () => {
    resetForm()
    showCreateDialog.value = true
}

const closeCreateDialog = () => {
    showCreateDialog.value = false
}

const submitCategory = async () => {

    cargando.value = true
    try {
        console.log(formulario.value)
        await secureRequest('/categorias', {
            method: 'POST',
            body: formulario.value,
        })

        resetForm()
        closeCreateDialog()
    } catch (error) {
        console.error(error?.data || error)
    } finally {
        cargando.value = false
    }
}
</script>

<style scoped>
.categoria-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.section-card {
    border-color: rgba(34, 197, 94, 0.22);
    background: #ffffff;
    box-shadow: 0 6px 18px rgba(34, 197, 94, 0.08);
}

.section-card :deep(.v-card-title) {
    padding: 18px 22px 6px;
}

.section-card :deep(.v-card-text) {
    padding: 10px 22px 22px;
}

.stat-card,
.product-card {
    background: #f2fff6;
    border-color: rgba(34, 197, 94, 0.28);
    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.08);
}

.product-card {
    min-height: 210px;
}

.stat-card :deep(.v-card-text),
.product-card :deep(.v-card-text) {
    padding: 18px 18px 16px;
}

.new-category-btn {
    text-transform: none;
    font-weight: 600;
    border-radius: 12px;
    background: linear-gradient(135deg, #0bc965 0%, #05a552 100%) !important;
    color: #ffffff !important;
    box-shadow: none !important;
}

.new-category-btn :deep(.v-btn__overlay) {
    opacity: 0;
}

.new-category-btn :deep(.v-btn__content) {
    letter-spacing: 0.2px;
}

.gain-chip {
    border: 2px solid #7AF0A8;
    color: #05a552;
    background: #EEFCF5;
    padding: 6px 10px;
    border-radius: 10px;
    font-weight: 700;
}

.stock-chip--success {
    background: #EEFCF5 !important;
    color: #05a552 !important;
    border: 1.5px solid #7AF0A8;
}

.availability--low {
    color: #df2f26;
}

.progress--low :deep(.v-progress-linear__determinate) {
    background-color: #df2f26 !important;
}

.modal-card {
    background: #ffffff;
    border-color: rgba(34, 197, 94, 0.18);
    box-shadow: 0 18px 40px rgba(5, 165, 82, 0.22);
}

.submit-btn {
    text-transform: none;
    font-weight: 600;
}
</style>