<template>
  <div>Remote+Lzay Search</div>
  <BetterSelect
    v-model="value"
    lazy
    remote
    :options="options"
    :loading="loading"
    :lazyLoading="lazyLoading"
    :finished="finished"
    @search="onSearch"
    @scroll="onScroll"
  >
  </BetterSelect>
</template>
<!-- 
     remote  + loading + onSearch  
     lazy +lazyLoading  +onScroll 
    -->
<script lang="ts" setup>
import { useOptions } from '@/hooks'
import { ref } from 'vue'
const loading = ref(false)
const lazyLoading = ref(false)
const finished = ref(false)
const value = ref()
const options = useOptions(0, 10)
const onSearch = (val) => {
  console.log('搜索关键字', val)
  loading.value = true
  setTimeout(() => {
    loading.value = false
    options.value = [{ label: '你好', value: 'qwer' }]
  }, 2000)
}
const pagination = {
  page: 1,
  size: 10,
  total: 40
}
const onScroll = () => {
  console.log('到底')
  lazyLoading.value = true
  setTimeout(() => {
    const pageStart = pagination.page * 10
    pagination.page++
    options.value = [...options.value, ...useOptions(pageStart, pageStart + 10).value]

    lazyLoading.value = false
    finished.value = pagination.page >= 4
  }, 2000)
}
</script>
