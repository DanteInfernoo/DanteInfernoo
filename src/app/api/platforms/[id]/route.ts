import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { connected, username } = body

  const platform = await db.platform.update({
    where: { id: params.id },
    data: {
      ...(connected !== undefined && { connected }),
      ...(username !== undefined && { username }),
    },
  })

  return NextResponse.json({
    ...platform,
    createdAt: platform.createdAt.toISOString(),
  })
}
