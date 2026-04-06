/**
 * Formata um valor numérico como moeda brasileira (BRL).
 * Exemplo: 1234.56 → "R$ 1.234,56"
 *
 * @param {number} value - Valor a formatar.
 * @returns {string} Valor formatado no padrão pt-BR.
 */
export const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)
