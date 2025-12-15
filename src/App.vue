<script setup lang="ts">
import NavigationBar from './components/NavigationBar.vue'
import AnnouncementBar from './components/AnnouncementBar.vue'
import Modal from './components/Modal.vue'
import FloatingMenu from './components/FloatingMenu.vue'
import { useModal } from './composables/useModal'

const { modalState, hideModal } = useModal()
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen">
    <NavigationBar />
    <AnnouncementBar />
    <main class="flex-1 p-5 pt-[60px] max-md:pt-[50px]">
      <router-view />
    </main>
    <FloatingMenu />
    <Modal 
      :show="modalState.show" 
      :title="modalState.title" 
      :message="modalState.message"
      @close="hideModal"
    />
  </div>
</template>
