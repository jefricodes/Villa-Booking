
<script setup lang="ts">

import { ref, computed } from 'vue'

import type { Villa } from '~/types/villa'

import { formatRupiah } from '~/utils/formatRupiah'


// ======================================
// 1. RESPONSE TYPE
// ======================================

interface ApiHealth {
  success: boolean
  message: string
  service: string
  timestamp: string
}


interface VillasApiResponse {
  success: boolean
  count: number
  data: Villa[]
}


interface AvailabilityCheckResponse {
  success: boolean
  available: boolean
  message: string

  villa: {
    id: number
    name: string
  }

  stay: {
    checkIn: string
    checkOut: string
    nights: number
  }

  price: {
    perNight: number
    totalPrice: number
  }

  demoOnly: boolean
}


// ======================================
// 2. GET HEALTH API
// ======================================

const {
  data: health,
  pending: healthPending,
  error: healthError,
  refresh: refreshHealth
} = await useFetch<ApiHealth>('/api/health')


// ======================================
// 3. GET VILLAS API
// ======================================

const {
  data: villaResponse,
  pending: villasPending,
  error: villasError
} = await useFetch<VillasApiResponse>('/api/villas')


const apiVillas = computed(() => {
  return villaResponse.value?.data ?? []
})


// ======================================
// 4. POST AVAILABILITY API
// ======================================

const checkLoading = ref(false)

const checkResult =
  ref<AvailabilityCheckResponse | null>(null)

const checkError = ref('')


// Fungsi mengirim POST request
async function runAvailabilityCheck(
  checkIn: string,
  checkOut: string
) {

  checkLoading.value = true

  checkResult.value = null

  checkError.value = ''

  try {

    const response =
      await $fetch<AvailabilityCheckResponse>(
        '/api/availability/check',
        {
          method: 'POST',

          body: {
            villaId: 1,
            checkIn,
            checkOut
          }
        }
      )

    checkResult.value = response

  } catch (error) {

    checkError.value =
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat menghubungi API.'

  } finally {

    checkLoading.value = false

  }

}


// ======================================
// 5. SEO
// ======================================

useHead({
  title: 'API Playground | VillaStay'
})

</script>


<template>

  <main class="api-page">

    <div class="api-container">

      <header class="page-heading">

        <span class="eyebrow">
          BACKEND LEARNING
        </span>

        <h1>
          API <span>Playground</span>
        </h1>

        <p>
          Halaman praktik untuk menguji komunikasi
          antara frontend Nuxt dan backend Nitro.
        </p>

      </header>


      <!-- HEALTH API -->
      <section class="api-card">

        <div class="card-heading">

          <div>
            <span class="method get">GET</span>
            <strong>/api/health</strong>
          </div>

          <button
            type="button"
            class="refresh-button"
            @click="refreshHealth()"
            :disabled="healthPending"
          >
            Refresh
          </button>

        </div>


        <p class="description">
          Memeriksa apakah backend sedang berjalan.
        </p>


        <p v-if="healthPending">
          Memeriksa server...
        </p>

        <p v-else-if="healthError" class="error">
          {{ healthError.message }}
        </p>

        <div v-else-if="health" class="success-panel">

          <strong>✓ Server aktif</strong>

          <p>{{ health.message }}</p>

          <small>
            Service: {{ health.service }}
          </small>

          <small>
            Timestamp: {{ health.timestamp }}
          </small>

        </div>

      </section>


      <!-- VILLAS API -->
      <section class="api-card">

        <div class="card-heading">
          <div>
            <span class="method get">GET</span>
            <strong>/api/villas</strong>
          </div>
        </div>

        <p class="description">
          Mengambil daftar villa dari backend.
        </p>


        <p v-if="villasPending">
          Mengambil data villa...
        </p>

        <p v-else-if="villasError" class="error">
          {{ villasError.message }}
        </p>


        <div v-else class="villa-list">

          <article
            v-for="villa in apiVillas"
            :key="villa.id"
            class="villa-item"
          >

            <div>
              <strong>{{ villa.name }}</strong>
              <small>{{ villa.slug }}</small>
            </div>

            <div>
              <strong>
                {{ formatRupiah(villa.pricePerNight) }}
              </strong>

              <small>
                {{ villa.capacity }} tamu
              </small>
            </div>

          </article>

          <p>
            Total villa diterima:
            <strong>{{ villaResponse?.count ?? 0 }} unit</strong>
          </p>

        </div>

      </section>


      <!-- POST AVAILABILITY API -->
      <section class="api-card">

        <div class="card-heading">
          <div>
            <span class="method post">POST</span>
            <strong>/api/availability/check</strong>
          </div>
        </div>


        <p class="description">
          Menguji pengecekan ketersediaan Villa Nusa
          menggunakan data reservasi simulasi.
        </p>


        <div class="test-buttons">

          <button
            type="button"
            :disabled="checkLoading"
            @click="
              runAvailabilityCheck(
                '2026-12-12',
                '2026-12-14'
              )
            "
          >
            Tes Tanggal Bentrok
          </button>


          <button
            type="button"
            class="secondary-button"
            :disabled="checkLoading"
            @click="
              runAvailabilityCheck(
                '2026-12-13',
                '2026-12-15'
              )
            "
          >
            Tes Tanggal Tersedia
          </button>

        </div>


        <p v-if="checkLoading">
          Mengirim request ke backend...
        </p>


        <div v-if="checkError" class="error">
          {{ checkError }}
        </div>


        <div
          v-if="checkResult"
          class="result-panel"
          :class="{
            unavailable: !checkResult.available
          }"
        >

          <strong>
            {{ checkResult.available
              ? '✓ Tanggal tidak bentrok'
              : '✕ Tanggal bentrok'
            }}
          </strong>

          <p>{{ checkResult.message }}</p>

          <hr />

          <p>
            Villa: {{ checkResult.villa.name }}
          </p>

          <p>
            Durasi: {{ checkResult.stay.nights }} malam
          </p>

          <p>
            Harga per malam:
            {{ formatRupiah(checkResult.price.perNight) }}
          </p>

          <strong>
            Estimasi total:
            {{ formatRupiah(checkResult.price.totalPrice) }}
          </strong>

          <small>
            demoOnly: {{ checkResult.demoOnly }}
          </small>

        </div>

      </section>


      <div class="learning-note">
        <strong>Catatan pembelajaran:</strong>

        Semua pemeriksaan masih menggunakan data simulasi.
        Belum ada reservasi yang disimpan ke SQLite.
      </div>

    </div>

  </main>

