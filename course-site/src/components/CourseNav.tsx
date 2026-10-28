import { NavLink } from 'react-router'
import { lessons, lessonPath } from '@/content'
import { cn } from '@/lib/utils'

interface CourseNavProps {
  onNavigate?: () => void
}

export function CourseNav({ onNavigate }: CourseNavProps) {
  return (
    <nav className="flex flex-col gap-1">
      <div className="px-3 pb-2 text-xs font-semibold tracking-wider text-slate-400">
        课程目录
      </div>
      {lessons.map((lesson) => (
        <NavLink
          key={lesson.slug}
          to={lessonPath(lesson)}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-indigo-50 font-medium text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )
          }
        >
          <span className="text-base leading-none">{lesson.emoji}</span>
          <span className="min-w-0 flex-1 truncate">
            {lesson.order === 0 ? lesson.title : `第 ${lesson.order} 课 · ${lesson.title}`}
          </span>
        </NavLink>
      ))}
      <div className="mx-3 my-3 border-t border-slate-200" />
      <div className="px-3 pb-2 text-xs font-semibold tracking-wider text-slate-400">
        独立专题
      </div>
      <NavLink
        to="/game-lab"
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
            isActive
              ? 'bg-violet-50 font-medium text-violet-700'
              : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700',
          )
        }
      >
        <span className="text-base leading-none">🛸</span>
        <span className="min-w-0 flex-1 truncate">AI 协同游戏设计 · 外星人入侵</span>
      </NavLink>
    </nav>
  )
}
