<script setup lang="ts">
import type { VillasApiResponse } from '#shared/types/villa-api'
const {data: villasResponse} = await useFetch<VillasApiResponse>(
  '/api/villas', {key: 'public-villas'}
)
const villas = computed(() => villasResponse.value?.data ?? [])
useHead({
  title: 'Booking | VillaStay',
  meta: [
    {
      name: 'description',
      content: 'Book your villa stay now.'
    }
  ]
})
</script>

<template>
  <main>
    <BookingForm :villas="villas" />
  </main>
</template>