
<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: async () => {
    try {
      await $fetch('/api/admin/me')
    } catch {
      return navigateTo('/admin/login')
    }
  },
})

interface Villa {
  id: number
  slug: string
  name: string
  pricePerNight: number
  capacity: number
  bedrooms: number
  bathrooms: number
  location: string
  isActive: boolean
}

const villas = ref<Villa[]>([])
const loading = ref(true)
const errorMessage = ref('')

async function loadVillas() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch<{
      success: boolean
      data: Villa[]
    }>('/api/villas')

    villas.value = response.data
  } catch {
    errorMessage.value = 'Gagal memuat daftar villa.'
  } finally {
    loading.value = false
  }
}

onMounted(loadVillas)
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-10">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Manajemen Villa</h1>
        <p class="mt-2 text-gray-500">
          Kelola data villa yang tersedia.
        </p>
      </div>
    </div>

    <div v-if="loading">
      Memuat data villa...
    </div>

    <div v-else-if="errorMessage">
      <p class="text-red-600">{{ errorMessage }}</p>
      <button
        class="mt-3 rounded bg-gray-900 px-4 py-2 text-white"
        @click="loadVillas"
      >
        Coba Lagi
      </button>
    </div>

    <div v-else-if="villas.length === 0">
      Belum ada villa yang tersedia.
    </div>

    <div v-else class="overflow-x-auto rounded-lg border">
      <table class="w-full text-left">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-4">Nama Villa</th>
            <th class="p-4">Harga / Malam</th>
            <th class="p-4">Kapasitas</th>
            <th class="p-4">Kamar Tidur</th>
            <th class="p-4">Status</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="villa in villas"
            :key="villa.id"
            class="border-t"
          >
            <td class="p-4">
              <p class="font-semibold">{{ villa.name }}</p>
              <p class="text-sm text-gray-500">{{ villa.location }}</p>
            </td>

            <td class="p-4">
              Rp {{ villa.pricePerNight.toLocaleString('id-ID') }}
            </td>

            <td class="p-4">{{ villa.capacity }} orang</td>

            <td class="p-4">{{ villa.bedrooms }}</td>

            <td class="p-4">
              <span
                :class="villa.isActive
                  ? 'text-green-600'
                  : 'text-red-600'"
              >
                {{ villa.isActive ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
