<template>
  <div class="container">
    <div class="card">
      <MyDataView />
    </div>
  </div>
</template>

<script setup>
import MyDataView from '@/components/MyDataView.vue'
</script>

<style lang="css" scoped>
.card {
  max-width: 1200px;
  margin: 20px 20px;
  align-items: center;
  align-content: center;
}
</style>
