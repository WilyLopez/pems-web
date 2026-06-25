import api from '@/services/api'

export async function imprimirTicket(idReserva: number): Promise<void> {
  const response = await api.get(`/reservas/${idReserva}/ticket`, { responseType: 'blob' })
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;width:0;height:0;border:none;'
  iframe.src = url
  document.body.appendChild(iframe)
  await new Promise<void>((resolve) => {
    iframe.onload = () => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      resolve()
    }
  })
  setTimeout(() => {
    document.body.removeChild(iframe)
    URL.revokeObjectURL(url)
  }, 1000)
}
