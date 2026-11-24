<script setup lang="ts">
// import { useVillas } from '~/composables/useVillas'

// const { villas: villas, pending, error } = useVillas()
import { villas } from '#shared/data/villas'

const facilities = [
  {
    icon: '🏊',
    title: 'Private Swimming Pool',
    description: 'Enjoy a private swimming pool in a cozy and relaxing atmosphere'
  },
  {
    icon: '📶',
    title: 'Free WiFi',
    description: 'Stay connected while enjoying your holiday.'
  },
  {
    icon: '❄️',
    title: 'Air Conditioning',
    description: 'Enjoy a cool and comfortable room atmosphere.'
  },
  {
    icon: '🍳',
    title: 'Private Kitchen',
    description: 'Kitchen facilities equipped for your cooking needs.'
  },
  {
    icon: '🚗',
    title: 'Private Parking',
    description: 'Dedicated parking area for guest vehicles.'
  },
  {
    icon: '🛏️',
    title: 'Comfortable Bedroom',
    description: 'A bedroom thoughtfully designed for quality rest.'
  }
]

useHead({
  title: 'VillaStay | Premium Villa Booking',
  meta: [
    {
      name: 'description',
      content: 'Find the best villas for a comfortable and memorable holiday experience.'
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
              Experience
              <span>Comfort</span>
              & Beautiful Living.
            </h1>
            <p>
              Discover a different kind of stay. Enjoy comfort, privacy, and an unforgettable holiday atmosphere with us.
            </p>

            <div class="hero-actions">

              <NuxtLink to="#booking" class="button button-primary">
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
            />
            <div class="image-label">
              <span>✦</span>
              A Place to Unwind
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

          
          <div
            v-if="villas.length === 0"
            class="empty-villas"
          >
            <h3>Belum Ada Villa</h3>

            <p>
              Saat ini belum ada unit villa yang dapat ditampilkan.
              Silakan kembali lagi nanti.
            </p>
          </div>

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
              <div class="facility-icon">{{ facility.icon }}</div>
              <h3>{{ facility.title }}</h3>
              <p>{{ facility.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section Booking -->

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
.empty-villas {
  padding: 45px 20px;
  background: white;
  border: 1px dashed #cbd8cd;
  border-radius: 12px;
  text-align: center;
}

.empty-villas h3 {
  color: #183d32;
  font-family: Georgia, serif;
}

.empty-villas p {
  color: #778078;
  font-size: 13px;
  line-height: 1.7;
}
/* HERO */
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

/* VILLA SECTION */
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

/* FACILITIES SECTION */
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
  transition: transform 0.2s ease;
}

.facility-card:hover {
  transform: translateY(-4px);
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

/* BOOKING SECTION */
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

/* RESPONSIVE */
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
</style>