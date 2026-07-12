import { describe, it, expect } from 'vitest';
import {
    CLASSES_ATIVO,
    GEOGRAFIAS,
    LABEL_NAO_CLASSIFICADO,
    NAO_CLASSIFICADO,
    SETORES_B3,
    SUBSETORES_B3,
    labelDaChave,
    setorDoSubsetor,
    subsetoresDoSetor,
} from '../taxonomiaB3';

describe('taxonomiaB3 — estrutura', () => {
    it('contém os 11 setores da B3', () => {
        expect(SETORES_B3).toHaveLength(11);
        expect(SETORES_B3.map((s) => s.value)).toContain('FINANCEIRO');
        expect(SETORES_B3.map((s) => s.value)).toContain('PETROLEO_GAS_BIOCOMBUSTIVEIS');
    });

    it('contém as 3 geografias com rótulos PT-BR', () => {
        expect(GEOGRAFIAS).toEqual([
            { value: 'BRASIL', label: 'Brasil' },
            { value: 'EUA', label: 'Estados Unidos' },
            { value: 'GLOBAL', label: 'Global' },
        ]);
    });

    it('contém as 5 classes de ativo incluindo EXTERIOR', () => {
        expect(CLASSES_ATIVO.map((c) => c.value)).toEqual([
            'ACAO',
            'FUNDO_IMOBILIARIO',
            'RENDA_FIXA',
            'CRIPTOMOEDA',
            'EXTERIOR',
        ]);
        expect(CLASSES_ATIVO.find((c) => c.value === 'EXTERIOR').label).toBe('Exterior');
    });

    it('todo subsetor referencia um setor pai válido', () => {
        const setoresValidos = new Set(SETORES_B3.map((s) => s.value));
        for (const sub of SUBSETORES_B3) {
            expect(setoresValidos.has(sub.setor), `setor pai inválido em ${sub.value}`).toBe(true);
        }
    });

    it('não há subsetores duplicados', () => {
        const values = SUBSETORES_B3.map((s) => s.value);
        expect(new Set(values).size).toBe(values.length);
    });

    it('todo setor tem pelo menos um subsetor', () => {
        for (const setor of SETORES_B3) {
            expect(
                subsetoresDoSetor(setor.value).length,
                `setor sem subsetor: ${setor.value}`,
            ).toBeGreaterThan(0);
        }
    });
});

describe('taxonomiaB3 — helpers', () => {
    it('subsetoresDoSetor filtra apenas os subsetores do setor informado', () => {
        const financeiro = subsetoresDoSetor('FINANCEIRO');
        expect(financeiro.map((s) => s.value)).toEqual([
            'BANCOS',
            'SEGUROS',
            'SERVICOS_FINANCEIROS_DIVERSOS',
            'EXPLORACAO_DE_IMOVEIS',
        ]);
    });

    it('subsetoresDoSetor retorna lista vazia para setor falsy', () => {
        expect(subsetoresDoSetor('')).toEqual([]);
        expect(subsetoresDoSetor(null)).toEqual([]);
        expect(subsetoresDoSetor(undefined)).toEqual([]);
    });

    it('setorDoSubsetor resolve o setor pai', () => {
        expect(setorDoSubsetor('BANCOS')).toBe('FINANCEIRO');
        expect(setorDoSubsetor('MINERACAO')).toBe('MATERIAIS_BASICOS');
        expect(setorDoSubsetor('ENERGIA_ELETRICA')).toBe('UTILIDADE_PUBLICA');
    });

    it('setorDoSubsetor retorna undefined para subsetor desconhecido', () => {
        expect(setorDoSubsetor('NAO_EXISTE')).toBeUndefined();
    });

    it('labelDaChave resolve rótulos de todas as dimensões e o bucket especial', () => {
        expect(labelDaChave('ACAO')).toBe('Ação');
        expect(labelDaChave('FINANCEIRO')).toBe('Financeiro');
        expect(labelDaChave('BANCOS')).toBe('Bancos');
        expect(labelDaChave('BRASIL')).toBe('Brasil');
        expect(labelDaChave(NAO_CLASSIFICADO)).toBe(LABEL_NAO_CLASSIFICADO);
    });

    it('labelDaChave faz fallback para a própria chave quando desconhecida', () => {
        expect(labelDaChave('CHAVE_INEXISTENTE')).toBe('CHAVE_INEXISTENTE');
    });
});
