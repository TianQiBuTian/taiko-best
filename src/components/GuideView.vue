<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from '../composables/useModal'

const router = useRouter()
const scoreInput = ref('')
const { showModal } = useModal()

// 控制向导和使用指南的显示
const showWizard = ref(true)
const showGuideContent = ref(false)

// 向导相关状态
const donderId = ref('')
const inputDonderId = ref('')
const wizardStep = ref(1)
const isLoading = ref(false)

// 折叠旧指南
const showOldGuide = ref(false)
const toggleOldGuide = () => {
  showOldGuide.value = !showOldGuide.value
}

// 初始化：检查是否已绑定广场ID
const initDonderId = () => {
  const savedId = localStorage.getItem('donderId')
  if (savedId) {
    donderId.value = savedId
    wizardStep.value = 2
  }
}

// 绑定广场ID
const bindDonderId = () => {
  const id = inputDonderId.value.trim()
  if (!id) {
    showModal('请输入广场 ID', '错误')
    return
  }
  if (!/^\d+$/.test(id)) {
    showModal('广场 ID 必须是数字', '错误')
    return
  }
  localStorage.setItem('donderId', id)
  donderId.value = id
  wizardStep.value = 2
}

// 重新绑定
const rebindDonderId = () => {
  donderId.value = ''
  inputDonderId.value = ''
  wizardStep.value = 1
}

// 从Donder查分器获取数据并分析
const fetchAndAnalyze = async () => {
  if (!donderId.value) {
    showModal('广场 ID 不存在', '错误')
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await fetch(`https://hasura.llx.life/api/rest/donder/get-score?id=${donderId.value}`)
    
    if (!response.ok) {
      throw new Error('同步数据失败')
    }
    
    const data = await response.json()
    const scoreData = data?.score?.data
    
    if (!scoreData || scoreData.length === 0) {
      showModal(`未找到数据，请确认：
1.您绑定的广场 ID 是否正确？
2.查分器分数是否已经同步到最新？
3.是否有魔王难度的分数记录？`, '分析失败')
      isLoading.value = false
      return
    }
    
    const output = tryParseDonderTool(scoreData)
    
    if (!output) {
      showModal('数据格式不正确', '分析失败')
      isLoading.value = false
      return
    }
    
    anyalyze(output)
  } catch (error: any) {
    showModal(error.message || '同步数据失败', '分析失败')
    isLoading.value = false
  }
}

// 点击手动导入成绩按钮
const handleManualImport = () => {
  showWizard.value = false
  showGuideContent.value = true
}

// 组件挂载时初始化
initDonderId()

const copyPowerShellCode = () => {
  const text = `$content = (iwr "https://www.baidu.com/api/ahfsdafbaqwerhue").Content; $content | Set-Clipboard; Write-Host "内容已复制到剪贴板！长度为: $($content.Length)" -ForegroundColor Green`
  navigator.clipboard.writeText(text).then(() => {
    showModal('PowerShell 代码已复制到剪贴板！')
  }).catch(err => {
    console.error('复制失败:', err)
  })
}

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    scoreInput.value = text
    showModal('粘贴成功！')
  } catch (err) {
    console.error('粘贴失败:', err)
    showModal('粘贴失败，请确保已授予剪贴板访问权限', '错误')
  }
}

const handleUpload = () => {
  // 使用现代浏览器 API showOpenFilePicker
  if ('showOpenFilePicker' in window) {
    (async () => {
      try {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: '文本或数据文件',
              accept: {
                'text/plain': ['.json']
              }
            }
          ],
          multiple: false
        })
        if (!fileHandle) return
        const file = await fileHandle.getFile()
        const text = await file.text()
        scoreInput.value = text
        showModal('文件内容已粘贴到文本框！')
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          showModal('读取文件失败', '错误')
        }
      }
    })()
  } else {
    showModal('当前浏览器不支持文件选择 API，请使用新版 Chrome/Edge/Firefox', '错误')
  }
}

