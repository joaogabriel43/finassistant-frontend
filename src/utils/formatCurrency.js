// Consolidado no design system D4 — fonte única em src/components/ui.
// Mantido como shim para compatibilidade com os imports existentes.
export { formatBRL, formatBRLShort } from '../components/ui'
import { formatBRL } from '../components/ui'

/**
 * @deprecated Use `formatBRL` de '@/components/ui'.
 * Mantido como alias para não quebrar os imports legados.
 */
export const formatCurrency = formatBRL
