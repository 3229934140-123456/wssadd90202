import { create } from 'zustand'
import type { Scheme, SchemeVersion } from '@/types'
import { schemes as initialSchemes } from '@/data/mock'

interface SchemeState {
  schemes: Scheme[]
  addScheme: (scheme: Scheme) => void
  updateScheme: (id: string, updates: Partial<Scheme>) => void
  deleteScheme: (id: string) => void
  publishScheme: (id: string) => void
  archiveScheme: (id: string) => void
  addVersion: (id: string, version: SchemeVersion) => void
}

export const useSchemeStore = create<SchemeState>((set) => ({
  schemes: initialSchemes,

  addScheme: (scheme) => {
    set((state) => ({ schemes: [...state.schemes, scheme] }))
  },

  updateScheme: (id, updates) => {
    set((state) => ({
      schemes: state.schemes.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    }))
  },

  deleteScheme: (id) => {
    set((state) => ({ schemes: state.schemes.filter((s) => s.id !== id) }))
  },

  publishScheme: (id) => {
    set((state) => ({
      schemes: state.schemes.map((s) =>
        s.id === id ? { ...s, status: 'published' as const, updatedAt: new Date().toISOString() } : s
      ),
    }))
  },

  archiveScheme: (id) => {
    set((state) => ({
      schemes: state.schemes.map((s) =>
        s.id === id ? { ...s, status: 'archived' as const, updatedAt: new Date().toISOString() } : s
      ),
    }))
  },

  addVersion: (id, version) => {
    set((state) => ({
      schemes: state.schemes.map((s) =>
        s.id === id
          ? { ...s, versions: [...s.versions, version], updatedAt: new Date().toISOString() }
          : s
      ),
    }))
  },
}))
