const DIAS_LABEL: Record<string, string> = {
  '1': 'Lun',
  '2': 'Mar',
  '3': 'Mié',
  '4': 'Jue',
  '5': 'Vie',
  '6': 'Sáb',
  '7': 'Dom',
}

export function formatHora12h(hora?: string): string {
  if (!hora) return ''
  const [h, m] = hora.split(':')
  const hours = Number(h)
  if (Number.isNaN(hours)) return hora
  const hour12 = hours % 12 || 12
  const ampm = hours >= 12 ? 'pm' : 'am'
  return `${hour12}:${m} ${ampm}`
}

export function formatDiasOperacion(diasOperacion?: string): string {
  const dias = (diasOperacion ?? '')
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)
  if (dias.length === 0) return '—'
  return dias.map((d) => DIAS_LABEL[d] ?? d).join(' ')
}
