import { formatDate } from '@/lib/utils'

export function buildWhatsAppLink(
  telefono: string,
  nombreCliente: string,
  fechaEvento: string
): string {
  const numero = telefono.replace(/\D/g, '')
  const mensaje = `Hola ${nombreCliente}, le contactamos sobre su evento del ${formatDate(fechaEvento)}.`
  return `https://wa.me/51${numero}?text=${encodeURIComponent(mensaje)}`
}
