import { useState, useEffect } from 'react'
import { Wallet, TrendingDown, TrendingUp, PiggyBank, Download, RefreshCw } from 'lucide-react'
// import { analyticsAPI } from '../services/api'
import { formatCurrency, formatDate } from '../utils/format'
import StatCard from '../components/common/StatCard'
import CategoryBadge from '../components/common/CategoryBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import PageHeader from '../components/common/PageHeader'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts'
import toast from 'react-hot-toast'

const COLORS = ['#00FFB2','#7B61FF','#FF6B35','#FFD23F','#FF4757','#00B4D8','#2ED573','#A8A8A8']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-800 border border-white/10 rounded-xl p-3 text-xs">
      <p className="text-white/60 mb-1 font-mono">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await analyticsAPI.getDashboard()
      setData(res.data.data)
    } catch { toast.error('Failed to load dashboard') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>
  if (!data) return null

  const pieData = Object.entries(data.categoryBreakdown || {}).map(([name, value]) => ({ name, value: Number(value) }))
  const monthlyData = (data.monthlyData || []).map(m => ({
    month: m.month, income: Number(m.income), expenses: Number(m.expenses)
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Dashboard" subtitle={`${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} · Live Overview`}
        action={
          <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />

      {/* Budget Alerts */}
      {data.budgetAlerts?.length > 0 && (
        <div className="space-y-2">
          {data.budgetAlerts.map((b, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
              b.exceeded ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            }`}>
              <span>{b.exceeded ? '🚨' : '⚠️'}</span>
              <span><strong>{b.categoryName}</strong> budget is {b.usagePercent.toFixed(0)}% used
                — {formatCurrency(b.limitAmount - b.spentAmount)} remaining</span>
            </div>
          ))}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={formatCurrency(data.totalBalance)} icon={Wallet} color="accent" />
        <StatCard title="Total Income" value={formatCurrency(data.totalIncome)} icon={TrendingUp} color="violet" />
        <StatCard title="Total Expenses" value={formatCurrency(data.totalExpenses)} icon={TrendingDown} color="red" />
        <StatCard title="Savings Rate" value={`${data.savingsRate}%`} icon={PiggyBank} color="yellow" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly Bar Chart */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-white">Income vs Expenses</h3>
              <p className="text-xs text-white/30 font-mono mt-0.5">Monthly trend · {new Date().getFullYear()}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'rgba(255,255,255,0.5)' }} />
              <Bar dataKey="income" name="Income" fill="#7B61FF" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#00FFB2" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="font-bold text-white mb-1">Category Breakdown</h3>
          <p className="text-xs text-white/30 font-mono mb-4">This month's spending</p>
          {pieData.length === 0 ? (
            <div className="text-center py-12 text-white/20 text-sm">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{
                    background: '#0C1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12
                  }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.slice(0, 5).map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-white/60">{d.name}</span>
                    </div>
                    <span className="text-white/80 font-mono">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-white mb-5">Recent Expenses</h3>
          <div className="space-y-3">
            {data.recentExpenses?.length === 0 && <p className="text-white/30 text-sm text-center py-8">No expenses yet</p>}
            {data.recentExpenses?.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                    style={{ background: (e.categoryColor || '#888') + '20' }}>
                    {e.categoryIcon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white leading-tight">{e.description}</div>
                    <div className="text-xs text-white/30 font-mono">{formatDate(e.date)}</div>
                  </div>
                </div>
                <span className="text-red-400 font-semibold font-mono text-sm">-{formatCurrency(e.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-white mb-5">Recent Income</h3>
          <div className="space-y-3">
            {data.recentIncome?.length === 0 && <p className="text-white/30 text-sm text-center py-8">No income yet</p>}
            {data.recentIncome?.map(i => (
              <div key={i.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base bg-accent/10">💰</div>
                  <div>
                    <div className="text-sm font-medium text-white leading-tight">{i.description}</div>
                    <div className="text-xs text-white/30 font-mono">{formatDate(i.date)}</div>
                  </div>
                </div>
                <span className="text-accent font-semibold font-mono text-sm">+{formatCurrency(i.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
