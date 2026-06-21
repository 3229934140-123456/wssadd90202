import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check, User, Tag } from 'lucide-react'
import { useDoctorOrderStore } from '@/stores/doctorOrders'
import { useProjectStore } from '@/stores/projects'
import { categories } from '@/data/mock'
import { cn } from '@/lib/utils'
import type { DoctorOrder } from '@/types'

const tagColorMap: Record<string, string> = {
  red: 'bg-red-50 text-red-700 border border-red-200',
  orange: 'bg-orange-50 text-orange-700 border border-orange-200',
  teal: 'bg-teal-50 text-teal-700 border border-teal-200',
  amber: 'bg-amber-50 text-amber-700 border border-amber-200',
}

function getTagColor(tag: string): string {
  const t = tag.toLowerCase()
  if (/硬质|禁止|严禁|避开/.test(t)) return tagColorMap.red
  if (/过烫|热|按摩|揉搓|桑拿/.test(t)) return tagColorMap.orange
  if (/补水|保湿|修复|抬高/.test(t)) return tagColorMap.teal
  return tagColorMap.amber
}

function getInitials(name: string) {
  return name.charAt(0)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

interface OrderForm {
  doctorName: string
  tags: string[]
  tagInput: string
  content: string
}

const emptyForm: OrderForm = { doctorName: '', tags: [], tagInput: '', content: '' }

export default function DoctorOrders() {
  const { orders, addOrder, updateOrder, deleteOrder } = useDoctorOrderStore()
  const { projects, lastAddedProjectId, clearLastAdded } = useProjectStore()
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id ?? '')
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<OrderForm>(emptyForm)

  useEffect(() => {
    if (lastAddedProjectId && projects.some(p => p.id === lastAddedProjectId)) {
      setSelectedProjectId(lastAddedProjectId)
      clearLastAdded()
    }
  }, [lastAddedProjectId, projects, clearLastAdded])

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const projectOrders = useMemo(
    () => orders.filter((o) => o.projectId === selectedProjectId),
    [orders, selectedProjectId]
  )

  const orderCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    orders.forEach((o) => {
      map[o.projectId] = (map[o.projectId] || 0) + 1
    })
    return map
  }, [orders])

  const handleAddTag = () => {
    const val = form.tagInput.trim()
    if (val && !form.tags.includes(val)) {
      setForm((f) => ({ ...f, tags: [...f.tags, ...val.split(',').map((t) => t.trim()).filter(Boolean)], tagInput: '' }))
    }
  }

  const handleRemoveTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddTag() }
  }

  const openAddForm = () => {
    setForm(emptyForm)
    setEditingOrderId(null)
    setShowForm(true)
  }

  const openEditForm = (order: DoctorOrder) => {
    setForm({ doctorName: order.doctorName, tags: [...order.tags], tagInput: '', content: order.content })
    setEditingOrderId(order.id)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.doctorName.trim() || !form.content.trim()) return
    const now = new Date().toISOString()
    if (editingOrderId) {
      updateOrder(editingOrderId, { doctorName: form.doctorName.trim(), tags: form.tags, content: form.content.trim() })
    } else {
      addOrder({
        id: `order-${Date.now()}`,
        projectId: selectedProjectId,
        projectName: selectedProject?.name ?? '',
        doctorName: form.doctorName.trim(),
        tags: form.tags,
        content: form.content.trim(),
        createdAt: now,
        updatedAt: now,
      })
    }
    setShowForm(false)
    setForm(emptyForm)
    setEditingOrderId(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setForm(emptyForm)
    setEditingOrderId(null)
  }

  return (
    <div className="flex h-full bg-[#F8FAFB]">
      <aside className="w-[250px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">项目列表</h2>
        </div>
        <nav className="py-2">
          {categories.map((cat) => (
            <div key={cat.id}>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {cat.icon} {cat.name}
              </div>
              {projects
                .filter((p) => p.categoryId === cat.id)
                .map((proj) => {
                  const count = orderCountMap[proj.id] || 0
                  const isActive = proj.id === selectedProjectId
                  return (
                    <button
                      key={proj.id}
                      onClick={() => { setSelectedProjectId(proj.id); setShowForm(false) }}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors',
                        isActive
                          ? 'bg-teal-50 border-l-[3px] border-[#0F766E] text-[#0F766E] font-medium'
                          : 'text-gray-600 hover:bg-gray-50 border-l-[3px] border-transparent'
                      )}
                    >
                      <span className="truncate">{proj.name}</span>
                      {count > 0 && (
                        <span className={cn(
                          'ml-2 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-medium px-1.5',
                          isActive ? 'bg-[#0F766E] text-white' : 'bg-gray-200 text-gray-600'
                        )}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{selectedProject?.name ?? '选择项目'}</h1>
            <p className="text-sm text-gray-500 mt-0.5">共 {projectOrders.length} 条医嘱</p>
          </div>
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] text-white text-sm font-medium rounded-lg hover:bg-[#0D6A62] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            添加医嘱
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              {editingOrderId ? '编辑医嘱' : '新增医嘱'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-3.5 h-3.5 inline mr-1" />医生姓名
                </label>
                <input
                  value={form.doctorName}
                  onChange={(e) => setForm((f) => ({ ...f, doctorName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E]"
                  placeholder="请输入医生姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag className="w-3.5 h-3.5 inline mr-1" />标签
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0F766E]/10 text-[#0F766E] rounded-full text-xs font-medium">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <input
                  value={form.tagInput}
                  onChange={(e) => setForm((f) => ({ ...f, tagInput: e.target.value }))}
                  onKeyDown={handleTagKeyDown}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E]"
                  placeholder="输入标签，回车添加（逗号分隔）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">医嘱内容</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] resize-y"
                  placeholder="请输入医嘱内容"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0F766E] text-white text-sm font-medium rounded-lg hover:bg-[#0D6A62] transition-colors"
                >
                  <Check className="w-4 h-4" />保存
                </button>
                <button
                  onClick={handleCancel}
                  className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {projectOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0F766E] flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-semibold">{getInitials(order.doctorName)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-900">{order.doctorName}</span>
                  </div>
                  {order.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {order.tags.map((tag) => (
                        <span key={tag} className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', getTagColor(tag))}>
                          {order.projectName}-{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    className="text-sm text-gray-700 leading-relaxed mb-3"
                    dangerouslySetInnerHTML={{ __html: order.content.replace(/\n/g, '<br/>') }}
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#0F766E] hover:bg-teal-50 rounded-md transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />编辑
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {projectOrders.length === 0 && !showForm && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">暂无医嘱，点击"添加医嘱"创建</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
