<template>
  <div>Remote Search</div>
  <BetterSelect :loading="loading" remote @search="onSearch" v-model="value" :options="options">
  </BetterSelect>
</template>
<!-- 
    remote  + loading +onSearch 

   -->
<script lang="ts" setup>
import { useOptions } from '@/hooks'
import { ref } from 'vue'
const loading = ref(false)
const value = ref()
const options = useOptions(0,3)
const onSearch = (val) => {
  console.log('搜索关键字', val)
  loading.value = true
  setTimeout(() => {
    loading.value = false
    options.value = [{ label: '你好', value: 'qwer' }]
  }, 2000)
}
</script>
