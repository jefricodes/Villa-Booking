

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted
} from 'vue'

import { villas } from '~/data/villas'
import { demoBookings } from '~/data/demo-bookings'

import type { Villa } from '~/types/villa'

import { formatRupiah } from '~/utils/formatRupiah'


// ======================================
// 1. MEMBACA QUERY PARAMETER
// ======================================

const route = useRoute()

function getVillaIdFromQuery(
  queryValue: unknown
): number | undefined {

  const value = Array.isArray(queryValue)
    ? queryValue[0]
    : queryValue

  if (typeof value !== 'string' || value.trim() === '') {
    return undefined
  }

  const villaId = Number(value)

  if (!Number.isSafeInteger(villaId)) {
    return undefined
  }

  const exists = villas.some(
    (villa) => villa.id === villaId
  )

  return exists ? villaId : undefined
}


// ======================================
// 2. DATA FORM
// ======================================

const today = ref('')

const selectedVillaId = ref<number>(
  getVillaIdFromQuery(route.query.villa)
  ?? villas[0]?.id
  ?? 0
)

const checkIn = ref('')
const checkOut = ref('')

const guestCount = ref(1)

const guestName = ref('')
const guestPhone = ref('')
const guestEmail = ref('')

const specialRequest = ref('')

// Status tampilan
const isSubmitting = ref(false)
const isPreviewVisible = ref(false)

// Menyimpan pesan error setiap input
const fieldErrors = ref<Record<string, string>>({})


// ======================================
// 3. MENGIKUTI PILIHAN VILLA DARI URL
// ======================================

watch(
  () => route.query.villa,
  (newValue) => {

    const villaId = getVillaIdFromQuery(newValue)

    if (villaId !== undefined) {
      selectedVillaId.value = villaId
    }

  }
)


// ======================================
// 4. MENGAMBIL DATA VILLA
// ======================================

const selectedVilla = computed((): Villa | undefined => {

  return villas.find(
    (villa) => villa.id === selectedVillaId.value
  )

})


const maxGuests = computed(() => {
  return selectedVilla.value?.capacity ?? 1
})


// ======================================
// 5. FUNGSI PENGOLAHAN TANGGAL
// ======================================

function getLocalDateValue(date: Date): string {

  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0')

  const day = String(
    date.getDate()
  ).padStart(2, '0')

  return `${year}-${month}-${day}`

}


function addOneDay(dateValue: string): string {

  const [year=0, month=1, day=1] = dateValue
    .split('-')
    .map(Number)

  const date = new Date(
    Date.UTC(year, month - 1, day)
  )

  date.setUTCDate(date.getUTCDate() + 1)

  const newYear = date.getUTCFullYear()

  const newMonth = String(
    date.getUTCMonth() + 1
  ).padStart(2, '0')

  const newDay = String(
    date.getUTCDate()
  ).padStart(2, '0')

  return `${newYear}-${newMonth}-${newDay}`

}


function getDateTimestamp(dateValue: string): number {

  const [year=0, month=1, day=1] = dateValue
    .split('-')
    .map(Number)

  return Date.UTC(year, month - 1, day)

}


function formatBookingDate(dateValue: string): string {

  if (!dateValue) {
    return '-'
  }

  const [year=0, month=1, day=1] = dateValue
    .split('-')
    .map(Number)

  const date = new Date(
    Date.UTC(year, month - 1, day)
  )

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date)

}


// ======================================
// 6. MENGHITUNG JUMLAH MALAM
// ======================================

const numberOfNights = computed(() => {

  if (!checkIn.value || !checkOut.value) {
    return 0
  }

  const start = getDateTimestamp(checkIn.value)

  const end = getDateTimestamp(checkOut.value)

  const difference = end - start

  if (difference <= 0) {
    return 0
  }

  return difference / 86400000

})


// ======================================
// 7. MENGATUR MINIMUM CHECK-OUT
// ======================================

const minCheckOut = computed(() => {

  if (!checkIn.value) {
    return today.value
  }

  return addOneDay(checkIn.value)

})


// ======================================
// 8. MENGHITUNG ESTIMASI HARGA
// ======================================

const totalPrice = computed(() => {

  const price = selectedVilla.value?.pricePerNight ?? 0

  return price * numberOfNights.value

})


// ======================================
// 9. MEMERIKSA BENTROK RESERVASI
// ======================================

