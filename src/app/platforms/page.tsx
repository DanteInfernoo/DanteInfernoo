'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, Link, Unlink, Users, FileText } from 'lucide-react'
import { PLATFORM_CONFIGS, formatNumber, cn } from '@/lib/utils'
import type { PlatformType } from '@/types'

interface PlatformWithCount {
  id: string
  name: string
  type: PlatformType
  username: string | null
  connected: boolean
  color: string
  followerCount: number
  postCount: number
  createdAt: string
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<PlatformWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchPlatforms = useCallback(async () => {
    const res = await fetch('/api/platforms')
    const data = await res.json()
    setPlatforms(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchPlatforms() }, [fetchPlatforms])

  const toggleConnection = async (id: string, currentState: boolean) => {
    setToggling(id)
    await fetch(`/api/platforms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connected: !currentState }),
    })
    await fetchPlatforms()
    setToggling(null)
  }

  const connected = platforms.filter(p => p.connected)
  const disconnected = platforms.filter(p => !p.connected)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Platforms</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Connect and manage your social media accounts · {connected.length} of {platforms.length} active
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-slate-500 animate-pulse">Loading platforms...</div>
        </div>
      ) : (
        <>
          {/* Connected */}
          {connected.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Connected ({connected.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {connected.map(platform => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    onToggle={() => toggleConnection(platform.id, platform.connected)}
                    loading={toggling === platform.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Disconnected */}
          {disconnected.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <XCircle size={14} className="text-slate-600" />
                Not Connected ({disconnected.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {disconnected.map(platform => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    onToggle={() => toggleConnection(platform.id, platform.connected)}
                    loading={toggling === platform.id}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="font-semibold text-white mb-2">About Platform Connections</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          In production, connecting platforms requires OAuth authorization with each social network's API.
          For this demo, use the toggle buttons to simulate connecting and disconnecting platforms.
          Connected platforms will be available when creating new posts.
        </p>
      </div>
    </div>
  )
}

function PlatformCard({
  platform,
  onToggle,
  loading,
}: {
  platform: PlatformWithCount
  onToggle: () => void
  loading: boolean
}) {
  const cfg = PLATFORM_CONFIGS[platform.type]
  return (
    <div className={cn(
      'bg-slate-900 border rounded-2xl p-5 transition-all',
      platform.connected ? 'border-slate-700' : 'border-slate-800 opacity-75'
    )}>
      {/* Platform Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg"
            style={{
              backgroundColor: `${cfg.color}20`,
              border: `1px solid ${cfg.color}40`,
              boxShadow: platform.connected ? `0 4px 20px ${cfg.color}20` : 'none',
            }}
          >
            {cfg.icon}
          </div>
          <div>
            <h3 className="font-semibold text-white">{cfg.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {platform.connected && platform.username ? platform.username : 'Not connected'}
            </p>
          </div>
        </div>
        <div className={cn(
          'text-xs font-semibold px-2.5 py-1 rounded-full',
          platform.connected ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-800 text-slate-500'
        )}>
          {platform.connected ? '● Live' : '○ Off'}
        </div>
      </div>

      {/* Stats */}
      {platform.connected && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Users size={12} className="text-slate-500" />
              <span className="text-xs text-slate-500">Followers</span>
            </div>
            <span className="text-sm font-bold text-white">{formatNumber(platform.followerCount)}</span>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <FileText size={12} className="text-slate-500" />
              <span className="text-xs text-slate-500">Posts</span>
            </div>
            <span className="text-sm font-bold text-white">{platform.postCount}</span>
          </div>
        </div>
      )}

      {/* Content Types */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {cfg.contentTypes.map(type => (
          <span key={type} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-500 rounded-full border border-slate-700">
            {type}
          </span>
        ))}
      </div>

      {/* Char Limit */}
      <p className="text-xs text-slate-600 mb-4">
        Character limit: {cfg.charLimit.toLocaleString()}
      </p>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        disabled={loading}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
          platform.connected
            ? 'border border-slate-700 text-slate-400 hover:border-red-800/50 hover:text-red-400 hover:bg-red-900/10'
            : 'text-white shadow-lg'
        )}
        style={!platform.connected ? { backgroundColor: cfg.color, boxShadow: `0 4px 14px ${cfg.color}40` } : {}}
      >
        {loading ? (
          <span className="animate-pulse">Updating...</span>
        ) : platform.connected ? (
          <><Unlink size={14} /> Disconnect</>
        ) : (
          <><Link size={14} /> Connect {cfg.name}</>
        )}
      </button>
    </div>
  )
}
