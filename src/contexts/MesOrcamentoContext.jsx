import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { hojeLocal } from '../utils/dateUtils';

// Mês de referência compartilhado entre os sub-componentes da aba Orçamento
// (ex.: Cartões usa para saber de qual fatura mostrar). Padrão de Context
// espelhado em AuthContext.jsx.
export const MesOrcamentoContext = createContext(null);

const MESES_LIMITE_FUTURO = 2;
const MESES_LIMITE_PASSADO = 24;

const pad = (n) => String(n).padStart(2, '0');

function somarMeses(mes, ano, delta) {
    const totalMeses = ano * 12 + (mes - 1) + delta;
    const novoAno = Math.floor(totalMeses / 12);
    const novoMes = (totalMeses % 12) + 1;
    return { mes: novoMes, ano: novoAno };
}

function diferencaEmMeses(mes, ano, mesBase, anoBase) {
    return (ano * 12 + (mes - 1)) - (anoBase * 12 + (mesBase - 1));
}

export function MesOrcamentoProvider({ children }) {
    // Ancorado em America/Sao_Paulo, e nao no fuso do navegador: `isMesAtual`
    // daqui alimenta o AdicionarTransacaoForm, que decide o que e' data futura
    // contra a mesma referência que o backend usa no @PastOrPresent.
    const [anoAtual, mesAtual] = hojeLocal().split('-').map(Number);

    const [mes, setMes] = useState(mesAtual);
    const [ano, setAno] = useState(anoAtual);

    const isMesAtual = mes === mesAtual && ano === anoAtual;
    const diferenca = diferencaEmMeses(mes, ano, mesAtual, anoAtual);
    const podeAvancar = diferenca < MESES_LIMITE_FUTURO;
    const podeVoltar = diferenca > -MESES_LIMITE_PASSADO;

    const navegar = useCallback((delta) => {
        const alvoDiferenca = diferencaEmMeses(mes, ano, mesAtual, anoAtual) + delta;
        if (alvoDiferenca > MESES_LIMITE_FUTURO || alvoDiferenca < -MESES_LIMITE_PASSADO) return;
        const { mes: novoMes, ano: novoAno } = somarMeses(mes, ano, delta);
        setMes(novoMes);
        setAno(novoAno);
    }, [mes, ano, mesAtual, anoAtual]);

    const irParaMesAtual = useCallback(() => {
        setMes(mesAtual);
        setAno(anoAtual);
    }, [mesAtual, anoAtual]);

    const primeiroDiaMes = `${ano}-${pad(mes)}-01`;
    const ultimoDiaMes = useMemo(() => {
        const ultimoDia = new Date(ano, mes, 0).getDate();
        return `${ano}-${pad(mes)}-${pad(ultimoDia)}`;
    }, [mes, ano]);

    const value = useMemo(() => ({
        mes,
        ano,
        isMesAtual,
        navegar,
        irParaMesAtual,
        primeiroDiaMes,
        ultimoDiaMes,
        podeAvancar,
        podeVoltar,
    }), [mes, ano, isMesAtual, navegar, irParaMesAtual, primeiroDiaMes, ultimoDiaMes, podeAvancar, podeVoltar]);

    return (
        <MesOrcamentoContext.Provider value={value}>
            {children}
        </MesOrcamentoContext.Provider>
    );
}

export function useMesOrcamento() { return useContext(MesOrcamentoContext); }
