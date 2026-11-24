
<script setup lang="ts">

// Import data villa
import { villas } from '~/data/villas'

// Import tipe Villa
import type { Villa } from '~/types/villa'

// Import fungsi format Rupiah
import { formatRupiah } from '~/utils/formatRupiah'


// =====================================
// A. MENGAMBIL PARAMETER URL
// =====================================

const route = useRoute()

// Contoh:
// /villas/nusa
// route.params.slug = 'nusa'


// =====================================
// B. MENCARI DATA VILLA
// =====================================

const villa = computed<Villa>(() => {

  const slug = String(route.params.slug)

  const foundVilla = villas.find((item) => {
    return item.slug === slug
  })

  // Jika villa tidak ditemukan
  if (!foundVilla) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Villa Not Found',
      message: 'Villa yang kamu cari tidak ditemukan.'
    })
  }

  return foundVilla

})


// =====================================
// C. GALERI FOTO
// =====================================

// Foto yang sedang dipilih
const activeImage = ref(
  villa.value.gallery[0] || villa.value.imageUrl
)

// Daftar semua foto
const galleryImages = computed(() => {
  return villa.value.gallery.length > 0
    ? villa.value.gallery
    : [villa.value.imageUrl]
})


// Mengganti gambar utama ketika thumbnail diklik
function selectImage(image: string) {
  activeImage.value = image
}


// Jika route villa berubah, reset foto utama
watch(villa, (newVilla) => {
  activeImage.value =
    newVilla.gallery[0] || newVilla.imageUrl
})


// =====================================
// D. SEO HALAMAN
// =====================================

useHead({
  title: computed(() => {
    return `${villa.value.name} | VillaStay`
  }),

  meta: [
    {
      name: 'description',
      content: computed(() => {
        return villa.value.description
      })
    }
  ]
})

</script>


<template>

  <main class="detail-page">

    <div class="detail-container">

      <!-- BREADCRUMB -->
      <nav class="breadcrumb">

        <NuxtLink to="/">
          Home
        </NuxtLink>

        <span>/</span>

        <NuxtLink to="/#villas">
          Our Villas
        </NuxtLink>

        <span>/</span>

        <strong>
          {{ villa.name }}
        </strong>

      </nav>


      <!-- PAGE HEADING -->
      <div class="detail-heading">

        <div>
          <span class="eyebrow">
            VILLA COLLECTION
          </span>

          <h1>
            {{ villa.name }}
          </h1>

          <p>
            📍 {{ villa.location }}
          </p>
        </div>

        <div class="heading-price">

          <strong>
            {{ formatRupiah(villa.pricePerNight) }}
          </strong>

          <span>
            / malam
          </span>

        </div>

      </div>


      <!-- IMAGE GALLERY -->
      <section class="gallery-section">

        <!-- MAIN IMAGE -->
        <div class="main-image">

          <img
            :src="activeImage"
            :alt="`Foto ${villa.name}`"
          />

          <span class="image-label">
            {{ villa.name }}
          </span>

        </div>


        <!-- THUMBNAILS -->
        <div class="thumbnail-list">

          <button
            v-for="(image, index) in galleryImages"
            :key="image"
            type="button"
            class="thumbnail-button"
            :class="{
              'is-active': activeImage === image
            }"
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


      <!-- MAIN DETAILS -->
      <div class="detail-layout">


        <!-- LEFT CONTENT -->
        <section class="detail-content">

          <!-- DESCRIPTION -->
          <div class="content-section">

            <h2>
              About This Villa
            </h2>

            <p>
              {{ villa.description }}
            </p>

            <p>
              Nikmati pengalaman menginap yang nyaman
              dengan berbagai fasilitas yang tersedia.
              Villa ini dapat menjadi pilihan yang tepat
              untuk liburan bersama keluarga maupun pasangan.
            </p>

          </div>


          <!-- SPECIFICATIONS -->
          <div class="content-section">

            <h2>
              Villa Information
            </h2>

            <div class="specification-grid">

              <div class="specification-item">
                <span>👥</span>
                <div>
                  <strong>{{ villa.capacity }} Orang</strong>
                  <small>Kapasitas maksimum</small>
                </div>
              </div>

              <div class="specification-item">
                <span>🛏</span>
                <div>
                  <strong>{{ villa.bedrooms }} Kamar</strong>
                  <small>Kamar tidur</small>
                </div>
              </div>

              <div class="specification-item">
                <span>🚿</span>
                <div>
                  <strong>{{ villa.bathrooms }} Kamar</strong>
                  <small>Kamar mandi</small>
                </div>
              </div>

              <div class="specification-item">
                <span>🏡</span>
                <div>
                  <strong>Private Stay</strong>
                  <small>Area menginap privat</small>
                </div>
              </div>

            </div>

          </div>


          <!-- AMENITIES -->
          <div class="content-section">

            <h2>
              Villa Facilities
            </h2>

            <p class="facility-intro">
              Fasilitas yang tersedia di {{ villa.name }}.
            </p>

            <div class="amenities-grid">

              <div
                v-for="amenity in villa.amenities"
                :key="amenity"
                class="amenity-item"
              >
                <span>✓</span>

                {{ amenity }}

              </div>

            </div>

          </div>

        </section>


        <!-- RIGHT BOOKING CARD -->
        <aside class="booking-card">

          <span class="booking-label">
            YOUR STAY
          </span>

          <h2>
            Reserve This Villa
          </h2>

          <div class="booking-price">

            <strong>
              {{ formatRupiah(villa.pricePerNight) }}
            </strong>

            <span>
              / malam
            </span>

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


          <!-- BOOKING NAVIGATION -->
          <NuxtLink
            :to="{
              path: '/booking',
              query: { villa: villa.id },
              hash: '#booking'
            }"
            class="booking-button"
          >
            Book This Villa →
          </NuxtLink>


          <p class="booking-note">
            Pilih tanggal menginap dan jumlah tamu
            pada halaman reservasi.
          </p>


          <NuxtLink
            to="/#villas"
            class="back-link"
          >
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
  margin-bottom: 30px;
  font-size: 12px;
  color: #89918b;
}

