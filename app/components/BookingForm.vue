
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from '#app'

import type { Villa } from '~/types/villa'
import type { AvailabilityCheckResponse } from '#shared/types/availability'
import type {
  BookingCreateRequest,
  BookingCreateResponse
} from '#shared/types/booking'

import { formatRupiah } from '~/utils/formatRupiah'

const props = defineProps<{
  villas: Villa[]
}>()

const route = useRoute()

// ======================================
// 1. STATE & INITIALIZATION
// ======================================

const getTodayString = () => {
  const now = new Date()
  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60_000
  )

  return localDate.toISOString().split('T')[0]!
}

const today = ref(getTodayString())

const form = ref({
  villaId: Number(route.query.villa) || props.villas[0]?.id || 0,
  checkIn: '',
  checkOut: '',
  guestCount: 1,
  guestName: '',
  guestPhone: '',
  guestEmail: '',
  specialRequest: ''
})

const errors = ref<Record<string, string>>({})

const isSubmitting = ref(false)
const isCreatingBooking = ref(false)

const isPreviewVisible = ref(false)

const availabilityStatus = ref<
  'idle' | 'available' | 'unavailable' | 'error'
>('idle')

const availabilityMessage = ref('')

const serverQuote = ref<AvailabilityCheckResponse | null>(null)

const bookingResult = ref<BookingCreateResponse['data'] | null>(null)
const bookingError = ref('')

// ======================================
// 2. API COMPOSABLE
// ======================================

const { createBooking } = useBookingApi()

// ======================================
// 3. COMPUTED PROPERTIES
// ======================================

const selectedVilla = computed(() =>
  props.villas.find(v => v.id === form.value.villaId)
)

const maxGuests = computed(() => selectedVilla.value?.capacity ?? 1)

const numberOfNights = computed(() => {
  if (!form.value.checkIn || !form.value.checkOut) return 0

  const start = Date.parse(`${form.value.checkIn}T00:00:00Z`)
  const end = Date.parse(`${form.value.checkOut}T00:00:00Z`)

  const diff = end - start

  return diff > 0 ? diff / (1000 * 60 * 60 * 24) : 0
})

const minCheckOut = computed(() => {
  if (!form.value.checkIn) return today.value

  const nextDay = new Date(`${form.value.checkIn}T00:00:00`)
  nextDay.setDate(nextDay.getDate() + 1)

  const year = nextDay.getFullYear()
  const month = String(nextDay.getMonth() + 1).padStart(2, '0')
  const day = String(nextDay.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
})

const displayedPricePerNight = computed(() =>
  serverQuote.value?.price.perNight ??
  selectedVilla.value?.pricePerNight ??
  0
)

const displayedNights = computed(() =>
  serverQuote.value?.stay.nights ?? numberOfNights.value
)

const displayedTotalPrice = computed(() =>
  serverQuote.value?.price.totalPrice ??
  displayedPricePerNight.value * displayedNights.value
)

// ======================================
// 4. WATCHERS
// ======================================

// Reset hasil pemeriksaan dan preview jika pilihan utama berubah.
watch(
  () => [
    form.value.villaId,
    form.value.checkIn,
    form.value.checkOut,
    form.value.guestCount
  ],
  () => {
    isPreviewVisible.value = false
    serverQuote.value = null
    availabilityStatus.value = 'idle'
    availabilityMessage.value = ''

    // Hapus pesan error booking lama ketika data berubah.
    bookingError.value = ''
    bookingResult.value = null
  }
)

// Sesuaikan jumlah tamu dengan kapasitas villa.
watch(
  () => form.value.villaId,
  () => {
    if (form.value.guestCount > maxGuests.value) {
      form.value.guestCount = maxGuests.value
    }

    clearError('villaId')
    clearError('guestCount')
  }
)

// Reset check-out jika check-in baru membuatnya tidak valid.
watch(
  () => form.value.checkIn,
  (newCheckIn) => {
    if (form.value.checkOut && form.value.checkOut <= newCheckIn) {
      form.value.checkOut = ''
    }

    clearError('checkIn')
    clearError('checkOut')
  }
)

// ======================================
// 5. METHODS & VALIDATION
// ======================================

const clearError = (field: string) => {
  delete errors.value[field]
}

const formatBookingDate = (dateStr: string) => {
  if (!dateStr) return '-'

  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!form.value.villaId || !selectedVilla.value) {
    newErrors.villaId = 'Silakan pilih villa.'
  }

  if (!form.value.checkIn) {
    newErrors.checkIn = 'Tanggal check-in wajib dipilih.'
  } else if (form.value.checkIn < today.value) {
    newErrors.checkIn = 'Tanggal check-in tidak boleh di masa lalu.'
  }

  if (!form.value.checkOut) {
    newErrors.checkOut = 'Tanggal check-out wajib dipilih.'
  } else if (numberOfNights.value < 1) {
    newErrors.checkOut = 'Check-out harus minimal satu hari setelah check-in.'
  }

  if (
    form.value.guestCount < 1 ||
    form.value.guestCount > maxGuests.value
  ) {
    newErrors.guestCount =
      `Jumlah tamu harus antara 1 sampai ${maxGuests.value} orang.`
  }

  if (form.value.guestName.trim().length < 3) {
    newErrors.guestName = 'Nama harus memiliki minimal 3 karakter.'
  }

  const phone = form.value.guestPhone.replace(/[\s()-]/g, '')

  if (!phone) {
    newErrors.guestPhone = 'Nomor telepon wajib diisi.'
  } else if (!/^\+?[0-9]{10,15}$/.test(phone)) {
    newErrors.guestPhone = 'Masukkan nomor telepon dengan 10–15 digit.'
  }

  if (
    form.value.guestEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.guestEmail)
  ) {
    newErrors.guestEmail = 'Format alamat email tidak valid.'
  }

  errors.value = newErrors

  return Object.keys(newErrors).length === 0
}

