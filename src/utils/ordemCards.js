/**
 * Ordem customizada dos cards da aba Investimentos (ADR-037).
 *
 * A ordem salva no backend é uma lista plana de ids de card. Como o conjunto
 * de cards evolui a cada release, a ordem salva é sempre RECONCILIADA com o
 * registry atual: ids desconhecidos são descartados (card removido do produto)
 * e ids ausentes são anexados na posição padrão relativa (card novo).
 */

/**
 * Reconcilia a ordem salva com a ordem padrão do registry.
 * @param {string[]} salva  ids vindos do backend (pode ser vazia = nunca reordenou)
 * @param {string[]} padrao ids na ordem padrão do registry (fonte da verdade dos ids válidos)
 * @returns {string[]} ordem final: salvos válidos primeiro, novos cards ao fim
 */
export function mesclarOrdem(salva, padrao) {
    if (!Array.isArray(salva) || salva.length === 0) return [...padrao];
    const validos = salva.filter((id) => padrao.includes(id));
    const faltantes = padrao.filter((id) => !validos.includes(id));
    return [...validos, ...faltantes];
}

/**
 * Move um card uma posição para cima/baixo DENTRO da sua sub-aba.
 * A lista é plana (todas as abas juntas); o swap acontece com o vizinho
 * pertencente à mesma sub-aba — cards de outras abas ficam intactos.
 *
 * @param {string[]} ordem      lista plana atual
 * @param {string}   id         card a mover
 * @param {number}   direcao    -1 = sobe, +1 = desce
 * @param {string[]} idsDaAba   ids que pertencem à mesma sub-aba do card
 * @returns {string[]} nova lista (a original nunca é mutada); no-op nas bordas
 */
export function moverCard(ordem, id, direcao, idsDaAba) {
    const posicoesDaAba = ordem
        .map((cardId, idx) => ({ cardId, idx }))
        .filter(({ cardId }) => idsDaAba.includes(cardId));

    const posAtual = posicoesDaAba.findIndex(({ cardId }) => cardId === id);
    if (posAtual === -1) return ordem;

    const posDestino = posAtual + direcao;
    if (posDestino < 0 || posDestino >= posicoesDaAba.length) return ordem; // borda

    const nova = [...ordem];
    const a = posicoesDaAba[posAtual].idx;
    const b = posicoesDaAba[posDestino].idx;
    [nova[a], nova[b]] = [nova[b], nova[a]];
    return nova;
}