.breadcrumb a {
  color: #8b765b;
  text-decoration: none;
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
  margin-bottom: 25px;
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
  color: #778078;
  font-size: 13px;
}

.heading-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: #778078;
  white-space: nowrap;
}

.heading-price strong {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 24px;
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
}

.image-label {
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding: 11px 17px;
  color: #183d32;
  background: white;
  border-radius: 6px;
  font-family: Georgia, serif;
  font-size: 14px;
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
}

.thumbnail-button img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 100px;
  object-fit: cover;
}

.thumbnail-button.is-active {
  border-color: #183d32;
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

.content-section h2 {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 25px;
  font-weight: 500;
}

.content-section > p {
  color: #778078;
  font-size: 14px;
  line-height: 1.9;
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
  font-size: 13px;
}

.specification-item small {
  color: #89918b;
  font-size: 11px;
}


/* =================================
   AMENITIES
================================= */

.facility-intro {
  margin-bottom: 20px;
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
  color: #536157;
  font-size: 13px;
}

.amenity-item span {
  display: grid;
  width: 23px;
  height: 23px;
  place-items: center;
  color: #286c4a;
  background: #eaf2e9;
  border-radius: 50%;
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
  font-size: 23px;
}

.booking-price span {
  color: #89918b;
  font-size: 12px;
}

.booking-info {
  padding: 15px 0;
}

.booking-info div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  color: #778078;
  font-size: 12px;
}

.booking-info strong {
  color: #26352c;
}

.booking-button {
  display: block;
  padding: 16px;
  margin-top: 10px;
  color: white;
  background: #183d32;
  border-radius: 7px;
  text-align: center;
  text-decoration: none;
  font-size: 13px;
  font-weight: bold;
  transition: background 0.2s;
}

.booking-button:hover {
  background: #285849;
}

.booking-note {
  color: #89918b;
  font-size: 11px;
  line-height: 1.7;
  text-align: center;
}

.back-link {
  display: block;
  margin-top: 20px;
  color: #8b765b;
  text-align: center;
  text-decoration: none;
  font-size: 12px;
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
    max-width: 500px;
  }

}

@media (max-width: 600px) {

  .detail-page {
    padding: 25px 16px 60px;
  }

  .detail-heading {
    flex-direction: column;
    align-items: flex-start;
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

  .specification-grid {
    grid-template-columns: 1fr;
  }

  .amenities-grid {
    grid-template-columns: 1fr;
  }

}

</style>
