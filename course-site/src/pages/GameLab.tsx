import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Download,
  FlaskConical,
  Gamepad2,
  Keyboard,
  Lightbulb,
  RotateCcw,
  Rocket,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { gameSteps } from '@/content/gameLabSteps'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'ai-game-lab-progress-v1'

const acceptanceItems = [
  { title: '运行', detail: '从干净终端启动，没有语法、导入或资源路径错误。' },
  { title: '测试边界', detail: '飞船不越界；舰队碰边只下移、换向一次。' },
  { title: '连续射击', detail: '移动中连按空格，不突破上限，离屏子弹会删除。' },
  { title: '碰撞', detail: '一次命中只加一次分，清空舰队后能重建。' },
  { title: '失败 / 重开', detail: '撞船与到底扣命；结束后 Enter 能正确恢复。' },
  { title: '代码阅读', detail: '能解释本步至少 3 行代码，并指出手改位置。' },
]

function readProgress(): number[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter((id) => Number.isInteger(id) && id >= 1 && id <= 8)
  } catch {
    return []
  }
}

interface ParameterControlProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  effect: string
  onChange: (value: number) => void
}

function ParameterControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  effect,
  onChange,
}: ParameterControlProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        <span className="rounded-md bg-white px-2 py-1 font-mono text-sm font-bold text-indigo-600 shadow-sm">
          {value.toFixed(step < 1 ? 1 : 0)} {unit}
        </span>
      </div>
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
      />
      <p className="mt-3 text-xs leading-relaxed text-slate-500">{effect}</p>
    </div>
  )
}

