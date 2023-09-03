<template>
  <div>Basic Multiple</div>
  <BetterSelect multiple v-model="value" :options="options"> </BetterSelect>
</template>

<script lang="ts" setup>
import { useOptions } from '@/hooks'
import { ref } from 'vue'

const value = ref([])
const options = useOptions()
</script>
