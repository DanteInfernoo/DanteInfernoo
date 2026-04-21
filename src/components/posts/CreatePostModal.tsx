'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Image, Video, Film, Clock, Hash, Send, FileText, Layers, BookOpen, Zap } from 'lucide-react'
import { usePostModal } from '@/store/usePostModal'
import { PLATFORM_CONFIGS, CONTENT_TYPE_LABELS, cn } from '@/lib/utils'
import type { Platform, ContentType, PostStatus } from '@/types'

const CONTENT_TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  IMAGE: <Image size={14} />,
  CAROUSEL: <Layers size={14} />,
  VIDEO: <Video size={14} />,
  REEL: <Film size={14} />,
  STORY: <Clock size={14} />,
  THREAD: <FileText size={14} />,
  ARTICLE: <BookOpen size={14} />,
  SHORT: <Zap size={14} />,
}

interface CreatePostModalProps {
  onCreated?: () => void
}

export function CreatePostModal({ onCreated }: CreatePostModalProps) {
  const { isOpen, editingPostId, close } = usePostModal()
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<string[]>([])
  const [contentType, setContentType] = useState<ContentType>('IMAGE')
  const [content, setContent] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [status, setStatus] = useState<PostStatus>('SCHEDULED')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchPlatforms = useCallback(async () => {
    const res = await fetch('/api/platforms')
    const data = await res.json()
    setPlatforms(data.filter((p: Platform & { connected: boolean }) => p.connected))
  }, [])

  const fetchPost = useCallback(async (id: string) => {
    const res = await fetch(`/api/posts/${id}`)
    const post = await res.json()
    setContent(post.content)
    setContentType(post.contentType)
    setStatus(post.status)
    setScheduledAt(post.scheduledAt ? post.scheduledAt.slice(0, 16) : '')
    setHashtags(post.hashtags.join(' '))
    setSelectedPlatformIds(post.platforms.map((pp: any) => pp.platformId))
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchPlatforms()
      if (editingPostId) {
        fetchPost(editingPostId)
      } else {
        // Reset form
        setContent('')
        setContentType('IMAGE')
        setStatus('SCHEDULED')
        setHashtags('')
        setScheduledAt('')
        setSelectedPlatformIds([])
        setError('')
      }
    }
  }, [isOpen, editingPostId, fetchPlatforms, fetchPost])

  const togglePlatform = (id: string) => {
    setSelectedPlatformIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const availableContentTypes = (): ContentType[] => {
    if (selectedPlatformIds.length === 0) return Object.keys(CONTENT_TYPE_LABELS) as ContentType[]
    const types = new Set<ContentType>()
    selectedPlatformIds.forEach(id => {
      const plat = platforms.find(p => p.id === id)
      if (plat) {
        PLATFORM_CONFIGS[plat.type].contentTypes.forEach(t => types.add(t))
      }
    })
    return Array.from(types)
  }

  const charLimit = (): number => {
    if (selectedPlatformIds.length === 0) return 2200
    const limits = selectedPlatformIds.map(id => {
      const plat = platforms.find(p => p.id === id)
      return plat ? PLATFORM_CONFIGS[plat.type].charLimit : 2200
    })
    return Math.min(...limits)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!content.trim()) return setError('Content is required.')
    if (selectedPlatformIds.length === 0) return setError('Select at least one platform.')
    if (status === 'SCHEDULED' && !scheduledAt) return setError('Schedule date is required for scheduled posts.')

    setLoading(true)
    try {
      const body = {
        content: content.trim(),
        contentType,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        hashtags: hashtags.trim()
          ? hashtags.split(/\s+/).map(h => h.startsWith('#') ? h : `#${h}`)
          : [],
        platformIds: selectedPlatformIds,
      }

      const url = editingPostId ? `/api/posts/${editingPostId}` : '/api/posts'
      const method = editingPostId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed to save post')

      close()
      onCreated?.()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const limit = charLimit()
  const remaining = limit - content.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">
            {editingPostId ? 'Edit Post' : 'Create New Post'}
          </h2>
          <button onClick={close} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Platform Selection */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-3">
              Platforms <span className="text-slate-500 font-normal">(select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(platform => {
                const config = PLATFORM_CONFIGS[platform.type]
                const selected = selectedPlatformIds.includes(platform.id)
                return (
                  <button
                    type="button"
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all',
                      selected
                        ? 'border-transparent text-white shadow-lg'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 bg-slate-800/50'
                    )}
                    style={selected ? { backgroundColor: config.color, boxShadow: `0 4px 14px ${config.color}40` } : {}}
                  >
                    {config.icon} {config.name}
                  </button>
                )
              })}
              {platforms.length === 0 && (
                <p className="text-slate-500 text-sm">No connected platforms. <a href="/platforms" className="text-violet-400 hover:underline">Connect one →</a></p>
              )}
            </div>
          </div>

          {/* Content Type */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-3">Content Type</label>
            <div className="flex flex-wrap gap-2">
              {availableContentTypes().map(type => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setContentType(type)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                    contentType === type
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 bg-slate-800/50'
                  )}
                >
                  {CONTENT_TYPE_ICONS[type]} {CONTENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">
              Caption / Content
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your post content here..."
              rows={5}
              className={cn(
                'w-full bg-slate-800 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none transition-colors',
                remaining < 0 ? 'border-red-500' : 'border-slate-700 focus:border-slate-600'
              )}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-slate-500">
                {selectedPlatformIds.length > 0 && `Limit: ${limit.toLocaleString()} chars`}
              </span>
              <span className={cn('text-xs', remaining < 0 ? 'text-red-400' : remaining < 50 ? 'text-amber-400' : 'text-slate-500')}>
                {remaining.toLocaleString()} remaining
              </span>
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <Hash size={14} className="text-slate-400" />
              Hashtags <span className="text-slate-500 font-normal">(space-separated)</span>
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={e => setHashtags(e.target.value)}
              placeholder="#contentcreator #socialmedia #marketing"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-slate-600 transition-colors"
            />
          </div>

          {/* Status and Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as PostStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none cursor-pointer"
              >
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" />
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                disabled={status === 'DRAFT'}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              />
            </div>
          </div>

          {/* Platform Char Limits Reminder */}
          {selectedPlatformIds.length > 1 && (
            <div className="bg-amber-900/20 border border-amber-800/30 rounded-xl p-3">
              <p className="text-amber-300/80 text-xs font-medium mb-1.5">Platform character limits</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {selectedPlatformIds.map(id => {
                  const plat = platforms.find(p => p.id === id)
                  if (!plat) return null
                  const cfg = PLATFORM_CONFIGS[plat.type]
                  const rem = cfg.charLimit - content.length
                  return (
                    <span key={id} className={cn('text-xs', rem < 0 ? 'text-red-400' : 'text-slate-400')}>
                      {cfg.name}: <strong className={rem < 0 ? 'text-red-400' : 'text-slate-300'}>{rem.toLocaleString()}</strong>
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={close}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || remaining < 0}
              className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Send size={15} />
              {loading ? 'Saving...' : editingPostId ? 'Update Post' : status === 'DRAFT' ? 'Save Draft' : 'Schedule Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
