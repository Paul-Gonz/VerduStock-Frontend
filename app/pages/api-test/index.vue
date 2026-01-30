<template>
    <div>
        <h1>API Test</h1>
        <pre v-if="data">{{ data }}</pre>
        <p v-if="error" style="color: red;">Error: {{ error.message }}</p>
    </div>
</template>

<script setup>
const { api } = useApi()
const { data, error } = await useAsyncData('test', () => api('/api-test'))
</script>