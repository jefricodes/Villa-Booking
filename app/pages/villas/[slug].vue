<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useHead, useFetch } from '#app'
// ✅ PERBAIKAN 1: Import formatRupiah yang sebelumnya hilang
import { formatRupiah } from '~/utils/formatRupiah'
import type { VillaDetailApiResponse } from '#shared/types/villa-api'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

// ✅ PERBAIKAN 2: Tambahkan 'key' eksplisit untuk caching yang lebih baik di Nuxt
const { data: villaResponse, pending, error } = await useFetch<VillaDetailApiResponse>(
  () => `/api/villas/by-slug/${encodeURIComponent(slug.value)}`,
  {
    key: `villa-detail-${slug.value}`,
    // lazy: false (default) memastikan data di-fetch sebelum render untuk SEO yang baik
  }
)

const villa = computed(() => villaResponse.value?.data)

// ======================================
// GALLERY LOGIC
// ======================================

const activeImage = ref('')

// ✅ PERBAIKAN 3: Optional chaining (?.) untuk mencegah error jika gallery undefined
const galleryImages = computed(() => {
  if (!villa.value) return []
  const gallery = villa.value.gallery
  return gallery && gallery.length > 0 ? gallery : [villa.value.imageUrl]
})

// Inisialisasi gambar aktif saat data gallery tersedia
watch(
  galleryImages,
  (images) => {
    if (images.length > 0 && !activeImage.value) {
      activeImage.value = images[0] ?? ''
    }
  },
  { immediate: true }
)

const selectImage = (image: string) => {
  activeImage.value = image
}

// ======================================
// SEO
// ======================================

// ✅ PERBAIKAN 4: Gunakan function return untuk reaktivitas useHead yang lebih bersih (Best Practice Nuxt 3)
useHead({
  title: () => (villa.value ? `${villa.value.name} | VillaStay` : 'Villa Detail | VillaStay'),
  meta: [
    {
      name: 'description',
      content: () => villa.value?.description ?? 'Informasi detail villa VillaStay.'
    }
  ]
})
</script>

