import { create } from 'zustand'
import type { Project } from '@/types'
import { projects as initialProjects } from '@/data/mock'

interface ProjectState {
  projects: Project[]
  lastAddedProjectId: string | null
  consumedPages: Set<string>
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  consumeLastAdded: (pageId: string) => string | null
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: initialProjects,
  lastAddedProjectId: null,
  consumedPages: new Set(),

  addProject: (project) => {
    set((state) => ({ projects: [...state.projects, project], lastAddedProjectId: project.id, consumedPages: new Set() }))
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }))
  },

  deleteProject: (id) => {
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }))
  },

  consumeLastAdded: (pageId) => {
    const state = get()
    if (!state.lastAddedProjectId) return null
    if (state.consumedPages.has(pageId)) return null
    const newConsumed = new Set(state.consumedPages)
    newConsumed.add(pageId)
    set({ consumedPages: newConsumed })
    return state.lastAddedProjectId
  },
}))
