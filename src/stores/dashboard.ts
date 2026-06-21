import { create } from 'zustand'
import type { StoreMetrics, OptimizationSuggestion } from '@/types'
import { storeMetrics as initialMetrics, optimizationSuggestions as initialSuggestions } from '@/data/mock'

interface DashboardState {
  storeMetrics: StoreMetrics[]
  suggestions: OptimizationSuggestion[]
  approveSuggestion: (id: string, extra?: { linkedSchemeId?: string; linkedSchemeName?: string; linkedVersion?: number; actionType?: 'todo' | 'update' | 'none' }) => void
  rejectSuggestion: (id: string) => void
  addSuggestion: (suggestion: OptimizationSuggestion) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  storeMetrics: initialMetrics,
  suggestions: initialSuggestions,

  approveSuggestion: (id, extra) => {
    set((state) => ({
      suggestions: state.suggestions.map((s) =>
        s.id === id ? { ...s, status: 'approved' as const, ...extra, processedAt: new Date().toISOString().slice(0, 10) } : s
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

  addSuggestion: (suggestion) => {
    set((state) => ({ suggestions: [suggestion, ...state.suggestions] }))
  },
}))
