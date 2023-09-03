<template>
  <div>Custom Template</div>
  <BetterSelect v-model="value" :options="options">
    <template #custom="{ item }">
     <span> {{ item.label }}</span>   -<span>搞啥啊</span>
    </template>
  </BetterSelect>
</template>

<script lang="ts" setup>
import { useOptions } from '@/hooks'
import { ref } from 'vue'

const value = ref()
const options = useOptions()
</script>
