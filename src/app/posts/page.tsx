'use client'

import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { Search, Filter, Trash2, Pencil, Plus, Clock, Instagram } from 'lucide-react'
import { CreatePostModal } from '@/components/posts/CreatePostModal'
import { usePostModal } from '@/store/usePostModal'
import { PLATFORM_CONFIGS, STATUS_STYLES, CONTENT_TYPE_LABELS, cn } from '@/lib/utils'
import type { Post, PostStatus } from '@/types'

const STATUS_TABS: { label: string; value: PostStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Drafts', value: 'DRAFT' },
  { label: 'Failed', value: 'FAILED' },
]

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<PostStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const open = usePostModal(s => s.open)

  const fetchPosts = useCallback(async () => {
    const url = activeTab !== 'ALL' ? `/api/posts?status=${activeTab}` : '/api/posts'
    const res = await fetch(url)
    const data = await res.json()
    setPosts(data)
    setLoading(false)
  }, [activeTab])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setDeleting(id)
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    await fetchPosts()
    setDeleting(null)
  }

  const filtered = posts.filter(p =>
    search ? p.content.toLowerCase().includes(search.toLowerCase()) : true
  )

  const counts = {
    ALL: posts.length,
    SCHEDULED: posts.filter(p => p.status === 'SCHEDULED').length,
    PUBLISHED: posts.filter(p => p.status === 'PUBLISHED').length,
    DRAFT: posts.filter(p => p.status === 'DRAFT').length,
    FAILED: posts.filter(p => p.status === 'FAILED').length,
  }

  return (
    <>
      <CreatePostModal onCreated={fetchPosts} />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Posts</h1>
            <p className="text-slate-400 text-sm mt-0.5">Manage all your scheduled content</p>
          </div>
          <button
            onClick={() => open()}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus size={16} /> New Post
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab.value
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              {tab.label}
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                activeTab === tab.value ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-500'
              )}>
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-slate-700"
          />
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-slate-500 animate-pulse">Loading posts...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
            <Clock className="mx-auto text-slate-700 mb-4" size={40} />
            <p className="text-slate-400 font-medium">No posts found</p>
            <p className="text-slate-600 text-sm mt-1">
              {search ? 'Try a different search term' : 'Create your first post to get started'}
            </p>
            {!search && (
              <button
                onClick={() => open()}
                className="mt-4 text-violet-400 hover:text-violet-300 text-sm font-medium"
              >
                Create a post →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(post => {
              const statusStyle = STATUS_STYLES[post.status]
              return (
                <div
                  key={post.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    {/* Platform Icons */}
                    <div className="flex gap-1.5 shrink-0 pt-0.5">
                      {post.platforms.slice(0, 3).map(pp => {
                        const cfg = PLATFORM_CONFIGS[pp.platform.type]
                        return (
                          <div
                            key={pp.id}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                            style={{ backgroundColor: `${cfg.color}25`, border: `1px solid ${cfg.color}50` }}
                            title={cfg.name}
                          >
                            {cfg.icon}
                          </div>
                        )
                      })}
                      {post.platforms.length > 3 && (
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] text-slate-500 bg-slate-800 border border-slate-700">
                          +{post.platforms.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle.className}`}>
                          {statusStyle.label}
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                          {CONTENT_TYPE_LABELS[post.contentType]}
                        </span>
                        {post.scheduledAt && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock size={10} />
                            {format(new Date(post.scheduledAt), 'MMM d, yyyy · h:mm a')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{post.content}</p>
                      {post.hashtags.length > 0 && (
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {post.hashtags.slice(0, 5).map(tag => (
                            <span key={tag} className="text-[10px] text-violet-400 bg-violet-900/20 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                          {post.hashtags.length > 5 && (
                            <span className="text-[10px] text-slate-600">+{post.hashtags.length - 5}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => open(post.id)}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        className="p-2 rounded-lg hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
