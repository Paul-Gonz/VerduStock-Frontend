<template>
    <div class="min-h-screen bg-gray-50 dark:bg-[#0f1522] text-gray-700 dark:text-slate-300 p-6 font-sans">

        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-wide">Registro Diario</h1>
                <p class="text-sm text-gray-500 dark:text-slate-400 mt-1">Gestión de ventas y compras de la jornada</p>
            </div>

            <div class="flex gap-3">
                <button @click="generarReporte"
                    class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e293b] hover:bg-gray-100 dark:hover:bg-[#334155] border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium transition-colors text-gray-700 dark:text-slate-300">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                        </path>
                    </svg>
                    Generar Reporte
                </button>

                <button @click="terminarDia" :disabled="cargando"
                    class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-sm font-medium shadow-[0_0_15px_rgba(5,150,105,0.3)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg v-if="cargando" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Terminar Día
                </button>
            </div>
        </header>

        <!-- Tarjetas de resumen -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white dark:bg-[#151e2f] border border-gray-100 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-lg">
                <div class="flex justify-between items-start mb-4">
                    <div class="p-2 bg-emerald-500/10 rounded-lg">
                        <svg class="w-6 h-6 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                    </div>
                    <span class="text-xs font-medium px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">Hoy</span>
                </div>
                <p class="text-sm text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Ventas Totales</p>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white">${{ totalIngresos.toFixed(2) }}</h2>
            </div>

            <div class="bg-white dark:bg-[#151e2f] border border-gray-100 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-lg">
                <div class="flex justify-between items-start mb-4">
                    <div class="p-2 bg-red-500/10 rounded-lg">
                        <svg class="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-sm text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Compras Totales</p>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white">${{ totalGastos.toFixed(2) }}</h2>
            </div>

            <div class="bg-white dark:bg-[#151e2f] border border-gray-100 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-lg">
                <div class="flex justify-between items-start mb-4">
                    <div class="p-2 bg-blue-500/10 rounded-lg">
                        <svg class="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3">
                            </path>
                        </svg>
                    </div>
                </div>
                <p class="text-sm text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Balance Neto</p>
                <h2 class="text-3xl font-bold" :class="balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                    ${{ balance.toFixed(2) }}
                </h2>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Formulario -->
            <div class="bg-white dark:bg-[#151e2f] border border-gray-100 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-lg h-fit">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Nuevo Movimiento</h3>
                <form @submit.prevent="registrarMovimiento" class="space-y-4">
                    <!-- Tipo -->
                    <div>
                        <label class="block text-sm text-gray-500 dark:text-slate-400 mb-2">Tipo de operación</label>
                        <div class="flex bg-gray-100 dark:bg-[#0f1522] rounded-lg p-1 border border-gray-200 dark:border-slate-700">
                            <button type="button" @click="form.tipo = 'ingreso'"
                                class="flex-1 py-2 text-sm font-medium rounded-md transition"
                                :class="form.tipo === 'ingreso' ? 'bg-emerald-600 text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'">Venta</button>
                            <button type="button" @click="form.tipo = 'gasto'"
                                class="flex-1 py-2 text-sm font-medium rounded-md transition"
                                :class="form.tipo === 'gasto' ? 'bg-red-600 text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'">Compra</button>
                        </div>
                    </div>

                    <!-- Concepto -->
                    <div>
                        <label class="block text-sm text-gray-500 dark:text-slate-400 mb-2">Concepto / Descripción</label>
                        <input v-model="form.concepto" type="text" required
                            class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                            placeholder="Ej. Venta en mostrador, Pago a proveedor...">
                    </div>

                    <!-- Producto con botón + -->
                    <div>
                        <label class="block text-sm text-gray-500 dark:text-slate-400 mb-2">Producto</label>
                        <div class="flex gap-2">
                            <select v-model="form.producto_id" required
    class="w-[240px] bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition truncate"
    @change="onProductoChange">
    <option value="">Seleccione producto...</option>
    <option v-for="p in listaProductos" :key="p.id" :value="p.id" class="truncate">
        {{ p.nombre }} ({{ (p.kilogramos || 0).toFixed(1) }} kg)
    </option>
</select>
                            <button type="button" @click="abrirModalProducto" 
                                class="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white font-medium transition">
                                +
                            </button>
                        </div>
                    </div>

                    <div v-if="form.precio_venta_kg && form.producto_id" 
                         class="flex items-center gap-2 text-sm p-2 rounded-lg"
                         :class="form.tipo === 'gasto' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'">
                        <span class="text-gray-600 dark:text-slate-400">
                            Precio por kg ({{ form.tipo === 'gasto' ? 'compra' : 'venta' }}):
                        </span>
                        <span class="font-bold" 
                             :class="form.tipo === 'gasto' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'">
                            ${{ form.precio_venta_kg.toFixed(2) }}
                        </span>
                    </div>

                    <!-- Cantidad en KG -->
                    <div>
                        <label class="block text-sm text-gray-500 dark:text-slate-400 mb-2">
                            {{ form.tipo === 'ingreso' ? 'Cantidad Vendida (kg)' : 'Cantidad Comprada (kg)' }}
                        </label>
                        <input v-model.number="form.cantidad" type="number" step="0.001" min="0.001" required
                            class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                            placeholder="0.000"
                            @input="recalcularMonto">
                        <div v-if="form.cantidad && form.monto && form.producto_id" class="mt-2 text-xs text-gray-500">
                            Precio por kg ({{ form.tipo === 'gasto' ? 'compra' : 'venta' }}): 
                            ${{ (form.monto / form.cantidad).toFixed(2) }}
                        </div>
                    </div>

                    <!-- Monto -->
                    <div>
                        <label class="block text-sm text-gray-500 dark:text-slate-400 mb-2">Monto Total ($)</label>
                        <input v-model.number="form.monto" type="number" step="0.01" min="0.01" required
                            class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                            placeholder="0.00">
                    </div>

                    <!-- Proveedor (solo para compras) -->
                    <div v-if="form.tipo === 'gasto'">
                        <label class="block text-sm text-gray-500 dark:text-slate-400 mb-2">Proveedor</label>
                        <div class="flex gap-2">
                            <select v-model="form.proveedor_id" 
                                class="flex-1 bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition">
                                <option value="">Seleccione un proveedor...</option>
                                <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">
                                    {{ prov.nombre }}
                                </option>
                            </select>
                            <button type="button" @click="abrirModalProveedor" 
                                class="px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white font-medium transition">
                                +
                            </button>
                        </div>
                    </div>

                    <button type="submit" :disabled="cargandoMovimiento"
                        class="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="cargandoMovimiento" class="flex items-center justify-center gap-2">
                            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                        </span>
                        <span v-else>Registrar {{ form.tipo === 'ingreso' ? 'Venta' : 'Compra' }}</span>
                    </button>
                </form>
            </div>

            <!-- Tabla de movimientos -->
            <div class="lg:col-span-2 bg-white dark:bg-[#151e2f] border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-lg flex flex-col">
                <div class="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Últimos Movimientos</h3>
                    <div class="flex items-center gap-4">
                        <div class="flex bg-gray-100 dark:bg-[#0f1522] rounded-lg p-1 border border-gray-200 dark:border-slate-700 text-sm">
                            <button @click="filtroTipo = 'todos'" :class="filtroTipo === 'todos' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'" class="px-3 py-1.5 rounded-md transition">Todos</button>
                            <button @click="filtroTipo = 'ingreso'" :class="filtroTipo === 'ingreso' ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'" class="px-3 py-1.5 rounded-md transition">Ventas</button>
                            <button @click="filtroTipo = 'gasto'" :class="filtroTipo === 'gasto' ? 'bg-red-600/20 text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'" class="px-3 py-1.5 rounded-md transition">Compras</button>
                        </div>
                        <span class="text-sm text-gray-500 dark:text-slate-400 hidden md:block">Hoy, {{ fechaActual }}</span>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50/80 dark:bg-[#0f1522]/50 text-gray-500 dark:text-slate-400">
                            <tr>
                                <th class="px-6 py-4 font-medium">Hora</th>
                                <th class="px-6 py-4 font-medium">Concepto</th>
                                <th class="px-6 py-4 font-medium">Producto</th>
                                <th class="px-6 py-4 font-medium">Cantidad (kg)</th>
                                <th class="px-6 py-4 font-medium text-right">Monto</th>
                                <th class="px-6 py-4 font-medium text-center">Tipo</th>
                                <th class="px-6 py-4 font-medium text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-slate-800/50">
                            <tr v-if="cargandoMovimientos">
                                <td colspan="7" class="px-6 py-8 text-center text-gray-400 dark:text-slate-500">
                                    <svg class="w-8 h-8 animate-spin mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Cargando movimientos...
                                </td>
                            </tr>
                            <tr v-else-if="movimientosFiltrados.length === 0">
                                <td colspan="7" class="px-6 py-8 text-center text-gray-400 dark:text-slate-500">
                                    No hay movimientos registrados para este filtro.
                                </td>
                            </tr>
                            <tr v-for="mov in movimientosFiltrados" :key="mov.id" class="hover:bg-gray-50 dark:hover:bg-slate-800/20 transition">
                                <td class="px-6 py-4 text-gray-500 dark:text-slate-400">{{ mov.hora }}</td>
                                <td class="px-6 py-4 font-medium text-gray-800 dark:text-slate-200">{{ mov.concepto }}</td>
                                <td class="px-6 py-4 text-gray-500 dark:text-slate-400">{{ mov.producto_nombre || '-' }}</td>
                                <td class="px-6 py-4 text-gray-600 dark:text-slate-300 font-mono">
                                    {{ mov.cantidad ? mov.cantidad.toFixed(3) + ' kg' : '-' }}
                                </td>
                                <td class="px-6 py-4 text-right font-mono"
                                    :class="mov.tipo === 'ingreso' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                                    {{ mov.tipo === 'ingreso' ? '+' : '-' }}${{ mov.monto.toFixed(2) }}
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                                        :class="mov.tipo === 'ingreso' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'">
                                        {{ mov.tipo === 'ingreso' ? 'Venta' : 'Compra' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-center">
    <button @click="eliminarMovimiento(mov)" class="text-red-500 hover:text-red-700 transition" title="Eliminar movimiento">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    </button>
</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal para crear producto - VERSIÓN MEJORADA -->
<div v-if="showModalProducto" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-[#151e2f] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 transform transition-all">
        <!-- Encabezado -->
        <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-slate-700">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">➕ Nuevo Producto</h3>
            <button @click="showModalProducto = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <form @submit.prevent="guardarProducto">
            <div class="grid grid-cols-2 gap-4">
                <!-- Nombre del producto - ocupa 2 columnas -->
                <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Nombre del producto <span class="text-red-500">*</span>
                    </label>
                    <input v-model="nuevoProducto.nombre" type="text" required
                        class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                        placeholder="Ej. Tomate, Cebolla, Pimiento...">
                </div>

                <!-- Categoría -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Categoría <span class="text-red-500">*</span>
                    </label>
                    <select v-model="nuevoProducto.categoria_id" required
                        class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition">
                        <option value="">Seleccione una categoría</option>
                        <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
                    </select>
                </div>

                <!-- Proveedor -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Proveedor <span class="text-red-500">*</span>
                    </label>
                    <select v-model="nuevoProducto.proveedor_id" required
                        class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition">
                        <option value="">Seleccione un proveedor</option>
                        <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">{{ prov.nombre }}</option>
                    </select>
                </div>

                <!-- Stock inicial -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Stock inicial (kg) <span class="text-red-500">*</span>
                    </label>
                    <input v-model.number="nuevoProducto.kilogramos" type="number" step="0.001" required
                        class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                        placeholder="0.000">
                </div>

                <!-- Precio de compra -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Precio de compra ($/kg) <span class="text-red-500">*</span>
                    </label>
                    <input v-model.number="nuevoProducto.precio_compra" type="number" step="0.01" required
                        class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                        placeholder="0.00">
                </div>

                <!-- Precio de venta -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Precio de venta ($/kg) <span class="text-red-500">*</span>
                    </label>
                    <input v-model.number="nuevoProducto.precio_venta_kg" type="number" step="0.01" required
                        class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                        placeholder="0.00">
                </div>

                <!-- Margen de ganancia (calculado automáticamente) -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Margen de ganancia
                    </label>
                    <div class="w-full bg-gray-100 dark:bg-[#0a0f18] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-600 dark:text-slate-400">
                        {{ calcularMargen() }}%
                    </div>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button type="button" @click="showModalProducto = false"
                    class="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300 font-medium transition">
                    Cancelar
                </button>
                <button type="submit" :disabled="guardandoProducto"
                    class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <svg v-if="guardandoProducto" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span v-else>Guardar Producto</span>
                </button>
            </div>
        </form>
    </div>
</div>

    </div>

    <!-- Modal de confirmación para Terminar Día -->
<div v-if="showModalCierre" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-[#151e2f] rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
        <div class="text-center">
            <!-- Icono -->
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                <svg class="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cerrar Día</h3>
            <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">
                ¿Estás seguro de que deseas cerrar el día? Esta acción no se puede deshacer.
            </p>
            
            <!-- Resumen del día -->
            <div class="bg-gray-50 dark:bg-[#0f1522] rounded-lg p-3 mb-4 text-sm">
                <div class="flex justify-between mb-2">
                    <span class="text-gray-500 dark:text-slate-400">Ventas Totales:</span>
                    <span class="font-medium text-emerald-600 dark:text-emerald-400">${{ totalIngresos.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-gray-500 dark:text-slate-400">Compras Totales:</span>
                    <span class="font-medium text-red-600 dark:text-red-400">${{ totalGastos.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-slate-700">
                    <span class="font-medium text-gray-700 dark:text-slate-300">Balance Final:</span>
                    <span class="font-bold" :class="balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                        ${{ balance.toFixed(2) }}
                    </span>
                </div>
            </div>
            
            <div class="flex gap-3">
                <button type="button" @click="showModalCierre = false"
                    class="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300 transition">
                    Cancelar
                </button>
                <button type="button" @click="confirmarCierre" :disabled="cerrando"
                    class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="cerrando" class="flex items-center justify-center gap-2">
                        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                    </span>
                    <span v-else>Confirmar Cierre</span>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Modal de éxito después del cierre -->
<div v-if="showModalExito" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-[#151e2f] rounded-xl shadow-xl max-w-sm w-full p-6 transform transition-all">
        <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                <svg class="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Día Cerrado</h3>
            <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">
                El día ha sido cerrado exitosamente.
            </p>
            <div class="bg-gray-50 dark:bg-[#0f1522] rounded-lg p-3 mb-4">
                <div class="flex justify-between">
                    <span class="text-gray-500 dark:text-slate-400">Balance Final:</span>
                    <span class="font-bold text-lg" :class="balanceExito >= 0 ? 'text-emerald-600' : 'text-red-600'">
                        ${{ balanceExito.toFixed(2) }}
                    </span>
                </div>
            </div>
            <button @click="showModalExito = false"
                class="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition">
                Aceptar
            </button>
        </div>
    </div>
</div>

<!-- Modal de error -->
<div v-if="showModalError" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-[#151e2f] rounded-xl shadow-xl max-w-sm w-full p-6 transform transition-all">
        <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error</h3>
            <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">
                {{ mensajeError }}
            </p>
            <button @click="showModalError = false"
                class="w-full px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition">
                Cerrar
            </button>
        </div>
    </div>
</div>

<!-- Modal de éxito al crear producto -->
<div v-if="showModalExitoProducto" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-[#151e2f] rounded-xl shadow-xl max-w-sm w-full p-6 transform transition-all">
        <div class="text-center">
            <!-- Icono de éxito -->
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                <svg class="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">✅ Producto Creado</h3>
            <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">
                El producto <span class="font-semibold text-emerald-600">{{ productoRecienCreado }}</span> ha sido creado exitosamente.
            </p>
            
            <div class="bg-gray-50 dark:bg-[#0f1522] rounded-lg p-3 mb-4 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-500 dark:text-slate-400">Stock inicial:</span>
                    <span class="font-medium text-gray-800 dark:text-slate-200">{{ productoRecienStock }} kg</span>
                </div>
            </div>
            
            <button @click="showModalExitoProducto = false"
                class="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Continuar
            </button>
        </div>
    </div>
</div>

<!-- Modal de Reportes -->
<div v-if="showModalReporte" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-[#151e2f] rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Generar Reporte</h3>
            <button @click="showModalReporte = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <form @submit.prevent="generarReporteSubmit">
            <!-- Tipo de reporte -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Tipo de Reporte</label>
                <div class="grid grid-cols-3 gap-2">
                    <button type="button" @click="reporteFiltros.tipo = 'todos'"
                        :class="reporteFiltros.tipo === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'"
                        class="px-3 py-2 rounded-lg text-sm font-medium transition">
                        Completo
                    </button>
                    <button type="button" @click="reporteFiltros.tipo = 'ingreso'"
                        :class="reporteFiltros.tipo === 'ingreso' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'"
                        class="px-3 py-2 rounded-lg text-sm font-medium transition">
                        Solo Ventas
                    </button>
                    <button type="button" @click="reporteFiltros.tipo = 'gasto'"
                        :class="reporteFiltros.tipo === 'gasto' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'"
                        class="px-3 py-2 rounded-lg text-sm font-medium transition">
                        Solo Compras
                    </button>
                </div>
            </div>

            <!-- Rango de fechas -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Rango de Fechas</label>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-slate-400 mb-1">Desde</label>
                        <input type="date" v-model="reporteFiltros.fecha_desde" required
                            class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-slate-400 mb-1">Hasta</label>
                        <input type="date" v-model="reporteFiltros.fecha_hasta" required
                            class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition">
                    </div>
                </div>
            </div>

            <!-- Botones rápidos de fechas -->
            <div class="mb-6">
                <label class="block text-xs text-gray-500 dark:text-slate-400 mb-2">Fechas rápidas</label>
                <div class="flex flex-wrap gap-2">
                    <button type="button" @click="setFechaRapida('hoy')" class="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-800 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                        Hoy
                    </button>
                    <button type="button" @click="setFechaRapida('ayer')" class="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-800 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                        Ayer
                    </button>
                    <button type="button" @click="setFechaRapida('semana')" class="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-800 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                        Última Semana
                    </button>
                    <button type="button" @click="setFechaRapida('mes')" class="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-800 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                        Último Mes
                    </button>
                    <button type="button" @click="setFechaRapida('trimestre')" class="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-800 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                        Último Trimestre
                    </button>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex gap-3">
                <button type="button" @click="showModalReporte = false"
                    class="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300 transition">
                    Cancelar
                </button>
                <button type="submit" :disabled="generandoReporte"
                    class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="generandoReporte" class="flex items-center justify-center gap-2">
                        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generando...
                    </span>
                    <span v-else>Generar Reporte</span>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Modal para mostrar el reporte generado -->
<div v-if="showModalResultado" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-[#151e2f] rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col p-6">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Reporte Generado</h3>
            <button @click="showModalResultado = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Resumen del reporte -->
        <div class="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 dark:bg-[#0f1522] rounded-lg">
            <div class="text-center">
                <p class="text-xs text-gray-500 dark:text-slate-400">Total Movimientos</p>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ reporteData.total_movimientos }}</p>
            </div>
            <div class="text-center">
                <p class="text-xs text-gray-500 dark:text-slate-400">Total Ventas</p>
                <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400">${{ reporteData.total_ingresos?.toFixed(2) || 0 }}</p>
            </div>
            <div class="text-center">
                <p class="text-xs text-gray-500 dark:text-slate-400">Total Compras</p>
                <p class="text-xl font-bold text-red-600 dark:text-red-400">${{ reporteData.total_gastos?.toFixed(2) || 0 }}</p>
            </div>
        </div>

        <!-- Balance -->
        <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700 dark:text-slate-300">Balance del período:</span>
                <span class="text-2xl font-bold" :class="(reporteData.balance || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                    ${{ (reporteData.balance || 0).toFixed(2) }}
                </span>
            </div>
        </div>

        <!-- Tabla de movimientos -->
        <div class="flex-1 overflow-auto">
            <table class="w-full text-left text-sm">
                <thead class="sticky top-0 bg-gray-50 dark:bg-[#0f1522]">
                    <tr>
                        <th class="px-3 py-2">Fecha</th>
                        <th class="px-3 py-2">Hora</th>
                        <th class="px-3 py-2">Concepto</th>
                        <th class="px-3 py-2">Producto</th>
                        <th class="px-3 py-2">Cantidad</th>
                        <th class="px-3 py-2 text-right">Monto</th>
                        <th class="px-3 py-2 text-center">Tipo</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                    <tr v-if="reporteData.movimientos?.length === 0">
                        <td colspan="7" class="px-3 py-8 text-center text-gray-400 dark:text-slate-500">
                            No hay movimientos en este período
                        </td>
                    </tr>
                    <tr v-for="mov in reporteData.movimientos" :key="mov.id" class="hover:bg-gray-50 dark:hover:bg-slate-800/20">
                        <td class="px-3 py-2 text-gray-500 dark:text-slate-400">{{ mov.fecha }}</td>
                        <td class="px-3 py-2 text-gray-500 dark:text-slate-400">{{ mov.hora }}</td>
                        <td class="px-3 py-2 text-gray-800 dark:text-slate-200">{{ mov.concepto }}</td>
                        <td class="px-3 py-2 text-gray-500 dark:text-slate-400">{{ mov.producto_nombre || '-' }}</td>
                        <td class="px-3 py-2 text-gray-600 dark:text-slate-300">{{ mov.cantidad ? mov.cantidad.toFixed(2) + ' kg' : '-' }}</td>
                        <td class="px-3 py-2 text-right font-mono" :class="mov.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'">
                            {{ mov.tipo === 'ingreso' ? '+' : '-' }}${{ mov.monto.toFixed(2) }}
                        </td>
                        <td class="px-3 py-2 text-center">
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="mov.tipo === 'ingreso' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                                {{ mov.tipo === 'ingreso' ? 'Venta' : 'Compra' }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Botón para exportar -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button @click="exportarReporte" class="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar a Excel
            </button>
        </div>
    </div>
</div>

<!-- Modal de confirmación para eliminar movimiento -->
<div v-if="showModalEliminar" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-[#151e2f] rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
        <div class="text-center">
            <!-- Icono de advertencia -->
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </div>
            
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Eliminar Movimiento</h3>
            <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">
                ¿Estás seguro de que deseas eliminar este movimiento?<br>
                <span class="font-semibold">Se revertirá el stock del producto automáticamente.</span>
            </p>
            
            <!-- Detalle del movimiento a eliminar -->
            <div v-if="movimientoAEliminar" class="bg-gray-50 dark:bg-[#0f1522] rounded-lg p-3 mb-4 text-sm">
                <div class="flex justify-between mb-2">
                    <span class="text-gray-500 dark:text-slate-400">Concepto:</span>
                    <span class="font-medium text-gray-800 dark:text-slate-200">{{ movimientoAEliminar.concepto }}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-gray-500 dark:text-slate-400">Producto:</span>
                    <span class="font-medium text-gray-800 dark:text-slate-200">{{ movimientoAEliminar.producto_nombre || '-' }}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-gray-500 dark:text-slate-400">Cantidad:</span>
                    <span class="font-medium text-gray-800 dark:text-slate-200">{{ movimientoAEliminar.cantidad ? movimientoAEliminar.cantidad.toFixed(2) + ' kg' : '-' }}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-gray-500 dark:text-slate-400">Monto:</span>
                    <span class="font-medium" :class="movimientoAEliminar.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'">
                        {{ movimientoAEliminar.tipo === 'ingreso' ? '+' : '-' }}${{ (movimientoAEliminar.monto || 0).toFixed(2) }}
                    </span>
                </div>
                <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-slate-700">
                    <span class="text-gray-500 dark:text-slate-400">Tipo:</span>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="movimientoAEliminar.tipo === 'ingreso' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                        {{ movimientoAEliminar.tipo === 'ingreso' ? 'VENTA' : 'COMPRA' }}
                    </span>
                </div>
            </div>
            
            <div class="flex gap-3">
                <button type="button" @click="showModalEliminar = false"
                    class="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300 transition">
                    Cancelar
                </button>
                <button type="button" @click="confirmarEliminacion" :disabled="eliminando"
                    class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="eliminando" class="flex items-center justify-center gap-2">
                        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Eliminando...
                    </span>
                    <span v-else>Sí, Eliminar</span>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Modal para crear proveedor -->
<div v-if="showModalProveedor" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-[#151e2f] rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-slate-700">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">➕ Nuevo Proveedor</h3>
            <button @click="showModalProveedor = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <form @submit.prevent="guardarProveedor">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Nombre del proveedor <span class="text-red-500">*</span>
                    </label>
                    <input v-model="nuevoProveedor.nombre" type="text" required
                        class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                        placeholder="Ej. Proveedor XYZ">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Teléfono
                    </label>
                    <input v-model="nuevoProveedor.telefono" type="text"
                        class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                        placeholder="Ej. 0412-1234567">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Dirección
                    </label>
                    <input v-model="nuevoProveedor.direccion" type="text"
                        class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                        placeholder="Ej. Calle Principal #123">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Detalles / Observaciones
                    </label>
                    <textarea v-model="nuevoProveedor.detalle" rows="3"
                        class="w-full bg-gray-50 dark:bg-[#0f1522] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition resize-none"
                        placeholder="Información adicional sobre el proveedor..."></textarea>
                </div>
            </div>

            <div class="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button type="button" @click="showModalProveedor = false"
                    class="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300 font-medium transition">
                    Cancelar
                </button>
                <button type="submit" :disabled="guardandoProveedor"
                    class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <span v-if="guardandoProveedor" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span v-else>Guardar Proveedor</span>
                </button>
            </div>
        </form>
    </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useApi } from '~/composables/useApi'
import { useProductos } from '~/composables/useProductos'



// Estados
const { api } = useApi()
const { refreshProductos } = useProductos()
const cargando = ref(false)
const cargandoMovimiento = ref(false)
const cargandoMovimientos = ref(false)
const filtroTipo = ref('todos')
const fechaActual = ref(new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }))
const showModalProducto = ref(false)
const showModalCierre = ref(false)
const showModalExito = ref(false)
const showModalError = ref(false)
const cerrando = ref(false)
const balanceExito = ref(0)
const mensajeError = ref('')
const showModalEliminar = ref(false)
const movimientoAEliminar = ref(null)
const eliminando = ref(false)
const showModalExitoProducto = ref(false)
const productoRecienCreado = ref('')
const productoRecienStock = ref(0)
const showModalProveedor = ref(false)
const nuevoProveedor = ref({    nombre: '',    telefono: '',    direccion: '',    detalle: ''})
const guardandoProveedor = ref(false)

// Datos
const movimientos = ref([])
const listaProductos = ref([])
const categorias = ref([])
const proveedores = ref([])

// Formulario movimiento
const form = ref({
    tipo: 'ingreso',
    concepto: '',
    monto: null,
    cantidad: null,
    producto_id: '',
    proveedor: '',
    proveedor_id: null,
    precio_venta_kg: null
})

// Nuevo producto
const nuevoProducto = ref({
    nombre: '',
    categoria_id: '',
    kilogramos: 0,
    precio_compra: 0,
    precio_venta_kg: 0,
    proveedor_id: ''
})

// Computed
const movimientosFiltrados = computed(() => {
    if (filtroTipo.value === 'todos') return movimientos.value
    return movimientos.value.filter(m => m.tipo === filtroTipo.value)
})

const totalIngresos = computed(() => {
    return movimientos.value
        .filter(m => m.tipo === 'ingreso')
        .reduce((acc, curr) => acc + curr.monto, 0)
})

const totalGastos = computed(() => {
    return movimientos.value
        .filter(m => m.tipo === 'gasto')
        .reduce((acc, curr) => acc + curr.monto, 0)
})

const balance = computed(() => totalIngresos.value - totalGastos.value)

// Cargar movimientos del día
const cargarMovimientos = async () => {
    cargandoMovimientos.value = true
    try {
        const response = await api('/movimientos')
        movimientos.value = response.data || (Array.isArray(response) ? response : [])
    } catch (error) {
        console.error('Error cargando movimientos:', error)
    } finally {
        cargandoMovimientos.value = false
    }
}

// Cargar productos
const cargarProductos = async () => {
    try {
        await refreshProductos()
        const response = await api('/productos', {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        })
        listaProductos.value = response.data || (Array.isArray(response) ? response : [])
        console.log('Productos recargados:', listaProductos.value.length)
    } catch (error) {
        console.error('Error cargando productos:', error)
    }
}

// Cargar categorías para el modal
const cargarCategorias = async () => {
    try {
        const response = await api('/categorias')
        categorias.value = response.data || (Array.isArray(response) ? response : [])
    } catch (error) {
        console.error('Error cargando categorías:', error)
    }
}

// Cargar proveedores para el modal
const cargarProveedores = async () => {
    try {
        const response = await api('/proveedores')
        proveedores.value = response.data || (Array.isArray(response) ? response : [])
    } catch (error) {
        console.error('Error cargando proveedores:', error)
    }
}

// Registrar movimiento
const registrarMovimiento = async () => {
    if (!form.value.concepto || !form.value.monto) {
        alert('Por favor complete los campos obligatorios')
        return
    }

    if (!form.value.producto_id) {
        alert('Por favor seleccione un producto')
        return
    }

    if (!form.value.cantidad || form.value.cantidad <= 0) {
        alert('Por favor ingrese una cantidad válida')
        return
    }

    cargandoMovimiento.value = true
    try {
        const payload = {
            tipo: form.value.tipo,
            concepto: form.value.concepto,
            monto: form.value.monto,
            producto_id: form.value.producto_id,
            cantidad: form.value.cantidad,
            proveedor: form.value.proveedor || null
        }

        const response = await api('/movimientos', {
            method: 'POST',
            body: JSON.stringify(payload)
        })

        const nuevoMov = response.data || response
        
        movimientos.value.unshift(nuevoMov)
        
        // Resetear formulario
        form.value = {
            tipo: 'ingreso',
            concepto: '',
            monto: null,
            cantidad: null,
            producto_id: '',
            proveedor: ''
        }

        await refreshProductos()

        
        // IMPORTANTE: Recargar productos después de cada transacción
        await cargarProductos()
        
        // También mostrar el stock actualizado en el select
        console.log('Stock actualizado después de transacción')
        
    } catch (error) {
        console.error('Error registrando movimiento:', error)
        mensajeError.value = error.message || 'Error al registrar el movimiento'
        showModalError.value = true
    } finally {
        cargandoMovimiento.value = false
    }
}

const onProductoChange = () => {
    if (form.value.producto_id) {
        const producto = listaProductos.value.find(p => p.id === form.value.producto_id)
        if (producto) {
            // Cargar precio según tipo
            const precio = obtenerPrecioProducto(producto)
            form.value.precio_venta_kg = precio
            
            // Cargar el proveedor del producto (si existe)
            if (producto.proveedor_id) {
                form.value.proveedor_id = producto.proveedor_id
                // También actualizar el nombre del proveedor para el backend
                const proveedor = proveedores.value.find(p => p.id === producto.proveedor_id)
                form.value.proveedor = proveedor ? proveedor.nombre : ''
            } else {
                form.value.proveedor_id = null
                form.value.proveedor = ''
            }
            
            if (form.value.cantidad && form.value.cantidad > 0) {
                form.value.monto = precio * form.value.cantidad
            }
            
            const tipoTexto = form.value.tipo === 'gasto' ? 'compra' : 'venta'
            console.log(`Precio de ${tipoTexto} de ${producto.nombre}: $${precio} por kg`)
            if (producto.proveedor_id) {
                console.log(`Proveedor: ${form.value.proveedor}`)
            }
        }
    } else {
        form.value.precio_venta_kg = null
        form.value.proveedor_id = null
        form.value.proveedor = ''
    }
}

// Función para recalcular el monto cuando cambia la cantidad
const recalcularMonto = () => {
    if (form.value.cantidad && form.value.cantidad > 0 && form.value.precio_venta_kg) {
        form.value.monto = form.value.cantidad * form.value.precio_venta_kg
    }
}

watch(() => form.value.producto_id, (nuevoId) => {
    if (nuevoId) {
        const producto = listaProductos.value.find(p => p.id === nuevoId)
        if (producto) {
            const precio = obtenerPrecioProducto(producto)
            form.value.precio_venta_kg = precio
            
            // Cargar el proveedor del producto
            if (producto.proveedor_id) {
                form.value.proveedor_id = producto.proveedor_id
                const proveedor = proveedores.value.find(p => p.id === producto.proveedor_id)
                form.value.proveedor = proveedor ? proveedor.nombre : ''
            } else {
                form.value.proveedor_id = null
                form.value.proveedor = ''
            }
            
            if (form.value.cantidad && form.value.cantidad > 0) {
                form.value.monto = precio * form.value.cantidad
            }
        }
    } else {
        form.value.precio_venta_kg = null
        form.value.proveedor_id = null
        form.value.proveedor = ''
    }
}, { immediate: true })

// Watcher para cuando cambia el tipo de operación (venta/compra)
watch(() => form.value.tipo, () => {
    // Si hay un producto seleccionado, actualizar el precio
    if (form.value.producto_id) {
        const producto = listaProductos.value.find(p => p.id === form.value.producto_id)
        if (producto) {
            const precio = obtenerPrecioProducto(producto)
            form.value.precio_venta_kg = precio
            
            // Si es compra, cargar el proveedor del producto
            if (form.value.tipo === 'gasto' && producto.proveedor_id) {
                form.value.proveedor_id = producto.proveedor_id
                const proveedor = proveedores.value.find(p => p.id === producto.proveedor_id)
                form.value.proveedor = proveedor ? proveedor.nombre : ''
            } else if (form.value.tipo === 'ingreso') {
                // Para ventas, limpiar el proveedor
                form.value.proveedor_id = null
                form.value.proveedor = ''
            }
            
            if (form.value.cantidad && form.value.cantidad > 0) {
                form.value.monto = precio * form.value.cantidad
            }
        }
    }
})

const obtenerPrecioProducto = (producto) => {
    if (!producto) return 0
    
    // Si es compra (gasto), usar precio de compra
    if (form.value.tipo === 'gasto') {
        return producto.precio_compra || 0
    }
    
    // Si es venta (ingreso), usar precio de venta
    return producto.precio_venta_kg || producto.precio_venta || 0
}

// Eliminar movimiento
// Eliminar movimiento - Abre el modal de confirmación
const eliminarMovimiento = (movimiento) => {
    movimientoAEliminar.value = movimiento
    showModalEliminar.value = true
}

// Confirmar eliminación
const confirmarEliminacion = async () => {
    if (!movimientoAEliminar.value) return
    
    eliminando.value = true
    try {
        await api(`/movimientos/${movimientoAEliminar.value.id}`, { method: 'DELETE' })
        movimientos.value = movimientos.value.filter(m => m.id !== movimientoAEliminar.value.id)
        await refreshProductos()

        // Recargar productos después de eliminar
        await cargarProductos()
        showModalEliminar.value = false
        movimientoAEliminar.value = null
    } catch (error) {
        console.error('Error eliminando movimiento:', error)
        mensajeError.value = error.message || 'Error al eliminar el movimiento'
        showModalError.value = true
        showModalEliminar.value = false
    } finally {
        eliminando.value = false
    }
}

// Terminar día
const terminarDia = () => {
    // Mostrar modal de confirmación en lugar de alert
    showModalCierre.value = true
}

// Nueva función para confirmar el cierre
const confirmarCierre = async () => {
    cerrando.value = true
    try {
        const response = await api('/movimientos/cerrar-dia', { method: 'POST' })
        balanceExito.value = response.balance
        showModalCierre.value = false
        showModalExito.value = true
        await cargarMovimientos()
        // Recargar productos después de cerrar el día
        await cargarProductos()
        await refreshProductos()
    } catch (error) {
        console.error('Error cerrando día:', error)
        mensajeError.value = error.message || 'Error al cerrar el día'
        showModalCierre.value = false
        showModalError.value = true
    } finally {
        cerrando.value = false
    }
}

// Variables para reportes
const showModalReporte = ref(false)
const showModalResultado = ref(false)
const generandoReporte = ref(false)
const reporteFiltros = ref({
    tipo: 'todos',
    fecha_desde: new Date().toISOString().split('T')[0],
    fecha_hasta: new Date().toISOString().split('T')[0]
})
const reporteData = ref({
    movimientos: [],
    total_ingresos: 0,
    total_gastos: 0,
    total_movimientos: 0,
    balance: 0
})

const calcularMargen = () => {
    const compra = nuevoProducto.value.precio_compra || 0
    const venta = nuevoProducto.value.precio_venta_kg || 0
    if (compra > 0 && venta > 0) {
        const margen = ((venta - compra) / compra) * 100
        return margen.toFixed(2)
    }
    return '0.00'
}

// Agrega esta variable para el estado de guardado
const guardandoProducto = ref(false)

// Función para generar el reporte
const generarReporteSubmit = async () => {
    generandoReporte.value = true
    try {
        const params = new URLSearchParams({
            tipo: reporteFiltros.value.tipo,
            fecha_desde: reporteFiltros.value.fecha_desde,
            fecha_hasta: reporteFiltros.value.fecha_hasta
        })
        
        const response = await api(`/reportes/movimientos?${params}`)
        reporteData.value = response.data || response
        showModalReporte.value = false
        showModalResultado.value = true
    } catch (error) {
        console.error('Error generando reporte:', error)
        alert('Error al generar el reporte')
    } finally {
        generandoReporte.value = false
    }
}

// Fechas rápidas
const setFechaRapida = (periodo) => {
    const hoy = new Date()
    const fechaFin = new Date()
    
    switch (periodo) {
        case 'hoy':
            reporteFiltros.value.fecha_desde = hoy.toISOString().split('T')[0]
            reporteFiltros.value.fecha_hasta = hoy.toISOString().split('T')[0]
            break
        case 'ayer':
            const ayer = new Date()
            ayer.setDate(ayer.getDate() - 1)
            reporteFiltros.value.fecha_desde = ayer.toISOString().split('T')[0]
            reporteFiltros.value.fecha_hasta = ayer.toISOString().split('T')[0]
            break
        case 'semana':
            const semana = new Date()
            semana.setDate(semana.getDate() - 7)
            reporteFiltros.value.fecha_desde = semana.toISOString().split('T')[0]
            reporteFiltros.value.fecha_hasta = hoy.toISOString().split('T')[0]
            break
        case 'mes':
            const mes = new Date()
            mes.setMonth(mes.getMonth() - 1)
            reporteFiltros.value.fecha_desde = mes.toISOString().split('T')[0]
            reporteFiltros.value.fecha_hasta = hoy.toISOString().split('T')[0]
            break
        case 'trimestre':
            const trimestre = new Date()
            trimestre.setMonth(trimestre.getMonth() - 3)
            reporteFiltros.value.fecha_desde = trimestre.toISOString().split('T')[0]
            reporteFiltros.value.fecha_hasta = hoy.toISOString().split('T')[0]
            break
    }
}

const exportarReporte = async () => {
    // Construir parámetros
    const params = new URLSearchParams({
        tipo: reporteFiltros.value.tipo,
        fecha_desde: reporteFiltros.value.fecha_desde,
        fecha_hasta: reporteFiltros.value.fecha_hasta,
        export: 'excel'
    })
    
    const ruta = `/reportes/movimientos?${params}`
    const tipoArchivo = `reporte_movimientos_${reporteFiltros.value.fecha_desde}_${reporteFiltros.value.fecha_hasta}.xlsx`
    
    try {
        // Usar api con responseType blob
        const response = await api(ruta, {
            method: 'GET',
            responseType: 'blob'
        })
        
        // Crear enlace y forzar descarga
        const urlArchivo = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = urlArchivo
        link.setAttribute('download', tipoArchivo)
        document.body.appendChild(link)
        link.click()
        
        // Limpiar
        document.body.removeChild(link)
        window.URL.revokeObjectURL(urlArchivo)
        
    } catch (error) {
        console.error('Error exportando Excel:', error)
        alert('Error al generar el archivo Excel. Verifica la consola para más detalles.')
    }
}

// Modifica la función generarReporte existente
const generarReporte = () => {
    // Establecer fechas por defecto (últimos 7 días)
    const hoy = new Date()
    const semana = new Date()
    semana.setDate(semana.getDate() - 7)
    reporteFiltros.value = {
        tipo: 'todos',
        fecha_desde: semana.toISOString().split('T')[0],
        fecha_hasta: hoy.toISOString().split('T')[0]
    }
    showModalReporte.value = true
}

// Guardar nuevo producto
const guardarProducto = async () => {
    // Validaciones
    if (!nuevoProducto.value.nombre || nuevoProducto.value.nombre.trim() === '') {
        mensajeError.value = 'El nombre del producto es requerido'
        showModalError.value = true
        return
    }
    
    if (!nuevoProducto.value.categoria_id) {
        mensajeError.value = 'Por favor seleccione una categoría'
        showModalError.value = true
        return
    }
    
    if (!nuevoProducto.value.proveedor_id) {
        mensajeError.value = 'Por favor seleccione un proveedor'
        showModalError.value = true
        return
    }
    
    if (!nuevoProducto.value.kilogramos || nuevoProducto.value.kilogramos <= 0) {
        mensajeError.value = 'El stock inicial debe ser mayor a 0'
        showModalError.value = true
        return
    }
    
    if (!nuevoProducto.value.precio_compra || nuevoProducto.value.precio_compra <= 0) {
        mensajeError.value = 'El precio de compra debe ser mayor a 0'
        showModalError.value = true
        return
    }
    
    if (!nuevoProducto.value.precio_venta_kg || nuevoProducto.value.precio_venta_kg <= 0) {
        mensajeError.value = 'El precio de venta debe ser mayor a 0'
        showModalError.value = true
        return
    }

    guardandoProducto.value = true
    
    try {
        const payload = {
            nombre: nuevoProducto.value.nombre.trim(),
            categoria_id: parseInt(nuevoProducto.value.categoria_id),
            proveedor_id: parseInt(nuevoProducto.value.proveedor_id),
            kilogramos: parseFloat(nuevoProducto.value.kilogramos),
            precio_compra: parseFloat(nuevoProducto.value.precio_compra),
            precio_venta_kg: parseFloat(nuevoProducto.value.precio_venta_kg),
            desperdicio: 0,
            detalle: null
        }
        
        const response = await api('/productos', {
            method: 'POST',
            body: JSON.stringify(payload)
        })

        const producto = response.data || response
        
        // Guardar datos del producto para mostrar en el modal de éxito
        productoRecienCreado.value = producto.nombre
        productoRecienStock.value = producto.kilogramos
        
        listaProductos.value.push(producto)
        form.value.producto_id = producto.id
        
        // Cerrar modal de creación y abrir modal de éxito
        showModalProducto.value = false
        showModalExitoProducto.value = true
        
        // Resetear formulario del producto
        nuevoProducto.value = {
            nombre: '',
            categoria_id: '',
            kilogramos: 0,
            precio_compra: 0,
            precio_venta_kg: 0,
            proveedor_id: ''
        }
        
        await cargarProductos()
        
    } catch (error) {
        console.error('Error guardando producto:', error)
        mensajeError.value = error.message || 'Error al guardar el producto. Verifica que los datos sean correctos.'
        showModalError.value = true
    } finally {
        guardandoProducto.value = false
    }
}

const abrirModalProducto = () => {
    nuevoProducto.value = {
        nombre: '',
        categoria_id: '',
        kilogramos: 0,
        precio_compra: 0,
        precio_venta_kg: 0,
        proveedor_id: ''
    }
    showModalProducto.value = true
}

const abrirModalProveedor = () => {
    nuevoProveedor.value = {
        nombre: '',
        telefono: '',
        direccion: '',
        detalle: ''
    }
    showModalProveedor.value = true
}


const guardarProveedor = async () => {
    if (!nuevoProveedor.value.nombre || nuevoProveedor.value.nombre.trim() === '') {
        mensajeError.value = 'El nombre del proveedor es requerido'
        showModalError.value = true
        return
    }

    guardandoProveedor.value = true
    
    try {
        // Preparar el payload con todos los campos
        const payload = {
            nombre: nuevoProveedor.value.nombre.trim(),
            telefono: nuevoProveedor.value.telefono?.trim() || null,
            direccion: nuevoProveedor.value.direccion?.trim() || null,
            detalle: nuevoProveedor.value.detalle?.trim() || null
        }
        
        console.log('Guardando proveedor:', payload) // Debug

        const response = await api('/proveedores', {
            method: 'POST',
            body: JSON.stringify(payload)
        })

        const proveedor = response.data || response
        
        // Agregar a la lista de proveedores
        proveedores.value.push(proveedor)
        
        // Seleccionar el proveedor creado
        form.value.proveedor_id = proveedor.id
        form.value.proveedor = proveedor.nombre
        
        // Cerrar modal
        showModalProveedor.value = false
        
        // Recargar proveedores para asegurar que la lista esté actualizada
        await cargarProveedores()
        
        // Mostrar mensaje de éxito
        mensajeError.value = '' // Limpiar error
        console.log('Proveedor creado:', proveedor.nombre)
        
    } catch (error) {
        console.error('Error guardando proveedor:', error)
        mensajeError.value = error.message || 'Error al guardar el proveedor'
        showModalError.value = true
    } finally {
        guardandoProveedor.value = false
    }
}

// Inicialización
onMounted(async () => {
    await Promise.all([
        cargarMovimientos(),
        cargarProductos(),
        cargarCategorias(),
        cargarProveedores()
    ])
})
</script>

<style scoped>
.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>