import { useState, useMemo } from 'react'
import { TrendingUp, Eye, AlertTriangle, Check, X, Filter, Plus, Download } from 'lucide-react'
import { stores } from '@/data/mock'
import { useSchemeStore } from '@/stores/schemes'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useDashboardStore } from '@/stores/dashboard'
import { useTodoStore } from '@/stores/todos'
import { useDistributionStore } from '@/stores/distribution'
import type { StoreMetrics, OptimizationSuggestion, MonthlyData } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { cn } from '@/lib/utils'
import type { SchemeTodo } from '@/types'
import { useNavigate } from 'react-router-dom'
import { ListTodo, ExternalLink, ArrowRight } from 'lucide-react'

const rankBadge = (i: number) => {
  if (i === 0) return 'bg-amber-400 text-white'
  if (i === 1) return 'bg-gray-300 text-gray-700'
  if (i === 2) return 'bg-amber-700 text-white'
  return 'bg-gray-100 text-gray-500'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { todos, addTodo, resolveTodo } = useTodoStore()
  const { storeMetrics, suggestions, approveSuggestion, rejectSuggestion, addSuggestion } = useDashboardStore()
  const { schemes } = useSchemeStore()
  const { distributions: allDistributions } = useDistributionStore()
  const [suggestionFilter, setSuggestionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitForm, setSubmitForm] = useState({ storeId: '', relatedSchemeId: '', content: '', submitter: '' })
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [approveForm, setApproveForm] = useState({ actionType: 'none' as 'todo' | 'update' | 'none', linkedSchemeId: '', linkedVersion: 0 })
  const [activeView, setActiveView] = useState<'overview' | 'ledger'>('overview')
  const [ledgerFilter, setLedgerFilter] = useState({ store: '', scheme: '', actionType: '' as '' | 'todo' | 'update' | 'none' | 'rejected', status: '' as '' | 'approved' | 'rejected' })
  const [viewingSuggestionId, setViewingSuggestionId] = useState<string | null>(null)

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

  const handleExport = () => {
    const processed = suggestions.filter(s => s.status !== 'pending')
    const filtered = processed.filter(s => {
      if (ledgerFilter.store && s.storeName !== ledgerFilter.store) return false
      if (ledgerFilter.scheme && s.relatedSchemeName !== ledgerFilter.scheme && s.linkedSchemeName !== ledgerFilter.scheme) return false
      if (ledgerFilter.actionType === 'rejected' && s.status !== 'rejected') return false
      if (ledgerFilter.actionType && ledgerFilter.actionType !== 'rejected' && s.actionType !== ledgerFilter.actionType) return false
      if (ledgerFilter.status && s.status !== ledgerFilter.status) return false
      return true
    })
    const header = '门店,建议内容,关联方案,处理方式,结果,处理时间,落地版本'
    const rows = filtered.map(s => {
      const actionLabel = s.status === 'rejected' ? '已拒绝' : s.actionType === 'todo' ? '生成待办' : s.actionType === 'update' ? '关联版本' : '标记采纳'
      const version = s.linkedVersion ? `v${s.linkedVersion}` : '-'
      return `"${s.storeName}","${s.content.replace(/"/g, '""')}","${s.linkedSchemeName || s.relatedSchemeName}","${actionLabel}","${s.status === 'approved' ? '已采纳' : '已拒绝'}","${s.processedAt || s.createdAt}","${version}"`
    })
    const csv = '\uFEFF' + header + '\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `审核台账_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
<div className="flex items-center gap-4 border-b border-gray-100 pb-3 mb-2">
  <h1 className="text-2xl font-bold text-gray-900">效果看板</h1>
  <div className="ml-4 flex gap-1 rounded-lg bg-gray-100 p-1">
    <button onClick={() => setActiveView('overview')} className={cn('rounded-md px-4 py-1.5 text-sm font-medium transition-colors', activeView === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>数据概览</button>
    <button onClick={() => setActiveView('ledger')} className={cn('rounded-md px-4 py-1.5 text-sm font-medium transition-colors', activeView === 'ledger' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
      审核台账
      <Filter className="ml-1.5 inline h-3.5 w-3.5 opacity-60" />
    </button>
  </div>
</div>
{activeView === 'overview' && (
<>
<div className="mb-2">
  <h1 className="text-2xl font-bold text-gray-900">效果看板</h1>
  <p className="mt-1 text-sm text-gray-500">查看各门店启用率、阅读率与风险反馈趋势</p>
</div>
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

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-7 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
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

        <div className="col-span-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-[#0F766E]" />
              方案待办
              {todos.filter(t => t.status !== 'resolved').length > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{todos.filter(t => t.status !== 'resolved').length}</span>
              )}
            </h2>
          </div>
          <div className="space-y-3">
            {todos.length === 0 && <p className="py-6 text-center text-xs text-gray-400">暂无待办事项</p>}
            {todos.map((t) => {
              const resolved = t.status === 'resolved'
              return (
                <div key={t.id} className={cn('rounded-lg border p-3.5', resolved ? 'border-gray-100 bg-gray-50/30' : 'border-[#D4A853]/30 bg-[#D4A853]/5')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('rounded px-2 py-0.5 text-[10px] font-medium', resolved ? 'bg-gray-200 text-gray-600' : 'bg-[#D4A853]/20 text-[#9a7a3a]')}>
                          {resolved ? '已完成' : '待处理'}
                        </span>
                        <span className="text-xs font-medium text-gray-700 truncate">{t.schemeName}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{t.suggestionContent}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-gray-400">
                        <span>{t.storeName} · 提交</span>
                        <span>·</span>
                        <span>{t.createdAt}</span>
                        {resolved && t.resolvedVersion && (<><span>·</span><span className="text-[#0F766E]">已落到 v{t.resolvedVersion}</span></>)}
                      </div>
                    </div>
                    {!resolved && (
                      <button onClick={() => navigate(`/schemes/${t.schemeId}?todoId=${t.id}&suggestionId=${t.suggestionId}`)} className="shrink-0 inline-flex items-center gap-1 rounded-md bg-[#0F766E] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#0d6a63]">
                        <ExternalLink className="h-3 w-3" />处理
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="col-span-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
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
                  <div className="flex items-center gap-2">
                    <StatusBadge status={s.status} />
                    {s.status === 'approved' && s.linkedSchemeName && (
                      <span className="rounded bg-[#0F766E]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0F766E]">
                        → {s.linkedSchemeName}{s.linkedVersion ? ` v${s.linkedVersion}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-600">{s.content}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{s.submitter} · {s.createdAt.slice(0, 10)}</span>
                  {s.status === 'pending' && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { setApprovingId(s.id); setShowApproveModal(true); setApproveForm({ actionType: 'none', linkedSchemeId: s.relatedSchemeId, linkedVersion: 0 }) }}
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
</>
)}
{activeView === 'ledger' && (
<div className="space-y-5">
  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">门店</label>
        <select value={ledgerFilter.store} onChange={(e) => setLedgerFilter(f => ({ ...f, store: e.target.value }))} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-[#0F766E]">
          <option value="">全部门店</option>
          {stores.filter(s => s.isActive).map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">方案</label>
        <select value={ledgerFilter.scheme} onChange={(e) => setLedgerFilter(f => ({ ...f, scheme: e.target.value }))} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-[#0F766E]">
          <option value="">全部方案</option>
          {schemes.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">处理方式</label>
        <select value={ledgerFilter.actionType} onChange={(e) => setLedgerFilter(f => ({ ...f, actionType: e.target.value as any }))} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-[#0F766E]">
          <option value="">全部</option>
          <option value="todo">生成方案待办</option>
          <option value="update">关联方案版本</option>
          <option value="none">仅标记采纳</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">状态</label>
        <select value={ledgerFilter.status} onChange={(e) => setLedgerFilter(f => ({ ...f, status: e.target.value as any }))} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-[#0F766E]">
          <option value="">全部</option>
          <option value="approved">已采纳</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>
    </div>
  </div>

  <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
    <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-800">审核记录</h3>
      <button onClick={handleExport} className="inline-flex items-center gap-1.5 rounded-md bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
        <Download className="h-3.5 w-3.5" />导出
      </button>
    </div>
    <table className="w-full text-xs">
      <thead>
        <tr className="bg-gray-50/80 text-gray-400">
          <th className="px-5 py-3 text-left font-medium">门店</th>
          <th className="px-5 py-3 text-left font-medium">建议内容</th>
          <th className="px-5 py-3 text-left font-medium">关联方案</th>
          <th className="px-5 py-3 text-left font-medium">处理方式</th>
          <th className="px-5 py-3 text-left font-medium">结果</th>
          <th className="px-5 py-3 text-left font-medium">处理时间</th>
          <th className="px-5 py-3 text-left font-medium">操作</th>
        </tr>
      </thead>
      <tbody>
        {(() => {
          const processed = suggestions.filter(s => s.status !== 'pending')
          const filtered = processed.filter(s => {
            if (ledgerFilter.store && s.storeName !== ledgerFilter.store) return false
            if (ledgerFilter.scheme && s.relatedSchemeName !== ledgerFilter.scheme && s.linkedSchemeName !== ledgerFilter.scheme) return false
            if (ledgerFilter.actionType === 'rejected' && s.status !== 'rejected') return false
            if (ledgerFilter.actionType && ledgerFilter.actionType !== 'rejected' && s.actionType !== ledgerFilter.actionType) return false
            if (ledgerFilter.status && s.status !== ledgerFilter.status) return false
            return true
          })
          if (filtered.length === 0) {
            return <tr><td colSpan={7} className="px-5 py-10 text-center text-xs text-gray-400">暂无审核记录</td></tr>
          }
          return filtered.map(s => {
            const actionLabel = s.status === 'rejected' ? '已拒绝' : s.actionType === 'todo' ? '生成待办' : s.actionType === 'update' ? '关联版本' : '标记采纳'
            const actionColor = s.status === 'rejected' ? 'bg-red-50 text-red-600' : s.actionType === 'todo' ? 'bg-[#D4A853]/10 text-[#9a7a3a]' : s.actionType === 'update' ? 'bg-[#0F766E]/10 text-[#0F766E]' : 'bg-gray-100 text-gray-600'
            return (
              <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3">
                  <span className="font-medium text-gray-800">{s.storeName}</span>
                </td>
                <td className="px-5 py-3 max-w-[280px]">
                  <p className="line-clamp-2 text-gray-600">{s.content}</p>
                </td>
                <td className="px-5 py-3">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">{s.linkedSchemeName || s.relatedSchemeName}</span>
                  {s.linkedVersion && <span className="ml-1 text-[10px] font-medium text-[#0F766E]">v{s.linkedVersion}</span>}
                </td>
                <td className="px-5 py-3">
                  <span className={cn('rounded px-2 py-0.5 text-[10px] font-medium', actionColor)}>{actionLabel}</span>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {s.processedAt || s.createdAt}
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => setViewingSuggestionId(s.id)} className="font-medium text-[#0F766E] hover:underline">查看链路</button>
                </td>
              </tr>
            )
          })
        })()}
      </tbody>
    </table>
  </div>
</div>
)}

      {showApproveModal && approvingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[480px] rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">采纳建议</h2>
              <button onClick={() => { setShowApproveModal(false); setApprovingId(null) }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">处理方式</label>
                <div className="flex gap-3">
                  {([['none', '仅标记采纳'], ['todo', '生成方案待办'], ['update', '关联方案版本']] as const).map(([val, label]) => (
                    <label key={val} className={cn('flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm transition-colors', approveForm.actionType === val ? 'border-[#0F766E] bg-[#0F766E]/5 text-[#0F766E]' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      <input type="radio" name="actionType" value={val} checked={approveForm.actionType === val} onChange={() => setApproveForm(f => ({ ...f, actionType: val }))} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              {(approveForm.actionType === 'todo' || approveForm.actionType === 'update') && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">关联方案</label>
                  <select value={approveForm.linkedSchemeId} onChange={(e) => setApproveForm(f => ({ ...f, linkedSchemeId: e.target.value, linkedVersion: 0 }))} className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]">
                    <option value="">请选择方案</option>
                    {schemes.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {approveForm.actionType === 'update' && approveForm.linkedSchemeId && (() => {
                const scheme = schemes.find(s => s.id === approveForm.linkedSchemeId)
                return scheme && scheme.versions.length > 0 ? (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500">关联版本</label>
                    <select value={approveForm.linkedVersion} onChange={(e) => setApproveForm(f => ({ ...f, linkedVersion: Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]">
                      <option value={0}>请选择版本</option>
                      {scheme.versions.map(v => (
                        <option key={v.id} value={v.version}>v{v.version} - {v.modifyReason.slice(0, 20)}</option>
                      ))}
                    </select>
                  </div>
                ) : null
              })()}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setShowApproveModal(false); setApprovingId(null) }} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={() => {
                if (approveForm.actionType === 'todo' && !approveForm.linkedSchemeId) {
                  alert('请选择关联方案后再确认')
                  return
                }
                if (approveForm.actionType === 'update' && (!approveForm.linkedSchemeId || !approveForm.linkedVersion)) {
                  alert('请选择关联方案和版本后再确认')
                  return
                }
                const extra: Record<string, unknown> = { actionType: approveForm.actionType }
                if (approveForm.actionType !== 'none') {
                  const scheme = schemes.find(s => s.id === approveForm.linkedSchemeId)
                  extra.linkedSchemeId = approveForm.linkedSchemeId
                  extra.linkedSchemeName = scheme?.name ?? ''
                  extra.linkedVersion = approveForm.linkedVersion || undefined
                  if (approveForm.actionType === 'todo' && approveForm.linkedSchemeId) {
                    const suggestion = suggestions.find(s => s.id === approvingId)
                    const schemeMatch = schemes.find(s => s.id === approveForm.linkedSchemeId)
                    addTodo({
                      id: `todo-${Date.now()}`,
                      suggestionId: approvingId!,
                      storeName: suggestion?.storeName ?? '',
                      storeId: suggestion?.storeId ?? '',
                      suggestionContent: suggestion?.content ?? '',
                      schemeId: approveForm.linkedSchemeId,
                      schemeName: schemeMatch?.name ?? '',
                      status: 'pending',
                      createdBy: '运营管理员',
                      createdAt: new Date().toISOString().slice(0, 10),
                    })
                  }
                }
                approveSuggestion(approvingId, extra as any)
                setShowApproveModal(false)
                setApprovingId(null)
              }} className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d6a63]">确认采纳</button>
            </div>
          </div>
        </div>
      )}
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
{viewingSuggestionId && (() => {
  const suggestion = suggestions.find(s => s.id === viewingSuggestionId)
  const todo = useTodoStore.getState().todos.find(t => t.suggestionId === viewingSuggestionId)
  const scheme = suggestion?.linkedSchemeId ? schemes.find(s => s.id === suggestion.linkedSchemeId) : null
  const linkedVersionObj = scheme && suggestion?.linkedVersion ? scheme.versions.find(v => v.version === suggestion.linkedVersion) : null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[560px] rounded-xl bg-white p-6 shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">处理链路追踪</h2>
          <button onClick={() => setViewingSuggestionId(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-0">
          <div className="relative flex gap-4 pb-5">
            <div className="absolute left-[11px] top-6 h-full w-0.5 bg-[#0F766E]/20" />
            <div className="relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">1</span>
            </div>
            <div className="flex-1 rounded-lg border border-gray-100 bg-blue-50/30 p-3">
              <p className="text-[10px] font-semibold text-blue-600 mb-1">门店提交建议</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-800">{suggestion?.storeName}</span>
                <span className="text-[10px] text-gray-400">{suggestion?.submitter} · {suggestion?.createdAt}</span>
              </div>
              <p className="text-xs text-gray-600">{suggestion?.content}</p>
            </div>
          </div>

          <div className="relative flex gap-4 pb-5">
            <div className="absolute left-[11px] top-6 h-full w-0.5 bg-[#0F766E]/20" />
            <div className="relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full bg-[#D4A853] flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">2</span>
            </div>
            <div className="flex-1 rounded-lg border border-gray-100 bg-[#D4A853]/5 p-3">
              <p className="text-[10px] font-semibold text-[#9a7a3a] mb-1">总部审核处理</p>
              <div className="flex items-center gap-2 mb-1.5">
                <StatusBadge status={suggestion?.status ?? 'pending'} />
                {suggestion?.actionType && (
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                    {suggestion.actionType === 'todo' ? '生成方案待办' : suggestion.actionType === 'update' ? '关联方案版本' : '仅标记采纳'}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400">处理时间：{suggestion?.processedAt ?? '—'}</p>
            </div>
          </div>

          {todo && (
            <div className="relative flex gap-4 pb-5">
              <div className="absolute left-[11px] top-6 h-full w-0.5 bg-[#0F766E]/20" />
              <div className="relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full bg-amber-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">3</span>
              </div>
              <div className="flex-1 rounded-lg border border-gray-100 bg-amber-50/30 p-3">
                <p className="text-[10px] font-semibold text-amber-700 mb-1">方案待办</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-800">{todo.schemeName}</span>
                  <span className={cn('rounded px-2 py-0.5 text-[10px] font-medium', todo.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                    {todo.status === 'resolved' ? '已完成' : '处理中'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">处理人：{todo.createdBy}</p>
                {todo.status === 'resolved' && todo.resolvedVersion && (
                  <p className="text-[11px] text-green-700">已落到方案版本 v{todo.resolvedVersion}</p>
                )}
                <p className="mt-1 text-[10px] text-gray-400">创建：{todo.createdAt}{todo.resolvedAt ? ` · 完成：${todo.resolvedAt}` : ''}</p>
              </div>
            </div>
          )}

          {linkedVersionObj && (
            <div className="relative flex gap-4 pb-0">
              <div className="relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full bg-[#0F766E] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{todo ? 4 : 3}</span>
              </div>
              <div className="flex-1 rounded-lg border border-gray-100 bg-[#0F766E]/5 p-3">
                <p className="text-[10px] font-semibold text-[#0F766E] mb-1">方案版本落地</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-800">v{linkedVersionObj.version}</span>
                  <span className="text-[10px] text-gray-400">生效：{linkedVersionObj.effectiveTime.replace('T', ' ')}</span>
                </div>
                <p className="text-xs text-gray-600">{linkedVersionObj.modifyReason}</p>
                <p className="mt-1 text-[10px] text-gray-400">修改人：{linkedVersionObj.modifiedBy}</p>
                {(() => {
                  const relatedDists = useDistributionStore.getState().distributions.filter(d => d.schemeId === suggestion?.linkedSchemeId && d.distributedVersion && d.distributedVersion >= linkedVersionObj.version)
                  const hasDistribution = relatedDists.length > 0
                  const hasResend = relatedDists.some(d => d.distributedReason?.includes('补发'))
                  return (
                    <div className="mt-1.5 flex items-center gap-2">
                      {hasDistribution ? (
                        <span className="text-[10px] text-green-600">已下发到 {relatedDists.reduce((acc, d) => acc + d.storeIds.length, 0)} 家门店</span>
                      ) : (
                        <span className="text-[10px] text-amber-600">尚未下发</span>
                      )}
                      {hasResend && (
                        <span className="rounded bg-red-50 px-1.5 py-0.5 text-[9px] font-medium text-red-600">含补发</span>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {!todo && !linkedVersionObj && suggestion?.status === 'approved' && suggestion?.actionType === 'none' && (
            <div className="relative flex gap-4 pb-0">
              <div className="relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full bg-gray-400 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">3</span>
              </div>
              <div className="flex-1 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-[10px] font-semibold text-gray-500 mb-1">处理完成</p>
                <p className="text-xs text-gray-500">仅标记采纳，未生成待办或关联方案版本</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={() => setViewingSuggestionId(null)} className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d6a63]">关闭</button>
        </div>
      </div>
    </div>
  )
})()}
    </div>
  )
}
