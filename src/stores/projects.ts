import { create } from 'zustand'
import type { Project } from '@/types'
import { projects as initialProjects } from '@/data/mock'

interface ProjectState {
  projects: Project[]
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: initialProjects,

  addProject: (project) => {
    set((state) => ({ projects: [...state.projects, project] }))
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
}))
