'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, FileText, Share2, BarChart3, Plus, Zap } from 'lucide-react'
import { usePostModal } from '@/store/usePostModal'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Posts', href: '/posts', icon: FileText },
  { name: 'Platforms', href: '/platforms', icon: Share2 },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

const platformDots = [
  { color: '#E1306C', label: 'Instagram' },
  { color: '#1877F2', label: 'Facebook' },
  { color: '#1DA1F2', label: 'Twitter' },
  { color: '#69C9D0', label: 'TikTok' },
  { color: '#0A66C2', label: 'LinkedIn' },
]

export function Sidebar() {
  const pathname = usePathname()
  const open = usePostModal(s => s.open)

  return (
    <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-800 shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">SocialFlow</h1>
            <p className="text-slate-500 text-xs">Content Scheduler</p>
          </div>
        </div>
      </div>

      {/* New Post Button */}
      <div className="p-4">
        <button
          onClick={() => open()}
          className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 transition-colors font-semibold text-sm shadow-lg shadow-violet-900/30"
        >
          <Plus size={18} />
          New Post
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-3 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                isActive
                  ? 'bg-violet-600/15 text-violet-400 ring-1 ring-violet-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-violet-400' : ''} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Connected Platforms */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">Connected</p>
        <div className="flex gap-2 flex-wrap">
          {platformDots.map(p => (
            <div
              key={p.label}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs ring-2 ring-slate-900"
              style={{ backgroundColor: p.color }}
              title={p.label}
            >
              {p.label[0]}
            </div>
          ))}
        </div>
        <p className="text-slate-600 text-xs mt-2">5 platforms active</p>
      </div>
    </aside>
  )
}
