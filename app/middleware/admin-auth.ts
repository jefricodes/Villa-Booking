
export default defineNuxtRouteMiddleware(async (to) => {
  // Halaman login tidak memerlukan autentikasi.
  if (to.path === '/admin/login') return

  try {
    // Meminta backend memeriksa session admin.
    // useRequestFetch meneruskan request context dan cookie
    // ketika middleware dijalankan saat SSR.
    const requestFetch = useRequestFetch()

    await requestFetch('/api/admin/me')
  } catch {
    // Jika session tidak valid, arahkan ke halaman login.
    return navigateTo('/admin/login')
  }
})
