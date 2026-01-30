<template>
    <div>Redirigiendo...</div>
</template>

<script setup>
onMounted(() => {
    navigateTo('/login')
})
definePageMeta({
    layout: false,
})
</script>