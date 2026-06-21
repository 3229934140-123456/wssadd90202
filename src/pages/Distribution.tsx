import { useState } from 'react'
import { Search, Send, Check, X, Plus, Trash2, Smartphone, ToggleLeft, ToggleRight } from 'lucide-react'
import { useDistributionStore } from '@/stores/distribution'
import { useSchemeStore } from '@/stores/schemes'
import { stores } from '@/data/mock'
import StatusBadge from '@/components/StatusBadge'
import { cn } from '@/lib/utils'
import type { HolidayReminder } from '@/types'

const regions = ['全部', '华东区', '华南区', '华北区']
const brandTones = [
  { value: '专业严谨', label: '专业严谨' },
  { value: '温馨关怀', label: '温馨关怀' },
  { value: '时尚活力', label: '时尚活力' },
]

export default function Distribution() {
  const { distributions, miniAppConfig, distributeScheme, updateMiniAppConfig, addHolidayReminder, removeHolidayReminder } = useDistributionStore()
  const { schemes } = useSchemeStore()
  const [activeTab, setActiveTab] = useState<'scheme' | 'miniapp'>('scheme')

  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null)
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([])
  const [regionFilter, setRegionFilter] = useState('全部')
  const [searchScheme, setSearchScheme] = useState('')
  const [allowRegionalDiff, setAllowRegionalDiff] = useState(false)
  const [storeOverrides, setStoreOverrides] = useState<Record<string, string>>({})

  const [homepageCopy, setHomepageCopy] = useState(miniAppConfig.homepageCopy)
  const [brandTone, setBrandTone] = useState(miniAppConfig.brandTone)
  const [newReminder, setNewReminder] = useState({ holiday: '', startDate: '', endDate: '', content: '' })

  const publishedSchemes = schemes.filter((s) => s.status === 'published')
  const filteredSchemes = publishedSchemes.filter((s) => s.name.toLowerCase().includes(searchScheme.toLowerCase()))
  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId)
  const filteredStores = stores.filter((s) => regionFilter === '全部' || s.region === regionFilter)
  const selectedStores = stores.filter((s) => selectedStoreIds.includes(s.id))

  const toggleStore = (id: string) => {
    setSelectedStoreIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }
  const selectAll = () => setSelectedStoreIds(filteredStores.filter((s) => s.isActive).map((s) => s.id))
  const deselectAll = () => setSelectedStoreIds([])

  const handleDistribute = () => {
    if (!selectedScheme) return
    distributeScheme({
      id: `dist-${Date.now()}`,
      schemeId: selectedScheme.id,
      schemeName: selectedScheme.name,
      storeIds: selectedStoreIds,
      status: 'pending',
      allowRegionalDiff,
      distributedAt: new Date().toISOString(),
      distributedBy: '运营管理员',
    })
    setSelectedSchemeId(null)
    setSelectedStoreIds([])
    setStoreOverrides({})
    setAllowRegionalDiff(false)
  }

  const handleSaveMiniApp = () => {
    updateMiniAppConfig({ homepageCopy, brandTone })
  }

  const handleAddReminder = () => {
    if (!newReminder.holiday || !newReminder.startDate || !newReminder.endDate || !newReminder.content) return
    addHolidayReminder({ id: `hol-${Date.now()}`, ...newReminder })
    setNewReminder({ holiday: '', startDate: '', endDate: '', content: '' })
  }

  const formatDate = (d: string) => {
    const dt = new Date(d)
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">门店下发</h1>
        <p className="mt-1 text-sm text-gray-500">管理方案下发与小程序文案配置</p>
      </div>

      <div className="mb-6 flex gap-1 rounded-lg bg-white p-1 shadow-sm w-fit">
        {([['scheme', '方案下发'], ['miniapp', '小程序文案']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} className={cn('rounded-md px-5 py-2 text-sm font-medium transition-colors', activeTab === key ? 'bg-[#0F766E] text-white' : 'text-gray-600 hover:text-gray-900')}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'scheme' && (
        <>
          <div className="flex gap-5 mb-6" style={{ minHeight: 480 }}>
            <div className="w-[300px] shrink-0 rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input value={searchScheme} onChange={(e) => setSearchScheme(e.target.value)} placeholder="搜索方案..." className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {filteredSchemes.map((s) => (
                  <div key={s.id} onClick={() => setSelectedSchemeId(s.id)} className={cn('cursor-pointer rounded-lg p-3 mb-1 transition-all border-l-3', selectedSchemeId === s.id ? 'border-l-[#0F766E] bg-[#0F766E]/5' : 'border-l-transparent hover:bg-gray-50')}>
                    <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-xs text-gray-400">{s.categoryId === 'cat-1' ? '皮肤管理' : s.categoryId === 'cat-2' ? '微整注射' : s.categoryId === 'cat-3' ? '外科手术' : '激光光电'}</span>
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <div className="flex gap-2">
                  {regions.map((r) => (
                    <button key={r} onClick={() => setRegionFilter(r)} className={cn('rounded-md px-3 py-1.5 text-xs font-medium transition-colors', regionFilter === r ? 'bg-[#0F766E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs font-medium text-[#0F766E] hover:underline">全选</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={deselectAll} className="text-xs font-medium text-gray-500 hover:underline">取消全选</button>
                </div>
                <button onClick={() => setAllowRegionalDiff(!allowRegionalDiff)} className="flex items-center gap-2 text-sm text-gray-600">
                  {allowRegionalDiff ? <ToggleRight className="h-5 w-5 text-[#0F766E]" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                  允许区域差异
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-2">
                  {filteredStores.map((store) => (
                    <label key={store.id} className={cn('flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors', selectedStoreIds.includes(store.id) ? 'border-[#0F766E] bg-[#0F766E]/5' : 'border-gray-100 hover:border-gray-200')}>
                      <input type="checkbox" checked={selectedStoreIds.includes(store.id)} onChange={() => toggleStore(store.id)} className="h-4 w-4 rounded border-gray-300 text-[#0F766E] focus:ring-[#0F766E]" />
                      <span className="text-sm text-gray-900">{store.name}</span>
                      <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{store.region}</span>
                    </label>
                  ))}
                </div>
                {allowRegionalDiff && selectedStores.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-medium text-gray-500">区域差异覆盖</p>
                    {selectedStores.map((store) => (
                      <div key={store.id}>
                        <label className="text-xs text-gray-600 mb-1 block">{store.name}</label>
                        <textarea value={storeOverrides[store.id] ?? ''} onChange={(e) => setStoreOverrides((o) => ({ ...o, [store.id]: e.target.value }))} placeholder="输入该门店的差异内容..." rows={2} className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-[300px] shrink-0 rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">下发预览</h3>
              </div>
              <div className="flex-1 p-4 space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">选中方案</p>
                  <p className="text-sm font-medium text-gray-900">{selectedScheme?.name ?? '请选择方案'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">下发门店数</p>
                  <p className="text-2xl font-bold text-[#0F766E]">{selectedStoreIds.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">门店列表</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selectedStores.length === 0 && <p className="text-xs text-gray-300">暂未选择门店</p>}
                    {selectedStores.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 text-xs text-gray-700">
                        <Check className="h-3 w-3 text-[#0F766E]" />{s.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100">
                <button onClick={handleDistribute} disabled={!selectedScheme || selectedStoreIds.length === 0} className={cn('w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-colors', selectedScheme && selectedStoreIds.length > 0 ? 'bg-[#0F766E] text-white hover:bg-[#0d6a63]' : 'bg-gray-100 text-gray-400 cursor-not-allowed')}>
                  <Send className="h-4 w-4" />确认下发
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">下发历史</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">方案名称</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">下发门店数</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">状态</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">下发时间</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">操作人</th>
                </tr>
              </thead>
              <tbody>
                {distributions.map((d) => (
                  <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-900">{d.schemeName}</td>
                    <td className="px-4 py-3 text-gray-600">{d.storeIds.length}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(d.distributedAt)}</td>
                    <td className="px-4 py-3 text-gray-500">{d.distributedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'miniapp' && (
        <div className="flex gap-6">
          <div className="flex-1 space-y-5">
            <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">首页文案</label>
              <textarea value={homepageCopy} onChange={(e) => setHomepageCopy(e.target.value)} rows={4} className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]" />
            </div>

            <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">品牌语气</label>
              <select value={brandTone} onChange={(e) => setBrandTone(e.target.value)} className="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]">
                {brandTones.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">节日提醒列表</label>
              </div>
              <div className="space-y-3 mb-5">
                {miniAppConfig.holidayReminders.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{r.holiday}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.startDate} ~ {r.endDate}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{r.content}</p>
                    </div>
                    <button onClick={() => removeHolidayReminder(r.id)} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs font-medium text-gray-500">添加提醒</p>
                <div className="grid grid-cols-3 gap-3">
                  <input value={newReminder.holiday} onChange={(e) => setNewReminder((p) => ({ ...p, holiday: e.target.value }))} placeholder="节日名称" className="rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]" />
                  <input type="date" value={newReminder.startDate} onChange={(e) => setNewReminder((p) => ({ ...p, startDate: e.target.value }))} className="rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]" />
                  <input type="date" value={newReminder.endDate} onChange={(e) => setNewReminder((p) => ({ ...p, endDate: e.target.value }))} className="rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]" />
                </div>
                <textarea value={newReminder.content} onChange={(e) => setNewReminder((p) => ({ ...p, content: e.target.value }))} placeholder="提醒内容" rows={2} className="w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]" />
                <button onClick={handleAddReminder} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F766E]/10 px-3 py-1.5 text-xs font-medium text-[#0F766E] hover:bg-[#0F766E]/20 transition-colors">
                  <Plus className="h-3.5 w-3.5" />添加
                </button>
              </div>
            </div>

            <button onClick={handleSaveMiniApp} className="inline-flex items-center gap-2 rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#0d6a63] transition-colors">
              <Check className="h-4 w-4" />保存配置
            </button>
          </div>

          <div className="w-[340px] shrink-0">
            <div className="rounded-[2rem] border-[6px] border-gray-800 bg-white overflow-hidden shadow-xl">
              <div className="bg-[#0F766E] px-5 py-3 flex items-center justify-between">
                <span className="text-white text-sm font-medium">术后饮食管理</span>
                <Smartphone className="h-4 w-4 text-white/70" />
              </div>
              <div className="p-5 space-y-4 min-h-[520px]">
                <div className="rounded-xl bg-gradient-to-br from-[#0F766E]/5 to-[#D4A853]/10 p-4">
                  <p className="text-xs text-gray-800 leading-relaxed">{homepageCopy || '首页文案预览'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">品牌语气</span>
                  <span className="rounded-full bg-[#D4A853]/20 px-2 py-0.5 text-[10px] font-medium text-[#D4A853]">{brandTone}</span>
                </div>
                {miniAppConfig.holidayReminders.slice(0, 2).map((r) => (
                  <div key={r.id} className="rounded-xl border border-[#D4A853]/30 bg-[#D4A853]/5 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-xs font-semibold text-[#D4A853]">{r.holiday}</span>
                      <span className="text-[10px] text-gray-400">{r.startDate}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-3">{r.content}</p>
                  </div>
                ))}
              </div>
              <div className="h-6 bg-gray-100 flex items-center justify-center">
                <div className="w-20 h-1 rounded-full bg-gray-300" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
