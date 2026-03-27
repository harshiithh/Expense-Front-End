import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Target, AlertTriangle, CheckCircle } from 'lucide-react'
import { budgetAPI, categoryAPI } from '../services/api'
import { formatCurrency } from '../utils/format'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ categoryId: '', limitAmount: '',
    month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  const [saving, setSaving] = useState(false)
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1)
  const [selYear, setSelYear] = useState(new Date().getFullYear())

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [budRes, catRes] = await Promise.all([
        budgetAPI.getForMonth(selMonth, selYear), categoryAPI.getExpense()
      ])
      setBudgets(budRes.data.data || [])
      setCategories(catRes.data.data || [])
    } catch { toast.error('Failed to load budgets') }
    finally { setLoading(false) }
  }, [selMonth, selYear])

  useEffect(() => { load() }, [load])

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await budgetAPI.createOrUpdate({ ...form, limitAmount: parseFloat(form.limitAmount),
        categoryId: parseInt(form.categoryId), month: parseInt(form.month), year: parseInt(form.year) })
      toast.success('Budget saved!')
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this budget?')) return
    try { await budgetAPI.delete(id); toast.success('Budget deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const totalBudget = budgets.reduce((s, b) => s + Number(b.limitAmount), 0)
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spentAmount), 0)
  const overBudget = budgets.filter(b => b.exceeded).length

  const getBarColor = (pct) => {
    if (pct >= 100) return 'bg-red-500'
    if (pct >= 80) return 'bg-yellow-500'
    return 'bg-accent'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Budgets" subtitle="Set and monitor your spending limits"
        action={
          <button onClick={() => { setForm(p => ({...p, month: selMonth, year: selYear})); setModal(true) }}
            className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> Set Budget
          </button>
        }
      />

      {/* Month Selector */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-white/40 font-mono">View Month:</span>
          <div className="flex flex-wrap gap-2">
            {MONTHS.map((m, i) => (
              <button key={i} onClick={() => setSelMonth(i + 1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  selMonth === i + 1
                    ? 'bg-accent text-black font-bold'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}>{m}</button>
            ))}
          </div>
          <select value={selYear} onChange={e => setSelYear(Number(e.target.value))}
            className="input py-1.5 text-sm w-28">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Budget', value: formatCurrency(totalBudget), color: 'text-accent', icon: Target },
          { label: 'Total Spent', value: formatCurrency(totalSpent), color: 'text-yellow-400', icon: AlertTriangle },
          { label: 'Over Budget', value: `${overBudget} categories`, color: overBudget > 0 ? 'text-red-400' : 'text-emerald-400', icon: CheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card text-center py-4">
            <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
            <div className="text-xs text-white/30 mt-1 uppercase tracking-widest font-mono">{label}</div>
          </div>
        ))}
      </div>

      {/* Budget Cards */}
      {loading ? <LoadingSpinner /> : budgets.length === 0 ? (
        <div className="card text-center py-16">
          <Target size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No budgets set for {MONTHS[selMonth - 1]} {selYear}</p>
          <button onClick={() => setModal(true)} className="btn-primary mt-4 text-sm">Set Your First Budget</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map(b => {
            const pct = Math.min(b.usagePercent, 100)
            const remaining = Number(b.limitAmount) - Number(b.spentAmount)
            return (
              <div key={b.id} className={`card card-hover relative overflow-hidden ${
                b.exceeded ? 'border-red-500/30' : b.usagePercent >= 80 ? 'border-yellow-500/30' : ''
              }`}>
                {b.exceeded && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-red-400" />
                )}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{categories.find(c => c.id === b.categoryId)?.icon || '📦'}</span>
                      <span className="font-semibold text-white">{b.categoryName}</span>
                    </div>
                    <div className="text-xs font-mono text-white/30">{MONTHS[selMonth-1]} {selYear}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {b.exceeded
                      ? <span className="badge bg-red-500/10 text-red-400 border border-red-500/20">Over!</span>
                      : b.usagePercent >= 80
                        ? <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">⚠ High</span>
                        : <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ OK</span>
                    }
                    <button onClick={() => remove(b.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-400 transition-all ml-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-white/50">{formatCurrency(b.spentAmount)} spent</span>
                    <span className="text-white/50">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${getBarColor(b.usagePercent)}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white/30">Budget: <span className="text-white/60">{formatCurrency(b.limitAmount)}</span></span>
                  <span className={remaining < 0 ? 'text-red-400' : 'text-emerald-400'}>
                    {remaining < 0 ? `-${formatCurrency(Math.abs(remaining))} over` : `${formatCurrency(remaining)} left`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Set Budget">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Category</label>
            <select value={form.categoryId} onChange={e => setForm(p => ({...p, categoryId: e.target.value}))}
              className="input" required>
              <option value="">Select a category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Monthly Limit (₹)</label>
            <input type="number" step="0.01" min="1" value={form.limitAmount}
              onChange={e => setForm(p => ({...p, limitAmount: e.target.value}))}
              className="input" placeholder="e.g. 5000" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Month</label>
              <select value={form.month} onChange={e => setForm(p => ({...p, month: e.target.value}))} className="input">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <select value={form.year} onChange={e => setForm(p => ({...p, year: e.target.value}))} className="input">
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
