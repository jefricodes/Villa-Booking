
<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: false,
})

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Email dan password wajib diisi.'
    return
  }

  loading.value = true

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
    })

    await navigateTo('/admin')
  } catch (error: unknown) {
    const fetchError = error as {
      data?: {
        statusMessage?: string
        message?: string
      }
    }

    errorMessage.value =
      fetchError.data?.statusMessage ||
      fetchError.data?.message ||
      'Login gagal. Silakan coba kembali.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-card">
      <div class="login-heading">
        <h1>Admin Login</h1>
        <p>Silakan masuk untuk mengelola Villa Booking.</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            autocomplete="username"
            required
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>

          <div class="password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan password"
              autocomplete="current-password"
              required
            >

            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Sembunyikan' : 'Tampilkan' }}
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="error-message" role="alert">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="login-button"
          :disabled="loading"
        >
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f3f4f6;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 36px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 35px rgb(0 0 0 / 8%);
}

.login-heading {
  margin-bottom: 28px;
  text-align: center;
}

.login-heading h1 {
  margin-bottom: 8px;
  color: #111827;
  font-size: 26px;
}

.login-heading p {
  color: #6b7280;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.password-wrapper {
  display: flex;
  gap: 8px;
}

.password-wrapper input {
  min-width: 0;
  flex: 1;
}

.toggle-password {
  padding: 8px;
  border: 0;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
}

.login-button {
  width: 100%;
  padding: 13px;
  border: 0;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-bottom: 16px;
  color: #dc2626;
  font-size: 14px;
}
</style>
