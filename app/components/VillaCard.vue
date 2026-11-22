
<script setup lang="ts">
import type { Villa } from '~/types/villa'
import { formatRupiah } from '~/utils/formatRupiah'

// Menerima data villa dari parent component
const props = defineProps<{
  villa: Villa
}>()
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
        <span
          v-for="amenity in props.villa.amenities.slice(0, 3)"
          :key="amenity"
          class="amenity"
        >
          {{ amenity }}
        </span>
      </div>

      <!-- Price and Booking -->
      <div class="villa-bottom">

        <div class="villa-price">
          <strong>
            {{ formatRupiah(props.villa.pricePerNight) }}
          </strong>

          <span>/ night</span>
        </div>

        <a href="#booking" class="villa-button">
          Book Now ↗
        </a>

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
}

.villa-content {
  padding: 20px;
}

.villa-location {
  color: #a18360;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.villa-content h3 {
  margin: 8px 0;
  font-family: Georgia, serif;
  font-size: 25px;
  color: #183d32;
}

.villa-description {
  min-height: 58px;
  color: #768078;
  font-size: 13px;
  line-height: 1.6;
}

.villa-details {
  display: flex;
  gap: 15px;
  padding: 15px 0;
  color: #56655c;
  font-size: 12px;
  border-bottom: 1px solid #edf0ec;
}

.villa-amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 15px 0;
}

.amenity {
  padding: 6px 9px;
  background: #f1f5f1;
  border-radius: 5px;
  font-size: 10px;
  color: #476253;
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
  font-size: 16px;
}

.villa-price span {
  color: #89918b;
  font-size: 11px;
}

.villa-button {
  padding: 11px 14px;
  background: #183d32;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
}
</style>
