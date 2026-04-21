export type PlatformType = 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'TIKTOK' | 'LINKEDIN' | 'YOUTUBE' | 'PINTEREST'
export type ContentType = 'IMAGE' | 'CAROUSEL' | 'VIDEO' | 'REEL' | 'STORY' | 'THREAD' | 'ARTICLE' | 'SHORT'
export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED'
export type PostPlatformStatus = 'PENDING' | 'PUBLISHED' | 'FAILED'

export interface Platform {
  id: string
  name: string
  type: PlatformType
  username: string | null
  connected: boolean
  avatar: string | null
  color: string
  followerCount: number
  createdAt: string
}

export interface PostPlatform {
  id: string
  postId: string
  platformId: string
  platform: Platform
  status: PostPlatformStatus
  error: string | null
}

export interface Post {
  id: string
  title: string | null
  content: string
  contentType: ContentType
  status: PostStatus
  scheduledAt: string | null
  publishedAt: string | null
  mediaUrls: string[]
  hashtags: string[]
  platforms: PostPlatform[]
  createdAt: string
  updatedAt: string
}

export interface CreatePostInput {
  content: string
  contentType: ContentType
  status: PostStatus
  scheduledAt?: string | null
  hashtags?: string[]
  platformIds: string[]
}

export interface PlatformConfig {
  type: PlatformType
  name: string
  color: string
  bgColor: string
  textColor: string
  charLimit: number
  contentTypes: ContentType[]
  icon: string
}
