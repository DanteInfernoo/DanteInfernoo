import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const include = {
  platforms: {
    include: { platform: true },
  },
}

function serializePost(post: any) {
  return {
    ...post,
    mediaUrls: JSON.parse(post.mediaUrls || '[]'),
    hashtags: JSON.parse(post.hashtags || '[]'),
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    platforms: post.platforms.map((pp: any) => ({
      ...pp,
      platform: {
        ...pp.platform,
        createdAt: pp.platform.createdAt.toISOString(),
      },
    })),
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const platformId = searchParams.get('platformId')
  const contentType = searchParams.get('contentType')

  const where: any = {}
  if (status) where.status = status
  if (contentType) where.contentType = contentType
  if (platformId) {
    where.platforms = { some: { platformId } }
  }

  const posts = await db.post.findMany({
    where,
    include,
    orderBy: { scheduledAt: 'asc' },
  })

  return NextResponse.json(posts.map(serializePost))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { content, contentType, status, scheduledAt, hashtags = [], platformIds = [] } = body

  if (!content || !contentType || !platformIds.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const post = await db.post.create({
    data: {
      content,
      contentType,
      status: status || 'DRAFT',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      hashtags: JSON.stringify(hashtags),
      mediaUrls: '[]',
      platforms: {
        create: platformIds.map((platformId: string) => ({
          platformId,
          status: status === 'PUBLISHED' ? 'PUBLISHED' : 'PENDING',
        })),
      },
    },
    include,
  })

  return NextResponse.json(serializePost(post), { status: 201 })
}
