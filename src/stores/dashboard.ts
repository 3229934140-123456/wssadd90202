import { create } from 'zustand'
import type { StoreMetrics, OptimizationSuggestion } from '@/types'
import { storeMetrics as initialMetrics, optimizationSuggestions as initialSuggestions } from '@/data/mock'

interface DashboardState {
  storeMetrics: StoreMetrics[]
  suggestions: OptimizationSuggestion[]
  approveSuggestion: (id: string) => void
  rejectSuggestion: (id: string) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  storeMetrics: initialMetrics,
  suggestions: initialSuggestions,

  approveSuggestion: (id) => {
    set((state) => ({
      suggestions: state.suggestions.map((s) =>
        s.id === id ? { ...s, status: 'approved' as const } : s
      ),
    }))
  },

  rejectSuggestion: (id) => {
    set((state) => ({
      suggestions: state.suggestions.map((s) =>
        s.id === id ? { ...s, status: 'rejected' as const } : s
      ),
    }))
  },
}))