const conflictingBooking = computed(() => {

  if (
    !selectedVilla.value ||
    !checkIn.value ||
    !checkOut.value ||
    numberOfNights.value < 1
  ) {
    return undefined
  }

  return demoBookings.find((booking) => {

    // Harus villa yang sama
    const sameVilla =
      booking.villaId === selectedVillaId.value

    // Pending dan confirmed memblokir jadwal
    const blocksSchedule =
      booking.status === 'pending' ||
      booking.status === 'confirmed'

    // Rumus overlap tanggal
    const dateOverlaps =
      booking.checkIn < checkOut.value &&
      booking.checkOut > checkIn.value

    return (
      sameVilla &&
      blocksSchedule &&
      dateOverlaps
    )

  })

})


const hasDateConflict = computed(() => {
  return Boolean(conflictingBooking.value)
})


// Pesan informasi ketersediaan
const availabilityMessage = computed(() => {

  if (!checkIn.value || !checkOut.value) {
    return ''
  }

  if (numberOfNights.value < 1) {
    return ''
  }

  if (hasDateConflict.value) {
    return 'Tanggal tersebut bertabrakan dengan reservasi yang sudah tercatat.'
  }

  return 'Tidak ditemukan bentrok pada data simulasi. Ketersediaan sebenarnya belum diverifikasi server.'

})


// ======================================
// 10. WATCH PERUBAHAN CHECK-IN
// ======================================

watch(checkIn, (newValue) => {

  if (
    newValue &&
    checkOut.value &&
    checkOut.value <= newValue
  ) {
    checkOut.value = ''
  }

})


// ======================================
// 11. WATCH PERUBAHAN VILLA
// ======================================

watch(selectedVillaId, () => {

  if (guestCount.value > maxGuests.value) {
    guestCount.value = maxGuests.value
  }

})


// ======================================
// 12. RESET PREVIEW DAN ERROR
// ======================================

// Tutup preview jika ada perubahan form
watch(
  [
    selectedVillaId,
    checkIn,
    checkOut,
    guestCount,
    guestName,
    guestPhone,
    guestEmail,
    specialRequest
  ],
  () => {
    isPreviewVisible.value = false
  }
)


// Hapus error sesuai input yang diperbaiki
watch(guestName, () => {
  clearFieldError('guestName')
})

watch(guestPhone, () => {
  clearFieldError('guestPhone')
})

watch(guestEmail, () => {
  clearFieldError('guestEmail')
})

watch(guestCount, () => {
  clearFieldError('guestCount')
})

watch(specialRequest, () => {
  clearFieldError('specialRequest')
})

watch (checkIn, () => {
    clearFieldError('checkIn')
    clearFieldError('checkOut')
})

watch (selectedVillaId, () => {
    clearFieldError('villa')
    clearFieldError('guestCount')
})


// ======================================
// 13. SET TANGGAL HARI INI
// ======================================

onMounted(() => {

  today.value = getLocalDateValue(new Date())

})


// ======================================
// 14. VALIDASI FORM
// ======================================

function validateForm(): boolean {

  const errors: Record<string, string> = {}

  // Periksa villa
  if (!selectedVilla.value) {
    errors.villa = 'Silakan pilih villa.'
  }


  // Periksa check-in
  if (!checkIn.value) {

    errors.checkIn = 'Tanggal check-in wajib dipilih.'

  } else if (
    today.value &&
    checkIn.value < today.value
  ) {

    errors.checkIn = 'Tanggal check-in tidak boleh di masa lalu.'

  }


  // Periksa check-out
  if (!checkOut.value) {

    errors.checkOut = 'Tanggal check-out wajib dipilih.'

  } else if (!checkIn.value) {

    errors.checkOut = 'Pilih check-in terlebih dahulu.'

  } else if (numberOfNights.value < 1) {

    errors.checkOut =
      'Check-out harus minimal satu hari setelah check-in.'

  } else if (hasDateConflict.value) {

    errors.checkOut =
      'Tanggal menginap bertabrakan dengan reservasi lain.'

  }


  // Periksa jumlah tamu
  if (!Number.isInteger(guestCount.value)) {

    errors.guestCount = 'Jumlah tamu harus berupa angka bulat.'

  } else if (
    guestCount.value < 1 ||
    guestCount.value > maxGuests.value
  ) {

    errors.guestCount =
      `Jumlah tamu harus antara 1 sampai ${maxGuests.value} orang.`

  }


  // Periksa nama pelanggan
  const name = guestName.value.trim()

  if (name.length < 3) {

    errors.guestName =
      'Nama harus memiliki minimal 3 karakter.'

  }


  // Periksa nomor telepon
  const phone = guestPhone.value.replace(
    /[\s()-]/g,
    ''
  )

  if (!phone) {

    errors.guestPhone =
      'Nomor telepon wajib diisi.'

  } else if (!/^\+?[0-9]{10,15}$/.test(phone)) {

    errors.guestPhone =
      'Masukkan nomor telepon dengan 10–15 digit.'

  }


  // Periksa email jika diisi
  const email = guestEmail.value.trim()

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {

    errors.guestEmail =
      'Format alamat email tidak valid.'

  }


  // Simpan semua error
  fieldErrors.value = errors

  // Jika tidak ada error, hasilnya true
  return Object.keys(errors).length === 0

}
function clearFieldError(field: string): void {

  const updatedErrors = {
    ...fieldErrors.value
  }

  delete updatedErrors[field]

  fieldErrors.value = updatedErrors

}


