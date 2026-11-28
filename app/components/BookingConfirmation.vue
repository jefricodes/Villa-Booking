<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BookingRecord, BookingStatus } from '#shared/types/booking'

const props = defineProps<{
  booking: BookingRecord
}>()

const formattedPrice = computed(() =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(props.booking.totalPrice)
)

const formattedDate = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${value}T00:00:00Z`))

// ✅ PERBAIKAN: status badge (dipindah dari BookingForm)
const statusClass = computed(() => {
  const s = (props.booking.status as BookingStatus)
  if (s === 'confirmed' || s === 'completed') return 'is-confirmed'
  if (s === 'cancelled') return 'is-cancelled'
  return 'is-pending'
})

const statusLabel = computed(() => {
  const s = (props.booking.status as BookingStatus)
  if (s === 'confirmed') return 'Terkonfirmasi'
  if (s === 'completed') return 'Selesai'
  if (s === 'cancelled') return 'Dibatalkan'
  return 'Menunggu Konfirmasi'
})

// ✅ PERBAIKAN: tombol salin kode (dipindah dari BookingForm)
const copied = ref(false)
const copyBookingCode = async () => {
  const code = props.booking.bookingCode
  if (!code) return
  try {
    await navigator.clipboard.writeText(code)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = code
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <section class="booking-confirmation" aria-labelledby="confirmation-title">

    <!-- HERO -->
    <div class="confirmation-hero">
      <div class="confirmation-icon" aria-hidden="true">
        <svg viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="24" fill="none" stroke="#31855a" stroke-width="3"/>
          <path fill="none" stroke="#31855a" stroke-width="4" stroke-linecap="round"
                d="M14 27l7 7 16-16"/>
        </svg>
      </div>

      <h2 id="confirmation-title">Reservasi Berhasil Dibuat!</h2>
      <p>
        Terima kasih, <strong>{{ booking.guestName }}</strong>.
        Data reservasi kamu sudah kami terima.
      </p>
      <span class="status-badge" :class="statusClass">
        <i></i> {{ statusLabel }}
      </span>
    </div>

    <!-- BOOKING CODE -->
    <div class="booking-code-box">
      <div class="booking-code-info">
        <small>Kode Reservasi</small>
        <strong class="booking-code">{{ booking.bookingCode }}</strong>
      </div>
      <button type="button" class="copy-button" @click="copyBookingCode">
        {{ copied ? '✓ Tersalin' : 'Salin Kode' }}
      </button>
    </div>

    <!-- DETAILS -->
    <div class="booking-details">
      <div><span>Villa</span><strong>{{ booking.villaName }}</strong></div>
      <div><span>Jumlah Tamu</span><strong>{{ booking.guestCount }} orang</strong></div>
      <div><span>Check-in</span><strong>{{ formattedDate(booking.checkIn) }}</strong></div>
      <div><span>Check-out</span><strong>{{ formattedDate(booking.checkOut) }}</strong></div>
      <div><span>Lama Menginap</span><strong>{{ booking.nights }} malam</strong></div>
      <div><span>Telepon</span><strong>{{ booking.guestPhone }}</strong></div>
      <div v-if="booking.guestEmail"><span>Email</span><strong>{{ booking.guestEmail }}</strong></div>
      <div v-if="booking.specialRequest" class="full">
        <span>Permintaan Khusus</span><strong>{{ booking.specialRequest }}</strong>
      </div>
    </div>

    <!-- TOTAL -->
    <div class="confirmation-total">
      <span>Total Reservasi</span>
      <strong>{{ formattedPrice }}</strong>
    </div>

    <p class="confirmation-note">
      Simpan kode reservasi ini untuk keperluan komunikasi dengan pengelola villa.
    </p>

  </section>
</template>

<style scoped>
.booking-confirmation {
  padding: 40px 35px;
  background: white;
  border: 1px solid #d7e5d9;
  border-radius: 16px;
  box-shadow: 0 14px 40px rgba(24, 61, 50, 0.08);
  color: #26352c;
  animation: successIn 0.4s ease;
}

@keyframes successIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* HERO */
.confirmation-hero { text-align: center; margin-bottom: 28px; }

.confirmation-icon {
  width: 64px; height: 64px;
  margin: 0 auto 16px;
}
.confirmation-icon svg { width: 100%; height: 100%; }
.confirmation-icon circle {
  stroke-dasharray: 151; stroke-dashoffset: 151;
  animation: drawCircle 0.5s ease forwards;
}
.confirmation-icon path {
  stroke-dasharray: 36; stroke-dashoffset: 36;
  animation: drawCheck 0.4s ease 0.45s forwards;
}
@keyframes drawCircle { to { stroke-dashoffset: 0; } }
@keyframes drawCheck  { to { stroke-dashoffset: 0; } }

.confirmation-hero h2 {
  margin: 0 0 8px;
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 24px;
  font-weight: 500;
}

.confirmation-hero p {
  margin: 0 auto 14px;
  max-width: 420px;
  color: #556058;
  font-size: 14px;
  line-height: 1.7;
}
.confirmation-hero p strong { color: #183d32; }

/* STATUS BADGE */
.status-badge {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 6px 14px; border-radius: 999px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.3px;
}
.status-badge i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.status-badge.is-pending   { color: #9a6a1f; background: #fdf3e0; }
.status-badge.is-confirmed { color: #286c4a; background: #edf7ef; }
.status-badge.is-cancelled { color: #a52d2d; background: #fff0f0; }

/* BOOKING CODE */
.booking-code-box {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 18px 22px; margin-bottom: 26px;
  background: #f5f7f3; border: 1px dashed #cbd8cd; border-radius: 12px;
}
.booking-code-info small { display: block; color: #869087; font-size: 11px; margin-bottom: 4px; }
.booking-code {
  color: #183d32; font-family: 'Courier New', monospace;
  font-size: 18px; font-weight: 700; letter-spacing: 0.5px;
}
.copy-button {
  padding: 9px 16px; color: white; background: #183d32;
  border: none; border-radius: 8px; font-size: 12px; font-weight: 600;
  cursor: pointer; white-space: nowrap; transition: background 0.2s;
}
.copy-button:hover { background: #0f2820; }

/* DETAILS */
.booking-details {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 18px 24px; padding-bottom: 22px; border-bottom: 1px solid #e9eee9;
}
.booking-details > div { display: flex; flex-direction: column; gap: 5px; }
.booking-details .full { grid-column: 1 / -1; }
.booking-details span { color: #89918b; font-size: 11px; }
.booking-details strong { color: #26352c; font-size: 14px; overflow-wrap: anywhere; }

/* TOTAL */
.confirmation-total {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 12px; padding: 20px 0 6px;
}
.confirmation-total span { color: #556058; font-size: 14px; }
.confirmation-total strong { color: #183d32; font-family: Georgia, serif; font-size: 30px; }

.confirmation-note { margin: 12px 0 0; color: #869087; font-size: 12px; line-height: 1.6; }

@media (max-width: 600px) {
  .booking-confirmation { padding: 28px 20px; }
  .booking-code-box { flex-direction: column; align-items: stretch; }
  .copy-button { width: 100%; }
  .booking-details { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .booking-confirmation { animation: none; }
  .confirmation-icon circle,
  .confirmation-icon path { animation: none; stroke-dashoffset: 0; }
}
</style>