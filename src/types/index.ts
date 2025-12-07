export interface SongData {
  title: string
  constant: number
  totalNotes: number
  composite: number
  avgDensity: number
  instDensity: number
  separation: number
  bpmChange: number
  hsChange: number
  x: number
}

export interface UserScore {
  id: number
  level: number
  great: number
  good: number
  bad: number
  combo: number
  updatedAt: string
}

export interface SongStats {
  title: string
  rating: number
  daigouryoku: number
  stamina: number
  speed: number
  accuracy_power: number
  rhythm: number
  complex: number
}

export interface SongsDatabase {
  [key: string]: SongData
}