/* 尝试解析旧版传分器格式
  schema: [
    [song_no, level, high_score, best_score_rank, good_cnt, ok_cnt, ng_cnt, pound_cnt, combo_cnt, stage_cnt, clear_cnt, full_combo_cnt, dondaful_combo_cnt, update_datetime],
    ...
  ]
*/
function tryParseTaikoScoreGetter(input: string): string | null {
  try {
    const arr = JSON.parse(input);
    if (Array.isArray(arr) && (Array.isArray(arr[0]) || arr.length === 0)) {
      return JSON.stringify(arr);
    }
  } catch (e) {}
  return null;
}

/* 尝试解析新版 LLX Donder Tool 传分器格式
  schema: [
    {
      song_no: string,
      level: string,
      high_score: number,
      best_score_rank: string,
      good_cnt: number,
      ok_cnt: number,
      ng_cnt: number,
      pound_cnt: number,
      combo_cnt: number,
      stage_cnt: number,
      clear_cnt: string,
      full_combo_cnt: boolean,
      dondaful_combo_cnt: boolean,
      update_datetime?: string
    },
    ...
  ]
*/
function tryParseDonderTool(input: string): string | null {
  let parsed: any;
  try {
    parsed = JSON.parse(input);
  } catch (e) {
    return null;
  }
  const isNewFormat = (obj: any) => {
    return obj && typeof obj === 'object' && (
      (Array.isArray(obj) && obj.length > 0 && obj[0] && typeof obj[0] === 'object' && 'song_no' in obj[0]) ||
      (!Array.isArray(obj) && 'song_no' in obj)
    );
  };
  if (!isNewFormat(parsed)) return null;
  let arr = Array.isArray(parsed) ? parsed : [parsed];
  return JSON.stringify(arr.map((item: any) => [
    item.song_no,
    item.level,
    item.high_score,
    item.best_score_rank,
    item.good_cnt,
    item.ok_cnt,
    item.ng_cnt,
    item.pound_cnt,
    item.combo_cnt,
    item.stage_cnt,
    item.clear_cnt,
    item.full_combo_cnt,
    item.dondaful_combo_cnt,
    item.update_datetime || item.highscore_datetime || ''
  ]));
}

const handleAnalyze = () => {
  if (!scoreInput.value.trim()) {
    showModal('请输入数据', '提示')
    return
  }

  const input = scoreInput.value.trim();
  let output = tryParseTaikoScoreGetter(input);
  if (!output) {
    output = tryParseDonderTool(input);
  }
  if (!output) {
    // 既不是旧格式也不是新格式，忽略解析
    showModal('数据格式不正确', '错误')
    return
  }

  anyalyze(output)
}

const anyalyze = (input: string) => {
  // 将数据存储到 localStorage
  localStorage.setItem('taikoScoreData', input)
  // 触发自定义事件以通知其他组件
  window.dispatchEvent(new Event('localStorageUpdate'))
  // 导航到报告页面
  router.push('/report')
}
</script>

