<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })
const route = useRoute()
const villaId = route.params.id
</script>

<template>
  <main class="admin-page">
    <h1>Edit Villa ID: {{ villaId }}</h1>
    <p>Halaman ini sedang dalam pengembangan.</p>
  </main>
</template>

<style scoped>
.admin-page { padding: 40px 32px; background: #f5f6f0; min-height: 100vh; }
h1 { color: #183d32; font-family: Georgia, serif; font-size: 28px; margin-bottom: 16px; }
p { color: #556058; font-size: 14px; }
</style>