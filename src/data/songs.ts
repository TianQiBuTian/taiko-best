import type { SongsDatabase } from '../types'

// Songs数据太大,将从原index.html中动态读取
// 或者在构建时提取到单独的JSON文件
export const songsData: SongsDatabase = {}

// 临时解决方案:动态从旧index.html加载
export async function loadSongsData(): Promise<SongsDatabase> {
  // 这里可以通过fetch从外部文件加载
  // 或者在构建时通过脚本提取
  try {
    const response = await fetch('/songs.json')
    return await response.json()
  } catch {
    console.error('无法加载songs.json')
    return {}
  }
}
