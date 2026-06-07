// Consolidado no design system D4 — fonte única em src/components/ui.
import { formatBRL } from '../components/ui'

/**
 * @deprecated Use `formatBRL` de '@/components/ui'.
 * Formata um número como moeda BRL: 800.0 → "R$ 800,00"
 */
export const formatCurrency = formatBRL

/**
 * Substitui padrões "R$ 800.0" e "R$ 1500.0" em textos de mensagem
 * por "R$ 800,00" e "R$ 1.500,00" usando regex.
 */
export const formatCurrencyInText = (text) => {
  if (!text || typeof text !== 'string') return text
  return text.replace(/R\$\s*([\d]+(?:\.\d+)?)/g, (_, num) =>
    formatBRL(parseFloat(num))
  )
}
