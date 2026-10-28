import { Link } from 'react-router'
import { lessons, lessonPath } from '@/content'
import { Sparkles } from 'lucide-react'

export default function Home() {
  const courseLessons = lessons.filter((l) => l.order > 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/70 via-white to-white">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <span className="text-base font-bold text-slate-900">AI 协同编程课</span>
          <span className="ml-2 hidden rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600 sm:inline-block">
            用 Trae 学编程
          </span>
        </div>
      </header>

      {/* 封面 */}
      <section className="mx-auto max-w-3xl px-4 pb-12 pt-16 text-center sm:pt-20">
        <div className="mb-5 text-6xl">🤖💻</div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          AI 协同编程课
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-600">
          面向 12 岁以上零基础学生的「AI 时代第一门编程课」。
          用字节跳动的 AI IDE「Trae」学会两项核心能力：
          <span className="font-medium text-slate-800">AI 代码补全</span> 与
          <span className="font-medium text-slate-800">Vibe Coding</span>，
          每节课都能带回家一个趣味作品。
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">🐍 Python</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">🌐 HTML / CSS</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">⚡ JavaScript</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">🎯 16 课时 · 8 课</span>
        </div>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/doc/readme"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
          >
            📖 先读课程总纲
          </Link>
          <Link
            to="/doc/lesson01"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            🚀 从第 1 课开始
          </Link>
        </div>
      </section>

      {/* 独立专题入口：不计入原 8 课 */}
      <section className="mx-auto max-w-5xl px-4 pb-12">
        <Link
          to="/game-lab"
          className="group flex flex-col gap-5 overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 p-6 text-white shadow-lg shadow-indigo-200/60 transition hover:-translate-y-0.5 hover:shadow-xl sm:flex-row sm:items-center sm:p-7"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-4xl ring-1 ring-white/25">
            🛸
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 text-xs font-semibold tracking-wider text-cyan-200">独立专题章 · 8 步游戏项目</div>
            <h2 className="text-xl font-black sm:text-2xl">AI 协同游戏设计 · 外星人入侵</h2>
            <p className="mt-2 text-sm leading-6 text-indigo-100">Python + Pygame · Trae IDE / SOLO 双模式 · 可保存进度的课堂工作台</p>
          </div>
          <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 transition group-hover:bg-cyan-50">进入游戏实验室 →</span>
        </Link>
      </section>

      {/* 课程卡片 */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <h2 className="mb-6 text-center text-xl font-bold text-slate-900">八节课，八个作品</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courseLessons.map((lesson) => (
            <Link
              key={lesson.slug}
              to={lessonPath(lesson)}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-3xl">{lesson.emoji}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  {lesson.tag}
                </span>
              </div>
              <div className="text-xs font-semibold text-indigo-500">
                第 {lesson.order} 课
              </div>
              <div className="mt-1 text-base font-bold leading-snug text-slate-900">
                {lesson.title}
              </div>
              <div className="mt-auto pt-3 text-sm text-slate-500">
                🛠️ 产出：{lesson.project}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        AI 协同编程课 · 基于 Trae IDE · 教学模式参考吴恩达 Learn Python with AI
      </footer>
    </div>
  )
}
