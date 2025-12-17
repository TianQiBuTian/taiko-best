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
    case 'success': return 'text-[#34C759] bg-[#34C759]/15'
    case 'warning': return 'text-[#FF9500] bg-[#FF9500]/15'
    case 'info':
    default: return 'text-[#007AFF] bg-[#007AFF]/15'
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="z-[2000] fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm transition-all duration-500" @click="handleOverlayClick">
      <div class="relative bg-[#1c1c1e]/80 shadow-[0_20px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl border border-white/10 rounded-[32px] w-[90%] max-w-[440px] overflow-hidden transition-all duration-500 modal-content transform">
        
        <!-- Header -->
        <div class="px-8 pt-8 pb-4">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="m-0 font-bold text-white text-2xl tracking-tight">公告</h3>
              <p class="opacity-50 m-0 mt-0.5 font-medium text-white text-xs uppercase tracking-wider">最新动态与更新</p>
            </div>
            <button 
              class="flex justify-center items-center bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 text-white/70 transition-all duration-200 cursor-pointer" 
              @click="handleClose"
            >
              <i class="text-sm fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <!-- Content -->
        <div class="px-6 py-2 max-h-[55vh] overflow-y-auto custom-scrollbar">
          <div class="flex flex-col gap-3">
            <div 
              v-for="(item, index) in announcements" 
              :key="item.id"
              class="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-[22px] overflow-hidden transition-all duration-300"
              :style="{ animationDelay: `${index * 80}ms` }"
              :class="'animate-slide-in'"
            >
              <div class="relative flex gap-4 p-4">
                <!-- Icon Box -->
                <div 
                  class="flex flex-shrink-0 justify-center items-center rounded-2xl w-11 h-11 text-lg"
                  :class="getIconColor(item.type)"
                >
                  <i class="fas" :class="getIcon(item.type)"></i>
                </div>
                
                <!-- Text Content -->
                <div class="flex-1 min-w-0">
                  <div class="text-[15px] text-white/90 break-words leading-snug" v-html="item.text"></div>
                  <div class="flex items-center gap-1.5 opacity-40 mt-2">
                    <i class="text-[10px] text-white/90 fas fa-clock"></i>
                    <span class="font-medium text-[11px] text-white/90 uppercase tracking-wide">{{ item.date }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="px-8 pt-4 pb-8 text-center">
          <button 
            class="bg-[#007AFF] hover:bg-[#0071e3] shadow-lg py-3.5 border-none rounded-2xl w-full font-semibold text-[15px] text-white active:scale-[0.98] transition-all duration-200 cursor-pointer transform" 
            @click="handleClose"
          >
            我知道了
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
