import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  LayoutGrid,
  Stethoscope,
  Send,
  MessageCircleQuestion,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: '方案库', icon: ClipboardList, path: '/schemes' },
  { label: '项目分类', icon: LayoutGrid, path: '/categories' },
  { label: '医嘱编辑', icon: Stethoscope, path: '/doctor-orders' },
  { label: '门店下发', icon: Send, path: '/distribution' },
  { label: '问答库', icon: MessageCircleQuestion, path: '/qa' },
  { label: '效果看板', icon: BarChart3, path: '/dashboard' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className={cn(
        'flex h-16 items-center border-b border-gray-100 px-4',
        collapsed ? 'justify-center' : 'gap-2'
      )}>
        <Stethoscope className="h-6 w-6 shrink-0 text-teal" />
        {!collapsed && (
          <span className="text-lg font-semibold tracking-wide text-teal">
            忌口管家
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-l-[3px] border-gold bg-teal text-white'
                      : 'text-gray-600 hover:bg-teal-50 hover:text-teal',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-100 p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg py-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  )
}
