import { create } from 'zustand'
import type { Project } from '@/types'
import { projects as initialProjects } from '@/data/mock'

interface ProjectState {
  projects: Project[]
  lastAddedProjectId: string | null
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  clearLastAdded: () => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: initialProjects,
  lastAddedProjectId: null,

  addProject: (project) => {
    set((state) => ({ projects: [...state.projects, project], lastAddedProjectId: project.id }))
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

  clearLastAdded: () => {
    set({ lastAddedProjectId: null })
  },
}))
