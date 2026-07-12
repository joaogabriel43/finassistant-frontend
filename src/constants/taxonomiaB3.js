// src/constants/taxonomiaB3.js
// ───────────────────────────────────────────────────────────────────
// FONTE ÚNICA da taxonomia setorial B3 no frontend — espelha os enums
// do backend (SetorB3, SubsetorB3, Geografia). Quando a lista oficial
// completa da B3 for adotada, trocar APENAS este módulo.
//
// Os `value` são exatamente os nomes dos enums Java; os `label` são os
// rótulos PT-BR exibidos na UI.

// ── Setores (SetorB3) ───────────────────────────────────────────────
export const SETORES_B3 = [
    { value: 'BENS_INDUSTRIAIS', label: 'Bens Industriais' },
    { value: 'COMUNICACOES', label: 'Comunicações' },
    { value: 'CONSUMO_CICLICO', label: 'Consumo Cíclico' },
    { value: 'CONSUMO_NAO_CICLICO', label: 'Consumo não Cíclico' },
    { value: 'FINANCEIRO', label: 'Financeiro' },
    { value: 'MATERIAIS_BASICOS', label: 'Materiais Básicos' },
    { value: 'PETROLEO_GAS_BIOCOMBUSTIVEIS', label: 'Petróleo, Gás e Biocombustíveis' },
    { value: 'SAUDE', label: 'Saúde' },
    { value: 'TECNOLOGIA_INFORMACAO', label: 'Tecnologia da Informação' },
    { value: 'UTILIDADE_PUBLICA', label: 'Utilidade Pública' },
    { value: 'OUTROS', label: 'Outros' },
];

// ── Subsetores (SubsetorB3) — cada um com o setor pai ───────────────
export const SUBSETORES_B3 = [
    // Bens Industriais
    { value: 'TRANSPORTE', label: 'Transporte', setor: 'BENS_INDUSTRIAIS' },
    { value: 'MAQUINAS_E_EQUIPAMENTOS', label: 'Máquinas e Equipamentos', setor: 'BENS_INDUSTRIAIS' },
    { value: 'CONSTRUCAO_E_ENGENHARIA', label: 'Construção e Engenharia', setor: 'BENS_INDUSTRIAIS' },
    // Comunicações
    { value: 'TELECOMUNICACOES', label: 'Telecomunicações', setor: 'COMUNICACOES' },
    { value: 'MIDIA', label: 'Mídia', setor: 'COMUNICACOES' },
    // Consumo Cíclico
    { value: 'COMERCIO_VAREJISTA', label: 'Comércio Varejista', setor: 'CONSUMO_CICLICO' },
    { value: 'TECIDOS_VESTUARIO_E_CALCADOS', label: 'Tecidos, Vestuário e Calçados', setor: 'CONSUMO_CICLICO' },
    { value: 'VIAGENS_E_LAZER', label: 'Viagens e Lazer', setor: 'CONSUMO_CICLICO' },
    { value: 'CONSTRUCAO_CIVIL', label: 'Construção Civil', setor: 'CONSUMO_CICLICO' },
    // Consumo não Cíclico
    { value: 'ALIMENTOS_PROCESSADOS', label: 'Alimentos Processados', setor: 'CONSUMO_NAO_CICLICO' },
    { value: 'BEBIDAS', label: 'Bebidas', setor: 'CONSUMO_NAO_CICLICO' },
    { value: 'AGROPECUARIA', label: 'Agropecuária', setor: 'CONSUMO_NAO_CICLICO' },
    { value: 'COMERCIO_E_DISTRIBUICAO', label: 'Comércio e Distribuição', setor: 'CONSUMO_NAO_CICLICO' },
    // Financeiro
    { value: 'BANCOS', label: 'Bancos', setor: 'FINANCEIRO' },
    { value: 'SEGUROS', label: 'Seguros', setor: 'FINANCEIRO' },
    { value: 'SERVICOS_FINANCEIROS_DIVERSOS', label: 'Serviços Financeiros Diversos', setor: 'FINANCEIRO' },
    { value: 'EXPLORACAO_DE_IMOVEIS', label: 'Exploração de Imóveis', setor: 'FINANCEIRO' },
    // Materiais Básicos
    { value: 'MINERACAO', label: 'Mineração', setor: 'MATERIAIS_BASICOS' },
    { value: 'SIDERURGIA_E_METALURGIA', label: 'Siderurgia e Metalurgia', setor: 'MATERIAIS_BASICOS' },
    { value: 'QUIMICOS', label: 'Químicos', setor: 'MATERIAIS_BASICOS' },
    { value: 'MADEIRA_E_PAPEL', label: 'Madeira e Papel', setor: 'MATERIAIS_BASICOS' },
    // Petróleo, Gás e Biocombustíveis
    { value: 'EXPLORACAO_REFINO_E_DISTRIBUICAO', label: 'Exploração, Refino e Distribuição', setor: 'PETROLEO_GAS_BIOCOMBUSTIVEIS' },
    { value: 'EQUIPAMENTOS_E_SERVICOS_PETROLIFEROS', label: 'Equipamentos e Serviços Petrolíferos', setor: 'PETROLEO_GAS_BIOCOMBUSTIVEIS' },
    // Saúde
    { value: 'SERVICOS_MEDICO_HOSPITALARES', label: 'Serviços Médico-Hospitalares', setor: 'SAUDE' },
    { value: 'MEDICAMENTOS_E_OUTROS_PRODUTOS', label: 'Medicamentos e Outros Produtos', setor: 'SAUDE' },
    { value: 'EQUIPAMENTOS_HOSPITALARES', label: 'Equipamentos Hospitalares', setor: 'SAUDE' },
    // Tecnologia da Informação
    { value: 'PROGRAMAS_E_SERVICOS', label: 'Programas e Serviços', setor: 'TECNOLOGIA_INFORMACAO' },
    { value: 'COMPUTADORES_E_EQUIPAMENTOS', label: 'Computadores e Equipamentos', setor: 'TECNOLOGIA_INFORMACAO' },
    // Utilidade Pública
    { value: 'ENERGIA_ELETRICA', label: 'Energia Elétrica', setor: 'UTILIDADE_PUBLICA' },
    { value: 'AGUA_E_SANEAMENTO', label: 'Água e Saneamento', setor: 'UTILIDADE_PUBLICA' },
    { value: 'GAS', label: 'Gás', setor: 'UTILIDADE_PUBLICA' },
    // Outros
    { value: 'FUNDOS_DIVERSIFICADOS', label: 'Fundos Diversificados', setor: 'OUTROS' },
    { value: 'OUTROS_DIVERSOS', label: 'Outros Diversos', setor: 'OUTROS' },
];

