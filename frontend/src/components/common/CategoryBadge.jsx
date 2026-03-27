export default function CategoryBadge({ name, color, icon }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: color + '20', color, border: `1px solid ${color}30` }}>
      {icon && <span>{icon}</span>}
      {name}
    </span>
  )
}
