<script setup lang="ts">
import type { VillasApiResponse } from '#shared/types/villa-api'

// ======================================
// 1. DATA FETCHING (Nuxt 3 Best Practice)
// ======================================
const {
  data: villaResponse,
  pending: villasPending,
  error: villasError,
  refresh: refreshVillas
} = await useFetch<VillasApiResponse>('/api/villas', {
  key: 'public-villas',
  default: () => ({ success: true, count: 0, data: [] })
})

// Computed property untuk mengambil array villa dengan aman
const villas = computed(() => villaResponse.value?.data ?? [])

// ======================================
// 2. DATA FASILITAS (Dengan Typing yang Jelas)
// ======================================
interface Facility {
  icon: string
  title: string
  description: string
}

const facilities: Facility[] = [
  {
    icon: '🏊',
    title: 'Private Swimming Pool',
    description: 'Nikmati kolam renang pribadi dengan suasana yang nyaman.'
  },
  {
    icon: '📶',
    title: 'Free WiFi',
    description: 'Tetap terhubung selama menikmati waktu liburan.'
  },
  {
    icon: '❄️',
    title: 'Air Conditioning',
    description: 'Nikmati suasana kamar yang sejuk dan nyaman.'
  },
  {
    icon: '🍳',
    title: 'Private Kitchen',
    description: 'Fasilitas dapur untuk kebutuhan memasak.'
  },
  {
    icon: '🚗',
    title: 'Private Parking',
    description: 'Area parkir untuk kendaraan tamu.'
  },
  {
    icon: '🛏️',
    title: 'Comfortable Bedroom',
    description: 'Kamar yang dirancang untuk waktu istirahat berkualitas.'
  }
]

// ======================================
// 3. SEO
// ======================================
useHead({
  title: 'VillaStay | Premium Villa Booking',
  meta: [
    {
      name: 'description',
      content: 'Temukan villa terbaik untuk pengalaman liburan yang nyaman dan tak terlupakan.'
    }
  ]
})
</script>

