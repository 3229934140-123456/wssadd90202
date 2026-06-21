import { create } from 'zustand'
import type { StoreDistribution, MiniAppConfig, HolidayReminder } from '@/types'
import { storeDistributions, miniAppConfig } from '@/data/mock'

interface DistributionState {
  distributions: StoreDistribution[]
  miniAppConfig: MiniAppConfig
  distributeScheme: (distribution: StoreDistribution) => void
  updateDistribution: (id: string, updates: Partial<StoreDistribution>) => void
  updateMiniAppConfig: (updates: Partial<MiniAppConfig>) => void
  addHolidayReminder: (reminder: HolidayReminder) => void
  removeHolidayReminder: (id: string) => void
}

export const useDistributionStore = create<DistributionState>((set, get) => ({
  distributions: storeDistributions,
  miniAppConfig: miniAppConfig,

  distributeScheme: (distribution) => {
    set((state) => ({ distributions: [...state.distributions, distribution] }))
  },

  updateDistribution: (id, updates) => {
    set((state) => ({
      distributions: state.distributions.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    }))
  },

  updateMiniAppConfig: (updates) => {
    set((state) => ({ miniAppConfig: { ...state.miniAppConfig, ...updates } }))
  },

  addHolidayReminder: (reminder) => {
    set((state) => ({
      miniAppConfig: {
        ...state.miniAppConfig,
        holidayReminders: [...state.miniAppConfig.holidayReminders, reminder],
      },
    }))
  },

  removeHolidayReminder: (id) => {
    set((state) => ({
      miniAppConfig: {
        ...state.miniAppConfig,
        holidayReminders: state.miniAppConfig.holidayReminders.filter((r) => r.id !== id),
      },
    }))
  },
}))
