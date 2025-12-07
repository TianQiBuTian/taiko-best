<script setup lang="ts">
import NavigationBar from './components/NavigationBar.vue'
</script>

<template>
  <div id="app">
    <NavigationBar />
    <router-view />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
