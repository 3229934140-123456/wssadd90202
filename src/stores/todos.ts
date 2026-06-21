import { create } from 'zustand'
import type { TodoItem } from '@/types'

interface TodoState {
  todos: TodoItem[]
  addTodo: (todo: TodoItem) => void
  resolveTodo: (id: string, resolvedVersion: number) => void
}

const initialTodos: TodoItem[] = []

export const useTodoStore = create<TodoState>((set) => ({
  todos: initialTodos,

  addTodo: (todo) => {
    set((state) => ({ todos: [...state.todos, todo] }))
  },

  resolveTodo: (id, resolvedVersion) => {
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, status: 'resolved' as const, resolvedVersion, resolvedAt: new Date().toISOString().slice(0, 10) } : t
      ),
    }))
  },
}))
