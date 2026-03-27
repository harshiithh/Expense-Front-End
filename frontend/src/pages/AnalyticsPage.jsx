import { useState, useEffect } from 'react'
import { analyticsAPI } from '../services/api'
import { formatCurrency } from '../utils/format'
import PageHeader from '../components/common/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area
} from 'recharts'

const COLORS = ['#00FFB2','#7B61FF','#FF6B35','#FFD23F','#FF4757','#00B4D8','#2ED573','#A8A8A8']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-800 border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      {label && <p className="text-white/50 mb-1.5 font-mono">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [trends, setTrends] = useState([])
  const [catData, setCatData] = useState({})
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  const load = async () => {
    setLoading(true)
    try {
      const [trendRes, catRes] = await Promise.all([
        analyticsAPI.getTrends(year),
        analyticsAPI.getCategories(month, year),
      ])
      const rawTrends = trendRes.data.data || []
      setTrends(rawTrends.map(d => ({
        month: d.month,
        income: Number(d.income),
        expenses: Number(d.expenses),
        net: Number(d.income) - Number(d.expenses),
      })))
      setCatData(catRes.data.data || {})
    } catch { toast.error('Failed to load analytics') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [year, month])

  const pieData = Object.entries(catData).map(([name, value]) => ({ name, value: Number(value) }))
  const totalSpend = pieData.reduce((s, d) => s + d.value, 0)

  const totalIncome = trends.reduce((s, d) => s + d.income, 0)
  const totalExpenses = trends.reduce((s, d) => s + d.expenses, 0)
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Analytics" subtitle="Deep dive into your financial patterns"
        action={
          <div className="flex gap-2">
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input py-2 text-sm w-28">
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="input py-2 text-sm w-24">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        }
      />

      {loading ? <LoadingSpinner size="lg" /> : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: 'Annual Income', value: formatCurrency(totalIncome), color: 'text-accent', glow: 'bg-accent' },
              { label: 'Annual Expenses', value: formatCurrency(totalExpenses), color: 'text-red-400', glow: 'bg-red-500' },
              { label: 'Net Savings', value: formatCurrency(totalIncome - totalExpenses), color: 'text-violet', glow: 'bg-violet' },
              { label: 'Savings Rate', value: `${savingsRate}%`, color: 'text-yellow-400', glow: 'bg-yellow-500' },
            ].map(({ label, value, color, glow }) => (
              <div key={label} className="card relative overflow-hidden text-center py-5">
                <div className={`absolute -top-6 -right-6 w-20 h-20 ${glow} opacity-10 rounded-full blur-2xl`} />
                <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
                <div className="text-xs text-white/30 mt-1 uppercase tracking-widest font-mono">{label}</div>
              </div>
            ))}
          </div>

          {/* Area Chart - Full Width */}
          <div className="card">
            <div className="mb-5">
              <h3 className="font-bold text-white">Income vs Expenses Trend</h3>
              <p className="text-xs text-white/30 font-mono mt-0.5">Full year overview · {year}</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7B61FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FFB2" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#00FFB2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'rgba(255,255,255,0.5)' }} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#7B61FF" strokeWidth={2} fill="url(#incGrad)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#00FFB2" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Net Savings Bar */}
            <div className="card">
              <div className="mb-5">
                <h3 className="font-bold text-white">Monthly Net Savings</h3>
                <p className="text-xs text-white/30 font-mono mt-0.5">Income minus expenses · {year}</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="net" name="Net Savings" radius={[4,4,0,0]}
                    fill="#00FFB2"
                    label={false}
                  >
                    {trends.map((entry, index) => (
                      <Cell key={index} fill={entry.net >= 0 ? '#00FFB2' : '#FF4757'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Pie */}
            <div className="card">
              <div className="mb-4">
                <h3 className="font-bold text-white">Spending by Category</h3>
                <p className="text-xs text-white/30 font-mono mt-0.5">{MONTHS[month-1]} {year}</p>
              </div>
              {pieData.length === 0 ? (
                <div className="text-center py-12 text-white/20 text-sm">No expense data for this month</div>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                        dataKey="value" paddingAngle={3}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => formatCurrency(v)} contentStyle={{
                        background: '#0C1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2.5">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs text-white/70 truncate">{d.name}</span>
                            <span className="text-xs font-mono text-white/50 ml-1">{((d.value / totalSpend) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{
                              width: `${(d.value / totalSpend) * 100}%`,
                              background: COLORS[i % COLORS.length]
                            }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
