'use client'

import { useEffect, useState, useCallback } from 'react'
import { CreatePostModal } from '@/components/posts/CreatePostModal'
import { CalendarView } from '@/components/calendar/CalendarView'
import type { Post } from '@/types'

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    const res = await fetch('/api/posts')
    const data = await res.json()
    setPosts(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  return (
    <>
      <CreatePostModal onCreated={fetchPosts} />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            View and manage your entire year of content
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500 animate-pulse">Loading calendar...</div>
          </div>
        ) : (
          <CalendarView posts={posts} onRefresh={fetchPosts} />
        )}
      </div>
    </>
  )
}
