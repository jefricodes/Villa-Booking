<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, navigateTo } from '#app'

const isMenuOpen = ref(false)
const route = useRoute()

function closeMenu() {
  isMenuOpen.value = false
}

// PERUBAHAN: Logika navigasi cerdas yang diperbarui
function handleNavigation(targetId: string) {
  closeMenu()

  if (route.path === '/') {
    // --- JIKA SEDANG DI HOMEPAGE ---
    if (targetId === 'home') {
      // Scroll ke paling atas halaman dengan mulus
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Scroll ke section tertentu
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  } else {
    // --- JIKA SEDANG DI HALAMAN LAIN (MISAL: /booking) ---
    if (targetId === 'home') {
      // PERUBAHAN UTAMA: Jika tujuannya 'home', cukup arahkan ke '/' tanpa hash (#)
      navigateTo('/') 
    } else {
      // Jika tujuannya section lain (villas, facilities, booking), tambahkan hash
      navigateTo(`/#${targetId}`)
    }
  }
}
</script>

<template>
  <header class="header">
    <div class="header-container">

      <!-- Logo: Klik logo akan selalu kembali ke Home (atas) -->
      <a href="#home" class="brand" @click.prevent="handleNavigation('home')">
        <span class="brand-icon">V</span>
        <span class="brand-name">
          VILLA<span>STAY</span>
        </span>
      </a>

      <!-- Navigation -->
      <nav
        id="main-navigation"
        class="navigation"
        :class="{ 'is-open': isMenuOpen }"
      >
        <!-- PERUBAHAN: Semua link menggunakan fungsi handleNavigation yang sama -->
        <a href="#home" @click.prevent="handleNavigation('home')">
          Home
        </a>

        <a href="#villas" @click.prevent="handleNavigation('villas')">
          Our Villas
        </a>

        <a href="#facilities" @click.prevent="handleNavigation('facilities')">
          Facilities
        </a>

        <NuxtLink to="booking" @click.prevent="handleNavigation('booking')">
          Book Now
        </NuxtLink>
      </nav>

      <!-- Tombol CTA di Header -->
      <a href="#booking" class="header-booking" @click.prevent="handleNavigation('booking')">
        Book Your Stay
      </a>

      <!-- Mobile Menu Button -->
      <button
        class="menu-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-controls="main-navigation"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        {{ isMenuOpen ? '✕' : '☰' }}
      </button>

    </div>
  </header>
</template>

<style scoped>
/* Style tetap sama seperti sebelumnya, tidak ada perubahan di sini */
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