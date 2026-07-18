/**
 * Cores das categorias gerenciadas (ADR-038).
 *
 * transacoes.categoria é texto livre — o vínculo com a categoria gerenciada
 * é feito por NOME, case-insensitive e com trim, nunca por FK. Sem match,
 * o chamador usa a paleta padrão (fallback).
 */
export function corDaCategoria(nome, categorias, fallback = null) {
    if (!nome || !Array.isArray(categorias) || categorias.length === 0) return fallback;
    const alvo = String(nome).trim().toLowerCase();
    const match = categorias.find(
        (c) => String(c?.nome ?? '').trim().toLowerCase() === alvo
    );
    return match?.cor ?? fallback;
}
