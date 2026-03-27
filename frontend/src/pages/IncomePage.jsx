import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { incomeAPI, categoryAPI } from '../services/api'
import { formatCurrency, formatDate } from '../utils/format'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import PageHeader from '../components/common/PageHeader'
import CategoryBadge from '../components/common/CategoryBadge'
import toast from 'react-hot-toast'

const EMPTY = { amount: '', description: '', date: new Date().toISOString().split('T')[0], categoryId: '', source: '' }

export default function IncomePage() {
  const [incomes, setIncomes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [incRes, catRes] = await Promise.all([incomeAPI.getAll(), categoryAPI.getIncome()])
      setIncomes(incRes.data.data || [])
      setCategories(catRes.data.data || [])
    } catch { toast.error('Failed to load income') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (inc) => {
    setEditing(inc)
    setForm({ amount: inc.amount, description: inc.description, date: inc.date,
      categoryId: inc.categoryId || '', source: inc.source || '' })
    setModal(true)
  }

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount),
        categoryId: form.categoryId ? parseInt(form.categoryId) : null }
      if (editing) await incomeAPI.update(editing.id, payload)
      else await incomeAPI.create(payload)
      toast.success(editing ? 'Income updated!' : 'Income added!')
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this income entry?')) return
    try { await incomeAPI.delete(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0)

  const columns = [
    { key: 'date', label: 'Date', render: v => <span className="font-mono text-xs text-white/50">{formatDate(v)}</span> },
    { key: 'description', label: 'Description', render: v => <span className="font-medium">{v}</span> },
    { key: 'categoryName', label: 'Category', render: (v, row) => v
      ? <CategoryBadge name={v} color="#7B61FF" />
      : <span className="text-white/20 text-xs">—</span>
    },
    { key: 'source', label: 'Source', render: v => v
      ? <span className="text-xs text-white/40 font-mono">{v}</span>
      : <span className="text-white/20">—</span>
    },
    { key: 'amount', label: 'Amount', render: v => (
      <span className="font-mono font-semibold text-accent">+{formatCurrency(v)}</span>
    )},
    { key: 'id', label: '', render: (_, row) => (
      <div className="flex gap-2 justify-end">
        <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-all">
          <Pencil size={14} />
        </button>
        <button onClick={() => remove(row.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/30 hover:text-red-400 transition-all">
          <Trash2 size={14} />
        </button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Income" subtitle="Track all your income sources"
        action={
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> Add Income
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Income', value: formatCurrency(totalIncome), color: 'text-accent' },
          { label: 'Transactions', value: incomes.length, color: 'text-white' },
          { label: 'Avg per Entry', value: formatCurrency(incomes.length ? totalIncome / incomes.length : 0), color: 'text-violet' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center py-4">
            <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
            <div className="text-xs text-white/30 mt-1 uppercase tracking-widest font-mono">{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-white/8">
          <span className="text-sm font-semibold text-white">All Income</span>
          <span className="ml-2 text-xs text-white/30 font-mono">{incomes.length} records</span>
        </div>
        <Table columns={columns} data={incomes} loading={loading} emptyMessage="No income recorded yet. Add your first entry!" />
      </div>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Income' : 'Add Income'}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount (₹)</label>
              <input type="number" step="0.01" min="0.01" value={form.amount}
                onChange={e => setForm(p => ({...p, amount: e.target.value}))}
                className="input" placeholder="0.00" required />
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" value={form.date}
                onChange={e => setForm(p => ({...p, date: e.target.value}))}
                className="input" required />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <input type="text" value={form.description}
              onChange={e => setForm(p => ({...p, description: e.target.value}))}
              className="input" placeholder="e.g. Monthly Salary, Freelance Project" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select value={form.categoryId} onChange={e => setForm(p => ({...p, categoryId: e.target.value}))}
                className="input">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Source</label>
              <input type="text" value={form.source}
                onChange={e => setForm(p => ({...p, source: e.target.value}))}
                className="input" placeholder="e.g. Company Name" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editing ? 'Update' : 'Add Income'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
