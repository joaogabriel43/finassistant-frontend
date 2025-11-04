import React, { useState } from 'react';
import AdicionarTransacaoForm from '../components/orcamento/AdicionarTransacaoForm';
import GastosPorCategoriaChart from '../components/dashboard/GastosPorCategoriaChart';
import ListaTransacoes from '../components/orcamento/ListaTransacoes';

const Orcamento = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleTransacaoAdicionada = () => {
        setRefreshKey((k) => k + 1);
    };

    const handleTransacaoAlterada = () => {
        setRefreshKey((k) => k + 1);
    };

    const contentWrapperStyle = { width: '100%', maxWidth: '1200px' };

    return (
        <div style={contentWrapperStyle}>
            <h2>Painel de Orçamento</h2>
            <hr />
            <AdicionarTransacaoForm onTransacaoAdicionada={handleTransacaoAdicionada} />
            <ListaTransacoes refreshKey={refreshKey} onChanged={handleTransacaoAlterada} />
            <GastosPorCategoriaChart key={refreshKey} />
        </div>
    );
};

export default Orcamento;
