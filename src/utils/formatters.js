/**
 * Formata um número como moeda BRL: 800.0 → "R$ 800,00"
 */
export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)

/**
 * Substitui padrões "R$ 800.0" e "R$ 1500.0" em textos de mensagem
 * por "R$ 800,00" e "R$ 1.500,00" usando regex.
 */
export const formatCurrencyInText = (text) => {
  if (!text || typeof text !== 'string') return text
  return text.replace(/R\$\s*([\d]+(?:\.\d+)?)/g, (_, num) =>
    formatCurrency(parseFloat(num))
  )
}
