<script setup lang="ts">
import BetterSelect from './better-select.vue'
import BasicUsage from "./docs/basic-usage.vue"
import BasicMultiple from './docs/basic-multiple.vue';
import CustomTemplate from './docs/custom-template.vue';
import Filterable from './docs/filterable.vue';
import RemoteSearch from './docs/remote-search.vue';
import RemoteLazySearch from './docs/remote+lazy-search.vue';

 

</script>

<template>
  <BasicUsage></BasicUsage>
  <hr>
  <BasicMultiple></BasicMultiple>
  <hr>
  <CustomTemplate></CustomTemplate>
  <hr>
  <Filterable></Filterable>
  <hr>
  <RemoteSearch></RemoteSearch>
  <hr>
  <RemoteLazySearch></RemoteLazySearch>
</template>

<style scoped lang="scss">
.box {
  width: 500px;
  height: 500px;
  border: 1px solid red;
  position: relative;
}
.input {
  position: absolute;
  left: 0;
  top: 0;
  outline: none;
  border: none;
}
</style>
