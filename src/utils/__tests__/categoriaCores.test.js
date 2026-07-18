import { describe, it, expect } from 'vitest';
import { corDaCategoria } from '../categoriaCores';

const CATS = [
    { id: '1', nome: 'Alimentação', cor: '#FF8800', categoriaPaiId: null },
    { id: '2', nome: 'Transporte', cor: '#00AAFF', categoriaPaiId: null },
];

describe('corDaCategoria — match por nome (case-insensitive, trim)', () => {
    it('match exato retorna a cor', () => {
        expect(corDaCategoria('Alimentação', CATS)).toBe('#FF8800');
    });

    it('match ignora caixa e espaços', () => {
        expect(corDaCategoria('  ALIMENTAÇÃO ', CATS)).toBe('#FF8800');
    });

    it('sem match retorna o fallback', () => {
        expect(corDaCategoria('Lazer', CATS, '#DEFA17')).toBe('#DEFA17');
    });

    it('nome/lista vazios retornam fallback sem quebrar', () => {
        expect(corDaCategoria(null, CATS, 'x')).toBe('x');
        expect(corDaCategoria('Lazer', [], 'x')).toBe('x');
        expect(corDaCategoria('Lazer', null, 'x')).toBe('x');
    });
});
