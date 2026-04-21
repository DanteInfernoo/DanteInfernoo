'use client'

import { useEffect, useState, useCallback } from 'react'
import { Calendar, FileText, CheckCircle2, Share2, Clock, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { format, isAfter } from 'date-fns'
import { CreatePostModal } from '@/components/posts/CreatePostModal'
import { usePostModal } from '@/store/usePostModal'
import { PLATFORM_CONFIGS, STATUS_STYLES, cn } from '@/lib/utils'
import type { Post, Platform } from '@/types'

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
      {sub && <div className="text-slate-600 text-xs mt-1">{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const open = usePostModal(s => s.open)

  const fetchData = useCallback(async () => {
    const [postsRes, platformsRes] = await Promise.all([
      fetch('/api/posts'),
      fetch('/api/platforms'),
    ])
    const [postsData, platformsData] = await Promise.all([postsRes.json(), platformsRes.json()])
    setPosts(postsData)
    setPlatforms(platformsData)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const now = new Date()
  const scheduled = posts.filter(p => p.status === 'SCHEDULED')
  const published = posts.filter(p => p.status === 'PUBLISHED')
  const drafts = posts.filter(p => p.status === 'DRAFT')
  const upcoming = scheduled
    .filter(p => p.scheduledAt && isAfter(new Date(p.scheduledAt), now))
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
    .slice(0, 8)
  const connected = platforms.filter(p => p.connected)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-500 animate-pulse">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <>
      <CreatePostModal onCreated={fetchData} />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {format(now, "EEEE, MMMM d, yyyy")} · {scheduled.length} posts scheduled
            </p>
          </div>
          <button
            onClick={() => open()}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-violet-900/30"
          >
            <Plus size={16} /> New Post
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Calendar} label="Scheduled" value={scheduled.length} sub="posts in queue" color="bg-violet-600" />
          <StatCard icon={CheckCircle2} label="Published" value={published.length} sub="all time" color="bg-emerald-600" />
          <StatCard icon={FileText} label="Drafts" value={drafts.length} sub="in progress" color="bg-amber-600" />
          <StatCard icon={Share2} label="Platforms" value={`${connected.length}/${platforms.length}`} sub="connected" color="bg-blue-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Posts */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-violet-400" />
                <h2 className="font-semibold text-white">Upcoming Posts</h2>
              </div>
              <Link href="/posts?status=SCHEDULED" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-slate-800">
              {upcoming.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="mx-auto text-slate-700 mb-3" size={32} />
                  <p className="text-slate-500 text-sm">No upcoming posts scheduled.</p>
                  <button onClick={() => open()} className="mt-3 text-violet-400 hover:text-violet-300 text-sm font-medium">
                    Schedule your first post →
                  </button>
                </div>
              ) : (
                upcoming.map(post => {
                  const statusStyle = STATUS_STYLES[post.status]
                  return (
                    <div
                      key={post.id}
                      className="p-4 hover:bg-slate-800/30 transition-colors cursor-pointer group"
                      onClick={() => open(post.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            {post.platforms.map(pp => {
                              const cfg = PLATFORM_CONFIGS[pp.platform.type]
                              return (
                                <span
                                  key={pp.id}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                                  style={{ backgroundColor: cfg.color }}
                                >
                                  {cfg.name}
                                </span>
                              )
                            })}
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyle.className}`}>
                              {post.contentType}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                            {post.content}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs text-slate-400 font-medium">
                            {post.scheduledAt ? format(new Date(post.scheduledAt), 'MMM d') : '—'}
                          </div>
                          <div className="text-xs text-slate-600">
                            {post.scheduledAt ? format(new Date(post.scheduledAt), 'h:mm a') : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Platforms + Quick Actions */}
          <div className="space-y-4">
            {/* Platforms */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Share2 size={16} className="text-violet-400" />
                  <h2 className="font-semibold text-white">Platforms</h2>
                </div>
                <Link href="/platforms" className="text-sm text-violet-400 hover:text-violet-300">
                  Manage
                </Link>
              </div>
              <div className="p-4 space-y-2">
                {platforms.map(platform => {
                  const cfg = PLATFORM_CONFIGS[platform.type]
                  return (
                    <div key={platform.id} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                        style={{ backgroundColor: `${cfg.color}25`, border: `1px solid ${cfg.color}40` }}
                      >
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-300">{cfg.name}</div>
                        <div className="text-xs text-slate-600 truncate">{platform.username || 'Not connected'}</div>
                      </div>
                      <div className={cn(
                        'text-[10px] font-medium px-2 py-0.5 rounded-full',
                        platform.connected ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      )}>
                        {platform.connected ? 'Live' : 'Off'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-violet-400" />
                <h2 className="font-semibold text-white">This Month</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Posts scheduled', value: scheduled.filter(p => {
                    const d = p.scheduledAt ? new Date(p.scheduledAt) : null
                    return d && d.getMonth() === now.getMonth()
                  }).length, color: 'bg-violet-500' },
                  { label: 'Drafts pending', value: drafts.length, color: 'bg-amber-500' },
                  { label: 'Already published', value: published.length, color: 'bg-emerald-500' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                      <span className="text-sm text-slate-400">{stat.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