<template>
  <main>
    <!-- HERO SECTION -->
    <section id="home" class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <span class="eyebrow">✦ YOUR PRIVATE ESCAPE</span>
          <h1>
            Experience <span>Comfort</span> & Beautiful Living.
          </h1>
          <p>
            Discover a different kind of stay. Enjoy comfort, privacy, and an unforgettable holiday atmosphere with us.
          </p>

          <div class="hero-actions">
            <NuxtLink to="booking" class="button button-primary">
              Book Now →
            </NuxtLink>
            <NuxtLink to="#villas" class="button button-outline">
              Explore Our Villas
            </NuxtLink>
          </div>

          <div class="hero-statistics">
            <div>
              <strong>05</strong>
              <span>Villa Units</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Private Stay</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Guest Support</span>
            </div>
          </div>
        </div>

        <div class="hero-image">
          <img
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400"
            alt="Villa tropis dengan kolam renang"
            loading="eager"
          />
          <div class="image-label">
            <span>✦</span> A Place to Unwind
          </div>
        </div>
      </div>
    </section>

    <!-- VILLA SECTION -->
    <section id="villas" class="villa-section">
      <div class="section-container">
        <div class="section-heading">
          <div>
            <span class="eyebrow">OUR COLLECTION</span>
            <h2>Find Your Perfect <span>Villa.</span></h2>
          </div>
          <p>
            Choose a villa that fits the holiday needs of you and your loved ones.
          </p>
        </div>

        <!-- ✅ PERBAIKAN 1: Urutan kondisional yang benar (Loading -> Error -> Empty -> Data) -->
        
        <!-- 1. Loading State -->
        <div v-if="villasPending" class="villa-state">
          <span class="loading-spinner"></span>
          <p>Sedang mengambil data villa...</p>
        </div>

        <!-- 2. Error State -->
        <div v-else-if="villasError" class="villa-state villa-error" role="alert">
          <h3>Gagal Memuat Villa</h3>
          <p>Terjadi kesalahan saat mengambil data dari server.</p>
          <button type="button" class="retry-button" @click="refreshVillas()">
            Coba Lagi
          </button>
        </div>

        <!-- 3. Empty State -->
        <div v-else-if="villas.length === 0" class="empty-villas">
          <h3>Belum Ada Villa Tersedia</h3>
          <p>
            Saat ini belum ada unit villa yang dapat ditampilkan. 
            Silakan kembali lagi nanti.
          </p>
        </div>

        <!-- 4. Data State -->
        <div v-else class="villa-grid">
          <VillaCard
            v-for="villa in villas"
            :key="villa.id"
            :villa="villa"
          />
        </div>

      </div>
    </section>

    <!-- FACILITIES SECTION -->
    <section id="facilities" class="facilities-section">
      <div class="section-container">
        <div class="facilities-heading">
          <span class="eyebrow">OUR FACILITIES</span>
          <h2>Everything You Need <span>To Relax.</span></h2>
          <p>Various facilities designed for your comfort during your stay.</p>
        </div>

        <div class="facilities-grid">
          <div
            v-for="facility in facilities"
            :key="facility.title"
            class="facility-card"
          >
            <div class="facility-icon" aria-hidden="true">{{ facility.icon }}</div>
            <h3>{{ facility.title }}</h3>
            <p>{{ facility.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- BOOKING SECTION -->
    <section id="booking" class="booking-section">
      <div class="booking-content">
        <span class="eyebrow" style="color: #d4e0d9;">READY TO STAY?</span>
        <h2>Book Your Dream Villa Today.</h2>
        <p>
          Limited availability for the upcoming holiday season. 
          Secure your private escape now and get the best rate guaranteed.
        </p>
        <NuxtLink to="#villas" class="button-light">
          Choose Your Villa →
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style>
html {
  scroll-behavior: smooth;
}
</style>

<style scoped>
/* =================================
   STATES (Loading, Error, Empty)
================================= */
.villa-state {
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
  background: white;
  border: 1px solid #e9eee9;
  border-radius: 12px;
  text-align: center;
}

.villa-state p {
  color: #556058; /* ✅ PERBAIKAN 2: Kontras ditingkatkan */
  font-size: 14px;
  line-height: 1.7;
}

.villa-error h3 {
  color: #a52d2d;
  font-family: Georgia, serif;
}

.retry-button {
  padding: 12px 24px;
  color: white;
  background: #183d32;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #0f2820;
}

.empty-villas {
  padding: 60px 20px;
  background: white;
  border: 1px dashed #cbd8cd;
  border-radius: 12px;
  text-align: center;
}

.empty-villas h3 {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 20px;
  margin-bottom: 8px;
}

.empty-villas p {
  color: #556058; /* ✅ PERBAIKAN 2: Kontras ditingkatkan */
  font-size: 14px;
  line-height: 1.7;
}

/* =================================
   HERO SECTION
================================= */
.hero {
  padding: 75px 24px 90px;
  background: #f5f6f0;
}

.hero-container {
  max-width: 1200px;
  margin: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 65px;
}

.eyebrow {
  color: #967045; 
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
}

.hero-content h1 {
  margin: 25px 0;
  color: #183d32;
  font-family: Georgia, serif;
  font-size: clamp(42px, 5vw, 67px);
  line-height: 1.12;
  font-weight: 500;
}

.hero-content h1 span,
.section-heading h2 span,
.facilities-heading h2 span {
  color: #967045; 
  font-style: italic;
}

.hero-content > p {
  max-width: 480px;
  color: #556058; 
  font-size: 16px; 
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px; 
  margin-top: 30px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 15px;
}

.button-primary {
  background: #183d32;
  color: white;
}

.button-primary:hover {
  background: #0f2820;
}

.button-outline {
  background: transparent;
  color: #183d32;
  border: 2px solid #183d32;
}

.button-outline:hover {
  background: #183d32;
  color: white;
}

.hero-statistics {
  display: flex;
  gap: 40px;
  margin-top: 55px;
}

.hero-statistics div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hero-statistics strong {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 25px;
}

.hero-statistics span {
  color: #556058;
  font-size: 12px;
  font-weight: 500;
}

.hero-image {
  position: relative;
  height: 510px;
  border-radius: 150px 12px 12px 12px;
  overflow: hidden;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-label {
  position: absolute;
  bottom: 25px;
  left: 25px;
  padding: 15px 20px;
  background: white;
  border-radius: 8px;
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.image-label span {
  color: #967045;
}

/* =================================
   VILLA SECTION
================================= */
.villa-section {
  padding: 100px 24px;
  background: #fbfaf7;
}

.section-container {
  max-width: 1200px;
  margin: auto;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  margin-bottom: 40px;
}

.section-heading h2,
.facilities-heading h2 {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: clamp(32px, 4vw, 46px);
  font-weight: 500;
  line-height: 1.2;
}

.section-heading > p {
  max-width: 350px;
  color: #556058; 
  font-size: 15px; 
  line-height: 1.8;
}

.villa-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 30px; 
}

/* =================================
   FACILITIES SECTION
================================= */
.facilities-section {
  padding: 95px 24px;
  background: #f2f5f0;
}

.facilities-heading {
  max-width: 600px;
  margin: 0 auto 50px;
  text-align: center;
}

.facilities-heading p {
  color: #556058; 
  line-height: 1.8;
  font-size: 15px; 
}

.facilities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px; 
}

.facility-card {
  padding: 32px; 
  background: white;
  border: 1px solid #e0e8e0; 
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.facility-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(24, 61, 50, 0.06);
}

.facility-icon {
  font-size: 32px; 
  margin-bottom: 16px;
}

.facility-card h3 {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 20px; 
  margin-bottom: 12px;
}

.facility-card p {
  color: #556058; 
  font-size: 14px; 
  line-height: 1.7;
}

/* =================================
   BOOKING SECTION
================================= */
.booking-section {
  margin: 80px 24px;
  padding: 80px 25px; 
  background: #183d32;
  border-radius: 16px; 
  text-align: center;
}

.booking-content {
  max-width: 650px;
  margin: auto;
}

.booking-content h2 {
  color: white;
  font-family: Georgia, serif;
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 500;
  margin-bottom: 16px;
}

.booking-content > p {
  color: #d4e0d9; 
  font-size: 16px; 
  line-height: 1.8;
  margin-bottom: 30px;
}

.button-light {
  display: inline-block;
  padding: 16px 32px;
  color: #183d32;
  background: white;
  border-radius: 8px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.button-light:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

/* =================================
   RESPONSIVE
================================= */
@media (max-width: 950px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 35px;
  }
  .hero-image {
    height: 400px;
  }
  .villa-grid, .facilities-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .hero {
    padding-top: 50px;
  }
  .hero-image {
    height: 300px;
    border-radius: 80px 10px 10px 10px;
  }
  .hero-statistics {
    gap: 20px;
  }
  .hero-statistics strong {
    font-size: 21px;
  }
  .section-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .villa-grid, .facilities-grid {
    grid-template-columns: 1fr;
  }
  .booking-section {
    margin: 45px 16px;
    padding: 50px 20px;
  }
}

/* Loading Spinner (jika belum ada di global CSS) */
.loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(24, 61, 50, 0.2);
  border-top-color: #183d32;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>