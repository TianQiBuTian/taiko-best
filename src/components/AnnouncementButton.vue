<script setup lang="ts">
import { eventBus } from '@utils/eventBus'

function openAnnouncement() {
  eventBus.emit('open-announcement')
}
</script>

<template>
  <button 
    class="right-[30px] bottom-[100px] z-[999] fixed flex justify-center items-center bg-white hover:bg-gray-50 shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-none rounded-full w-14 h-14 text-primary text-2xl hover:scale-110 transition-all duration-300 cursor-pointer" 
    @click="openAnnouncement"
    title="公告"
  >
    <i class="fas fa-bullhorn"></i>
  </button>
</template>
