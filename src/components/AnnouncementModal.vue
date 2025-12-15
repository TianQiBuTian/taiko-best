<script setup lang="ts">
import { announcements } from '@data/announcement';


defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update-version'): void
}>()



const handleClose = () => {
  emit('update-version')
  emit('close')
}

const handleOverlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}

const getIcon = (type?: string) => {
  switch (type) {
    case 'success': return 'fa-check'
    case 'warning': return 'fa-bolt'
    case 'info':
    default: return 'fa-bell'
  }
}

const getIconColor = (type?: string) => {
  switch (type) {
    case 'success': return 'text-emerald-400 bg-emerald-400/20'
    case 'warning': return 'text-amber-400 bg-amber-400/20'
    case 'info':
    default: return 'text-cyan-400 bg-cyan-400/20'
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="z-[2000] fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-md transition-all duration-300" @click="handleOverlayClick">
      <div class="relative bg-[#1a1b26]/90 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl border border-white/10 w-[90%] max-w-[500px] overflow-hidden transition-all duration-300 modal-content transform">
        
        <!-- Header with modern gradient -->
        <div class="relative bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 p-1">
          <div class="bg-[#1a1b26]/40 backdrop-blur-sm px-6 py-6">
            <div class="z-10 relative flex justify-between items-center">
              <div>
                <h3 class="bg-clip-text bg-gradient-to-r from-white to-white/80 m-0 font-black text-transparent text-3xl italic tracking-tight">ANNOUNCEMENTS</h3>
                <p class="opacity-80 m-0 mt-1 font-medium text-violet-200 text-xs uppercase tracking-widest">Latest Updates & News</p>
              </div>
              <button 
                class="group flex justify-center items-center bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-full w-10 h-10 text-white transition-all duration-300 cursor-pointer" 
                @click="handleClose"
              >
                <i class="group-hover:rotate-90 transition-transform duration-300 fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Content -->
        <div class="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div class="flex flex-col gap-4">
            <div 
              v-for="(item, index) in announcements" 
              :key="item.id"
              class="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300"
              :style="{ animationDelay: `${index * 100}ms` }"
              :class="'animate-slide-in'"
            >
              <!-- Glow effect on hover -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all -translate-x-full group-hover:translate-x-full duration-1000 transform"></div>
              
              <div class="relative flex gap-4 p-4">
                <!-- Icon Box -->
                <div 
                  class="flex flex-shrink-0 justify-center items-center shadow-lg rounded-xl w-12 h-12 text-lg"
                  :class="getIconColor(item.type)"
                >
                  <i class="fas" :class="getIcon(item.type)"></i>
                </div>
                
                <!-- Text Content -->
                <div class="flex-1 min-w-0">
                  <div class="text-gray-300 text-lg break-words leading-relaxed" v-html="item.text"></div>
                  <div class="flex items-center gap-2 mt-2">
                    <i class="text-gray-500 text-sm fas fa-clock"></i>
                    <span class="font-mono text-gray-500 text-sm uppercase tracking-wider">{{ item.date }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="bg-black/20 px-6 py-5 border-white/5 border-t text-center">
          <button 
            class="bg-white hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] px-10 py-3 border-none rounded-full font-bold text-gray-900 text-sm tracking-wide transition-all hover:-translate-y-1 active:translate-y-0 duration-200 cursor-pointer transform" 
            @click="handleClose"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.animate-slide-in {
  animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
