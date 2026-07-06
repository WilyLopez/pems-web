import { HeroPreview } from './HeroPreview'
import { HeroStatsPreview } from './HeroStatsPreview'
import { SeguridadPreview } from './SeguridadPreview'
import { HistoriaPreview } from './HistoriaPreview'
import { ValoresPreview } from './ValoresPreview'
import { ReglamentoPreview } from './ReglamentoPreview'

type PreviewComponent = (props: {
  valores: Record<string, string>
}) => React.ReactElement

export const PREVIEWS: Record<string, PreviewComponent> = {
  hero: HeroPreview,
  'hero-stats': HeroStatsPreview,
  seguridad: SeguridadPreview,
  historia: HistoriaPreview,
  valores: ValoresPreview,
  reglamento: ReglamentoPreview,
}
