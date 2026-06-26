import { SolicitarEventoWizardView } from '@/features/cliente/celebraciones-wizard/components/views/SolicitarEventoWizardView'
import { AyudaWizardSheet } from '@/features/cliente/celebraciones-wizard/components/ui/AyudaWizardSheet'

export default function SolicitarEventoPage() {
  return (
    <>
      <SolicitarEventoWizardView />
      <AyudaWizardSheet />
    </>
  )
}
