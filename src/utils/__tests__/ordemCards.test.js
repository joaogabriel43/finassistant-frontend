import { describe, it, expect } from 'vitest';
import { mesclarOrdem, moverCard } from '../ordemCards';

const PADRAO = ['a', 'b', 'c', 'd'];

describe('mesclarOrdem — reconciliação da ordem salva com o registry', () => {
    it('ordem salva vazia retorna a ordem padrão', () => {
        expect(mesclarOrdem([], PADRAO)).toEqual(PADRAO);
        expect(mesclarOrdem(null, PADRAO)).toEqual(PADRAO);
    });

    it('ordem salva completa é respeitada', () => {
        expect(mesclarOrdem(['d', 'b', 'a', 'c'], PADRAO)).toEqual(['d', 'b', 'a', 'c']);
    });

    it('id desconhecido (card removido do produto) é descartado', () => {
        expect(mesclarOrdem(['x', 'b', 'a'], PADRAO)).toEqual(['b', 'a', 'c', 'd']);
    });

    it('cards novos (ausentes na ordem salva) são anexados ao fim', () => {
        expect(mesclarOrdem(['c', 'a'], PADRAO)).toEqual(['c', 'a', 'b', 'd']);
    });

    it('não muta a ordem padrão', () => {
        const padrao = ['a', 'b'];
        mesclarOrdem(['b', 'a'], padrao);
        expect(padrao).toEqual(['a', 'b']);
    });
});

describe('moverCard — swap com vizinho da MESMA sub-aba na lista plana', () => {
    // aba1 = [a, c] | aba2 = [b, d] — intercalados na lista plana
    const ORDEM = ['a', 'b', 'c', 'd'];
    const ABA1 = ['a', 'c'];
    const ABA2 = ['b', 'd'];

    it('descer pula cards de outra aba e troca com o próximo da mesma aba', () => {
        expect(moverCard(ORDEM, 'a', 1, ABA1)).toEqual(['c', 'b', 'a', 'd']);
    });

    it('subir troca com o anterior da mesma aba', () => {
        expect(moverCard(ORDEM, 'd', -1, ABA2)).toEqual(['a', 'd', 'c', 'b']);
    });

    it('primeiro da aba subindo é no-op', () => {
        expect(moverCard(ORDEM, 'a', -1, ABA1)).toEqual(ORDEM);
    });

    it('último da aba descendo é no-op', () => {
        expect(moverCard(ORDEM, 'd', 1, ABA2)).toEqual(ORDEM);
    });

    it('id inexistente é no-op', () => {
        expect(moverCard(ORDEM, 'zzz', 1, ABA1)).toEqual(ORDEM);
    });

    it('não muta a lista original', () => {
        const original = [...ORDEM];
        moverCard(ORDEM, 'a', 1, ABA1);
        expect(ORDEM).toEqual(original);
    });
});
