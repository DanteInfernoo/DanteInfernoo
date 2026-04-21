import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const platforms = await db.platform.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { posts: true } },
    },
  })

  return NextResponse.json(
    platforms.map(p => ({
      ...p,
      postCount: p._count.posts,
      createdAt: p.createdAt.toISOString(),
    }))
  )
}
