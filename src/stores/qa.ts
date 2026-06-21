import { create } from 'zustand'
import type { QAItem } from '@/types'
import { qaItems as initialItems } from '@/data/mock'

interface QAState {
  items: QAItem[]
  addQA: (item: QAItem) => void
  updateQA: (id: string, updates: Partial<QAItem>) => void
  deleteQA: (id: string) => void
}

export const useQAStore = create<QAState>((set) => ({
  items: initialItems,

  addQA: (item) => {
    set((state) => ({ items: [...state.items, item] }))
  },

  updateQA: (id, updates) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
      ),
    }))
  },

  deleteQA: (id) => {
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
  },
}))
