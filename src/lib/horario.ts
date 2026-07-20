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

function minutosDesdeMedianoche(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return (Number.isNaN(h) ? 0 : h) * 60 + (Number.isNaN(m) ? 0 : m)
}

export function estaDentroDeHorarioAtencion(
  horaApertura?: string,
  horaCierre?: string,
  ahora: Date = new Date()
): boolean {
  if (!horaApertura || !horaCierre) return true
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes()
  return (
    minutosAhora >= minutosDesdeMedianoche(horaApertura) &&
    minutosAhora <= minutosDesdeMedianoche(horaCierre)
  )
}

export function mensajeFueraDeHorario(
  horaApertura?: string,
  horaCierre?: string,
  ahora: Date = new Date()
): string {
  if (!horaApertura || !horaCierre) return ''
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes()
  const aunNoAbre = minutosAhora < minutosDesdeMedianoche(horaApertura)
  return aunNoAbre
    ? `El local aún no abre. Abre a las ${formatHora12h(horaApertura)}.`
    : `El local ya cerró. Cerró a las ${formatHora12h(horaCierre)}.`
}

export function formatDiasOperacion(diasOperacion?: string): string {
  const dias = (diasOperacion ?? '')
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)
  if (dias.length === 0) return '—'
  return dias.map((d) => DIAS_LABEL[d] ?? d).join(' ')
}
