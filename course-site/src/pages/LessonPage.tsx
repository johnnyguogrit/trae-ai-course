import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { Menu, ArrowLeft, ArrowRight, Sparkles, Home as HomeIcon } from 'lucide-react'
import { lessons, lessonBySlug, lessonPath } from '@/content'
import { Markdown } from '@/components/Markdown'
import { CourseNav } from '@/components/CourseNav'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

export default function LessonPage() {
  const { slug } = useParams<{ slug: string }>()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const lesson = lessonBySlug(slug)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!lesson) {
    return <Navigate to="/" replace />
  }

  const prev = lesson.order === 0 ? null : lessons[lesson.order - 1]
  const next = lesson.order < lessons.length - 1 ? lessons[lesson.order + 1] : null

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          {/* 移动端汉堡 */}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="打开课程目录">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto p-4 pt-8">
              <CourseNav onNavigate={() => setDrawerOpen(false)} />
            </SheetContent>
          </Sheet>

          <Sparkles className="h-5 w-5 shrink-0 text-indigo-600" />
          <Link to="/" className="shrink-0 text-base font-bold text-slate-900 hover:text-indigo-700">
            AI 协同编程课
          </Link>
          <span className="hidden text-slate-300 sm:inline">/</span>
          <span className="hidden min-w-0 flex-1 truncate text-sm text-slate-500 sm:inline">
            {lesson.order === 0 ? lesson.title : `第 ${lesson.order} 课 · ${lesson.title}`}
          </span>
          <Link
            to="/"
            className="ml-auto flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <HomeIcon className="h-4 w-4" />
            <span className="hidden sm:inline">首页</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4">
        {/* 桌面端侧边目录 */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto py-6 pr-2 lg:block">
          <CourseNav />
        </aside>

        {/* 正文 */}
        <main className="min-w-0 flex-1 py-8">
          <div className="mx-auto max-w-[760px]">
            <Markdown content={lesson.raw} />

            {/* 上一课 / 下一课 */}
            <div className="mt-14 flex flex-col gap-3 border-t border-slate-200 pt-8 sm:flex-row sm:justify-between">
              {prev ? (
                <Link
                  to={lessonPath(prev)}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-600" />
                  <span>
                    <span className="block text-xs text-slate-400">上一课</span>
                    <span className="block text-sm font-medium text-slate-700 group-hover:text-indigo-700">
                      {prev.order === 0 ? prev.title : `第 ${prev.order} 课 · ${prev.title}`}
                    </span>
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  to={lessonPath(next)}
                  className="group flex items-center justify-end gap-3 rounded-xl border border-slate-200 px-4 py-3 text-right transition hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <span>
                    <span className="block text-xs text-slate-400">下一课</span>
                    <span className="block text-sm font-medium text-slate-700 group-hover:text-indigo-700">
                      {next.order === 0 ? next.title : `第 ${next.order} 课 · ${next.title}`}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-600" />
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
