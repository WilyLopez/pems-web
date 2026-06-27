import type { SummaryItem } from './ModuleCard'

export function ReadOnlyList({ items }: { items: SummaryItem[] }) {
  return (
    <ul className="divide-y divide-gray-100">
      {items.map(({ label, value }) => (
        <li key={label} className="flex items-center justify-between gap-3 py-2.5">
          <span className="text-sm text-gray-500">{label}</span>
          <span className="text-sm font-semibold text-gray-900 text-right">{value}</span>
        </li>
      ))}
    </ul>
  )
}
