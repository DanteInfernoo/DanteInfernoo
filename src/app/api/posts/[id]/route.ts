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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = await db.post.findUnique({ where: { id: params.id }, include })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(serializePost(post))
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { content, contentType, status, scheduledAt, hashtags, platformIds } = body

  const data: any = {}
  if (content !== undefined) data.content = content
  if (contentType !== undefined) data.contentType = contentType
  if (status !== undefined) data.status = status
  if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null
  if (hashtags !== undefined) data.hashtags = JSON.stringify(hashtags)

  if (platformIds !== undefined) {
    await db.postPlatform.deleteMany({ where: { postId: params.id } })
    data.platforms = {
      create: platformIds.map((platformId: string) => ({
        platformId,
        status: 'PENDING',
      })),
    }
  }

  const post = await db.post.update({
    where: { id: params.id },
    data,
    include,
  })

  return NextResponse.json(serializePost(post))
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.post.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