// ======================================
// 15. PROSES FORM
// ======================================

async function handleSubmit() {

  isPreviewVisible.value = false

  // Jalankan validasi
  const isValid = validateForm()

  if (!isValid) {
    return
  }

  // Aktifkan loading
  isSubmitting.value = true

  try {

    // Simulasi proses pemeriksaan
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500)
    })

    // Tampilkan preview
    isPreviewVisible.value = true

  } finally {

    // Matikan loading
    isSubmitting.value = false

  }

}

</script>



<template>

  <section id="booking" class="booking-section">

    <div class="booking-container">

      <!-- HEADING -->
      <div class="booking-heading">

        <span class="eyebrow">
          RESERVATION
        </span>

        <h2>
          Book Your
          <span>Perfect Stay.</span>
        </h2>

        <p>
          Pilih villa dan tanggal menginap untuk
          melihat estimasi biaya reservasi.
        </p>

      </div>


        <div
        v-if="villas.length === 0"
        class="empty-state"
        role="status"
        >
        <span>🏡</span>

        <h3>Belum Ada Villa Tersedia</h3>

        <p>
            Saat ini belum ada unit villa yang dapat dipesan.
            Silakan kembali lagi nanti.
        </p>
        </div>

      <!-- BOOKING FORM -->
    <form
        v-else
        class="booking-form"
        novalidate
        @submit.prevent="handleSubmit"
    >

        <!-- PILIH VILLA -->
        <div class="form-group full-width">

          <label for="villa">
            Pilih Villa
          </label>

        <select
        id="villa"
        v-model.number="selectedVillaId"
        :disabled="villas.length === 0"
        :aria-invalid="Boolean(fieldErrors.villa)"
        required
        >
        <option
            v-for="villa in villas"
            :key="villa.id"
            :value="villa.id"
        >
            {{ villa.name }} -
            {{ formatRupiah(villa.pricePerNight) }} / malam
        </option>
        </select>

        <small v-if="selectedVilla">
        Kapasitas maksimum:
        {{ selectedVilla.capacity }} orang
        </small>

        <small
        v-if="fieldErrors.villa"
        class="field-error"
        >
        {{ fieldErrors.villa }}
        </small>


        </div>


        <!-- CHECK-IN -->
        <div class="form-group">

          <label for="checkIn">
            Check-in
          </label>

        <input
        id="checkIn"
        v-model="checkIn"
        type="date"
        :min="today"
        :aria-invalid="Boolean(fieldErrors.checkIn)"
        aria-describedby="checkIn-help"
        required
        />

        <small id="checkIn-help">
        Tanggal mulai menginap
        </small>

        <small
        v-if="fieldErrors.checkIn"
        class="field-error"
        >
        {{ fieldErrors.checkIn }}
        </small>


        </div>


        <!-- CHECK-OUT -->
        <div class="form-group">

          <label for="checkOut">
            Check-out
          </label>

                <input
                id="checkOut"
                v-model="checkOut"
                type="date"
                :min="minCheckOut"
                :disabled="!checkIn"
                :aria-invalid="Boolean(fieldErrors.checkOut)"
                required
                />

                <small>
                Minimal satu hari setelah check-in
                </small>

                <small
                v-if="fieldErrors.checkOut"
                class="field-error"
                >
                {{ fieldErrors.checkOut }}
                </small>
        </div>

        <div
        v-if="availabilityMessage"
        class="availability-message full-width"
        :class="{
            'is-unavailable': hasDateConflict
        }"
        role="status"
        >
        <span v-if="hasDateConflict">✕</span>
        <span v-else>✓</span>

        {{ availabilityMessage }}
        </div>



        <!-- JUMLAH TAMU -->
        <div class="form-group full-width">

          <label for="guestCount">
            Jumlah Tamu
          </label>


                <input
                id="guestCount"
                v-model.number="guestCount"
                type="number"
                min="1"
                :max="maxGuests"
                step="1"
                :aria-invalid="Boolean(fieldErrors.guestCount)"
                required
                />

                <small>
                Maksimal {{ maxGuests }} orang untuk villa ini.
                </small>

                <small
                v-if="fieldErrors.guestCount"
                class="field-error"
                >
                {{ fieldErrors.guestCount }}
                </small>


        </div>


        <!-- INFORMASI PELANGGAN -->
        <div class="form-divider full-width">
          Informasi Pelanggan
        </div>


        <div class="form-group full-width">

          <label for="guestName">
            Nama Lengkap
          </label>

          
            <input
            id="guestName"
            v-model.trim="guestName"
            type="text"
            minlength="3"
            maxlength="100"
            placeholder="Masukkan nama lengkap"
            autocomplete="name"
            :aria-invalid="Boolean(fieldErrors.guestName)"
            required
            />

            <small
            v-if="fieldErrors.guestName"
            class="field-error"
            >
            {{ fieldErrors.guestName }}
            </small>

        </div>


        <div class="form-group">

          <label for="guestPhone">
            Nomor Telepon / WhatsApp
          </label>

            <input
            id="guestPhone"
            v-model.trim="guestPhone"
            type="tel"
            inputmode="tel"
            maxlength="20"
            placeholder="081234567890"
            autocomplete="tel"
            :aria-invalid="Boolean(fieldErrors.guestPhone)"
            required
            />

            <small>
            Contoh: 081234567890 atau +6281234567890
            </small>

            <small
            v-if="fieldErrors.guestPhone"
            class="field-error"
            >
            {{ fieldErrors.guestPhone }}
            </small>


        </div>


        <div class="form-group">

          <label for="guestEmail">
            Email (Opsional)
          </label>
            <input
            id="guestEmail"
            v-model.trim="guestEmail"
            type="email"
            maxlength="254"
            placeholder="nama@email.com"
            autocomplete="email"
            :aria-invalid="Boolean(fieldErrors.guestEmail)"
            />

            <small
            v-if="fieldErrors.guestEmail"
            class="field-error"
            >
            {{ fieldErrors.guestEmail }}
            </small>

        </div>


        <!-- PERMINTAAN KHUSUS -->
        <div class="form-group full-width">

          <label for="specialRequest">
            Permintaan Khusus (Opsional)
          </label>
            <textarea
            id="specialRequest"
            v-model.trim="specialRequest"
            rows="3"
            maxlength="500"
            placeholder="Contoh: membutuhkan extra bed..."
            />

        </div>


        <!-- RINGKASAN HARGA -->
        <div class="price-summary full-width">

          <h3>
            Estimasi Biaya
          </h3>

          <div class="price-row">

            <span>Villa</span>

            <strong>
              {{ selectedVilla?.name ?? '-' }}
            </strong>

          </div>

          <div class="price-row">

            <span>Harga per malam</span>

            <strong>
              {{ formatRupiah(selectedVilla?.pricePerNight ?? 0) }}
            </strong>

          </div>

          <div class="price-row">

            <span>Durasi menginap</span>

            <strong>
              {{ numberOfNights }} malam
            </strong>

          </div>

          <div class="price-row">

            <span>Jumlah tamu</span>

            <strong>
              {{ guestCount }} orang
            </strong>

          </div>

          <div class="price-total">

            <span>Estimasi Total</span>

            <strong>
              {{ formatRupiah(totalPrice) }}
            </strong>

          </div>

        </div>

        <div
        v-if="Object.keys(fieldErrors).length > 0"
        class="error-summary full-width"
        role="alert"
        >
        Ada beberapa informasi yang perlu diperbaiki.
        Periksa kembali input yang ditandai sebelum melanjutkan.
        </div>



        <!-- SUBMIT BUTTON -->
        <div class="form-actions full-width">


            <button
            type="submit"
            class="submit-button"
            :disabled="isSubmitting || villas.length === 0"
            :aria-busy="isSubmitting"
            >
            <template v-if="isSubmitting">
                <span class="loading-spinner"></span>
                Memeriksa Reservasi...
            </template>

            <template v-else>
                Tampilkan Ringkasan Reservasi →
            </template>
            </button>

            <p>
            Ini masih simulasi frontend dan belum menyimpan
            reservasi ke database.
            </p>


        </div>

      </form>


      <!-- HASIL PREVIEW -->
      <div
        v-if="isPreviewVisible && selectedVilla"
        class="preview-card"
        aria-live="polite"
      >

        <div class="preview-heading">
          <span>✓</span>

          <div>
            <h3>Ringkasan Reservasi Berhasil Dibuat</h3>

            <p>
              Periksa kembali informasi berikut.
            </p>
          </div>
        </div>


        <div class="preview-details">

          <div>
            <span>Nama Pelanggan</span>
            <strong>{{ guestName }}</strong>
          </div>

          <div>
            <span>Nomor Telepon</span>
            <strong>{{ guestPhone }}</strong>
          </div>

          <div v-if="guestEmail">
            <span>Email</span>
            <strong>{{ guestEmail }}</strong>
          </div>

          <div>
            <span>Villa</span>
            <strong>{{ selectedVilla.name }}</strong>
          </div>

          <div>
            <span>Check-in</span>
            <strong>{{ formatBookingDate(checkIn) }}</strong>
          </div>

          <div>
            <span>Check-out</span>
            <strong>{{ formatBookingDate(checkOut) }}</strong>
          </div>

          <div>
            <span>Durasi</span>
            <strong>{{ numberOfNights }} malam</strong>
          </div>

          <div>
            <span>Jumlah Tamu</span>
            <strong>{{ guestCount }} orang</strong>
          </div>

          <div class="preview-total">
            <span>Total Estimasi</span>
            <strong>{{ formatRupiah(totalPrice) }}</strong>
          </div>

        </div>

        <p v-if="specialRequest">
          <strong>Permintaan khusus:</strong>
          {{ specialRequest }}
        </p>

        <div class="demo-notice">
          <strong>Catatan:</strong>
          Data ini baru ditampilkan di browser.
          Belum tersimpan dan belum mengunci tanggal villa.
          Tahap penyimpanan akan kita buat pada Backend Development.
        </div>

      </div>

    </div>

  </section>

