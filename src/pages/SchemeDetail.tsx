import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Send, Plus, Trash2, Clock } from 'lucide-react'
import { useSchemeStore } from '@/stores/schemes'
import { useCategoryStore } from '@/stores/categories'
import StatusBadge from '@/components/StatusBadge'
import SeverityTag from '@/components/SeverityTag'
import type { Scheme, FoodItem, RecoveryStage } from '@/types'

const severityLabels: Record<string, string> = { high: '严重', medium: '中等', low: '轻微' }

const frequencyOptions = [
  { value: 'daily', label: '每日' },
  { value: 'every3days', label: '每3天' },
  { value: 'weekly', label: '每周' },
  { value: 'custom', label: '自定义' },
] as const

const emptyScheme: Scheme = {
  id: '',
  name: '',
  categoryId: '',
  prohibitedFoods: [],
  recommendedFoods: [],
  reminderFrequency: 'daily',
  recoveryStages: [],
  specialPopulationNotes: '',
  status: 'draft',
  versions: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export default function SchemeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { schemes, updateScheme, addScheme, publishScheme } = useSchemeStore()
  const { categories } = useCategoryStore()

  const isNew = id === 'new'
  const existing = isNew ? null : schemes.find((s) => s.id === id)

  const [form, setForm] = useState<Scheme>(emptyScheme)
  const [newProhibited, setNewProhibited] = useState<{ name: string; reason: string; severity: 'high' | 'medium' | 'low' }>({ name: '', reason: '', severity: 'high' })
  const [newRecommended, setNewRecommended] = useState({ name: '', reason: '', severity: 'low' as const })
  const [newStage, setNewStage] = useState({ name: '', dayStart: 1, dayEnd: 7, description: '' })

  useEffect(() => {
    if (existing) setForm(existing)
  }, [existing])

  const update = <K extends keyof Scheme>(key: K, value: Scheme[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSaveDraft = () => {
    if (isNew) {
      addScheme({ ...form, id: `sch-${Date.now()}`, status: 'draft' })
    } else {
      updateScheme(form.id, { ...form, status: 'draft' })
    }
    navigate('/schemes')
  }

  const handlePublish = () => {
    if (isNew) {
      const newId = `sch-${Date.now()}`
      addScheme({ ...form, id: newId, status: 'published' })
    } else {
      publishScheme(form.id)
    }
    navigate('/schemes')
  }

  const addProhibitedFood = () => {
    if (!newProhibited.name.trim()) return
    const item: FoodItem = { id: `food-${Date.now()}`, ...newProhibited }
    update('prohibitedFoods', [...form.prohibitedFoods, item])
    setNewProhibited({ name: '', reason: '', severity: 'high' })
  }

  const removeProhibitedFood = (foodId: string) =>
    update('prohibitedFoods', form.prohibitedFoods.filter((f) => f.id !== foodId))

  const addRecommendedFood = () => {
    if (!newRecommended.name.trim()) return
    const item: FoodItem = { id: `rfood-${Date.now()}`, ...newRecommended }
    update('recommendedFoods', [...form.recommendedFoods, item])
    setNewRecommended({ name: '', reason: '', severity: 'low' })
  }

  const removeRecommendedFood = (foodId: string) =>
    update('recommendedFoods', form.recommendedFoods.filter((f) => f.id !== foodId))

  const addStage = () => {
    if (!newStage.name.trim()) return
    const stage: RecoveryStage = {
      id: `stage-${Date.now()}`,
      name: newStage.name,
      dayRange: [newStage.dayStart, newStage.dayEnd],
      description: newStage.description,
      prohibitedFoods: [],
      recommendedFoods: [],
    }
    update('recoveryStages', [...form.recoveryStages, stage])
    setNewStage({ name: '', dayStart: 1, dayEnd: 7, description: '' })
  }

  const removeStage = (stageId: string) =>
    update('recoveryStages', form.recoveryStages.filter((s) => s.id !== stageId))

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/schemes')}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  {isNew ? '新建方案' : form.name || '未命名方案'}
                </h1>
                {!isNew && <StatusBadge status={form.status} />}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Save className="h-4 w-4" />
              保存草稿
            </button>
            <button
              onClick={handlePublish}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0d6a63]"
            >
              <Send className="h-4 w-4" />
              发布方案
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 p-6">
        <div className="w-[60%] space-y-6">
          <section className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">基本信息</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">方案名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                  placeholder="请输入方案名称"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">分类</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => update('categoryId', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                >
                  <option value="">请选择分类</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">禁忌食物</h2>
            <div className="space-y-2">
              {form.prohibitedFoods.map((food) => (
                <div key={food.id} className="flex items-center justify-between rounded-lg bg-red-50/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">{food.name}</span>
                    <SeverityTag severity={food.severity} label={severityLabels[food.severity]} />
                    <span className="text-xs text-gray-400">{food.reason}</span>
                  </div>
                  <button onClick={() => removeProhibitedFood(food.id)} className="text-gray-300 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-end gap-3 rounded-lg border border-dashed border-gray-200 p-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-400">食物名称</label>
                <input
                  value={newProhibited.name}
                  onChange={(e) => setNewProhibited((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0F766E]"
                  placeholder="如：辛辣火锅"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-400">原因</label>
                <input
                  value={newProhibited.reason}
                  onChange={(e) => setNewProhibited((p) => ({ ...p, reason: e.target.value }))}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0F766E]"
                  placeholder="忌口原因"
                />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-xs text-gray-400">严重程度</label>
                <select
                  value={newProhibited.severity}
                  onChange={(e) => setNewProhibited((p) => ({ ...p, severity: e.target.value as 'high' | 'medium' | 'low' }))}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0F766E]"
                >
                  <option value="high">严重</option>
                  <option value="medium">中等</option>
                  <option value="low">轻微</option>
                </select>
              </div>
              <button
                onClick={addProhibitedFood}
                className="rounded-md bg-[#0F766E] px-3 py-2 text-sm text-white hover:bg-[#0d6a63]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">建议食物</h2>
            <div className="space-y-2">
              {form.recommendedFoods.map((food) => (
                <div key={food.id} className="flex items-center justify-between rounded-lg bg-green-50/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">{food.name}</span>
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      建议
                    </span>
                    <span className="text-xs text-gray-400">{food.reason}</span>
                  </div>
                  <button onClick={() => removeRecommendedFood(food.id)} className="text-gray-300 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-end gap-3 rounded-lg border border-dashed border-gray-200 p-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-400">食物名称</label>
                <input
                  value={newRecommended.name}
                  onChange={(e) => setNewRecommended((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0F766E]"
                  placeholder="如：鸡胸肉"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-400">原因</label>
                <input
                  value={newRecommended.reason}
                  onChange={(e) => setNewRecommended((p) => ({ ...p, reason: e.target.value }))}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0F766E]"
                  placeholder="推荐原因"
                />
              </div>
              <button
                onClick={addRecommendedFood}
                className="rounded-md bg-[#0F766E] px-3 py-2 text-sm text-white hover:bg-[#0d6a63]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">提醒频率</h2>
            <div className="flex flex-wrap gap-3">
              {frequencyOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                    form.reminderFrequency === opt.value
                      ? 'border-[#0F766E] bg-[#0F766E]/5 text-[#0F766E]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={opt.value}
                    checked={form.reminderFrequency === opt.value}
                    onChange={() => update('reminderFrequency', opt.value)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {form.reminderFrequency === 'custom' && (
              <input
                type="text"
                value={form.customFrequency ?? ''}
                onChange={(e) => update('customFrequency', e.target.value)}
                placeholder="请输入自定义频率，如：前7天每日提醒，之后每3天"
                className="mt-3 w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
              />
            )}
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">恢复阶段</h2>
            <div className="relative space-y-0">
              {form.recoveryStages.map((stage, idx) => (
                <div key={stage.id} className="relative flex gap-4 pb-6">
                  {idx < form.recoveryStages.length - 1 && (
                    <div className="absolute left-[11px] top-6 h-full w-0.5 bg-[#0F766E]/20" />
                  )}
                  <div className="relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full bg-[#0F766E] flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{idx + 1}</span>
                  </div>
                  <div className="flex-1 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{stage.name}</span>
                        <span className="rounded-full bg-[#D4A853]/10 px-2 py-0.5 text-xs font-medium text-[#D4A853]">
                          第{stage.dayRange[0]}-{stage.dayRange[1]}天
                        </span>
                      </div>
                      <button onClick={() => removeStage(stage.id)} className="text-gray-300 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-end gap-3 rounded-lg border border-dashed border-gray-200 p-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-400">阶段名称</label>
                <input
                  value={newStage.name}
                  onChange={(e) => setNewStage((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0F766E]"
                  placeholder="如：急性恢复期"
                />
              </div>
              <div className="w-20">
                <label className="mb-1 block text-xs text-gray-400">起始天</label>
                <input
                  type="number"
                  value={newStage.dayStart}
                  onChange={(e) => setNewStage((p) => ({ ...p, dayStart: Number(e.target.value) }))}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0F766E]"
                />
              </div>
              <div className="w-20">
                <label className="mb-1 block text-xs text-gray-400">结束天</label>
                <input
                  type="number"
                  value={newStage.dayEnd}
                  onChange={(e) => setNewStage((p) => ({ ...p, dayEnd: Number(e.target.value) }))}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0F766E]"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-400">描述</label>
                <input
                  value={newStage.description}
                  onChange={(e) => setNewStage((p) => ({ ...p, description: e.target.value }))}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0F766E]"
                  placeholder="阶段描述"
                />
              </div>
              <button onClick={addStage} className="rounded-md bg-[#0F766E] px-3 py-2 text-sm text-white hover:bg-[#0d6a63]">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">特殊人群说明</h2>
            <textarea
              value={form.specialPopulationNotes}
              onChange={(e) => update('specialPopulationNotes', e.target.value)}
              rows={4}
              placeholder="请输入特殊人群注意事项，如哺乳期、糖尿病患者等"
              className="w-full resize-none rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
            />
          </section>
        </div>

        <div className="w-[40%] space-y-6">
          <section className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">版本记录</h2>
            {form.versions.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400">暂无版本记录</p>
            ) : (
              <div className="space-y-3">
                {form.versions.map((ver) => (
                  <div key={ver.id} className="rounded-lg border border-gray-50 bg-gray-50/50 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#0F766E]">v{ver.version}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {ver.effectiveTime}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{ver.modifyReason}</p>
                    <p className="mt-1 text-xs text-gray-400">修改人：{ver.modifiedBy}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">小程序预览</h2>
            <div className="mx-auto w-[280px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              <div className="bg-[#0F766E] px-4 py-3 text-center text-xs font-medium text-white">
                术后饮食方案
              </div>
              <div className="p-4">
                <div className="mb-3 rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-sm font-semibold text-gray-900">{form.name || '方案名称'}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {categories.find((c) => c.id === form.categoryId)?.name ?? '未分类'}
                  </p>
                </div>
                <div className="mb-3 rounded-xl bg-white p-3 shadow-sm">
                  <p className="mb-2 text-xs font-semibold text-red-500">禁忌食物</p>
                  <div className="flex flex-wrap gap-1">
                    {form.prohibitedFoods.slice(0, 4).map((f) => (
                      <span key={f.id} className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] text-red-600">
                        {f.name}
                      </span>
                    ))}
                    {form.prohibitedFoods.length > 4 && (
                      <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] text-red-400">
                        +{form.prohibitedFoods.length - 4}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-3 rounded-xl bg-white p-3 shadow-sm">
                  <p className="mb-2 text-xs font-semibold text-green-600">建议食物</p>
                  <div className="flex flex-wrap gap-1">
                    {form.recommendedFoods.slice(0, 4).map((f) => (
                      <span key={f.id} className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] text-green-600">
                        {f.name}
                      </span>
                    ))}
                    {form.recommendedFoods.length > 4 && (
                      <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] text-green-400">
                        +{form.recommendedFoods.length - 4}
                      </span>
                    )}
                  </div>
                </div>
                {form.recoveryStages.length > 0 && (
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="mb-2 text-xs font-semibold text-gray-700">恢复阶段</p>
                    {form.recoveryStages.map((stage) => (
                      <div key={stage.id} className="mb-1.5 flex items-center gap-2 text-[10px]">
                        <span className="rounded bg-[#D4A853]/10 px-1.5 py-0.5 font-medium text-[#D4A853]">
                          第{stage.dayRange[0]}-{stage.dayRange[1]}天
                        </span>
                        <span className="text-gray-600">{stage.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