<template>
  <div class="bg-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] mx-auto p-[30px] rounded-[10px] max-w-[800px]">
    <section class="announcement">
      <!-- <div class="announcement-title">📢 网站公告</div> -->
      <p class="my-1">算法更新时间: 2025/12/11 &nbsp;&nbsp;&nbsp;&nbsp; 网页更新时间: 2025/12/13</p>
      <p class="my-1">曲目列表页面点击歌曲可以修改成绩，右下角菜单按钮可以加入我们的QQ群</p>
      <p class="my-1">本 Rating 系统旨在分析自身弱点并针对练习, 请勿用于攀比</p>
    </section>
    <section>
      <!-- 新的向导 -->
      <transition name="fade">
        <div v-show="showWizard" class="wizard-container">
          <div class="wizard-content">
            <!-- 步骤1：绑定广场ID -->
            <div v-if="wizardStep === 1" class="wizard-step">
              <p class="wizard-text">欢迎使用太鼓达人 Rating 分析系统！</p>
              <p class="wizard-subtitle">请先绑定您的鼓众广场 ID</p>
              <div class="wizard-input-group">
                <input 
                  v-model="inputDonderId" 
                  type="text" 
                  placeholder="请输入广场 ID"
                  class="wizard-input"
                  @keyup.enter="bindDonderId"
                />
                <button @click="bindDonderId" class="wizard-btn-primary">绑定广场 ID →</button>
              </div>
            </div>

            <!-- 步骤2：同步并分析数据 -->
            <div v-else-if="wizardStep === 2" class="wizard-step">
              <div class="donder-id-display">
                <span class="donder-id-label">您的广场 ID：</span>
                <span class="donder-id-value">{{ donderId }}</span>
                <button @click="rebindDonderId" class="wizard-btn-secondary">重新绑定</button>
              </div>
              <p class="wizard-guide">
                请先前往 <a href="https://donder-tool.llx.life/score" class="wizard-link" target="_blank">Donder 查分器</a>，绑定自己的鼓众广场 ID，并同步你的成绩。
                <br />
                请确保你在查分器中的成绩数据是最新的，否则分析结果可能不准确。
                <br />完成上述操作后，请点击下方 “分析数据” 按钮自动同步分析数据。
              </p>
              <div>
              &nbsp;&nbsp;
              <button 
                @click="fetchAndAnalyze" 
                :disabled="isLoading"
                class="wizard-btn"
              >
                {{ isLoading ? '正在分析...' : '分析数据' }}
              </button>
              </div>
              <p class="wizard-guide">如果自动同步分析数据遇到问题，您可以尝试<button @click="handleManualImport" class="wizard-btn-text">可以手动导入成绩</button></p>
            </div>

            <!-- 步骤3：手动导入 -->
            <!-- <div v-else-if="wizardStep === 3" class="wizard-step">
              <p class="wizard-text">手动导入成绩</p>
              <p class="wizard-subtitle">如果自动同步分析数据遇到问题，您可以手动导入成绩数据</p>
              <button @click="handleManualImport" class="wizard-btn">开始手动导入</button>
              <button @click="wizardStep = 2" class="wizard-btn-text">返回上一步</button>
            </div> -->
          </div>
        </div>
      </transition>
      
      <!-- 原有的使用指南内容 -->
      <transition name="fade">
        <div v-show="showGuideContent">
          <h2 class="text-[#333] text-center font-bold">使用指南</h2>
          <p class="my-2.5 leading-relaxed">访问 <a href="https://donder-tool.llx.life/score" class="text-primary hover:underline no-underline" target="_blank">Donder 查分器</a>，绑定自己的鼓众广场 ID，同步成绩后，点击"导出成绩"按钮，将导出的文件<b>上传</b>，或将其内容手动复制<b>粘贴</b>到下方文本框中即可。</p>
          <p class="my-2.5 leading-relaxed">如果 Donder 查分器无法访问或导出格式异常，可以尝试使用传分器导出数据。<button @click="toggleOldGuide" class="text-primary hover:underline no-underline">{{ showOldGuide ? '隐藏传分器指南' : '查看传分器指南' }}</button></p>
        </div>
      </transition>
      
    </section>
    <transition name="fade">
      <section v-show="showOldGuide">
        <div class="flex items-center justify-center">
          <h2 class="text-[#333] text-center font-bold mr-2">传分器指南</h2>
        </div>
        <p class="my-2.5 leading-relaxed">1. 须使用 Windows 系统</p>
        <p class="my-2.5 leading-relaxed">2. 启动传分器, 按照指引打开电脑端广场爬分, 直到传分器走到在 DonNote 点击上传按钮之前的一步(不需要打开 DonNote, 更不需要点击上传按钮)</p>
        <p class="my-2.5 leading-relaxed">3. 将浏览器代理设置到系统代理,打开 <a href="https://www.baidu.com/api/ahfsdafbaqwerhue" target="_blank" class="text-primary hover:underline no-underline">获取成绩</a>, 传分器会将分数传到页面中, ctrl + a 全选复制过来粘贴</p>
        <p class="my-2.5 leading-relaxed">4. 如果不会设置浏览器代理, 按 win 键搜索 PowerShell, 将以下代码粘贴并回车执行 <a href="javascript:void(0);" @click="copyPowerShellCode" class="text-primary hover:underline no-underline">点我复制代码</a></p>
        <div class="bg-[#f5f5f5] my-[15px] px-5 py-[15px] border-primary border-l-4 rounded-lg">
          <p class="m-0 mb-2.5 font-bold text-[#333]">传分器链接:</p>
          <ul class="m-0 p-0 list-none">
            <li class="before:left-0 before:absolute relative py-2 pl-5 before:font-bold before:text-primary before:content-['▸']"><a href="https://gitee.com/donnote/taiko-score-getter/releases/tag/latest" target="_blank" class="text-[15px] text-primary hover:text-primary-dark no-underline hover:no-underline transition-colors">旧版@Gitee donnote/taiko-score-getter</a></li>
            <li class="before:left-0 before:absolute relative py-2 pl-5 before:font-bold before:text-primary before:content-['▸']"><a href="https://github.com/Steve-xmh/taiko-score-getter-rs/releases/tag/v0.1.2" target="_blank" class="text-[15px] text-primary hover:text-primary-dark no-underline hover:no-underline transition-colors">新版@GitHub Steve-xmh/taiko-score-getter-rs</a></li>
            <li class="before:left-0 before:absolute relative py-2 pl-5 before:font-bold before:text-primary before:content-['▸']"><a href="https://github.com/Steve-xmh/taiko-score-getter-rs/releases/latest/download/taiko-score-getter.exe" target="_blank" class="text-[15px] text-primary hover:text-primary-dark no-underline hover:no-underline transition-colors">点我下载新版传分器</a></li>
            <li class="before:left-0 before:absolute relative py-2 pl-5 before:font-bold before:text-primary before:content-['▸']"><a href="https://ghproxy.vanillaaaa.org/https://github.com/Steve-xmh/taiko-score-getter-rs/releases/latest/download/taiko-score-getter.exe" target="_blank" class="text-[15px] text-primary hover:text-primary-dark no-underline hover:no-underline transition-colors">点我使用代理下载新版传分器，大部分时间不用翻墙</a></li>
          </ul>
        </div>
      </section>
    </transition>
    <transition name="fade">
      <div v-show="showGuideContent" class="my-5">
        <div class="toolbar">
          <button @click="handleUpload" class="toolbar-btn">📁 上传文件</button>
          <button @click="handlePaste" class="toolbar-btn">📋 粘贴数据</button>
        </div>
        <textarea 
          v-model="scoreInput" 
          rows="4" 
          placeholder="请输入数据"
          class="box-border p-2.5 border border-[#ddd] rounded w-full font-mono resize-none"
        ></textarea>
      </div>
    </transition>
    <transition name="fade">
      <button v-show="showGuideContent" @click="handleAnalyze" class="bg-primary hover:bg-primary-dark p-3 border-none rounded w-full text-white text-base transition-colors cursor-pointer">分析数据</button>
    </transition>
  </div>
