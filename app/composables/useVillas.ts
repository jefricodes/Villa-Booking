
import type { Villa } from '~/types/villa'

export const useVillas = () => {
  const { data, pending, error, refresh } = useFetch<Villa[]>('/api/villas', {
    key: 'villas-list',
  })
  return {
    villas: computed(() => data.value ?? []),
    pending,
    error,
    refresh,
  }
}