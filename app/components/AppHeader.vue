<script setup lang="ts">
import { ref } from 'vue'
import Booking from '~/pages/booking.vue';

const isMenuOpen = ref(false)

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <header class="header">
    <div class="header-container">

      <NuxtLink to="/" class="brand" @click="closeMenu">
        <span class="brand-icon">V</span>
        <span class="brand-name">
          VILLA<span>STAY</span>
        </span>
      </NuxtLink>

      <!-- Navigation -->
      
      <nav
        id="main-navigation"
        class="navigation"
        :class="{ 'is-open': isMenuOpen }"
      >

        <NuxtLink
          :to="{ path: '/', hash: '#home' }"
          @click="closeMenu"
        >
          Home
        </NuxtLink>

        <NuxtLink
          :to="{ path: '/', hash: '#villas' }"
          @click="closeMenu"
        >
          Our Villas
        </NuxtLink>

        <NuxtLink
          :to="{ path: '/', hash: '#facilities' }"
          @click="closeMenu"
        >
          Facilities
        </NuxtLink>

        <NuxtLink
          :to="{ path: '/', hash:'#booking'}"
          @click="closeMenu"
        >
          Contact
        </NuxtLink>

      </nav>

      <NuxtLink
        :to="{ path: '/booking' }"
        class="header-booking"
        @click="closeMenu"
      >
        Book Your Stay
      </NuxtLink>


      <!-- Mobile Menu Button -->
      <button
        class="menu-toggle"
        type="button"
        aria-label="Toggle navigation"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        {{ isMenuOpen ? '✕' : '☰' }}
      </button>

    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid #e9eee9;
  backdrop-filter: blur(12px);
}

.header-container {
  max-width: 1200px;
  min-height: 78px;
  margin: auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #183d32;
}

.brand-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  background: #183d32;
  color: white;
  border-radius: 10px;
  font-family: Georgia, serif;
  font-size: 23px;
}

.brand-name {
  font-weight: 800;
  letter-spacing: 1px;
  font-size: 17px;
}

.brand-name span {
  font-weight: 400;
  color: #9a7955;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 32px;
}

.navigation a {
  color: #59665e;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
}

.navigation a:hover {
  color: #967045;
}

.navigation a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: #967045;
  transition: width 0.2s ease;
}

.navigation a:hover::after {
  width: 100%;
}

.header-booking {
  padding: 13px 20px;
  background: #183d32;
  color: white;
  border-radius: 7px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.header-booking:hover {
  background: #0f2820;
  transform: translateY(-1px);
}

.menu-toggle {
  display: none;
  border: 0;
  background: none;
  color: #183d32;
  font-size: 25px;
  cursor: pointer;
}

@media (max-width: 760px) {
  .header-container {
    min-height: 68px;
  }

  .navigation {
    display: none;
    position: absolute;
    top: 68px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 12px 24px;
    background: white;
    border-bottom: 1px solid #e9eee9;
  }

  .navigation.is-open {
    display: flex;
  }

  .navigation a {
    padding: 14px 0;
  }

  .navigation a::after {
    display: none;
  }

  .header-booking {
    display: none;
  }

  .menu-toggle {
    display: block;
  }
}
</style>