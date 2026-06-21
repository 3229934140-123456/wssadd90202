import { create } from 'zustand'
import type { DoctorOrder } from '@/types'
import { doctorOrders as initialOrders } from '@/data/mock'

interface DoctorOrderState {
  orders: DoctorOrder[]
  addOrder: (order: DoctorOrder) => void
  updateOrder: (id: string, updates: Partial<DoctorOrder>) => void
  deleteOrder: (id: string) => void
}

export const useDoctorOrderStore = create<DoctorOrderState>((set) => ({
  orders: initialOrders,

  addOrder: (order) => {
    set((state) => ({ orders: [...state.orders, order] }))
  },

  updateOrder: (id, updates) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
      ),
    }))
  },

  deleteOrder: (id) => {
    set((state) => ({ orders: state.orders.filter((o) => o.id !== id) }))
  },
}))
