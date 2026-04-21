'use client'

import { create } from 'zustand'

interface PostModalStore {
  isOpen: boolean
  editingPostId: string | null
  open: (postId?: string) => void
  close: () => void
}

export const usePostModal = create<PostModalStore>((set) => ({
  isOpen: false,
  editingPostId: null,
  open: (postId) => set({ isOpen: true, editingPostId: postId ?? null }),
  close: () => set({ isOpen: false, editingPostId: null }),
}))