</template>


<style scoped>

.api-page {
  min-height: 100vh;
  padding: 65px 20px;
  background: #f5f7f3;
}

.api-container {
  max-width: 850px;
  margin: auto;
}

.page-heading {
  margin-bottom: 35px;
}

.eyebrow {
  color: #a17d54;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 2px;
}

.page-heading h1 {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 42px;
  font-weight: 500;
}

.page-heading h1 span {
  color: #b18a5a;
  font-style: italic;
}

.page-heading p,
.description {
  color: #778078;
  font-size: 13px;
  line-height: 1.8;
}

.api-card {
  margin-bottom: 22px;
  padding: 25px;
  background: white;
  border: 1px solid #e5ece5;
  border-radius: 12px;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.card-heading > div {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-heading strong {
  color: #183d32;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.method {
  padding: 6px 9px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: bold;
}

.get {
  color: #14623c;
  background: #e5f5eb;
}

.post {
  color: #2451a3;
  background: #e9efff;
}

.refresh-button,
.secondary-button {
  color: #183d32;
  background: #edf3ee;
}

.refresh-button {
  padding: 9px 14px;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.villa-list {
  margin-top: 18px;
}

.villa-item {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #edf0ec;
}

.villa-item div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.villa-item div:last-child {
  text-align: right;
}

.villa-item strong {
  color: #183d32;
  font-size: 13px;
}

.villa-item small,
.success-panel small,
.result-panel small {
  color: #89918b;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.villa-list > p {
  color: #778078;
  font-size: 12px;
}

.success-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 17px;
  color: #236440;
  background: #edf7ef;
  border-radius: 8px;
}

.success-panel p {
  margin: 0;
  font-size: 13px;
}

.test-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
}

.test-buttons button {
  padding: 12px 16px;
  color: white;
  background: #183d32;
  border: 0;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.test-buttons button.secondary-button {
  color: #183d32;
  background: #edf3ee;
}

.test-buttons button:disabled,
.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-panel {
  margin-top: 20px;
  padding: 18px;
  color: #236440;
  background: #edf7ef;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.7;
}

.result-panel.unavailable {
  color: #a52d2d;
  background: #fff0f0;
}

.result-panel p {
  margin: 7px 0;
}

.result-panel hr {
  border: 0;
  border-top: 1px solid currentColor;
  opacity: 0.2;
}

.error {
  padding: 14px;
  color: #a52d2d;
  background: #fff0f0;
  border-radius: 7px;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.learning-note {
  padding: 18px;
  color: #795b26;
  background: #fff8e9;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.8;
}

@media (max-width: 600px) {
  .api-page {
    padding: 40px 15px;
  }

  .api-card {
    padding: 18px;
  }

  .card-heading {
    align-items: flex-start;
  }

  .page-heading h1 {
    font-size: 34px;
  }

  .test-buttons {
    flex-direction: column;
  }

  .test-buttons button {
    width: 100%;
  }

}

</style>
