<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'admin-auth',
})

interface DashboardStats {
  totalVillas: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
}

const stats = ref<DashboardStats>({
  totalVillas: 0,
  totalBookings: 0,
  pendingBookings: 0,
  confirmedBookings: 0,
})

const loading = ref(true)
const errorMessage = ref('')

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch<{
      success: boolean
      data: DashboardStats
    }>('/api/admin/dashboard')

    stats.value = response.data
  } catch {
    errorMessage.value =
      'Gagal memuat statistik dashboard. Silakan coba kembali.'
  } finally {
    loading.value = false
  }
}

async function logout() {
  try {
    await $fetch('/api/admin/logout', {
      method: 'POST',
    })

    await navigateTo('/admin/login')
  } catch (error) {
    console.error('Logout gagal:', error)

    errorMessage.value = 'Logout gagal. Silakan coba kembali.'
  }
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <main class="dashboard">
    <header class="dashboard-header">
      <div>
        <!-- ✅ PERBAIKAN 1: Tambah eyebrow untuk konsistensi dengan halaman publik -->
        <span class="eyebrow">ADMIN PANEL</span>
        <h1>Dashboard</h1>
        <p>Selamat datang di sistem pengelolaan VillaStay.</p>
      </div>

      <div class="dashboard-actions">
        <!-- ✅ PERBAIKAN 2: Tambah link ke halaman booking admin -->
        <NuxtLink to="/admin/bookings" class="action-link">
          Kelola Booking
        </NuxtLink>

        <NuxtLink to="/admin/villas" class="action-link action-link-primary">
          Kelola Villa
        </NuxtLink>

        <button type="button" class="logout-button" @click="logout">
          Logout
        </button>
      </div>
    </header>

    <!-- ✅ PERBAIKAN 3: Loading state dengan spinner yang lebih baik -->
    <div v-if="loading" class="loading-state">
      <span class="loading-spinner"></span>
      <p>Memuat statistik dashboard...</p>
    </div>

    <div v-else-if="errorMessage" class="error-state" role="alert">
      <p>{{ errorMessage }}</p>
      <button type="button" class="retry-button" @click="loadDashboard">
        Coba Lagi
      </button>
    </div>

    <!-- ✅ PERBAIKAN 4: Stats grid dengan ikon & styling premium -->
    <section v-else class="stats-grid">
      <article class="stat-card stat-card-villa">
        <div class="stat-icon">🏡</div>
        <div class="stat-content">
          <h2>Total Villa</h2>
          <p>{{ stats.totalVillas }}</p>
        </div>
      </article>

      <article class="stat-card stat-card-booking">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <h2>Total Booking</h2>
          <p>{{ stats.totalBookings }}</p>
        </div>
      </article>

      <article class="stat-card stat-card-pending">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <h2>Menunggu Konfirmasi</h2>
          <p>{{ stats.pendingBookings }}</p>
        </div>
      </article>

      <article class="stat-card stat-card-confirmed">
        <div class="stat-icon">✓</div>
        <div class="stat-content">
          <h2>Booking Dikonfirmasi</h2>
          <p>{{ stats.confirmedBookings }}</p>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
/* ✅ PERBAIKAN 5: Styling disesuaikan dengan brand VillaStay */

.dashboard {
  padding: 40px 32px;
  background: #f5f6f0;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e9eee9;
}

/* Eyebrow label */
.eyebrow {
  display: inline-block;
  color: #967045;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.dashboard-header h1 {
  margin: 0 0 8px;
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 32px;
  font-weight: 500;
}

.dashboard-header p {
  margin: 0;
  color: #556058;
  font-size: 14px;
}

/* Action buttons */
.dashboard-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-link {
  padding: 10px 18px;
  border-radius: 8px;
  background: transparent;
  color: #183d32;
  border: 2px solid #183d32;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.action-link:hover {
  background: #183d32;
  color: white;
}

.action-link-primary {
  background: #183d32;
  color: white;
}

.action-link-primary:hover {
  background: #0f2820;
  border-color: #0f2820;
}

.logout-button {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: #a52d2d;
  color: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s ease;
}

.logout-button:hover {
  background: #8b2424;
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 20px;
  text-align: center;
}

.loading-state p {
  color: #556058;
  font-size: 14px;
}

/* Error state */
.error-state {
  padding: 24px;
  background: #fff0f0;
  border: 1px solid #f0cccc;
  border-radius: 12px;
  text-align: center;
}

.error-state p {
  margin: 0 0 16px;
  color: #a52d2d;
  font-size: 14px;
}

.retry-button {
  padding: 10px 20px;
  background: #183d32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #0f2820;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px 24px;
  background: white;
  border: 1px solid #e9eee9;
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(24, 61, 50, 0.08);
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  background: #f5f7f3;
  border-radius: 12px;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-card-pending .stat-icon {
  background: #fdf3e0;
}

.stat-card-confirmed .stat-icon {
  background: #edf7ef;
}

.stat-content h2 {
  margin: 0 0 8px;
  color: #556058;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.stat-content p {
  margin: 0;
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 32px;
  font-weight: 500;
}

/* Loading spinner */
.loading-spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid rgba(24, 61, 50, 0.2);
  border-top-color: #183d32;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard {
    padding: 24px 16px;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 20px;
  }

  .dashboard-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .dashboard-actions > * {
    flex: 1;
    min-width: 120px;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>