<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Announcement {
  id: number
  text: string
  type?: 'info' | 'warning' | 'success'
}

const navHeight = ref(73)

const announcements = ref<Announcement[]>([
  { id: 1, text: '建议使用新网址: <a href="https://rating.ourtaiko.org/" class="text-blue-400 hover:text-blue-300 underline" target="_blank">rating.ourtaiko.org</a>', type: 'info' },
  { id: 2, text: '域名 ourtaiko.org 免费提供, 有需要可以通过 GitHub 或者群聊联系我', type: 'success' },
  { id: 3, text: '广告位招租', type: 'info' }
])

const currentIndex = ref(0)
let intervalId: number | null = null

// 轮播间隔时间（毫秒）
const intervalTime = 5000

const startAutoPlay = () => {
  if (announcements.value.length <= 1) return
  
  intervalId = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % announcements.value.length
  }, intervalTime)
}

const stopAutoPlay = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

const prev = () => {
  stopAutoPlay()
  currentIndex.value = currentIndex.value === 0 
    ? announcements.value.length - 1 
    : currentIndex.value - 1
  startAutoPlay()
}

const next = () => {
  stopAutoPlay()
  currentIndex.value = (currentIndex.value + 1) % announcements.value.length
  startAutoPlay()
}

// 跳转到指定索引
const goToIndex = (index: number) => {
  stopAutoPlay()
  currentIndex.value = index
  startAutoPlay()
}

// 获取当前公告
const currentAnnouncement = () => {
  return announcements.value[currentIndex.value] || { id: 0, text: '', type: 'info' }
}

// 获取公告类型的样式
const getTypeClass = (type?: string) => {
  switch (type) {
    case 'warning':
      return 'bg-yellow-500/10 text-yellow-300'
    case 'success':
      return 'bg-green-500/10 text-green-300'
    case 'info':
    default:
      return 'bg-blue-500/10 text-blue-300'
  }
}

onMounted(() => {
  startAutoPlay()
  
  // 动态获取导航栏高度
  const updateNavHeight = () => {
    const nav = document.querySelector('nav')
    if (nav) {
      navHeight.value = nav.offsetHeight
    }
  }
  
  // 初始化高度
  updateNavHeight()
  
  // 监听窗口大小变化
  window.addEventListener('resize', updateNavHeight)
  
  // 使用 ResizeObserver 监听导航栏高度变化（更精确）
  const nav = document.querySelector('nav')
  let resizeObserver: ResizeObserver | null = null
  if (nav) {
    resizeObserver = new ResizeObserver(updateNavHeight)
    resizeObserver.observe(nav)
  }
  
  // 清理函数
  onUnmounted(() => {
    stopAutoPlay()
    window.removeEventListener('resize', updateNavHeight)
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  })
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <div :style="{ top: `${navHeight}px` }" class="right-0 left-0 z-[998] fixed bg-gradient-to-r from-[#1a2332] to-[#2c3e50] shadow-lg transition-all duration-300 ease-in-out">
    <div class="flex justify-center items-start gap-2 mx-auto px-4 py-3 max-w-[1200px] transition-all duration-300 ease-in-out">
      <!-- 左箭头 -->
      <button
        v-if="announcements.length > 1"
        @click="prev"
        class="flex flex-shrink-0 justify-center items-center self-center bg-white/10 hover:bg-white/20 rounded-full w-7 h-7 text-white/70 hover:text-white transition-all duration-200"
        aria-label="上一条公告"
      >
        <i class="fa-chevron-left text-xs fas"></i>
      </button>

      <!-- 公告内容区域 -->
      <div class="relative flex-1 mx-2 min-h-[28px] overflow-visible transition-all duration-300 ease-in-out">
        <Transition
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-300"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
          mode="out-in"
        >
          <div
            :key="currentAnnouncement().id"
            class="flex justify-center items-start py-1"
          >
            <div 
              :class="getTypeClass(currentAnnouncement().type)"
              class="inline-flex items-start gap-2 px-4 py-1.5 rounded-xl font-medium text-sm leading-relaxed"
            >
              <i class="flex-shrink-0 mt-1 text-xs fas fa-bullhorn"></i>
              <span v-html="currentAnnouncement().text" class="break-words"></span>
            </div>
          </div>
        </Transition>
      </div>

      <!-- 右箭头 -->
      <button
        v-if="announcements.length > 1"
        @click="next"
        class="flex flex-shrink-0 justify-center items-center self-center bg-white/10 hover:bg-white/20 rounded-full w-7 h-7 text-white/70 hover:text-white transition-all duration-200"
        aria-label="下一条公告"
      >
        <i class="fa-chevron-right text-xs fas"></i>
      </button>

      <!-- 指示器 -->
      <div v-if="announcements.length > 1" class="flex self-center gap-1.5">
        <button
          v-for="(_, index) in announcements"
          :key="index"
          @click="goToIndex(index)"
          :class="{
            'bg-white w-6': index === currentIndex,
            'bg-white/30 w-2': index !== currentIndex
          }"
          class="hover:bg-white/50 rounded-full h-2 transition-all duration-300 cursor-pointer"
          :aria-label="`切换到第 ${index + 1} 条公告`"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 可选：添加滚动文字效果（如果需要单行文字滚动） */
@keyframes scroll-text {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.scroll-text {
  animation: scroll-text 20s linear infinite;
}
</style>