// ======================================
// 6. STEP ONE: CHECK AVAILABILITY
// ======================================

const handleSubmit = async () => {
  if (isSubmitting.value || isCreatingBooking.value) return

  isPreviewVisible.value = false
  serverQuote.value = null
  bookingError.value = ''
  bookingResult.value = null

  if (!validateForm()) return
  if (!selectedVilla.value) return

  isSubmitting.value = true
  availabilityStatus.value = 'idle'
  availabilityMessage.value = ''

  try {
    const response = await $fetch<AvailabilityCheckResponse>(
      '/api/availability/check',
      {
        method: 'POST',
        body: {
          villaId: form.value.villaId,
          checkIn: form.value.checkIn,
          checkOut: form.value.checkOut
        }
      }
    )

    availabilityMessage.value = response.message

    availabilityStatus.value = response.available
      ? 'available'
      : 'unavailable'

    if (!response.available) {
      errors.value.checkOut = response.message
      return
    }

    serverQuote.value = response
    isPreviewVisible.value = true

  } catch (error: unknown) {
    console.error('Booking availability error:', error)

    availabilityStatus.value = 'error'
    availabilityMessage.value = getApiErrorMessage(
      error,
      'Gagal memeriksa ketersediaan. Periksa koneksi dan coba kembali.'
    )
  } finally {
    isSubmitting.value = false
  }
}

// ======================================
// 7. STEP TWO: CREATE BOOKING
// ======================================

