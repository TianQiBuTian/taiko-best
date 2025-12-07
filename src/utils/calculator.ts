import type { UserScore, SongData, SongStats } from '../types'

const CONSTANTS = { P1: 66, AH1: 3 }
const POWER = Math.pow
const SQRT = Math.sqrt
const MAX = Math.max

export function calcY(accuracy: number): number {
  const g = accuracy
  if (g <= 0.5) return 0
  if (g <= 0.6832) {
    return 4425 * POWER(g - 0.5, 4.876)
  } else if (g <= 0.9625) {
    return 30.748 * g - 19.88
  } else {
    return 0.228 * POWER(2.718, 3.386 * POWER(g, 24.658)) + 8.862
  }
}

export function calcP(x: number, y: number): number {
  const term = POWER(CONSTANTS.P1, 2) - POWER(x - y, 2) / 2
  if (term < 0) return CONSTANTS.P1
  return CONSTANTS.P1 - SQRT(term)
}

export function calcW(x: number, y: number): number {
  const term = 25 - POWER(x - 15.5, 2) / 25 - POWER(y - 23, 2) / 69
  if (term < 0) return 0.5
  return MAX(SQRT(term) - 4, 0.5)
}

export function calcSingleRating(x: number, y: number): number {
  const p = calcP(x, y)
  const w = calcW(x, y)
  return POWER(w * POWER(x, p) + (1 - w) * POWER(y, p), 1 / p)
}

export function calcBoundaries(x: number, y: number) {
  const y_max_val = 0.228 * POWER(2.718, 3.386 * POWER(1, 24.658)) + 8.862
  const r_xmin = calcSingleRating(0.05, y)
  const r_xmax = calcSingleRating(15.5, y)
  const r_ymin = calcSingleRating(x, 0)
  const r_ymax = calcSingleRating(x, y_max_val)
  return { r_xmin, r_xmax, r_ymin, r_ymax }
}

export function calcStamina(avgDensity: number, instDensity: number): number {
  if (avgDensity > instDensity) {
    return avgDensity + (avgDensity / 100) * (1 - instDensity / avgDensity) * (100 - avgDensity)
  } else {
    return avgDensity - (1 - avgDensity / instDensity) * avgDensity
  }
}

export function calcSpeed(instDensity: number, avgDensity: number): number {
  if (instDensity > avgDensity) {
    return instDensity - (1 - avgDensity / instDensity) * (instDensity - avgDensity)
  } else {
    return instDensity + (1 - instDensity / avgDensity) * (avgDensity - instDensity)
  }
}

export function calculateSongStats(songData: SongData, userScore: UserScore): SongStats | null {
  const total = songData.totalNotes
  const accuracy = userScore.great / total
  if (accuracy < 0.5) return null
  
  const x = songData.x
  const y = calcY(accuracy)
  const rating = calcSingleRating(x, y)
  
  const raw_complex = songData.composite
  const raw_stamina = calcStamina(songData.avgDensity, songData.instDensity)
  const raw_speed = calcSpeed(songData.instDensity, songData.avgDensity)
  const raw_rhythm = songData.separation + (songData.separation / 100) * (songData.bpmChange / 100) * (100 - songData.separation)
  
  const daigouryoku = SQRT(rating * x)
  const stamina = SQRT(rating * raw_stamina * 15.5 / 100)
  const speed = SQRT(rating * raw_speed * 15.5 / 100)
  const accuracy_power = SQRT(rating * y)
  const rhythm = SQRT(rating * raw_rhythm * 15.5 / 100)
  const complex = SQRT(rating * raw_complex * 15.5 / 100)
  
  return {
    title: songData.title,
    rating,
    daigouryoku,
    stamina,
    speed,
    accuracy_power,
    rhythm,
    complex
  }
}

export function parsePastedScores(raw: string | any[]): UserScore[] {
  const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (!Array.isArray(arr)) return []
  
  return arr.map(r => ({
    id: Number(r[0]),
    level: Number(r[1]),
    great: Number(r[4]) || 0,
    good: Number(r[5]) || 0,
    bad: Number(r[6]) || 0,
    combo: Number(r[8]) || 0,
    updatedAt: r[13]
  }))
}

export function getTop20Average(data: SongStats[], key: keyof SongStats): number {
  const sorted = data.map(d => d[key] as number).sort((a, b) => b - a)
  const top20 = sorted.slice(0, 20)
  if (top20.length === 0) return 0
  const sum = top20.reduce((a, b) => a + b, 0)
  return parseFloat((sum / top20.length).toFixed(2))
}

export function getTop20WeightedAverage(data: SongStats[], key: keyof SongStats): number {
  const sorted = data.map(d => d[key] as number).sort((a, b) => b - a)
  const top20 = sorted.slice(0, 20)
  
  if (top20.length === 0) return 0
  
  const weights = [0.4/5, 0.4/5, 0.4/5, 0.4/5, 0.4/5, 
                   0.3/5, 0.3/5, 0.3/5, 0.3/5, 0.3/5,
                   0.2/6, 0.2/6, 0.2/6, 0.2/6, 0.2/6, 0.2/6,
                   0.1/4, 0.1/4, 0.1/4, 0.1/4]
  
  let weightedSum = 0
  let weightSum = 0
  
  for (let i = 0; i < top20.length; i++) {
    const weight = weights[i]
    weightedSum += top20[i] * weight
    weightSum += weight
  }
  
  if (weightSum === 0) return 0
  
  const weightedAverage = weightedSum / weightSum
  return parseFloat(weightedAverage.toFixed(2))
}

export function getTop20Median(data: SongStats[], key: keyof SongStats): number {
  const sorted = data.map(d => d[key] as number).sort((a, b) => b - a)
  const top20 = sorted.slice(0, 20)
  
  if (top20.length === 0) return 0
  
  const mid = Math.floor(top20.length / 2)
  let median: number
  
  if (top20.length % 2 === 0) {
    median = (top20[mid - 1] + top20[mid]) / 2
  } else {
    median = top20[mid]
  }
  
  return parseFloat(median.toFixed(2))
}

export function topValueCompensate(
  ratingMid: number,
  fullMid: number,
  ratingAve: number,
  fullAve: number,
  threshold: number
): number {
  if (ratingAve < threshold) return ratingMid
  const per = (ratingAve - threshold) / (fullAve - threshold)
  return ratingMid + per * (15.5 - fullMid)
}
