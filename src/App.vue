<script setup lang="ts">
import { ref } from 'vue'
import GuideView from './components/GuideView.vue'
import ReportView from './components/ReportView.vue'
import type { UserScore, SongStats } from './types'

const showGuide = ref(true)
const scoreInput = ref('')
const results = ref<SongStats[]>([])
const isLoading = ref(false)

const handleAnalyze = (input: string) => {
  scoreInput.value = input
  showGuide.value = false
}

const handleResults = (data: SongStats[]) => {
  results.value = data
  isLoading.value = false
}

const handleBack = () => {
  showGuide.value = true
  results.value = []
}
</script>

<template>
  <div id="app">
    <GuideView 
      v-if="showGuide" 
      @analyze="handleAnalyze"
    />
    <ReportView 
      v-else 
      :score-input="scoreInput"
      @back="handleBack"
    />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