const confirmBooking = async () => {
  if (isCreatingBooking.value || isSubmitting.value) return

  if (!validateForm()) {
    isPreviewVisible.value = false
    return
  }

  if (!selectedVilla.value || !serverQuote.value) {
    bookingError.value =
      'Silakan periksa ketersediaan villa terlebih dahulu.'

    return
  }

  isCreatingBooking.value = true
  bookingError.value = ''
  bookingResult.value = null

  try {
    const payload: BookingCreateRequest = {
      villaId: form.value.villaId,
      guestName: form.value.guestName.trim(),
      guestEmail: form.value.guestEmail.trim(),
      guestPhone: form.value.guestPhone.trim(),
      checkIn: form.value.checkIn,
      checkOut: form.value.checkOut,
      guestCount: form.value.guestCount,
      specialRequest: form.value.specialRequest.trim() || null
    }

    const response = await createBooking(payload)

    bookingResult.value = response.data

    // Preview tidak lagi diperlukan setelah booking tersimpan.
    isPreviewVisible.value = false

  } catch (error: unknown) {
    console.error('Create booking error:', error)

    bookingError.value = getApiErrorMessage(
      error,
      'Reservasi gagal dibuat. Silakan coba kembali.'
    )

    // Jika tanggal baru saja dipesan pengunjung lain,
    // minta pengunjung memeriksa ketersediaan lagi.
    serverQuote.value = null
    availabilityStatus.value = 'idle'
    availabilityMessage.value = ''

  } finally {
    isCreatingBooking.value = false
  }
}

// ======================================
// 8. API ERROR HELPER
// ======================================

function getApiErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (typeof error !== 'object' || error === null) {
    return fallback
  }

  const apiError = error as {
    data?: {
      statusMessage?: string
      message?: string
    }
    statusMessage?: string
    message?: string
  }

  return (
    apiError.data?.statusMessage ??
    apiError.data?.message ??
    apiError.statusMessage ??
    apiError.message ??
    fallback
  )
}

// ======================================
// 9. INITIALIZATION
// ======================================

onMounted(() => {
  today.value = getTodayString()
})

// ✅ PERBAIKAN: state + fungsi untuk success screen
const copied = ref(false)

