<template>
    <div>Basic Usage</div>
  <BetterSelect v-model="value"  :options="options" :filterable="false"> </BetterSelect>
</template>

<script lang="ts" setup>
import { useOptions } from '@/hooks';
import { ref } from 'vue'

const value=ref()
const options= useOptions()
</script>
