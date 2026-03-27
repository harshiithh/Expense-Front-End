import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Download, Pencil, Trash2, Filter } from 'lucide-react'
import { expenseAPI, categoryAPI } from '../services/api'
import { formatCurrency, formatDate, downloadBlob } from '../utils/format'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import PageHeader from '../components/common/PageHeader'
import CategoryBadge from '../components/common/CategoryBadge'
import toast from 'react-hot-toast'

const EMPTY = { amount: '', description: '', date: new Date().toISOString().split('T')[0], categoryId: '', paymentMethod: '', notes: '' }

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [expRes, catRes] = await Promise.all([expenseAPI.getAll(), categoryAPI.getExpense()])
      setExpenses(expRes.data.data || [])
      setCategories(catRes.data.data || [])
    } catch { toast.error('Failed to load expenses') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (exp) => {
    setEditing(exp)
    setForm({ amount: exp.amount, description: exp.description, date: exp.date,
      categoryId: exp.categoryId, paymentMethod: exp.paymentMethod || '', notes: exp.notes || '' })
    setModal(true)
  }

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount), categoryId: parseInt(form.categoryId) }
      if (editing) await expenseAPI.update(editing.id, payload)
      else await expenseAPI.create(payload)
      toast.success(editing ? 'Expense updated!' : 'Expense added!')
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this expense?')) return
    try { await expenseAPI.delete(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const exportCsv = async () => {
    try {
      const res = await expenseAPI.exportCsv()
      downloadBlob(res.data, 'expenses.csv')
      toast.success('CSV exported!')
    } catch { toast.error('Export failed') }
  }

  const filtered = expenses.filter(e => {
    const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCat || String(e.categoryId) === filterCat
    return matchSearch && matchCat
  })

  const columns = [
    { key: 'date', label: 'Date', render: (v) => <span className="font-mono text-xs text-white/50">{formatDate(v)}</span> },
    { key: 'description', label: 'Description', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'categoryName', label: 'Category', render: (v, row) => (
      <CategoryBadge name={v} color={row.categoryColor} icon={row.categoryIcon} />
    )},
    { key: 'paymentMethod', label: 'Method', render: (v) => v
      ? <span className="text-xs text-white/40 font-mono">{v}</span> : <span className="text-white/20">—</span>
    },
    { key: 'amount', label: 'Amount', render: (v) => (
      <span className="font-mono font-semibold text-red-400">-{formatCurrency(v)}</span>
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
      <PageHeader title="Expenses" subtitle="Manage and track all your expenses"
        action={
          <div className="flex gap-2">
            <button onClick={exportCsv} className="btn-ghost flex items-center gap-2 text-sm">
              <Download size={15} /> Export CSV
            </button>
            <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15} /> Add Expense
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-9 py-2 text-sm" placeholder="Search expenses..." />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="input py-2 text-sm min-w-40">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: formatCurrency(filtered.reduce((s, e) => s + Number(e.amount), 0)), color: 'text-red-400' },
          { label: 'Transactions', value: filtered.length, color: 'text-white' },
          { label: 'Average', value: formatCurrency(filtered.length ? filtered.reduce((s, e) => s + Number(e.amount), 0) / filtered.length : 0), color: 'text-yellow-400' },
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
          <span className="text-sm font-semibold text-white">All Expenses</span>
          <span className="ml-2 text-xs text-white/30 font-mono">{filtered.length} records</span>
        </div>
        <Table columns={columns} data={filtered} loading={loading} emptyMessage="No expenses found. Add your first expense!" />
      </div>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
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
              className="input" placeholder="What did you spend on?" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select value={form.categoryId} onChange={e => setForm(p => ({...p, categoryId: e.target.value}))}
                className="input" required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => setForm(p => ({...p, paymentMethod: e.target.value}))}
                className="input">
                <option value="">Optional</option>
                {['Cash','UPI','Credit Card','Debit Card','Net Banking','Wallet'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Notes (Optional)</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))}
              className="input resize-none h-20" placeholder="Additional notes..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editing ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
