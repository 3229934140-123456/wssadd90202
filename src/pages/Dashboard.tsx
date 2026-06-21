import { useState, useMemo } from 'react'
import { TrendingUp, Eye, AlertTriangle, Check, X, Filter } from 'lucide-react'
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
  const { storeMetrics, suggestions, approveSuggestion, rejectSuggestion } = useDashboardStore()
  const [suggestionFilter, setSuggestionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

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
    </div>
  )
}
