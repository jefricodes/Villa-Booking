<script setup lang="ts">
import {ref, computed, watch, onMounted} from 'vue'
import { villas } from '~/data/villas'
import type { Villa } from '~/types/villa'

const today = ref ('')

const selectVillaId = ref <number> (villas[0]?.id ?? 0)

const checkIn = ref ('')

const checkOut = ref ('')

const guestCount = ref(1)

const guestName = ref ('')

const guestPhone = ref ('')

const guestEmail = ref ('')

const specialRequest = ref ('')

const isPreviewVisible = ref (false)

const errorMessage = ref ('')

// MENGAMBIL VILLA YANG DIPILIH (DATA VILLA)
const selectVilla = computed ((): Villa | undefined => {
    return villas.find((villa) => villa.id === selectVillaId.value)
})

// JUMLAH TAMU (MAX GUEST)
const maxGuests = computed(() => {
    return selectVilla.value?.capacity ?? 1
})

// FORMAT TANGGAL (FORMAT DATE)
function getLocalDateValue (date: Date): string {
    const year = date.getFullYear()

    const month = String (date.getMonth() + 1).padStart (2, '0')

    const day = String (date.getDate()).padStart (2, '0')

    return `${year}-${month}-${day}`
} 


function addOneDay (dateValue: string): string {
    const [year=0, month=1, day] = dateValue.split('-').map(Number)

    const date = new Date(Date.UTC(year, month - 1, day))

    date.setUTCDate(date.getUTCDate() + 1)

    const newYear = date.getUTCFullYear()

    const newMonth = String (date.getUTCMonth() + 1).padStart (2, '0')

    const newDay = String (date.getUTCDate()).padStart(2,'0')

    return `${newYear}-${newMonth}-${newDay}`
}

// Ubah tanggal jadi Timestamp (Change date to Timestamp)
function getTimeDatestamp(dateValue:string): number {
    const [year=0, month=1, day] = dateValue.split('-').map(Number)

    return Date.UTC (year, month - 1, day)
}

function formatBookingDate (dateValue: string): string {
    if (!dateValue) {
        return '-'
    }
    const [year=0, month=1, day] = dateValue.split('-').map(Number)

    const date = new Date (Date.UTC(year, month - 1, day))

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date)
}

// MENENTUKAN BATAS CHECKOUT (RULES CHECKOUT)
const minCheckOut = computed (() => {
    if (!checkIn.value) {
        return today.value
    }
    return addOneDay(checkIn.value)
})

// MENGHITUNG JUMLAH MALAM (COUNT NIGHT)
const numberOfNight = computed (() => {
    if (!checkIn.value || !checkOut.value) {
        return 0
    }

    const startDate = getTimeDatestamp(checkIn.value)

    const endDate = getTimeDatestamp(checkOut.value)

    const difference = endDate - startDate

    if (difference <= 0) {
        return 0
    }

    return difference / 86400000
})

// MENGHITUNG TOTAL HARGA (TOTAL PRICE)
const totalPrice = computed (() => {
    const pricePerNight = selectVilla.value?.pricePerNight ?? 0

    return numberOfNight.value * pricePerNight
})

// MEMANTAU PERUBAHAN CHECK-IN CHECK OUT (Watch changes)
watch (checkIn, (newCheckIn) => {
    if (newCheckIn && checkOut.value && checkOut.value <= checkIn.value) {
        checkOut.value = ''
    }
})
// jika villa berubah, sesuaikan jumlah tamu
watch (selectVillaId, () => {
    if (guestCount.value > maxGuests.value) {
        guestCount.value = maxGuests.value
    }
})

watch (
    [
        selectVillaId,
        checkIn,
        checkOut,
        guestCount,
        guestName,
        guestPhone,
        guestEmail,
        specialRequest
    ], () => {
        isPreviewVisible.value = false
        errorMessage.value = ''
    }
)

// SETUP DATE LOCAL BROWSER
onMounted (() => {
    today.value = getLocalDateValue(new Date())
})

// PROCESS FORM
function handleSubmit () {
    errorMessage.value = ''
    if (!selectVilla.value) {
        errorMessage.value = 'Silahkan pilih villa'
        return
    }
    if (!checkIn.value || !checkOut.value) {
        errorMessage.value = 'Silahkan pilih tanggal menginap.'
        return
    }
    // check-in harus mulai hari ini atau setelahnya
    if (today.value && checkIn.value < today.value) {
        errorMessage.value = 'tanggal check-in tidak valid'
        return
    }
    // check-out harus setelah check-in
    if (numberOfNight.value < 1) {
        errorMessage.value = 'Tanggal check-out minimal satu hari setelah check-in'
        return
    }
    // Periksa jumlah tamu (check total guest)
    if (guestCount.value < 1 || guestCount.value > maxGuests.value ) {
        errorMessage.value = `jumlah tamu harus antara 1 sampai ${maxGuests.value} orang.`
        return
    }
      // Periksa informasi pelanggan
    if (!guestName.value.trim()) {
        errorMessage.value = 'Nama pelanggan wajib diisi.'
        return
    }

    if (!guestPhone.value.trim()) {
        errorMessage.value = 'Nomor telepon wajib diisi.'
        return
    }

    // Tampilkan ringkasan reservasi
    isPreviewVisible.value = true

}
</script>