const copyBookingCode = async () => {
  const code = bookingResult.value?.bookingCode
  if (!code) return
  try {
    await navigator.clipboard.writeText(code)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // fallback untuk browser lama
    const ta = document.createElement('textarea')
    ta.value = code
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
}

// ✅ PERBAIKAN: warna badge sesuai status
const statusClass = computed(() => {
  const s = (bookingResult.value?.status ?? '').toLowerCase()
  if (s === 'confirmed') return 'is-confirmed'
  if (s === 'cancelled') return 'is-cancelled'
  return 'is-pending' // default: pending
})

const statusLabel = computed(() => {
  const s = (bookingResult.value?.status ?? '').toLowerCase()
  if (s === 'confirmed') return 'Terkonfirmasi'
  if (s === 'cancelled') return 'Dibatalkan'
  return 'Menunggu Konfirmasi'
})
</script>

<template>
  <section id="booking" class="booking-section">
    <div class="booking-container">

      <!-- HEADING -->
      <div class="booking-heading">
        <span class="eyebrow">RESERVATION</span>
        <h2>Book Your <span>Perfect Stay.</span></h2>
        <p>Pilih villa dan tanggal menginap untuk melihat estimasi biaya reservasi.</p>
      </div>

      <!-- ✅ STATE 1: EMPTY -->
      <div v-if="villas.length === 0" class="empty-state" role="status">
        <span>🏡</span>
        <h3>Belum Ada Villa Tersedia</h3>
        <p>Saat ini belum ada unit villa yang dapat dipesan. Silakan kembali lagi nanti.</p>
      </div>

      <!-- ✅ STATE 2: SUCCESS (redesign premium) -->
      <section v-if="bookingResult" class="booking-success" aria-live="polite">
        <div class="success-hero">
          <div class="success-icon" aria-hidden="true">
            <svg viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="24" fill="none" stroke="#31855a" stroke-width="3"/>
              <path fill="none" stroke="#31855a" stroke-width="4" stroke-linecap="round"
                    d="M14 27l7 7 16-16"/>
            </svg>
          </div>
          <h3>Reservasi Berhasil Dibuat!</h3>
          <p>
            Terima kasih, <strong>{{ bookingResult.guestName }}</strong>.
            Data reservasi kamu sudah kami terima.
          </p>
          <span class="status-badge" :class="statusClass">
            <i></i> {{ statusLabel }}
          </span>
        </div>

        <div class="booking-code-box">
          <div class="booking-code-info">
            <small>Kode Reservasi</small>
            <strong class="booking-code">{{ bookingResult.bookingCode }}</strong>
          </div>
          <button type="button" class="copy-button" @click="copyBookingCode">
            {{ copied ? '✓ Tersalin' : 'Salin Kode' }}
          </button>
        </div>

        <div class="success-grid">
          <div class="success-item">
            <span>Villa</span>
            <strong>{{ bookingResult.villaName }}</strong>
          </div>
          <div class="success-item">
            <span>Jumlah Tamu</span>
            <strong>{{ bookingResult.guestCount }} orang</strong>
          </div>
          <div class="success-item">
            <span>Check-in</span>
            <strong>{{ formatBookingDate(bookingResult.checkIn) }}</strong>
          </div>
          <div class="success-item">
            <span>Check-out</span>
            <strong>{{ formatBookingDate(bookingResult.checkOut) }}</strong>
          </div>
          <div class="success-item">
            <span>Durasi</span>
            <strong>{{ bookingResult.nights }} malam</strong>
          </div>
          <div class="success-item">
            <span>Telepon</span>
            <strong>{{ bookingResult.guestPhone }}</strong>
          </div>
          <div v-if="bookingResult.guestEmail" class="success-item full">
            <span>Email</span>
            <strong>{{ bookingResult.guestEmail }}</strong>
          </div>
        </div>

        <div class="success-total">
          <span>Total Reservasi</span>
          <strong>{{ formatRupiah(bookingResult.totalPrice) }}</strong>
        </div>

        <p class="success-note">
          Simpan kode reservasi di atas untuk keperluan komunikasi dan pembayaran selanjutnya.
        </p>

        <div class="success-actions">
          <NuxtLink to="/#villas" class="success-btn success-btn-primary">
            ← Lihat Villa Lain
          </NuxtLink>
          <NuxtLink to="/" class="success-btn success-btn-outline">
            Kembali ke Beranda
          </NuxtLink>
        </div>
      </section>

      <!-- ✅ STATE 3: FORM (v-if mandiri) -->
      <form
        v-if="villas.length > 0 && !bookingResult && !isPreviewVisible"
        class="booking-form"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <!-- PILIH VILLA -->
        <div class="form-group full-width">
          <label for="villa">Pilih Villa</label>
          <select
            id="villa"
            v-model.number="form.villaId"
            :aria-invalid="Boolean(errors.villaId)"
            @change="clearError('villaId')"
            required
          >
            <option v-for="villa in villas" :key="villa.id" :value="villa.id">
              {{ villa.name }} - {{ formatRupiah(villa.pricePerNight) }} / malam
            </option>
          </select>
          <small v-if="selectedVilla">Kapasitas maksimum: {{ selectedVilla.capacity }} orang</small>
          <small v-if="errors.villaId" class="field-error">{{ errors.villaId }}</small>
        </div>

        <!-- CHECK-IN -->
        <div class="form-group">
          <label for="checkIn">Check-in</label>
          <input
            id="checkIn"
            v-model="form.checkIn"
            type="date"
            :min="today"
            :aria-invalid="Boolean(errors.checkIn)"
            @input="clearError('checkIn')"
            required
          />
          <small v-if="errors.checkIn" class="field-error">{{ errors.checkIn }}</small>
        </div>

        <!-- CHECK-OUT -->
        <div class="form-group">
          <label for="checkOut">Check-out</label>
          <input
            id="checkOut"
            v-model="form.checkOut"
            type="date"
            :min="minCheckOut"
            :disabled="!form.checkIn"
            :aria-invalid="Boolean(errors.checkOut)"
            @input="clearError('checkOut')"
            required
          />
          <small v-if="errors.checkOut" class="field-error">{{ errors.checkOut }}</small>
        </div>

        <!-- AVAILABILITY MESSAGE -->
        <div
          v-if="availabilityMessage"
          class="availability-message"
          :class="{ 'is-unavailable': availabilityStatus === 'unavailable' || availabilityStatus === 'error' }"
          role="status"
        >
          <span>{{ availabilityStatus === 'available' ? '✓' : '!' }}</span>
          {{ availabilityMessage }}
        </div>

        <!-- JUMLAH TAMU -->
        <div class="form-group full-width">
          <label for="guestCount">Jumlah Tamu</label>
          <input
            id="guestCount"
            v-model.number="form.guestCount"
            type="number"
            min="1"
            :max="maxGuests"
            step="1"
            :aria-invalid="Boolean(errors.guestCount)"
            @input="clearError('guestCount')"
            required
          />
          <small>Maksimal {{ maxGuests }} orang untuk villa ini.</small>
          <small v-if="errors.guestCount" class="field-error">{{ errors.guestCount }}</small>
        </div>

        <!-- INFORMASI PELANGGAN -->
        <div class="form-divider full-width">Informasi Pelanggan</div>

        <div class="form-group full-width">
          <label for="guestName">Nama Lengkap</label>
          <input
            id="guestName"
            v-model.trim="form.guestName"
            type="text"
            minlength="3"
            maxlength="100"
            placeholder="Masukkan nama lengkap"
            autocomplete="name"
            :aria-invalid="Boolean(errors.guestName)"
            @input="clearError('guestName')"
            required
          />
          <small v-if="errors.guestName" class="field-error">{{ errors.guestName }}</small>
        </div>

        <div class="form-group">
          <label for="guestPhone">Nomor Telepon / WhatsApp</label>
          <input
            id="guestPhone"
            v-model.trim="form.guestPhone"
            type="tel"
            inputmode="tel"
            maxlength="20"
            placeholder="0812xxx"
            autocomplete="tel"
            :aria-invalid="Boolean(errors.guestPhone)"
            @input="clearError('guestPhone')"
            required
          />
          <small v-if="errors.guestPhone" class="field-error">{{ errors.guestPhone }}</small>
        </div>

        <div class="form-group">
          <label for="guestEmail">Email (Opsional)</label>
          <input
            id="guestEmail"
            v-model.trim="form.guestEmail"
            type="email"
            maxlength="254"
            placeholder="nama@email.com"
            autocomplete="email"
            :aria-invalid="Boolean(errors.guestEmail)"
            @input="clearError('guestEmail')"
          />
          <small v-if="errors.guestEmail" class="field-error">{{ errors.guestEmail }}</small>
        </div>

        <div class="form-group full-width">
          <label for="specialRequest">Permintaan Khusus (Opsional)</label>
          <textarea
            id="specialRequest"
            v-model.trim="form.specialRequest"
            rows="3"
            maxlength="500"
            placeholder="Contoh: membutuhkan extra bed..."
            @input="clearError('specialRequest')"
          />
        </div>

        <!-- RINGKASAN HARGA -->
        <div class="price-summary full-width">
          <h3>Estimasi Biaya</h3>
          <div class="price-row">
            <span>Villa</span>
            <strong>{{ selectedVilla?.name ?? '-' }}</strong>
          </div>
          <div class="price-row">
            <span>Harga per malam</span>
            <strong>{{ formatRupiah(displayedPricePerNight) }}</strong>
          </div>
          <div class="price-row">
            <span>Durasi menginap</span>
            <strong>{{ displayedNights }} malam</strong>
          </div>
          <div class="price-row">
            <span>Jumlah tamu</span>
            <strong>{{ form.guestCount }} orang</strong>
          </div>
          <div class="price-total">
            <span>Estimasi Total</span>
            <strong>{{ formatRupiah(displayedTotalPrice) }}</strong>
          </div>
        </div>

        <div v-if="Object.keys(errors).length > 0" class="error-summary full-width" role="alert">
          Ada beberapa informasi yang perlu diperbaiki. Periksa kembali input yang ditandai.
        </div>

        <!-- SUBMIT BUTTON -->
        <div class="form-actions full-width">
          <button
            type="submit"
            class="submit-button"
            :disabled="isSubmitting || villas.length === 0"
            :aria-busy="isSubmitting"
          >
            <span v-if="isSubmitting" class="loading-spinner"></span>
            {{ isSubmitting ? 'Memeriksa Reservasi...' : 'Tampilkan Ringkasan Reservasi →' }}
          </button>
          <p>Periksa ketersediaan terlebih dahulu sebelum mengonfirmasi reservasi.</p>
        </div>
      </form>

      <!-- ✅ bookingError -->
      <div v-if="bookingError" class="error-summary" role="alert">
        {{ bookingError }}
      </div>

      <!-- ✅ STATE 4: PREVIEW (v-if mandiri) -->
      <div
        v-if="villas.length > 0 && !bookingResult && isPreviewVisible && selectedVilla"
        class="preview-card"
        aria-live="polite"
      >
        <div class="preview-heading">
          <span>✓</span>
          <div>
            <h3>Ringkasan Reservasi Berhasil Dibuat</h3>
            <p>Periksa kembali informasi berikut.</p>
            <p v-if="serverQuote" class="quote-note">
              Estimasi harga dihitung berdasarkan data villa yang diperoleh dari server.
              Ini belum merupakan konfirmasi reservasi.
            </p>
          </div>
        </div>

        <div class="preview-details">
          <div><span>Nama Pelanggan</span><strong>{{ form.guestName }}</strong></div>
          <div><span>Nomor Telepon</span><strong>{{ form.guestPhone }}</strong></div>
          <div v-if="form.guestEmail"><span>Email</span><strong>{{ form.guestEmail }}</strong></div>
          <div><span>Villa</span><strong>{{ selectedVilla.name }}</strong></div>
          <div><span>Check-in</span><strong>{{ formatBookingDate(form.checkIn) }}</strong></div>
          <div><span>Check-out</span><strong>{{ formatBookingDate(form.checkOut) }}</strong></div>
          <div><span>Durasi</span><strong>{{ displayedNights }} malam</strong></div>
          <div><span>Jumlah Tamu</span><strong>{{ form.guestCount }} orang</strong></div>
          <div class="preview-total">
            <span>Total Estimasi</span>
            <strong>{{ formatRupiah(displayedTotalPrice) }}</strong>
          </div>
        </div>

        <p v-if="form.specialRequest">
          <strong>Permintaan khusus:</strong> {{ form.specialRequest }}
        </p>

        <div class="preview-actions">
          <button
            type="button"
            class="submit-button"
            :disabled="isCreatingBooking"
            :aria-busy="isCreatingBooking"
            @click="confirmBooking"
          >
            <span v-if="isCreatingBooking" class="loading-spinner"></span>
            {{ isCreatingBooking ? 'Menyimpan Reservasi...' : 'Konfirmasi Reservasi' }}
          </button>
          <p>Reservasi akan disimpan setelah kamu menekan tombol konfirmasi.</p>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>

/* =================================
   BOOKING SUCCESS (redesign)
================================= */
.booking-success {
  margin-top: 10px;
  padding: 40px 35px;
  background: white;
  border: 1px solid #d7e5d9;
  border-radius: 16px;
  box-shadow: 0 14px 40px rgba(24, 61, 50, 0.08);
  animation: successIn 0.4s ease;
}

@keyframes successIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.success-hero {
  text-align: center;
  margin-bottom: 28px;
}

.success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
}

