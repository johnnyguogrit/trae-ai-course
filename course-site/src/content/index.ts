import readmeRaw from './readme.md?raw'
import lesson01 from './lesson01.md?raw'
import lesson02 from './lesson02.md?raw'
import lesson03 from './lesson03.md?raw'
import lesson04 from './lesson04.md?raw'
import lesson05 from './lesson05.md?raw'
import lesson06 from './lesson06.md?raw'
import lesson07 from './lesson07.md?raw'
import lesson08 from './lesson08.md?raw'

export interface LessonMeta {
  /** 路由 slug，readme 为 'readme'，其余为 'lesson01'… */
  slug: string
  /** 课次编号，readme 为 0 */
  order: number
  /** 导航/卡片用短标题 */
  title: string
  /** 产出项目 */
  project: string
  emoji: string
  tag: string
  raw: string
}

export const lessons: LessonMeta[] = [
  {
    slug: 'readme',
    order: 0,
    title: '课程总纲',
    project: '课程定位、目标与整体安排',
    emoji: '📖',
    tag: '导读',
    raw: readmeRaw,
  },
  {
    slug: 'lesson01',
    order: 1,
    title: '你好，AI 编程伙伴',
    project: 'Hello World 个人名片页',
    emoji: '👋',
    tag: 'Trae 入门',
    raw: lesson01,
  },
  {
    slug: 'lesson02',
    order: 2,
    title: 'Python 起步 × AI 补全',
    project: 'AI 聊天机器人',
    emoji: '🤖',
    tag: 'Python',
    raw: lesson02,
  },
  {
    slug: 'lesson03',
    order: 3,
    title: 'Python 逻辑与循环',
    project: '猜数字游戏',
    emoji: '🎲',
    tag: 'Python',
    raw: lesson03,
  },
  {
    slug: 'lesson04',
    order: 4,
    title: '函数与数据结构 + Vibe Coding 初体验',
    project: '单词消消乐',
    emoji: '🃏',
    tag: 'Vibe Coding',
    raw: lesson04,
  },
  {
    slug: 'lesson05',
    order: 5,
    title: 'HTML/CSS 网页基础',
    project: '我的个人主页',
    emoji: '🏠',
    tag: 'HTML/CSS',
    raw: lesson05,
  },
  {
    slug: 'lesson06',
    order: 6,
    title: 'JavaScript 让网页动起来',
    project: '点击计数器 + 变色按钮',
    emoji: '🖱️',
    tag: 'JavaScript',
    raw: lesson06,
  },
  {
    slug: 'lesson07',
    order: 7,
    title: 'Web 小游戏项目 —— 打地鼠',
    project: '打地鼠游戏',
    emoji: '🔨',
    tag: '项目实战',
    raw: lesson07,
  },
  {
    slug: 'lesson08',
    order: 8,
    title: '综合 Vibe Coding 大项目',
    project: '自选大项目（三选一）',
    emoji: '🚀',
    tag: '结课项目',
    raw: lesson08,
  },
]

export const lessonBySlug = (slug: string | undefined) =>
  lessons.find((l) => l.slug === slug)

export const lessonPath = (l: LessonMeta) => `/doc/${l.slug}`
