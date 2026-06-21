import { useState } from 'react'
import { Plus, Pencil, Trash2, Sparkles, Syringe, Scissors, Zap, X, Check } from 'lucide-react'
import { useCategoryStore } from '@/stores/categories'
import { projects } from '@/data/mock'
import type { Project } from '@/types'

const iconOptions = [
  { key: 'sparkles', icon: Sparkles, label: '皮肤管理', color: 'text-teal-700', bg: 'bg-teal-100' },
  { key: 'syringe', icon: Syringe, label: '微整注射', color: 'text-gold-500', bg: 'bg-gold-100' },
  { key: 'scissors', icon: Scissors, label: '外科手术', color: 'text-teal-800', bg: 'bg-teal-50' },
  { key: 'zap', icon: Zap, label: '激光光电', color: 'text-gold-600', bg: 'bg-gold-50' },
]

const iconMap: Record<string, (typeof iconOptions)[number]> = {
  sparkles: iconOptions[0],
  syringe: iconOptions[1],
  scissors: iconOptions[2],
  zap: iconOptions[3],
  '💧': iconOptions[0],
  '💉': iconOptions[1],
  '🔪': iconOptions[2],
  '⚡': iconOptions[3],
}

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore()
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('sparkles')
  const [addingProjectId, setAddingProjectId] = useState<string | null>(null)
  const [newProjectName, setNewProjectName] = useState('')

  const getProjectsByCategory = (categoryId: string) =>
    projects.filter((p: Project) => p.categoryId === categoryId)

  const handleAddCategory = () => {
    if (!newName.trim()) return
    addCategory({
      id: `cat-${Date.now()}`,
      name: newName.trim(),
      icon: selectedIcon,
      sortOrder: categories.length + 1,
      projectCount: 0,
    })
    setNewName('')
    setSelectedIcon('sparkles')
    setShowModal(false)
  }

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id)
  }

  const handleAddProject = (categoryId: string) => {
    if (!newProjectName.trim()) return
    const cat = categories.find((c) => c.id === categoryId)
    if (cat) updateCategory(categoryId, { projectCount: cat.projectCount + 1 })
    setNewProjectName('')
    setAddingProjectId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">项目分类</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
        >
          <Plus className="h-4 w-4" />
          新建分类
        </button>
      </div>

      <div className="flex flex-wrap gap-5">
        {categories.map((category) => {
          const iconOpt = iconMap[category.icon] || iconOptions[0]
          const IconComp = iconOpt.icon
          const categoryProjects = getProjectsByCategory(category.id)

          return (
            <div
              key={category.id}
              className="w-[280px] rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconOpt.bg}`}>
                  <IconComp className={`h-5 w-5 ${iconOpt.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 truncate">{category.name}</span>
                    <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal">
                      {categoryProjects.length}项
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {categoryProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm"
                  >
                    <span className="text-gray-700">{project.name}</span>
                    <span className="text-xs text-gray-400">{project.schemeCount}个方案</span>
                  </div>
                ))}
              </div>

              {addingProjectId === category.id ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="项目名称"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-teal"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddProject(category.id)}
                  />
                  <button
                    onClick={() => handleAddProject(category.id)}
                    className="rounded-lg bg-teal p-1.5 text-white transition-colors hover:bg-teal-800"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { setAddingProjectId(null); setNewProjectName('') }}
                    className="rounded-lg bg-gray-100 p-1.5 text-gray-500 transition-colors hover:bg-gray-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingProjectId(category.id)}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 py-1.5 text-xs text-gray-400 transition-colors hover:border-teal hover:text-teal"
                >
                  <Plus className="h-3 w-3" />
                  新建项目
                </button>
              )}

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-teal">
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[400px] rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">新建分类</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">分类名称</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="请输入分类名称"
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">图标选择</label>
                <div className="mt-2 flex gap-3">
                  {iconOptions.map((opt) => {
                    const OptIcon = opt.icon
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setSelectedIcon(opt.key)}
                        className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl border-2 transition-all ${
                          selectedIcon === opt.key
                            ? 'border-teal bg-teal-50 ring-1 ring-teal/30'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <OptIcon className={`h-5 w-5 ${opt.color}`} />
                        <span className="mt-1 text-[10px] text-gray-500">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); setNewName('') }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAddCategory}
                className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