</template>


<style scoped>

/* BOOKING SECTION */

.booking-section {
  padding: 90px 24px;
  background: #f5f6f0;
  scroll-margin-top: 85px;
}

.booking-container {
  max-width: 850px;
  margin: auto;
}


/* HEADING */

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


/* FORM */

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
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #38765c;
  box-shadow: 0 0 0 3px rgba(56, 118, 92, 0.10);
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


/* PRICE SUMMARY */

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


/* BUTTON */

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
}

.submit-button:hover {
  background: #285849;
}

.form-actions p {
  margin-top: 12px;
  color: #89918b;
  font-size: 11px;
}


/* ERROR */

.error-message {
  padding: 14px;
  color: #a52d2d;
  background: #fff0f0;
  border: 1px solid #f0cccc;
  border-radius: 7px;
  font-size: 13px;
}


/* PREVIEW */

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


/* RESPONSIVE */

@media (max-width: 600px) {

  .booking-section {
    padding: 60px 16px;
  }

  .booking-form {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 18px;
  }

  .preview-card {
    padding: 20px;
  }

  .preview-details {
    grid-template-columns: 1fr;
  }

  .preview-details .preview-total {
    grid-column: auto;
  }

}


/* =================================
   EMPTY STATE
================================= */

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


/* =================================
   FIELD ERRORS
================================= */

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


/* =================================
   ERROR SUMMARY
================================= */

.error-summary {
  padding: 14px 16px;
  color: #a52d2d;
  background: #fff0f0;
  border: 1px solid #f0cccc;
  border-radius: 7px;
  font-size: 13px;
  line-height: 1.6;
}


/* =================================
   AVAILABILITY MESSAGE
================================= */

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


/* =================================
   BUTTON DISABLED
================================= */

.submit-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}


/* =================================
   LOADING SPINNER
================================= */

.loading-spinner {
  display: inline-block;
  width: 15px;
  height: 15px;
  margin-right: 8px;
  vertical-align: middle;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* =================================
   SMALL MOBILE
================================= */

@media (max-width: 420px) {

  .price-summary {
    padding: 18px;
  }

  .price-total {
    align-items: flex-start;
    flex-direction: column;
  }

  .price-total strong {
    font-size: 20px;
  }

  .submit-button {
    padding: 14px 10px;
    font-size: 12px;
  }

  .preview-heading h3 {
    font-size: 15px;
  }

}


/* REDUCE ANIMATION FOR ACCESSIBILITY */

@media (prefers-reduced-motion: reduce) {

  .loading-spinner {
    animation: none;
  }

}


</style>
