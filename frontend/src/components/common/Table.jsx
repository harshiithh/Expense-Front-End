export default function Table({ columns, data, loading, emptyMessage = 'No data found' }) {
  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8">
            {columns.map(c => (
              <th key={c.key} className="text-left py-3 px-4 text-xs font-mono text-white/30 uppercase tracking-widest">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0
            ? <tr><td colSpan={columns.length} className="text-center py-12 text-white/30">{emptyMessage}</td></tr>
            : data.map((row, i) => (
              <tr key={i} className="table-row">
                {columns.map(c => (
                  <td key={c.key} className="py-3.5 px-4 text-white/80">
                    {c.render ? c.render(row[c.key], row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}
