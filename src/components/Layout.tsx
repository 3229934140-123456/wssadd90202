import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import Sidebar from '@/components/Sidebar'

const breadcrumbMap: Record<string, string> = {
  '/schemes': '方案库',
  '/categories': '项目分类',
  '/doctor-orders': '医嘱编辑',
  '/distribution': '门店下发',
  '/qa': '问答库',
  '/dashboard': '效果看板',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1279px)')
    setCollapsed(mql.matches)
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const segments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/')
    const label = breadcrumbMap[path] || seg
    return { path, label }
  })

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-300',
          collapsed ? 'ml-16' : 'ml-60'
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <nav className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">首页</span>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.path} className="flex items-center gap-2">
                <span className="text-gray-300">/</span>
                <span className="text-gray-700">{crumb.label}</span>
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
