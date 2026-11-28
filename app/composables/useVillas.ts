import type { VillasApiResponse } from '#shared/types/villa-api'

export function useVillas() {
  const {
    data: villaResponse,
    pending: villasPending,
    error: villasError,
    refresh: refreshVillas
  } = useFetch<VillasApiResponse>('/api/villas', {
    key: 'public-villas',
    default: () => ({ success: true, count: 0, data: [] })
  })

  const villas = computed(() => villaResponse.value?.data ?? [])

  return {
    villas,
    villasPending,
    villasError,
    refreshVillas
  }
}