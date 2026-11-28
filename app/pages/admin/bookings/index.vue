<script setup lang="ts">
definePageMeta({
  middleware: 'admin-auth',
})
</script>

<template>
  <main class="admin-page">
    <header class="admin-header">
      <div>
        <span class="eyebrow">ADMIN PANEL</span>
        <h1>Kelola Booking</h1>
        <p>Konfirmasi pembayaran dan kelola reservasi tamu.</p>
      </div>

      <div class="header-actions">
        <NuxtLink to="/admin" class="btn btn-outline">
          ← Dashboard
        </NuxtLink>
        <NuxtLink to="/admin/villas" class="btn btn-outline">
          Kelola Villa
        </NuxtLink>
      </div>
    </header>

    <div class="placeholder-state">
      <span class="placeholder-icon">📋</span>
      <h3>Halaman Kelola Booking</h3>
      <p>Fitur ini sedang dalam tahap pengembangan. Kita akan membangunnya selanjutnya.</p>
    </div>
  </main>
</template>

<style scoped>
.admin-page {
  padding: 40px 32px;
  background: #f5f6f0;
  min-height: 100vh;
}

.eyebrow {
  display: inline-block;
  color: #967045;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e9eee9;
}

.admin-header h1 {
  margin: 0 0 8px;
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 32px;
  font-weight: 500;
}

.admin-header p {
  margin: 0;
  color: #556058;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 2px solid #183d32;
}

.btn-outline {
  background: transparent;
  color: #183d32;
}

.btn-outline:hover {
  background: #183d32;
  color: white;
}

.placeholder-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 20px;
  text-align: center;
  background: white;
  border: 1px solid #e9eee9;
  border-radius: 12px;
}

.placeholder-icon {
  font-size: 48px;
}

.placeholder-state h3 {
  margin: 0;
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 22px;
}

.placeholder-state p {
  margin: 0;
  color: #556058;
  font-size: 14px;
}
</style>