import { useState, useMemo } from 'react'
import { TrendingUp, Eye, AlertTriangle, Check, X, Filter, Plus } from 'lucide-react'
import { stores } from '@/data/mock'
import { useSchemeStore } from '@/stores/schemes'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useDashboardStore } from '@/stores/dashboard'
import type { StoreMetrics, OptimizationSuggestion, MonthlyData } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { cn } from '@/lib/utils'

const rankBadge = (i: number) => {
  if (i === 0) return 'bg-amber-400 text-white'
  if (i === 1) return 'bg-gray-300 text-gray-700'
  if (i === 2) return 'bg-amber-700 text-white'
  return 'bg-gray-100 text-gray-500'
}

export default function Dashboard() {
  const { storeMetrics, suggestions, approveSuggestion, rejectSuggestion, addSuggestion } = useDashboardStore()
  const { schemes } = useSchemeStore()
  const [suggestionFilter, setSuggestionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitForm, setSubmitForm] = useState({ storeId: '', relatedSchemeId: '', content: '', submitter: '' })

  const avgActivation = useMemo(() => {
    const sum = storeMetrics.reduce((a, s) => a + s.activationRate, 0)
    return (sum / storeMetrics.length).toFixed(1)
  }, [storeMetrics])

  const avgRead = useMemo(() => {
    const sum = storeMetrics.reduce((a, s) => a + s.readRate, 0)
    return (sum / storeMetrics.length).toFixed(1)
  }, [storeMetrics])

  const totalRisk = useMemo(() => storeMetrics.reduce((a, s) => a + s.riskFeedbackCount, 0), [storeMetrics])

  const trendData = useMemo(() => {
    const months = storeMetrics[0]?.monthlyTrend.map((m) => m.month) ?? []
    return months.map((month, mi) => {
      const items = storeMetrics.map((s) => s.monthlyTrend[mi]).filter(Boolean) as MonthlyData[]
      return {
        month: month.slice(5),
        activationRate: +(items.reduce((a, d) => a + d.activationRate, 0) / items.length).toFixed(1),
        readRate: +(items.reduce((a, d) => a + d.readRate, 0) / items.length).toFixed(1),
        riskFeedbackCount: +(items.reduce((a, d) => a + d.riskFeedbackCount, 0) / items.length).toFixed(1),
      }
    })
  }, [storeMetrics])

  const rankedStores = useMemo(() => [...storeMetrics].sort((a, b) => b.activationRate - a.activationRate), [storeMetrics])

  const handleSubmitSuggestion = () => {
    if (!submitForm.storeId || !submitForm.relatedSchemeId || !submitForm.content || !submitForm.submitter) {
      alert('请填写所有必填项')
      return
    }
    const store = stores.find(s => s.id === submitForm.storeId)
    const scheme = schemes.find(s => s.id === submitForm.relatedSchemeId)
    addSuggestion({
      id: `sug-${Date.now()}`,
      storeId: submitForm.storeId,
      storeName: store?.name ?? '',
      submitter: submitForm.submitter,
      content: submitForm.content,
      relatedSchemeId: submitForm.relatedSchemeId,
      relatedSchemeName: scheme?.name ?? '',
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10)
    })
    setShowSubmitModal(false)
    setSubmitForm({ storeId: '', relatedSchemeId: '', content: '', submitter: '' })
  }

  const filteredSuggestions = useMemo(() => {
    if (suggestionFilter === 'all') return suggestions
    return suggestions.filter((s) => s.status === suggestionFilter)
  }, [suggestions, suggestionFilter])

  const metricCards = [
    { label: '平均启用率', value: avgActivation, unit: '%', icon: TrendingUp, accent: 'text-teal-700', bg: 'from-teal-50 to-white', circle: 'bg-teal-100' },
    { label: '平均阅读率', value: avgRead, unit: '%', icon: Eye, accent: 'text-amber-600', bg: 'from-amber-50 to-white', circle: 'bg-amber-100' },
    { label: '风险反馈总量', value: totalRisk, unit: '', icon: AlertTriangle, accent: 'text-red-600', bg: 'from-red-50 to-white', circle: 'bg-red-100' },
  ]

  const filterTabs = [
    { key: 'all' as const, label: '全部' },
    { key: 'pending' as const, label: '待审核' },
    { key: 'approved' as const, label: '已采纳' },
    { key: 'rejected' as const, label: '已拒绝' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-5">
        {metricCards.map((card) => (
          <div key={card.label} className={cn('rounded-xl border border-gray-100 bg-gradient-to-br p-5 shadow-sm', card.bg)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className={cn('mt-1 text-3xl font-bold', card.accent)}>
                  {card.value}<span className="ml-0.5 text-lg">{card.unit}</span>
                </p>
              </div>
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', card.circle)}>
                <card.icon className={cn('h-6 w-6', card.accent)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">月度趋势</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[60, 100]} unit="%" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 10]} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="activationRate" name="启用率" stroke="#0F766E" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="left" type="monotone" dataKey="readRate" name="阅读率" stroke="#D4A853" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="riskFeedbackCount" name="风险反馈量" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">门店排行</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-400">
                <th className="pb-3 text-left font-medium">排名</th>
                <th className="pb-3 text-left font-medium">门店名称</th>
                <th className="pb-3 text-left font-medium">区域</th>
                <th className="pb-3 text-left font-medium">启用率</th>
                <th className="pb-3 text-left font-medium">阅读率</th>
                <th className="pb-3 text-left font-medium">反馈量</th>
              </tr>
            </thead>
            <tbody>
              {rankedStores.map((store, i) => (
                <tr key={store.storeId} className={cn('border-b border-gray-50', i < 3 && 'bg-amber-50/30')}>
                  <td className="py-3">
                    <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold', rankBadge(i))}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-gray-800">{store.storeName}</td>
                  <td className="py-3 text-gray-500">{store.region}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-teal-600" style={{ width: `${store.activationRate}%` }} />
                      </div>
                      <span className="text-gray-700">{store.activationRate}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: `${store.readRate}%` }} />
                      </div>
                      <span className="text-gray-700">{store.readRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-700">{store.riskFeedbackCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-2 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">优化建议</h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSuggestionFilter(tab.key)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      suggestionFilter === tab.key
                        ? 'bg-teal-700 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowSubmitModal(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F766E]/10 px-3 py-1.5 text-xs font-medium text-[#0F766E] hover:bg-[#0F766E]/20 transition-colors">
                <Plus className="h-3.5 w-3.5" />提交建议
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {filteredSuggestions.map((s) => (
              <div key={s.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{s.storeName}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{s.relatedSchemeName}</span>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-600">{s.content}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{s.submitter} · {s.createdAt.slice(0, 10)}</span>
                  {s.status === 'pending' && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => approveSuggestion(s.id)}
                        className="flex items-center gap-1 rounded-md bg-teal-700 px-2 py-0.5 text-xs text-white hover:bg-teal-800"
                      >
                        <Check className="h-3 w-3" />采纳
                      </button>
                      <button
                        onClick={() => rejectSuggestion(s.id)}
                        className="flex items-center gap-1 rounded-md bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />拒绝
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[500px] rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">提交优化建议</h2>
              <button onClick={() => { setShowSubmitModal(false); setSubmitForm({ storeId: '', relatedSchemeId: '', content: '', submitter: '' }) }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">选择门店</label>
                <select value={submitForm.storeId} onChange={(e) => setSubmitForm(f => ({ ...f, storeId: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]">
                  <option value="">请选择门店</option>
                  {stores.filter(s => s.isActive).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.region})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">关联方案</label>
                <select value={submitForm.relatedSchemeId} onChange={(e) => setSubmitForm(f => ({ ...f, relatedSchemeId: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]">
                  <option value="">请选择方案</option>
                  {schemes.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">顾客追问内容</label>
                <textarea value={submitForm.content} onChange={(e) => setSubmitForm(f => ({ ...f, content: e.target.value }))} rows={4} className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]" placeholder="请详细描述顾客高频追问的问题..." />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">提交人</label>
                <input value={submitForm.submitter} onChange={(e) => setSubmitForm(f => ({ ...f, submitter: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]" placeholder="请输入您的姓名" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setShowSubmitModal(false); setSubmitForm({ storeId: '', relatedSchemeId: '', content: '', submitter: '' }) }} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleSubmitSuggestion} className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d6a63]">提交</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