.success-icon svg { width: 100%; height: 100%; }

.success-icon circle {
  stroke-dasharray: 151;
  stroke-dashoffset: 151;
  animation: drawCircle 0.5s ease forwards;
}

.success-icon path {
  stroke-dasharray: 36;
  stroke-dashoffset: 36;
  animation: drawCheck 0.4s ease 0.45s forwards;
}

@keyframes drawCircle { to { stroke-dashoffset: 0; } }
@keyframes drawCheck  { to { stroke-dashoffset: 0; } }

.success-hero h3 {
  margin: 0 0 8px;
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 24px;
}

.success-hero p {
  margin: 0 auto 14px;
  max-width: 420px;
  color: #556058;
  font-size: 14px;
  line-height: 1.7;
}

.success-hero p strong { color: #183d32; }

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.status-badge i {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.is-pending   { color: #9a6a1f; background: #fdf3e0; }
.status-badge.is-confirmed { color: #286c4a; background: #edf7ef; }
.status-badge.is-cancelled { color: #a52d2d; background: #fff0f0; }

/* Booking code */
.booking-code-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  margin-bottom: 26px;
  background: #f5f7f3;
  border: 1px dashed #cbd8cd;
  border-radius: 12px;
}

.booking-code-info small {
  display: block;
  color: #869087;
  font-size: 11px;
  margin-bottom: 4px;
}

.booking-code {
  color: #183d32;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.copy-button {
  padding: 9px 16px;
  color: white;
  background: #183d32;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.copy-button:hover { background: #0f2820; }

/* Detail grid */
.success-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px 24px;
  padding-bottom: 22px;
  border-bottom: 1px solid #e9eee9;
}

.success-item { display: flex; flex-direction: column; gap: 5px; }
.success-item.full { grid-column: 1 / -1; }
.success-item span { color: #89918b; font-size: 11px; }
.success-item strong {
  color: #26352c;
  font-size: 14px;
  overflow-wrap: anywhere;
}

/* Total */
.success-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 0 6px;
}

.success-total span { color: #556058; font-size: 14px; }

.success-total strong {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 30px;
}

.success-note {
  margin: 12px 0 24px;
  color: #869087;
  font-size: 12px;
  line-height: 1.6;
}

/* Actions */
.success-actions {
  display: flex;
  gap: 12px;
}

.success-btn {
  flex: 1;
  padding: 14px;
  border-radius: 9px;
  text-align: center;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.success-btn-primary { background: #183d32; color: white; }
.success-btn-primary:hover { background: #0f2820; transform: translateY(-1px); }

.success-btn-outline {
  background: transparent;
  color: #183d32;
  border: 2px solid #183d32;
}
.success-btn-outline:hover { background: #183d32; color: white; }

@media (max-width: 600px) {
  .booking-success { padding: 28px 20px; }
  .booking-code-box { flex-direction: column; align-items: stretch; }
  .copy-button { width: 100%; }
  .success-grid { grid-template-columns: 1fr; }
  .success-actions { flex-direction: column; }
}

@media (prefers-reduced-motion: reduce) {
  .booking-success { animation: none; }
  .success-icon circle,
  .success-icon path { animation: none; stroke-dashoffset: 0; }
}

.preview-actions {
  margin-top: 25px;
  text-align: center;
}

.preview-actions p {
  margin-top: 12px;
  color: #89918b;
  font-size: 11px;
}

.booking-success {
  border-color: #31855a;
}

.booking-success .preview-heading > span {
  background: #31855a;
}
/* ✅ PERBAIKAN 5: CSS tetap sama, hanya dirapikan indentasinya agar konsisten */
.booking-section {
  padding: 90px 24px;
  background: #f5f6f0;
  scroll-margin-top: 85px;
}

.booking-container {
  max-width: 850px;
  margin: auto;
}

.booking-heading {
  margin-bottom: 35px;
  text-align: center;
}

.eyebrow {
  color: #a17d54;
  font-weight: bold;
  font-size: 11px;
  letter-spacing: 2px;
}

.booking-heading h2 {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: clamp(34px, 5vw, 46px);
  font-weight: 500;
}

.booking-heading h2 span {
  color: #b18a5a;
  font-style: italic;
}

.booking-heading p {
  color: #778078;
  font-size: 14px;
  line-height: 1.8;
}

.booking-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  padding: 35px;
  background: white;
  border: 1px solid #e9eee9;
  border-radius: 14px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.form-group label {
  color: #183d32;
  font-size: 13px;
  font-weight: 700;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 14px;
  color: #26352c;
  background: #fbfcfa;
  border: 1px solid #dfe7df;
  border-radius: 7px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #38765c;
  box-shadow: 0 0 0 3px rgba(56, 118, 92, 0.15); /* ✅ Dipertebal sedikit untuk aksesibilitas fokus */
}

.form-group input:disabled {
  cursor: not-allowed;
  background: #eeeeee;
}

.form-group small {
  color: #869087;
  font-size: 11px;
}

.form-divider {
  padding-top: 10px;
  padding-bottom: 12px;
  color: #183d32;
  font-size: 14px;
  font-weight: bold;
  border-bottom: 1px solid #e9eee9;
}

.price-summary {
  margin-top: 5px;
  padding: 25px;
  background: #f5f7f3;
  border-radius: 9px;
}

.price-summary h3 {
  margin-top: 0;
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 21px;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  color: #778078;
  font-size: 13px;
  border-bottom: 1px solid #e4eae3;
}

.price-row strong {
  color: #26352c;
  text-align: right;
}

.price-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 15px;
  padding-top: 15px;
  color: #183d32;
  border-top: 1px solid #cbd8cd;
}

.price-total strong {
  font-size: 22px;
  font-family: Georgia, serif;
}

.form-actions {
  text-align: center;
}

.submit-button {
  width: 100%;
  padding: 16px;
  color: white;
  background: #183d32;
  border: none;
  border-radius: 7px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-button:hover:not(:disabled) {
  background: #0f2820;
}

.submit-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.form-actions p {
  margin-top: 12px;
  color: #89918b;
  font-size: 11px;
}

.preview-card {
  margin-top: 30px;
  padding: 30px;
  background: white;
  border: 1px solid #d7e5d9;
  border-radius: 12px;
}

.preview-heading {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 25px;
}

.preview-heading > span {
  display: grid;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  place-items: center;
  color: white;
  background: #31855a;
  border-radius: 50%;
}

.preview-heading h3 {
  margin: 0;
  color: #183d32;
  font-size: 17px;
}

.preview-heading p {
  color: #778078;
  font-size: 12px;
}

.preview-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.preview-details div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-details span {
  color: #89918b;
  font-size: 11px;
}

.preview-details strong {
  color: #26352c;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.preview-details .preview-total {
  grid-column: 1 / -1;
  padding-top: 20px;
  border-top: 1px solid #e9eee9;
}

.preview-details .preview-total strong {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 25px;
}

.demo-notice {
  margin-top: 25px;
  padding: 15px;
  color: #795b26;
  background: #fff8e9;
  border-radius: 7px;
  font-size: 12px;
  line-height: 1.7;
}

.empty-state {
  padding: 45px 25px;
  background: white;
  border: 1px dashed #cbd8cd;
  border-radius: 12px;
  text-align: center;
}

.empty-state > span {
  font-size: 40px;
}

.empty-state h3 {
  color: #183d32;
  font-family: Georgia, serif;
}

.empty-state p {
  color: #778078;
  font-size: 13px;
  line-height: 1.8;
}

.field-error {
  color: #b42318 !important;
  font-size: 12px !important;
  line-height: 1.5;
}

.form-group input[aria-invalid="true"],
.form-group select[aria-invalid="true"] {
  border-color: #dc5b53;
  background: #fffafa;
}

.error-summary {
  padding: 14px 16px;
  color: #a52d2d;
  background: #fff0f0;
  border: 1px solid #f0cccc;
  border-radius: 7px;
  font-size: 13px;
  line-height: 1.6;
}

.availability-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  color: #286c4a;
  background: #edf7ef;
  border: 1px solid #d0e8d5;
  border-radius: 7px;
  font-size: 12px;
  line-height: 1.6;
}

.availability-message.is-unavailable {
  color: #a52d2d;
  background: #fff0f0;
  border-color: #f0cccc;
}

.loading-spinner {
  display: inline-block;
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .booking-section { padding: 60px 16px; }
  .booking-form { grid-template-columns: 1fr; padding: 20px; gap: 18px; }
  .preview-card { padding: 20px; }
  .preview-details { grid-template-columns: 1fr; }
  .preview-details .preview-total { grid-column: auto; }
}

@media (max-width: 420px) {
  .price-summary { padding: 18px; }
  .price-total { align-items: flex-start; flex-direction: column; }
  .price-total strong { font-size: 20px; }
  .submit-button { padding: 14px 10px; font-size: 12px; }
  .preview-heading h3 { font-size: 15px; }
}

@media (prefers-reduced-motion: reduce) {
  .loading-spinner { animation: none; }
}
</style>