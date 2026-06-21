import { create } from 'zustand'
import type { Category } from '@/types'
import { categories as initialCategories } from '@/data/mock'

interface CategoryState {
  categories: Category[]
  addCategory: (category: Category) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  reorderCategories: (reordered: Category[]) => void
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: initialCategories,

  addCategory: (category) => {
    set((state) => ({ categories: [...state.categories, category] }))
  },

  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }))
  },

  deleteCategory: (id) => {
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }))
  },

  reorderCategories: (reordered) => {
    set({ categories: reordered.map((c, index) => ({ ...c, sortOrder: index })) })
  },
}))