// ── Geografias (Geografia) ──────────────────────────────────────────
export const GEOGRAFIAS = [
    { value: 'BRASIL', label: 'Brasil' },
    { value: 'EUA', label: 'Estados Unidos' },
    { value: 'GLOBAL', label: 'Global' },
];

// ── Classes de ativo (TipoAtivo) — usadas nos rótulos do breakdown ──
export const CLASSES_ATIVO = [
    { value: 'ACAO', label: 'Ação' },
    { value: 'FUNDO_IMOBILIARIO', label: 'FII' },
    { value: 'RENDA_FIXA', label: 'Renda Fixa' },
    { value: 'CRIPTOMOEDA', label: 'Cripto' },
    { value: 'EXTERIOR', label: 'Exterior' },
];

// ── Chave especial do breakdown (backend) ───────────────────────────
export const NAO_CLASSIFICADO = 'NAO_CLASSIFICADO';
export const LABEL_NAO_CLASSIFICADO = 'Não classificado';

// ── Helpers ─────────────────────────────────────────────────────────

/** Subsetores pertencentes a um setor (lista vazia quando setor falsy). */
export const subsetoresDoSetor = (setor) =>
    setor ? SUBSETORES_B3.filter((s) => s.setor === setor) : [];

/** Setor pai de um subsetor (undefined quando não encontrado). */
export const setorDoSubsetor = (subsetor) =>
    SUBSETORES_B3.find((s) => s.value === subsetor)?.setor;

const buildLabelMap = (lista) =>
    Object.fromEntries(lista.map((item) => [item.value, item.label]));

const LABELS = {
    ...buildLabelMap(SETORES_B3),
    ...buildLabelMap(SUBSETORES_B3),
    ...buildLabelMap(GEOGRAFIAS),
    ...buildLabelMap(CLASSES_ATIVO),
    [NAO_CLASSIFICADO]: LABEL_NAO_CLASSIFICADO,
};

/**
 * Rótulo PT-BR de qualquer chave do breakdown (classe, setor, subsetor,
 * geografia ou NAO_CLASSIFICADO). Fallback: a própria chave.
 */
export const labelDaChave = (chave) => LABELS[chave] ?? chave;