export default function GameLab() {
  const [currentId, setCurrentId] = useState(1)
  const [completed, setCompleted] = useState<number[]>(readProgress)
  const [copiedKey, setCopiedKey] = useState('')
  const [shipSpeed, setShipSpeed] = useState(4)
  const [bulletSpeed, setBulletSpeed] = useState(7)
  const [alienSpeed, setAlienSpeed] = useState(1)
  const [lives, setLives] = useState(3)

  const step = gameSteps[currentId - 1]
  const isComplete = completed.includes(currentId)
  const progress = Math.round((completed.length / 8) * 100)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed))
    } catch {
      // 隐私模式禁用存储时，页面仍可在本次会话中正常使用。
    }
  }, [completed])

  const copyText = async (text: string, key: string) => {
    const copyWithSelection = () => {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const succeeded = document.execCommand('copy')
      textarea.remove()
      if (!succeeded) throw new Error('浏览器拒绝了复制操作')
    }

    try {
      let copied = false
      try {
        // 优先使用点击事件中的同步复制，避免权限弹窗让课堂反馈一直等待。
        copyWithSelection()
        copied = true
      } catch {
        // 不支持选中复制时，继续使用现代 Clipboard API。
      }
      if (!copied && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        copied = true
      }
      if (!copied) throw new Error('当前浏览器不支持复制')
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey((current) => (current === key ? '' : current)), 1800)
    } catch {
      setCopiedKey('error')
    }
  }

  const toggleComplete = () => {
    setCompleted((current) =>
      current.includes(currentId)
        ? current.filter((id) => id !== currentId)
        : [...current, currentId].sort((a, b) => a - b),
    )
  }

  const resetProgress = () => {
    if (completed.length > 0 && !window.confirm('确定清空 8 步完成记录吗？代码文件不会被修改。')) return
    setCompleted([])
  }

  const settingsCode = `# 复制到 final/settings.py 的「学生修改区」
self.ship_speed = ${shipSpeed.toFixed(1)}
self.bullet_speed = ${bulletSpeed.toFixed(1)}
self.initial_alien_speed = ${alienSpeed.toFixed(1)}
self.ship_limit = ${lives}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-cyan-50/40 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">返回课程首页</span>
          </Link>
          <div className="mx-1 h-5 w-px bg-slate-200" />
          <Gamepad2 className="h-5 w-5 text-indigo-600" />
          <span className="truncate text-sm font-bold">AI 协同游戏设计</span>
          <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">独立专题章</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-xl shadow-indigo-100/40">
          <div className="grid gap-8 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 p-6 text-white sm:p-8 lg:grid-cols-[1.45fr_1fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/25">
                <Sparkles className="h-3.5 w-3.5" /> Python · Pygame · Trae IDE + SOLO
              </div>
              <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                AI 协同游戏设计
                <span className="mt-1 block text-cyan-200">外星人入侵</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-50 sm:text-base">
                8 步做出完整射击游戏。你负责读懂、手改和验收，AI 负责补全与协作；每一步都能独立运行、独立继续。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`${import.meta.env.BASE_URL}downloads/alien_invasion_ai_code.zip`}
                  download
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-cyan-50"
                >
                  <Download className="h-4 w-4" /> 下载完整代码包
                </a>
                <a href="#step-workbench" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                  <Rocket className="h-4 w-4" /> 从当前关卡开始
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-white/12 p-5 ring-1 ring-white/20 backdrop-blur-sm">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs font-medium text-indigo-100">我的完成进度</div>
                  <div className="mt-1 text-3xl font-black">{completed.length}<span className="text-lg text-indigo-200"> / 8</span></div>
                </div>
                <div className="text-4xl" aria-hidden="true">🛸</div>
              </div>
              <Progress value={progress} className="mt-4 h-2.5 bg-white/20 [&>div]:bg-cyan-300" />
              <div className="mt-5 border-t border-white/15 pt-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-indigo-100"><Keyboard className="h-4 w-4" /> 最终操作键</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['← → 移动', '空格 射击', 'Enter 重开', 'Q / Esc 退出'].map((key) => (
                    <span key={key} className="rounded-lg bg-slate-950/20 px-2.5 py-1.5 font-medium">{key}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-amber-50 px-6 py-3 text-sm leading-6 text-amber-800">
            <Terminal className="mt-1 h-4 w-4 shrink-0" />
            <p><strong>本地运行提醒：</strong>本网页是学习工作台，不会直接运行 Pygame。请下载代码，在本地 Trae 终端安装 pygame 后运行各步 main.py。</p>
          </div>
        </section>

        <section id="step-workbench" className="mt-8 scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">8 步关卡导航</h2>
              <p className="mt-1 text-sm text-slate-500">点击切换；完成本步修改与测试后再勾选。</p>
            </div>
            <Button variant="ghost" size="sm" onClick={resetProgress} className="text-slate-500 hover:text-rose-600">
              <RotateCcw className="h-4 w-4" /> 重置进度
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {gameSteps.map((item) => {
              const done = completed.includes(item.id)
              const active = item.id === currentId
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setCurrentId(item.id)}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'relative min-h-24 rounded-2xl border p-3 text-left transition-all',
                    active ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100 ring-2 ring-indigo-100' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn('text-xs font-black', active ? 'text-indigo-600' : 'text-slate-400')}>STEP {item.id}</span>
                    {done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-300" />}
                  </div>
                  <div className={cn('mt-2 text-sm font-bold leading-snug', active ? 'text-indigo-900' : 'text-slate-700')}>{item.title}</div>
                </button>
              )
            })}
          </div>
        </section>

        <Card className="mt-5 gap-0 overflow-hidden border-indigo-100 py-0 shadow-lg shadow-slate-200/50">
          <div className="border-b border-slate-100 bg-gradient-to-r from-white to-indigo-50/60 p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-white">第 {step.id} 步</span>
                  <code className="rounded-md bg-slate-100 px-2 py-1 text-indigo-700">{step.file}</code>
                </div>
                <h2 className="text-2xl font-black">{step.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{step.goal}</p>
              </div>
              <Button onClick={toggleComplete} variant={isComplete ? 'secondary' : 'default'} className={cn(isComplete ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-indigo-600 hover:bg-indigo-700')}>
                <Check className="h-4 w-4" /> {isComplete ? '已完成 · 点击取消' : '标记本步完成'}
              </Button>
            </div>
          </div>

          <div className="space-y-7 p-5 sm:p-7">
            <div className="grid gap-4 md:grid-cols-3">
              {step.syntax.map((item) => (
                <div key={item.name} className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-indigo-800"><BookOpen className="h-4 w-4" />{item.name}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-cyan-50 p-4 text-sm leading-6 text-cyan-900">
              <Gamepad2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600" />
              <div><strong>运行效果：</strong>{step.effect}</div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <Bot className="h-5 w-5 text-violet-600" />
                <h3 className="text-lg font-bold">选择你的 AI 协作方式</h3>
              </div>
              <Tabs defaultValue="ide" className="gap-3">
                <TabsList className="grid h-11 w-full grid-cols-2 bg-slate-100 sm:w-96">
                  <TabsTrigger value="ide" className="data-[state=active]:text-indigo-700">Trae IDE · 小步读懂</TabsTrigger>
                  <TabsTrigger value="solo" className="data-[state=active]:text-violet-700">Trae SOLO · 完整验收</TabsTrigger>
                </TabsList>
                {(['ide', 'solo'] as const).map((mode) => {
                  const prompt = mode === 'ide' ? step.idePrompt : step.soloPrompt
                  const key = `${step.id}-${mode}`
                  return (
                    <TabsContent key={mode} value={mode}>
                      <div className={cn('rounded-2xl border p-4 sm:p-5', mode === 'ide' ? 'border-indigo-100 bg-indigo-50/50' : 'border-violet-100 bg-violet-50/50')}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold text-slate-500">{mode === 'ide' ? '让 AI 解释和引导，学生仍亲手改代码' : '提示词含上下文、目标、约束、运行验证与保护条件'}</p>
                          <Button type="button" size="sm" variant="outline" onClick={() => copyText(prompt, key)} className="shrink-0 bg-white">
                            {copiedKey === key ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            {copiedKey === key ? '已复制' : '复制提示词'}
                          </Button>
                        </div>
                        <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-700">{prompt}</pre>
                      </div>
                    </TabsContent>
                  )
                })}
              </Tabs>
              {copiedKey === 'error' && <p className="mt-2 text-sm text-rose-600">浏览器未允许自动复制，请选中提示词手动复制。</p>}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center gap-2 font-bold text-amber-900"><Lightbulb className="h-5 w-5" /> 学生亲手改代码</div>
                <p className="mt-3 text-sm leading-7 text-amber-900/80">{step.task}</p>
                <div className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs text-amber-700">先写预期 → 手动修改 → 本地运行 → 记录结果</div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                <div className="flex items-center gap-2 font-bold text-emerald-900"><ShieldCheck className="h-5 w-5" /> 完成检查点</div>
                <ul className="mt-3 space-y-2">
                  {step.checkpoints.map((checkpoint) => (
                    <li key={checkpoint} className="flex items-start gap-2 text-sm leading-6 text-emerald-900/80">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{checkpoint}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 font-bold"><AlertTriangle className="h-5 w-5 text-rose-500" /> 常见报错急救卡</div>
              <div className="grid gap-2 md:grid-cols-3">
                {step.errors.map((error) => (
                  <details key={error.problem} className="group rounded-xl border border-slate-200 bg-slate-50 p-3 open:bg-white open:shadow-sm">
                    <summary className="cursor-pointer list-none break-words font-mono text-xs font-semibold leading-5 text-slate-700">{error.problem}<span className="float-right font-sans text-indigo-500 group-open:rotate-45">＋</span></summary>
                    <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-6 text-slate-600">{error.solution}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
            <Button variant="outline" disabled={currentId === 1} onClick={() => setCurrentId((id) => Math.max(1, id - 1))} className="bg-white">
              <ArrowLeft className="h-4 w-4" /> 上一步
            </Button>
            <span className="hidden text-xs text-slate-400 sm:inline">在 Trae 中运行 {step.file}</span>
            <Button disabled={currentId === 8} onClick={() => setCurrentId((id) => Math.min(8, id + 1))} className="bg-indigo-600 hover:bg-indigo-700">
              下一步 <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <section className="mt-10 grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="gap-0 border-cyan-100 py-0 shadow-md">
            <div className="border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-indigo-50 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-lg font-bold"><FlaskConical className="h-5 w-5 text-cyan-600" /> 参数实验室</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">拖动滑块，实时生成 final/settings.py 参数。复制后在本地运行，观察手感变化。</p>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
              <ParameterControl label="飞船速度" value={shipSpeed} min={1} max={10} step={0.5} unit="px/帧" onChange={setShipSpeed} effect="调大：移动更灵敏；调小：更容易精细对准，但躲舰队更困难。" />
              <ParameterControl label="子弹速度" value={bulletSpeed} min={3} max={15} step={0.5} unit="px/帧" onChange={setBulletSpeed} effect="调大：更快命中、离屏更快；调小：飞行节奏更慢，同屏子弹更容易达到上限。" />
              <ParameterControl label="外星人初始速度" value={alienSpeed} min={0.5} max={3} step={0.5} unit="px/帧" onChange={setAlienSpeed} effect="调大：舰队更压迫；调小：适合观察碰边与瞄准。每关仍会额外加速。" />
              <ParameterControl label="生命数" value={lives} min={1} max={6} step={1} unit="条" onChange={setLives} effect="调大：容错更多；调小：更容易测试游戏结束和 Enter 重开。" />
            </div>
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="rounded-xl bg-slate-950 p-4 text-slate-100">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-400"><Settings2 className="h-4 w-4" /> settings 参数代码</span>
                  <Button size="sm" variant="secondary" onClick={() => copyText(settingsCode, 'settings')} className="bg-slate-800 text-slate-100 hover:bg-slate-700">
                    {copiedKey === 'settings' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    {copiedKey === 'settings' ? '已复制' : '复制代码'}
                  </Button>
                </div>
                <pre className="overflow-x-auto text-sm leading-7"><code>{settingsCode}</code></pre>
              </div>
            </div>
          </Card>

          <Card className="gap-0 border-emerald-100 py-0 shadow-md">
            <div className="border-b border-emerald-100 bg-emerald-50 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-lg font-bold"><ShieldCheck className="h-5 w-5 text-emerald-600" /> AI 生成后怎么验收</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">AI 说「完成」不算完成。逐项亲手测试，并检查新功能有没有弄坏旧功能。</p>
            </div>
            <ul className="space-y-1 p-4 sm:p-5">
              {acceptanceItems.map((item, index) => (
                <li key={item.title} className="flex gap-3 rounded-xl p-3 transition hover:bg-emerald-50/70">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-700">{index + 1}</span>
                  <div><div className="text-sm font-bold text-slate-800">{item.title}</div><p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p></div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/70 py-8 text-center text-sm text-slate-400">
        AI 协同游戏设计 · 独立专题章 · 人负责理解、修改与验收
      </footer>
    </div>
  )
}