<template>
  <!-- LOADING STATE -->
  <main v-if="pending" class="detail-state">
    <span class="loading-spinner"></span>
    <p>Sedang mengambil informasi villa...</p>
  </main>

  <!-- ERROR / NOT FOUND STATE -->
  <main v-else-if="error || !villa" class="detail-state" role="alert">
    <h2>Villa Tidak Ditemukan</h2>
    <p>
      Villa yang kamu cari mungkin tidak tersedia atau sudah dinonaktifkan.
    </p>
    <NuxtLink to="/" class="back-button">
      Kembali ke Beranda
    </NuxtLink>
  </main>

  <!-- DETAIL VILLA -->
  <main v-else class="detail-page">
    <div class="detail-container">
      
      <!-- BREADCRUMB -->
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <NuxtLink to="/">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink to="/#villas">Our Villas</NuxtLink>
        <span aria-hidden="true">/</span>
        <strong aria-current="page">{{ villa.name }}</strong>
      </nav>

      <!-- ✅ PERBAIKAN 5: Pindahkan heading ke atas agar struktur grid tidak rusak -->
      <div class="detail-heading">
        <div>
          <span class="eyebrow">VILLA COLLECTION</span>
          <h1>{{ villa.name }}</h1>
          <p>📍 {{ villa.location }}</p>
        </div>
        <div class="heading-price">
          <strong>{{ formatRupiah(villa.pricePerNight) }}</strong>
          <span>/ malam</span>
        </div>
      </div>

      <!-- IMAGE GALLERY -->
      <section class="gallery-section" aria-label="Galeri Foto">
        <div class="main-image">
          <img
            :src="activeImage"
            :alt="`Foto utama ${villa.name}`"
            loading="eager"
          />
          <span class="image-label">{{ villa.name }}</span>
        </div>

        <div class="thumbnail-list">
          <button
            v-for="(image, index) in galleryImages"
            :key="image"
            type="button"
            class="thumbnail-button"
            :class="{ 'is-active': activeImage === image }"
            :aria-label="`Lihat foto ${index + 1}`"
            :aria-pressed="activeImage === image"
            @click="selectImage(image)"
          >
            <img
              :src="image"
              :alt="`${villa.name} foto ${index + 1}`"
              loading="lazy"
            />
          </button>
        </div>
      </section>

      <!-- MAIN DETAILS (2 Kolom) -->
      <div class="detail-layout">
        
        <!-- LEFT CONTENT -->
        <section class="detail-content">
          <div class="content-section">
            <h2>About This Villa</h2>
            <p>{{ villa.description }}</p>
            <p>
              Nikmati pengalaman menginap yang nyaman dengan berbagai fasilitas yang tersedia.
              Villa ini dapat menjadi pilihan yang tepat untuk liburan bersama keluarga maupun pasangan.
            </p>
          </div>

          <div class="content-section">
            <h2>Villa Information</h2>
            <div class="specification-grid">
              <div class="specification-item">
                <span aria-hidden="true">👥</span>
                <div>
                  <strong>{{ villa.capacity }} Orang</strong>
                  <small>Kapasitas maksimum</small>
                </div>
              </div>
              <div class="specification-item">
                <span aria-hidden="true">🛏</span>
                <div>
                  <strong>{{ villa.bedrooms }} Kamar</strong>
                  <small>Kamar tidur</small>
                </div>
              </div>
              <div class="specification-item">
                <span aria-hidden="true">🚿</span>
                <div>
                  <strong>{{ villa.bathrooms }} Kamar</strong>
                  <small>Kamar mandi</small>
                </div>
              </div>
              <div class="specification-item">
                <span aria-hidden="true">🏡</span>
                <div>
                  <strong>Private Stay</strong>
                  <small>Area menginap privat</small>
                </div>
              </div>
            </div>
          </div>

          <div class="content-section">
            <h2>Villa Facilities</h2>
            <p class="facility-intro">Fasilitas yang tersedia di {{ villa.name }}.</p>
            <div class="amenities-grid">
              <div v-for="amenity in villa.amenities" :key="amenity" class="amenity-item">
                <span aria-hidden="true">✓</span>
                {{ amenity }}
              </div>
            </div>
          </div>
        </section>

        <!-- RIGHT BOOKING CARD (Sticky) -->
        <aside class="booking-card">
          <span class="booking-label">YOUR STAY</span>
          <h2>Reserve This Villa</h2>
          
          <div class="booking-price">
            <strong>{{ formatRupiah(villa.pricePerNight) }}</strong>
            <span>/ malam</span>
          </div>

          <div class="booking-info">
            <div>
              <span>Kapasitas</span>
              <strong>{{ villa.capacity }} orang</strong>
            </div>
            <div>
              <span>Kamar tidur</span>
              <strong>{{ villa.bedrooms }} kamar</strong>
            </div>
            <div>
              <span>Kamar mandi</span>
              <strong>{{ villa.bathrooms }} kamar</strong>
            </div>
          </div>

          <!-- ✅ PERBAIKAN 6: Pastikan path sesuai. Jika form booking ada di homepage, ubah path menjadi '/' -->
          <NuxtLink
            :to="{ path: '/booking', query: { villa: villa.id } }"
            class="booking-button"
          >
            Book This Villa →
          </NuxtLink>

          <p class="booking-note">
            Pilih tanggal menginap dan jumlah tamu pada halaman reservasi.
          </p>

          <NuxtLink to="/#villas" class="back-link">
            ← Lihat Villa Lainnya
          </NuxtLink>
        </aside>

      </div>
    </div>
  </main>
</template>

<style scoped>
/* =================================
   MAIN PAGE
================================= */
.detail-page {
  min-height: 100vh;
  padding: 35px 24px 90px;
  background: #fbfaf7;
}

.detail-container {
  max-width: 1200px;
  margin: auto;
}

/* =================================
   BREADCRUMB
================================= */
.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 12px;
  color: #89918b;
}

.breadcrumb a {
  color: #8b765b;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb a:hover {
  color: #183d32;
}

.breadcrumb strong {
  color: #183d32;
}

/* =================================
   HEADING
================================= */
.detail-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 25px;
  margin-bottom: 35px;
}

.eyebrow,
.booking-label {
  color: #a17d54;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 2px;
}

.detail-heading h1 {
  margin: 12px 0;
  color: #183d32;
  font-family: Georgia, serif;
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 500;
}

.detail-heading p {
  color: #556058; /* ✅ PERBAIKAN 7: Kontras ditingkatkan dari #778078 agar lebih mudah dibaca */
  font-size: 14px;
  font-weight: 500;
}

.heading-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: #556058;
  white-space: nowrap;
}

.heading-price strong {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 28px; /* ✅ Dipertebal sedikit untuk hierarki visual */
}

/* =================================
   IMAGE GALLERY
================================= */
.gallery-section {
  display: grid;
  grid-template-columns: 1fr 125px;
  gap: 15px;
  margin-bottom: 45px;
}

