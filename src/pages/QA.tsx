import { useState, useMemo } from 'react'
import { Search, Plus, Pencil, Trash2, ChevronDown, ChevronRight, X, Check, MessageCircleQuestion } from 'lucide-react'
import { useQAStore } from '@/stores/qa'
import { projects, categories } from '@/data/mock'
import { cn } from '@/lib/utils'
import type { QAItem } from '@/types'

const fmt = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

interface Form { question: string; answer: string; relatedProjectIds: string[]; tags: string[]; tagInput: string; createdBy: string }
const empty: Form = { question: '', answer: '', relatedProjectIds: [], tags: [], tagInput: '', createdBy: '' }

export default function QA() {
  const { items, addQA, updateQA, deleteQA } = useQAStore()
  const [search, setSearch] = useState('')
  const [filterId, setFilterId] = useState('')
  const [expCats, setExpCats] = useState<Set<string>>(new Set(categories.map((c) => c.id)))
  const [expAns, setExpAns] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Form>(empty)

  const filtered = useMemo(() => items.filter((i) => {
    const ms = !search || i.question.includes(search) || i.answer.includes(search)
    const mp = !filterId || i.relatedProjectIds.includes(filterId)
    return ms && mp
  }), [items, search, filterId])

  const toggleSet = (set: Set<string>, id: string) => { const n = new Set(set); n.has(id) ? n.delete(id) : n.add(id); return n }

  const handleAddTag = () => {
    const v = form.tagInput.trim()
    if (v) { const ts = v.split(',').map((t) => t.trim()).filter(Boolean).filter((t) => !form.tags.includes(t)); setForm((f) => ({ ...f, tags: [...f.tags, ...ts], tagInput: '' })) }
  }

  const openAdd = () => { setForm(empty); setEditId(null); setShowForm(true) }
  const openEdit = (item: QAItem) => {
    setForm({ question: item.question, answer: item.answer, relatedProjectIds: [...item.relatedProjectIds], tags: [...item.tags], tagInput: '', createdBy: item.createdBy })
    setEditId(item.id); setShowForm(true)
  }
  const handleSave = () => {
    if (!form.question.trim() || !form.answer.trim()) return
    const now = new Date().toISOString()
    const names = form.relatedProjectIds.map((id) => projects.find((p) => p.id === id)?.name ?? '')
    if (editId) { updateQA(editId, { question: form.question.trim(), answer: form.answer.trim(), relatedProjectIds: form.relatedProjectIds, relatedProjectNames: names, tags: form.tags, createdBy: form.createdBy.trim() }) }
    else { addQA({ id: `qa-${Date.now()}`, question: form.question.trim(), answer: form.answer.trim(), relatedProjectIds: form.relatedProjectIds, relatedProjectNames: names, tags: form.tags, createdBy: form.createdBy.trim(), createdAt: now, updatedAt: now }) }
    setShowForm(false); setForm(empty); setEditId(null)
  }
  const cancel = () => { setShowForm(false); setForm(empty); setEditId(null) }

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20'

  return (
    <div className="flex h-full flex-col bg-[#F8FAFB]">
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索问答内容..." className="w-full rounded-lg border border-gray-200 bg-[#F8FAFB] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20" />
        </div>
        <select value={filterId} onChange={(e) => setFilterId(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0F766E]">
          <option value="">全部项目</option>
          {categories.map((c) => (<optgroup key={c.id} label={c.name}>{projects.filter((p) => p.categoryId === c.id).map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}</optgroup>))}
        </select>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0D6A62]">
          <Plus className="h-4 w-4" />新建问答
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[220px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
          <nav className="py-2">
            <button onClick={() => setFilterId('')} className={cn('w-full px-4 py-2.5 text-left text-sm transition-colors', !filterId ? 'bg-[#0F766E]/10 font-medium text-[#0F766E]' : 'text-gray-600 hover:bg-gray-50')}>全部</button>
            {categories.map((cat) => {
              const exp = expCats.has(cat.id)
              return (
                <div key={cat.id}>
                  <button onClick={() => setExpCats(toggleSet(expCats, cat.id))} className="flex w-full items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600">
                    {exp ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}{cat.icon} {cat.name}
                  </button>
                  {exp && projects.filter((p) => p.categoryId === cat.id).map((proj) => (
                    <button key={proj.id} onClick={() => setFilterId(filterId === proj.id ? '' : proj.id)} className={cn('w-full py-2 text-left text-sm transition-colors pl-8', filterId === proj.id ? 'bg-[#0F766E]/10 font-medium text-[#0F766E]' : 'text-gray-600 hover:bg-gray-50')}>
                      {proj.name}
                    </button>
                  ))}
                </div>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filtered.map((item) => {
              const exp = expAns.has(item.id)
              return (
                <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <h3 className="text-base font-bold text-gray-900">{item.question}</h3>
                  <div className="mt-2">
                    <p onClick={() => setExpAns(toggleSet(expAns, item.id))} className={cn('text-sm leading-relaxed text-gray-600 cursor-pointer', !exp && 'line-clamp-2')}>{item.answer}</p>
                    <button onClick={() => setExpAns(toggleSet(expAns, item.id))} className="mt-1 text-xs font-medium text-[#0F766E] hover:underline">{exp ? '收起' : '展开'}</button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.relatedProjectNames.map((n) => (<span key={n} className="rounded-full bg-[#0F766E]/10 px-2.5 py-0.5 text-xs font-medium text-[#0F766E]">{n}</span>))}
                    {item.tags.map((t) => (<span key={t} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">{t}</span>))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-400">{item.createdBy} · {fmt(item.createdAt)}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-[#0F766E] transition-colors hover:bg-teal-50"><Pencil className="h-3.5 w-3.5" />编辑</button>
                      <button onClick={() => deleteQA(item.id)} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-red-500 transition-colors hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />删除</button>
                    </div>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100"><MessageCircleQuestion className="h-8 w-8 text-gray-300" /></div>
                <p className="text-sm text-gray-400">暂无匹配的问答内容</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[560px] max-h-[85vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? '编辑问答' : '新建问答'}</h2>
              <button onClick={cancel} className="text-gray-400 transition-colors hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">问题</label>
                <input value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} placeholder="请输入问题" className={cn('mt-1.5', inputCls)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">答案</label>
                <textarea value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} placeholder="请输入答案" rows={4} className={cn('mt-1.5 resize-y', inputCls)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">关联项目</label>
                <div className="mt-2 max-h-40 space-y-3 overflow-y-auto rounded-lg border border-gray-200 p-3">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <div className="mb-1 text-xs font-semibold text-gray-400">{cat.icon} {cat.name}</div>
                      <div className="flex flex-wrap gap-2">
                        {projects.filter((p) => p.categoryId === cat.id).map((proj) => (
                          <label key={proj.id} className={cn('inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors', form.relatedProjectIds.includes(proj.id) ? 'border-[#0F766E] bg-[#0F766E]/10 text-[#0F766E]' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                            <input type="checkbox" checked={form.relatedProjectIds.includes(proj.id)} onChange={() => setForm((f) => ({ ...f, relatedProjectIds: f.relatedProjectIds.includes(proj.id) ? f.relatedProjectIds.filter((id) => id !== proj.id) : [...f.relatedProjectIds, proj.id] }))} className="sr-only" />
                            {form.relatedProjectIds.includes(proj.id) && <Check className="h-3 w-3" />}{proj.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">标签</label>
                {form.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {form.tags.map((tag) => (<span key={tag} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">{tag}<button onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))} className="text-gray-400 hover:text-red-500"><X className="h-3 w-3" /></button></span>))}
                  </div>
                )}
                <input value={form.tagInput} onChange={(e) => setForm((f) => ({ ...f, tagInput: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }} placeholder="输入标签，回车添加（逗号分隔）" className={cn('mt-1.5', inputCls)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">创建人</label>
                <input value={form.createdBy} onChange={(e) => setForm((f) => ({ ...f, createdBy: e.target.value }))} placeholder="请输入创建人" className={cn('mt-1.5', inputCls)} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={cancel} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">取消</button>
              <button onClick={handleSave} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0D6A62]"><Check className="h-4 w-4" />保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
