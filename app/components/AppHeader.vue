
<script setup lang="ts">
const isMenuOpen = ref(false)

function closeMenu() {
  isMenuOpen.value = false
}
</script>

<template>
  <header class="header">
    <div class="header-container">

      <!-- Logo -->
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
        <a href="#home" @click="closeMenu">
          Home
        </a>

        <a href="#villas" @click="closeMenu">
          Our Villas
        </a>

        <a href="#facilities" @click="closeMenu">
          Facilities
        </a>

        <a href="#booking" @click="closeMenu">
          Contact
        </a>
      </nav>

      <!-- Booking Button -->
      <a href="#villas" class="header-booking">
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
  transition: color 0.2s;
}

.navigation a:hover {
  color: #b18a5a;
}

.header-booking {
  padding: 13px 20px;
  background: #183d32;
  color: white;
  border-radius: 7px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
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

  .header-booking {
    display: none;
  }

  .menu-toggle {
    display: block;
  }
}
</style>