.main-image {
  position: relative;
  height: 460px;
  overflow: hidden;
  background: #e9eee9;
  border-radius: 12px;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.main-image:hover img {
  transform: scale(1.02); /* Efek zoom halus untuk kesan premium */
}

.image-label {
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding: 11px 17px;
  color: #183d32;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-radius: 6px;
  font-family: Georgia, serif;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.thumbnail-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.thumbnail-button {
  padding: 0;
  overflow: hidden;
  border: 3px solid transparent;
  background: #e9eee9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.thumbnail-button img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 100px;
  object-fit: cover;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.thumbnail-button:hover img {
  opacity: 1;
}

.thumbnail-button.is-active {
  border-color: #183d32;
}

.thumbnail-button.is-active img {
  opacity: 1;
}

/* =================================
   DETAIL LAYOUT
================================= */
.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 50px;
  align-items: start;
}

.detail-content {
  min-width: 0;
}

.content-section {
  padding-bottom: 35px;
  margin-bottom: 35px;
  border-bottom: 1px solid #e8ece6;
}

.content-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.content-section h2 {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 25px;
  font-weight: 500;
  margin-bottom: 16px;
}

.content-section > p {
  color: #556058; /* ✅ Kontras ditingkatkan */
  font-size: 15px; /* ✅ Ukuran font dinaikkan dari 14px untuk readability */
  line-height: 1.8;
}

/* =================================
   SPECIFICATIONS
================================= */
.specification-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
  margin-top: 25px;
}

.specification-item {
  display: flex;
  align-items: center;
  gap: 14px;
}

.specification-item > span {
  display: grid;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  place-items: center;
  background: #f0f4ef;
  border-radius: 8px;
  font-size: 19px;
}

.specification-item div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.specification-item strong {
  color: #183d32;
  font-size: 14px;
}

.specification-item small {
  color: #556058;
  font-size: 12px;
}

/* =================================
   AMENITIES
================================= */
.facility-intro {
  margin-bottom: 20px;
  color: #556058;
  font-size: 14px;
}

.amenities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #183d32; /* ✅ Kontras ditingkatkan dari #536157 */
  font-size: 14px;
  font-weight: 500;
}

.amenity-item span {
  display: grid;
  width: 23px;
  height: 23px;
  place-items: center;
  color: #ffffff;
  background: #183d32; /* ✅ Diubah menjadi warna primary agar lebih menonjol */
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
}

/* =================================
   BOOKING CARD
================================= */
.booking-card {
  position: sticky;
  top: 100px;
  padding: 28px;
  background: white;
  border: 1px solid #e9eee9;
  border-radius: 12px;
  box-shadow: 0 12px 35px rgba(24, 61, 50, 0.05);
}

.booking-card h2 {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 8px;
}

.booking-price {
  display: flex;
  align-items: baseline;
  gap: 7px;
  padding: 18px 0;
  border-bottom: 1px solid #e9eee9;
}

.booking-price strong {
  color: #183d32;
  font-size: 26px;
  font-family: Georgia, serif;
}

.booking-price span {
  color: #556058;
  font-size: 13px;
}

.booking-info {
  padding: 15px 0;
}

.booking-info div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  color: #556058;
  font-size: 13px;
  border-bottom: 1px dashed #e9eee9;
}

.booking-info div:last-child {
  border-bottom: none;
}

.booking-info strong {
  color: #183d32;
}

.booking-button {
  display: block;
  padding: 16px;
  margin-top: 10px;
  color: white;
  background: #183d32;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.booking-button:hover {
  background: #0f2820;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 61, 50, 0.2);
}

.booking-note {
  color: #556058;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
  margin-top: 16px;
}

.back-link {
  display: block;
  margin-top: 20px;
  color: #8b765b;
  text-align: center;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: color 0.2s;
}

.back-link:hover {
  color: #183d32;
}

/* =================================
   RESPONSIVE
================================= */
@media (max-width: 900px) {
  .detail-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .booking-card {
    position: static;
    max-width: 100%;
  }
}

@media (max-width: 600px) {
  .detail-page {
    padding: 25px 16px 60px;
  }

  .detail-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .gallery-section {
    grid-template-columns: 1fr;
  }

  .main-image {
    height: 300px;
  }

  .thumbnail-list {
    grid-template-columns: repeat(3, 1fr);
  }

  .thumbnail-button img {
    height: 85px;
    min-height: 85px;
  }

  .specification-grid,
  .amenities-grid {
    grid-template-columns: 1fr;
  }
}

/* =================================
   STATES
================================= */
.detail-state {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 30px;
  text-align: center;
}

.detail-state h2 {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 24px;
}

.detail-state p {
  max-width: 450px;
  color: #556058;
  font-size: 14px;
  line-height: 1.8;
}

.back-button {
  margin-top: 10px;
  padding: 12px 24px;
  color: white;
  background: #183d32;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
}

.back-button:hover {
  background: #0f2820;
}

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

@media (prefers-reduced-motion: reduce) {
  .loading-spinner,
  .main-image img,
  .booking-button,
  .back-button,
  .breadcrumb a,
  .back-link {
    animation: none;
    transition: none;
  }
}
</style>