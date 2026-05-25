import { redirect } from 'next/navigation'

export default function FechaRedirectPage({
  params,
}: {
  params: { fecha: string }
}) {
  redirect(`/reservar?fecha=${params.fecha}`)
}