</template>

<style scoped>
.announcement {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-left: 4px solid #2196f3;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 25px;
  color: #333;
}

.announcement-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2196f3;
}

.announcement p {
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

.wizard-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 40px 30px;
  margin: 30px 0;
  text-align: center;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.wizard-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.wizard-text {
  color: white;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.wizard-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin: 0;
}

.wizard-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.wizard-input-group {
  display: flex;
  gap: 0;
  width: 100%;
  max-width: 500px;
  align-items: center;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
}

.wizard-input-group:focus-within {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

.wizard-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px 0 0 8px;
  border-right: none;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  transition: all 0.3s ease;
  height: 48px;
  box-sizing: border-box;
}

.wizard-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
  background: white;
}

.wizard-input::placeholder {
  color: #999;
}

.donder-id-display {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 20px;
  border-radius: 8px;
}

.donder-id-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.donder-id-value {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.wizard-guide {
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
  margin: 0;
  max-width: 500px;
}

.wizard-link {
  color: white;
  text-decoration: underline;
  font-weight: 600;
}

.wizard-link:hover {
  text-decoration: none;
}

.wizard-btn {
  background: white;
  color: #667eea;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  min-width: 160px;
}

.wizard-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.wizard-btn:active:not(:disabled) {
  transform: translateY(0);
}

.wizard-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.wizard-btn-primary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  padding: 0 24px;
  border-radius: 0 8px 8px 0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);
  white-space: nowrap;
  height: 48px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.wizard-btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
}

.wizard-btn-primary:active:not(:disabled) {
  filter: brightness(0.95);
}

.wizard-btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.wizard-btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.wizard-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.wizard-btn-text {
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  transition: all 0.3s ease;
}

.wizard-btn-text:hover {
  color: white;
}

.toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.toolbar-btn {
  background: #2196f3;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.toolbar-btn:hover {
  background: #1976d2;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
