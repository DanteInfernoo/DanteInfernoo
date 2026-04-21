'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, isToday, addMonths, subMonths, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns'
import { usePostModal } from '@/store/usePostModal'
import { PLATFORM_CONFIGS, cn } from '@/lib/utils'
import type { Post } from '@/types'

type ViewMode = 'year' | 'month'

interface CalendarViewProps {
  posts: Post[]
  onRefresh: () => void
}

function getDayPosts(posts: Post[], date: Date): Post[] {
  return posts.filter(post => {
    if (!post.scheduledAt) return false
    return isSameDay(new Date(post.scheduledAt), date)
  })
}

function PostDot({ post }: { post: Post }) {
  const platform = post.platforms[0]?.platform
  const color = platform ? PLATFORM_CONFIGS[platform.type]?.color : '#6366f1'
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: color }}
      title={platform?.name}
    />
  )
}

function MiniMonth({
  date,
  posts,
  onSelectDay,
}: {
  date: Date
  posts: Post[]
  onSelectDay: (d: Date) => void
}) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDow = getDay(monthStart)

  return (
    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 hover:border-slate-600 transition-colors">
      <h3 className="text-xs font-semibold text-slate-300 mb-2 text-center">
        {format(date, 'MMMM')}
      </h3>
      <div className="grid grid-cols-7 gap-px mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-slate-600 text-[9px] font-medium py-0.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {Array.from({ length: startDow }).map((_, i) => <div key={`e-${i}`} />)}
        {days.map(day => {
          const dayPosts = getDayPosts(posts, day)
          const today = isToday(day)
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={cn(
                'relative flex flex-col items-center rounded py-0.5 transition-colors group',
                today ? 'bg-violet-600/30 ring-1 ring-violet-500/50' : 'hover:bg-slate-700/50',
              )}
            >
              <span className={cn('text-[9px] leading-none', today ? 'text-violet-300 font-bold' : 'text-slate-500')}>
                {format(day, 'd')}
              </span>
              {dayPosts.length > 0 && (
                <div className="flex gap-px flex-wrap justify-center mt-0.5">
                  {dayPosts.slice(0, 3).map((p, i) => <PostDot key={i} post={p} />)}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MonthView({
  date,
  posts,
  onSelectDay,
}: {
  date: Date
  posts: Post[]
  onSelectDay: (d: Date) => void
}) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDow = getDay(monthStart)

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-slate-800 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-xs font-medium text-slate-500 text-center py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDow }).map((_, i) => <div key={`e-${i}`} className="min-h-[80px]" />)}
        {days.map(day => {
          const dayPosts = getDayPosts(posts, day)
          const today = isToday(day)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[80px] rounded-xl p-2 border transition-colors cursor-pointer group',
                today
                  ? 'border-violet-500/40 bg-violet-900/10'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
              )}
              onClick={() => onSelectDay(day)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  'text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                  today ? 'bg-violet-600 text-white' : 'text-slate-400'
                )}>
                  {format(day, 'd')}
                </span>
                {dayPosts.length === 0 && (
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={e => { e.stopPropagation() }}
                  >
                    <Plus size={12} className="text-slate-500" />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {dayPosts.slice(0, 3).map(post => {
                  const platform = post.platforms[0]?.platform
                  const color = platform ? PLATFORM_CONFIGS[platform.type]?.color : '#6366f1'
                  return (
                    <div
                      key={post.id}
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] truncate"
                      style={{ backgroundColor: `${color}25`, borderLeft: `2px solid ${color}` }}
                    >
                      <span className="text-slate-300 truncate">{post.content.substring(0, 25)}</span>
                    </div>
                  )
                })}
                {dayPosts.length > 3 && (
                  <div className="text-[10px] text-slate-500 pl-1">+{dayPosts.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface DayDetailProps {
  date: Date
  posts: Post[]
  onClose: () => void
  onEdit: (postId: string) => void
}

function DayDetail({ date, posts, onClose, onEdit }: DayDetailProps) {
  const open = usePostModal(s => s.open)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="font-semibold text-white">{format(date, 'EEEE, MMMM d, yyyy')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">✕</button>
        </div>
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {posts.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No posts scheduled for this day.</p>
          ) : (
            posts.map(post => {
              const platform = post.platforms[0]?.platform
              const color = platform ? PLATFORM_CONFIGS[platform.type]?.color : '#6366f1'
              return (
                <div
                  key={post.id}
                  className="rounded-xl p-3 border border-slate-800 cursor-pointer hover:border-slate-600 transition-colors"
                  onClick={() => { onEdit(post.id); onClose() }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-slate-400">{platform?.name}</span>
                    <span className="text-xs text-slate-600 ml-auto">
                      {post.scheduledAt ? format(new Date(post.scheduledAt), 'h:mm a') : ''}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-2">{post.content}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {post.platforms.map(pp => (
                      <span
                        key={pp.id}
                        className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: PLATFORM_CONFIGS[pp.platform.type]?.color }}
                      >
                        {pp.platform.name}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => { open(); onClose() }}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-2 text-sm font-semibold transition-colors"
          >
            + Add Post for This Day
          </button>
        </div>
      </div>
    </div>
  )
}

export function CalendarView({ posts, onRefresh }: CalendarViewProps) {
  const [view, setView] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const open = usePostModal(s => s.open)

  const yearMonths = useMemo(() => {
    const year = currentDate.getFullYear()
    const yearStart = startOfYear(new Date(year, 0, 1))
    const yearEnd = endOfYear(new Date(year, 0, 1))
    return eachMonthOfInterval({ start: yearStart, end: yearEnd })
  }, [currentDate])

  const selectedDayPosts = selectedDay ? getDayPosts(posts, selectedDay) : []

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => view === 'month' ? setCurrentDate(subMonths(currentDate, 1)) : setCurrentDate(d => new Date(d.getFullYear() - 1, 0, 1))}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold text-white min-w-[160px] text-center">
            {view === 'month' ? format(currentDate, 'MMMM yyyy') : currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => view === 'month' ? setCurrentDate(addMonths(currentDate, 1)) : setCurrentDate(d => new Date(d.getFullYear() + 1, 0, 1))}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 rounded-lg p-0.5">
            {(['year', 'month'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors',
                  view === v ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => open()}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={15} /> New Post
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap">
        {(['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'TIKTOK', 'LINKEDIN'] as const).map(type => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_CONFIGS[type].color }} />
            <span className="text-xs text-slate-500">{PLATFORM_CONFIGS[type].name}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      {view === 'year' ? (
        <div className="grid grid-cols-4 gap-3">
          {yearMonths.map(month => (
            <MiniMonth
              key={month.toISOString()}
              date={month}
              posts={posts}
              onSelectDay={d => { setSelectedDay(d); setCurrentDate(d); setView('month') }}
            />
          ))}
        </div>
      ) : (
        <MonthView
          date={currentDate}
          posts={posts}
          onSelectDay={d => setSelectedDay(d)}
        />
      )}

      {/* Day Detail Modal */}
      {selectedDay && (
        <DayDetail
          date={selectedDay}
          posts={selectedDayPosts}
          onClose={() => setSelectedDay(null)}
          onEdit={id => open(id)}
        />
      )}
    </div>
  )
}
