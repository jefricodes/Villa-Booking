
<script setup lang="ts">
import { villas } from '~/data/villas'

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
    description: 'Kitchen facilities equipped for you cooking needs.'
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

          <span class="eyebrow">
            ✦ YOUR PRIVATE ESCAPE
          </span>

          <h1>
            Experience
            <span>Comfort</span>
            & Beautiful Living.
          </h1>

          <p>
            Discover a different kind of stay. Enjoy comfort, privacy, and an unforgettable holiday atmosphere with us.
          </p>

          <div class="hero-actions">
            <a href="#villas" class="button button-primary">
              Explore Our Villas →
            </a>

            <a href="#facilities" class="button button-outline">
              Discover More
            </a>
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
              <span>Guest Support*</span>
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

            <h2>
              Find Your Perfect
              <span>Villa.</span>
            </h2>
          </div>
          <p>
            Choose a villa that fits the holiday needs of you and your loved ones.
          </p>

        </div>


        <!-- VILLA CARD LIST -->
        <div class="villa-grid">

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

          <h2>
            Everything You Need
            <span>To Relax.</span>
          </h2>

          <p>
            Various facilities designed for your comfort during your stay.
          </p>
        </div>


        <div class="facilities-grid">

          <div
            v-for="facility in facilities"
            :key="facility.title"
            class="facility-card"
          >

            <div class="facility-icon">
              {{ facility.icon }}
            </div>

            <h3>
              {{ facility.title }}
            </h3>

            <p>
              {{ facility.description }}
            </p>

          </div>

        </div>

      </div>

    </section>


    <!-- BOOKING CALL TO ACTION -->
    <section id="booking" class="booking-section">

      <div class="booking-content">

        <span class="eyebrow">
          YOUR NEXT HOLIDAY
        </span>

        <h2>
          Ready for Your
          Next Escape?
        </h2>

        <p>
          Find your favorite villa and plan your next holiday experience.
        </p>

        <a href="#villas" class="button button-light">
          Choose Your Villa →
        </a>

      </div>

    </section>

  </main>
</template>

<style scoped>
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
  color: #a17d54;
  font-size: 11px;
  font-weight: bold;
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
  color: #b18a5a;
  font-style: italic;
}

.hero-content > p {
  max-width: 480px;
  color: #778078;
  font-size: 15px;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
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
  color: #849087;
  font-size: 11px;
}

.small-note {
  margin-top: 12px;
  font-size: 10px !important;
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
}

.image-label span {
  color: #b18a5a;
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
  color: #78837a;
  font-size: 14px;
  line-height: 1.8;
}

.villa-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 25px;
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
  color: #778078;
  line-height: 1.8;
  font-size: 14px;
}

.facilities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.facility-card {
  padding: 30px;
  background: white;
  border: 1px solid #e9eee9;
  border-radius: 12px;
}

.facility-icon {
  font-size: 30px;
}

.facility-card h3 {
  color: #183d32;
  font-family: Georgia, serif;
  font-size: 19px;
}

.facility-card p {
  color: #778078;
  font-size: 13px;
  line-height: 1.7;
}


/* BOOKING SECTION */

.booking-section {
  margin: 80px 24px;
  padding: 75px 25px;
  background: #183d32;
  border-radius: 15px;
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
}

.booking-content > p {
  color: #c4d2c9;
  font-size: 14px;
  line-height: 1.8;
}

.button-light {
  margin-top: 20px;
  color: #183d32;
  background: white;
}

.booking-content .booking-note {
  margin-top: 25px;
  font-size: 11px;
  color: #b7c7bc;
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

  .villa-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .facilities-grid {
    grid-template-columns: repeat(2, 1fr);
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
    gap: 5px;
  }

  .villa-grid {
    grid-template-columns: 1fr;
  }

  .facilities-grid {
    grid-template-columns: 1fr;
  }

  .booking-section {
    margin: 45px 16px;
    padding: 50px 20px;
  }
}
</style>
