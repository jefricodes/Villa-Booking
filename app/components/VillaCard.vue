<script setup lang="ts">

import { computed } from 'vue'
import type { Villa } from '~/types/villa'
import { formatRupiah } from '~/utils/formatRupiah'

const props = defineProps<{
  villa: Villa
}>()


const displayedAmenities = computed(() => {
  return props.villa.amenities?.slice(0, 3) || []
})

const remainingAmenitiesCount = computed(() => {
  const total = props.villa.amenities?.length || 0
  return total > 3 ? total - 3 : 0
})
</script>

<template>
  <article class="villa-card">

    <!-- Villa Image -->
    <div class="villa-image">
      <img
        :src="props.villa.imageUrl"
        :alt="`Foto ${props.villa.name}`"
        loading="lazy"
      />

      <span class="villa-capacity">
        Up to {{ props.villa.capacity }} Guests
      </span>
    </div>

    <!-- Villa Information -->
    <div class="villa-content">

      <p class="villa-location">
        {{ props.villa.location }}
      </p>

      <h3>
        {{ props.villa.name }}
      </h3>

      <!-- PERUBAHAN 4: Tingkatkan kontras dan ukuran font untuk readability -->
      <p class="villa-description">
        {{ props.villa.description }}
      </p>

      <!-- Villa Details -->
      <div class="villa-details">
        <span>
          🛏 {{ props.villa.bedrooms }} Bedrooms
        </span>

        <span>
          🚿 {{ props.villa.bathrooms }} Bathrooms
        </span>
      </div>

      <!-- Amenities -->
      <div class="villa-amenities">
        <!-- PERUBAHAN 5: Gunakan computed property 'displayedAmenities', BUKAN props.villa.amenities.slice(0, 3) -->
        <span
          v-for="amenity in displayedAmenities"
          :key="amenity"
          class="amenity"
        >
          {{ amenity }}
        </span>
        
        <!-- PERUBAHAN 6: Tampilkan info jika ada amenities yang tersembunyi -->
        <span v-if="remainingAmenitiesCount > 0" class="amenity-more">
          + {{ remainingAmenitiesCount }} lainnya
        </span>
      </div>

      <!-- Price and Booking -->
      <div class="villa-bottom">

        <div class="villa-price">
          <strong>
            {{ formatRupiah(props.villa.pricePerNight) }}
          </strong>
          <!-- PERUBAHAN 7: Perbaiki kontras warna dan ukuran font -->
          <span>/ night</span>
        </div>

      <NuxtLink
        :to="`/villas/${props.villa.slug}`"
        class="villa-button"
      >
        View Details ↗
      </NuxtLink>

      </div>

    </div>
  </article>
</template>

<style scoped>
.villa-card {
  overflow: hidden;
  background: white;
  border: 1px solid #e9eee9;
  border-radius: 14px;
  transition: transform 0.25s, box-shadow 0.25s;
}

.villa-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 14px 35px rgba(24, 61, 50, 0.09);
}

.villa-image {
  position: relative;
  height: 230px;
  overflow: hidden;
  background: #e8eee9;
}

.villa-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s;
}

.villa-card:hover .villa-image img {
  transform: scale(1.05);
}

.villa-capacity {
  position: absolute;
  right: 14px;
  bottom: 14px;
  padding: 8px 12px;
  color: #183d32;
  background: white;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); /* PERUBAHAN: Tambah sedikit shadow agar lebih terbaca */
}

.villa-content {
  padding: 20px;
}

.villa-location {
  color: #967045; /* PERUBAHAN: Sedikit lebih gelap dari #a18360 agar kontras lebih baik */
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.villa-content h3 {
  margin: 8px 0;
  font-family: Georgia, serif;
  font-size: 25px;
  color: #183d32;
}

/* PERUBAHAN 9: Readability & Contrast */
.villa-description {
  min-height: 58px;
  color: #556058; /* Diubah dari #768078 (lebih gelap = kontras lebih baik di background putih) */
  font-size: 14px; /* Diubah dari 13px agar lebih mudah dibaca */
  line-height: 1.6;
}

.villa-details {
  display: flex;
  gap: 15px;
  padding: 15px 0;
  color: #4a5950; /* Diubah dari #56655c agar sedikit lebih tegas */
  font-size: 13px; /* Diubah dari 12px */
  font-weight: 500;
  border-bottom: 1px solid #edf0ec;
}

.villa-amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
}

.amenity {
  padding: 6px 10px;
  background: #f1f5f1;
  border-radius: 6px;
  font-size: 11px; /* Diubah dari 10px (10px terlalu kecil untuk standar readability modern) */
  color: #3a5245; /* Diubah dari #476253 agar lebih kontras */
  font-weight: 500;
}

/* PERUBAHAN 10: Style untuk teks "+ X lainnya" */
.amenity-more {
  padding: 6px 10px;
  background: #e8f0e9;
  border-radius: 6px;
  font-size: 11px;
  color: #183d32;
  font-weight: 600;
}

.villa-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 18px;
}

.villa-price strong {
  display: block;
  color: #183d32;
  font-size: 18px; /* Diubah dari 16px agar harga lebih menonjol (hierarchy) */
  font-weight: 700;
}

/* PERUBAHAN 11: Readability & Contrast */
.villa-price span {
  color: #6b7a70; /* Diubah dari #89918b (lebih gelap agar tidak terlalu pudar) */
  font-size: 12px; /* Diubah dari 11px */
}

.villa-button {
  padding: 12px 16px; /* Diperbesar sedikit area kliknya */
  background: #183d32;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 12px; /* Diubah dari 11px */
  font-weight: 600;
  transition: background 0.2s ease, transform 0.2s ease;
}

/* PERUBAHAN 12: Tambahkan hover state untuk feedback visual yang baik */
.villa-button:hover {
  background: #0f2820;
  transform: translateY(-1px);
}
</style>