import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { PlatformType, ContentType, PostStatus, PlatformConfig } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PLATFORM_CONFIGS: Record<PlatformType, PlatformConfig> = {
  INSTAGRAM: {
    type: 'INSTAGRAM',
    name: 'Instagram',
    color: '#E1306C',
    bgColor: 'bg-pink-500',
    textColor: 'text-pink-400',
    charLimit: 2200,
    contentTypes: ['IMAGE', 'CAROUSEL', 'REEL', 'STORY', 'VIDEO'],
    icon: '📸',
  },
  FACEBOOK: {
    type: 'FACEBOOK',
    name: 'Facebook',
    color: '#1877F2',
    bgColor: 'bg-blue-600',
    textColor: 'text-blue-400',
    charLimit: 63206,
    contentTypes: ['IMAGE', 'VIDEO', 'STORY', 'CAROUSEL'],
    icon: '👍',
  },
  TWITTER: {
    type: 'TWITTER',
    name: 'Twitter / X',
    color: '#1DA1F2',
    bgColor: 'bg-sky-500',
    textColor: 'text-sky-400',
    charLimit: 280,
    contentTypes: ['IMAGE', 'VIDEO', 'THREAD'],
    icon: '🐦',
  },
  TIKTOK: {
    type: 'TIKTOK',
    name: 'TikTok',
    color: '#69C9D0',
    bgColor: 'bg-teal-400',
    textColor: 'text-teal-400',
    charLimit: 2200,
    contentTypes: ['VIDEO', 'REEL'],
    icon: '🎵',
  },
  LINKEDIN: {
    type: 'LINKEDIN',
    name: 'LinkedIn',
    color: '#0A66C2',
    bgColor: 'bg-blue-700',
    textColor: 'text-blue-300',
    charLimit: 3000,
    contentTypes: ['IMAGE', 'VIDEO', 'ARTICLE', 'CAROUSEL'],
    icon: '💼',
  },
  YOUTUBE: {
    type: 'YOUTUBE',
    name: 'YouTube',
    color: '#FF0000',
    bgColor: 'bg-red-600',
    textColor: 'text-red-400',
    charLimit: 5000,
    contentTypes: ['VIDEO', 'SHORT'],
    icon: '▶️',
  },
  PINTEREST: {
    type: 'PINTEREST',
    name: 'Pinterest',
    color: '#E60023',
    bgColor: 'bg-red-500',
    textColor: 'text-red-400',
    charLimit: 500,
    contentTypes: ['IMAGE', 'VIDEO'],
    icon: '📌',
  },
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  IMAGE: 'Image Post',
  CAROUSEL: 'Carousel',
  VIDEO: 'Video',
  REEL: 'Reel',
  STORY: 'Story',
  THREAD: 'Thread',
  ARTICLE: 'Article',
  SHORT: 'Short',
}

export const STATUS_STYLES: Record<PostStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-slate-700 text-slate-300' },
  SCHEDULED: { label: 'Scheduled', className: 'bg-violet-900/50 text-violet-300' },
  PUBLISHED: { label: 'Published', className: 'bg-emerald-900/50 text-emerald-300' },
  FAILED: { label: 'Failed', className: 'bg-red-900/50 text-red-300' },
}

export function formatScheduledTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  if (days === 1) return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  if (days === -1) return 'Yesterday'
  if (days < 0) return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function getPlatformConfig(type: PlatformType): PlatformConfig {
  return PLATFORM_CONFIGS[type]
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
