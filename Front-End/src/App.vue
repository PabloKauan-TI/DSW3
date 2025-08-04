<script setup>
import { RouterView } from 'vue-router'
import MenuBar from '@/components/MenuBar.vue'
</script>

<template>
  <div id="app">
    <MenuBar class="menu" />
    <RouterView class="centro" />
  </div>
</template>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.menu {
  width: 100%;
  margin: 0;
  padding: auto;
}

.centro {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  width: 100%;
  max-width: 1200px;
  margin: 20px auto 0;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
