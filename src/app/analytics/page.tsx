'use client'

import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, BarChart2, Eye, Heart, Share2, MessageCircle } from 'lucide-react'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { PLATFORM_CONFIGS, formatNumber, cn } from '@/lib/utils'
import type { Post, Platform } from '@/types'

function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)

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

  const published = posts.filter(p => p.status === 'PUBLISHED')
  const scheduled = posts.filter(p => p.status === 'SCHEDULED')

  // Platform breakdown
  const platformStats = platforms.filter(p => p.connected).map(platform => {
    const platformPosts = posts.filter(p =>
      p.platforms.some(pp => pp.platformId === platform.id)
    )
    const cfg = PLATFORM_CONFIGS[platform.type]
    return {
      platform,
      cfg,
      postCount: platformPosts.length,
      engagement: randomInRange(2, 12),
      reach: randomInRange(500, 15000),
    }
  })

  // Weekly posting activity (last 28 days)
  const last28Days = eachDayOfInterval({ start: subDays(new Date(), 27), end: new Date() })
  const weeklyData = last28Days.map(day => ({
    date: day,
    count: posts.filter(p => {
      if (!p.scheduledAt) return false
      const d = new Date(p.scheduledAt)
      return d.toDateString() === day.toDateString()
    }).length,
  }))
  const maxCount = Math.max(...weeklyData.map(d => d.count), 1)

  // Content type breakdown
  const contentTypeCounts = posts.reduce((acc, p) => {
    acc[p.contentType] = (acc[p.contentType] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const contentTypes = Object.entries(contentTypeCounts).sort((a, b) => b[1] - a[1])
  const maxContentCount = Math.max(...contentTypes.map(([, c]) => c), 1)

  // Mock engagement stats
  const totalReach = formatNumber(randomInRange(45000, 80000))
  const avgEngagement = (randomInRange(4, 9) + Math.random()).toFixed(1)
  const totalLikes = formatNumber(randomInRange(3000, 8000))
  const totalShares = formatNumber(randomInRange(500, 2000))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-500 animate-pulse">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Overview of your content performance across all platforms
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Eye, label: 'Total Reach', value: totalReach, sub: 'last 30 days', color: 'text-violet-400', bg: 'bg-violet-900/20' },
          { icon: Heart, label: 'Total Likes', value: totalLikes, sub: 'all platforms', color: 'text-pink-400', bg: 'bg-pink-900/20' },
          { icon: Share2, label: 'Shares', value: totalShares, sub: 'all platforms', color: 'text-blue-400', bg: 'bg-blue-900/20' },
          { icon: TrendingUp, label: 'Avg Engagement', value: `${avgEngagement}%`, sub: 'rate', color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
            <div className="text-slate-400 text-sm">{stat.label}</div>
            <div className="text-slate-600 text-xs mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posting Activity Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={16} className="text-violet-400" />
            <h2 className="font-semibold text-white">Posting Activity</h2>
            <span className="text-slate-500 text-xs ml-auto">Last 28 days</span>
          </div>
          <div className="flex items-end gap-1 h-32">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                  <div
                    className="w-full rounded-t-sm bg-violet-600/60 group-hover:bg-violet-500 transition-colors"
                    style={{ height: `${day.count === 0 ? 2 : (day.count / maxCount) * 100}%`, minHeight: day.count > 0 ? '8px' : '2px' }}
                    title={`${format(day.date, 'MMM d')}: ${day.count} posts`}
                  />
                </div>
                {i % 7 === 0 && (
                  <span className="text-[9px] text-slate-600">{format(day.date, 'MMM d')}</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
            <span>{published.length} published · {scheduled.length} scheduled</span>
            <span>{posts.length} total posts</span>
          </div>
        </div>

        {/* Platform Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Share2 size={16} className="text-violet-400" />
            <h2 className="font-semibold text-white">Platform Breakdown</h2>
          </div>
          <div className="space-y-3">
            {platformStats.map(({ platform, cfg, postCount, engagement, reach }) => {
              const pct = posts.length > 0 ? (postCount / posts.length) * 100 : 0
              return (
                <div key={platform.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                        style={{ backgroundColor: `${cfg.color}25` }}
                      >
                        {cfg.icon}
                      </div>
                      <span className="text-sm text-slate-300 font-medium">{cfg.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{postCount} posts</span>
                      <span className="text-emerald-400">{engagement}% eng</span>
                      <span>{formatNumber(reach)} reach</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Type Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={16} className="text-violet-400" />
            <h2 className="font-semibold text-white">Content Types</h2>
          </div>
          {contentTypes.length === 0 ? (
            <p className="text-slate-500 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {contentTypes.map(([type, count]) => (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-300">{type}</span>
                    <span className="text-xs text-slate-500">{count} posts</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-violet-600 transition-all"
                      style={{ width: `${(count / maxContentCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best Posting Times */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-violet-400" />
            <h2 className="font-semibold text-white">Best Posting Times</h2>
          </div>
          <div className="space-y-2">
            {[
              { platform: 'Instagram', time: '6:00 PM – 9:00 PM', day: 'Wed & Fri', icon: '📸', color: '#E1306C' },
              { platform: 'TikTok', time: '7:00 AM – 9:00 AM', day: 'Tue & Thu', icon: '🎵', color: '#69C9D0' },
              { platform: 'Twitter / X', time: '12:00 PM – 3:00 PM', day: 'Mon–Wed', icon: '🐦', color: '#1DA1F2' },
              { platform: 'LinkedIn', time: '7:00 AM – 8:30 AM', day: 'Tue & Wed', icon: '💼', color: '#0A66C2' },
              { platform: 'Facebook', time: '1:00 PM – 4:00 PM', day: 'Thu & Fri', icon: '👍', color: '#1877F2' },
            ].map(item => (
              <div key={item.platform} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-300">{item.platform}</div>
                  <div className="text-xs text-slate-500">{item.day}</div>
                </div>
                <div className="text-xs text-emerald-400 font-medium">{item.time}</div>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-xs mt-3">Based on industry averages for best engagement</p>
        </div>
      </div>
    </div>
  )
}
