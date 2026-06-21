import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useSchemeStore } from '@/stores/schemes'
import { useCategoryStore } from '@/stores/categories'
import StatusBadge from '@/components/StatusBadge'

const categoryColors: Record<string, string> = {
  'cat-1': 'bg-teal-500',
  'cat-2': 'bg-blue-500',
  'cat-3': 'bg-purple-500',
  'cat-4': 'bg-amber-500',
}

const frequencyLabels: Record<string, string> = {
  daily: '每日',
  every3days: '每3天',
  weekly: '每週',
  custom: '自定义',
}

export default function Schemes() {
  const navigate = useNavigate()
  const { schemes } = useSchemeStore()
  const { categories } = useCategoryStore()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const categoryTabs = [
    { id: 'all', name: '全部' },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ]

  const filtered = schemes.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = activeCategory === 'all' || s.categoryId === activeCategory
    return matchSearch && matchCategory
  })

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? ''

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">方案库</h1>
        <p className="mt-1 text-sm text-gray-500">管理术后饮食方案，维护禁忌与建议食物清单</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索方案名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
          />
        </div>
        <button
          onClick={() => navigate('/schemes/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0d6a63]"
        >
          <Plus className="h-4 w-4" />
          新建方案
        </button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === tab.id
                ? 'bg-[#0F766E] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20">
          <Search className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-400">暂无匹配的方案</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((scheme) => (
            <div
              key={scheme.id}
              onClick={() => navigate(`/schemes/${scheme.id}`)}
              className="group cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md hover:border-[#0F766E]/20"
            >
              <div className={`h-1.5 ${categoryColors[scheme.categoryId] ?? 'bg-gray-400'}`} />
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#0F766E] transition-colors line-clamp-1">
                    {scheme.name}
                  </h3>
                  <StatusBadge status={scheme.status} />
                </div>

                <p className="mb-4 text-xs text-gray-400">{getCategoryName(scheme.categoryId)}</p>

                <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                    禁忌{scheme.prohibitedFoods.length}项
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    建议{scheme.recommendedFoods.length}项
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(scheme.updatedAt)}
                  </span>
                  <span className="rounded-full bg-[#0F766E]/10 px-2.5 py-0.5 text-xs font-medium text-[#0F766E]">
                    {frequencyLabels[scheme.reminderFrequency]}
                    {scheme.reminderFrequency === 'custom' && scheme.customFrequency
                      ? `(${scheme.customFrequency})`
                      : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
