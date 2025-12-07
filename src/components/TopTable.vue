<script setup lang="ts">
import type { SongStats } from '../types'

interface Props {
  title: string
  data: SongStats[]
  valueKey: keyof SongStats
}

const props = defineProps<Props>()

const formatValue = (item: SongStats, key: keyof SongStats): string => {
  const value = item[key]
  if (typeof value === 'number') {
    return value.toFixed(2)
  }
  return String(value)
}
</script>

<template>
  <div class="table-section">
    <h2>{{ title }}</h2>
    <table>
      <thead>
        <tr>
          <th>排名</th>
          <th>曲名</th>
          <th>{{ title.split(' ')[0] }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td>{{ index + 1 }}</td>
          <td>{{ item.title }}</td>
          <td>{{ formatValue(item, valueKey) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-section {
  margin-top: 30px;
}

h2 {
  color: #333;
  margin-bottom: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th, td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #e91e63;
  color: white;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
