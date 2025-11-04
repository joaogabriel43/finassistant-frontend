import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import CreatableSelect from 'react-select/creatable';

const AdicionarTransacaoForm = ({ onTransacaoAdicionada }) => {
    const { user } = useAuth();
    const [valor, setValor] = useState('');
    const [categoria, setCategoria] = useState(null); // { value, label }
    const [descricao, setDescricao] = useState('');
    const [tipo, setTipo] = useState('SAIDA');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [categoriasExistentes, setCategoriasExistentes] = useState([]);
    const [isLoadingCategorias, setIsLoadingCategorias] = useState(true);

    useEffect(() => {
        if (!user || !user.id) return;
        setIsLoadingCategorias(true);
        api.get(`/orcamento/categorias/${user.id}`)
            .then((res) => {
                const options = (res.data || []).map((cat) => ({ value: cat, label: cat }));
                setCategoriasExistentes(options);
            })
            .catch((err) => console.error('Erro ao buscar categorias', err))
            .finally(() => setIsLoadingCategorias(false));
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            if (!user || !user.id) {
                setError('Usuário não autenticado.');
                return;
            }
            if (!categoria || !categoria.value) {
                setError('Selecione ou informe uma categoria.');
                return;
            }
            const requestData = { valor, categoria: categoria.value, descricao, tipo };
            await api.post(`/orcamento/transacao/${user.id}`, requestData);
            setSuccess('Transação adicionada com sucesso!');
            // Limpa o formulário
            setValor('');
            setCategoria(null);
            setDescricao('');
            setTipo('SAIDA');
            // Atualiza a lista/gráfico
            if (onTransacaoAdicionada) onTransacaoAdicionada();
            // Se criou uma categoria nova, adiciona à lista de opções
            if (!categoriasExistentes.find((opt) => opt.value === requestData.categoria)) {
                setCategoriasExistentes((prev) => [...prev, { value: requestData.categoria, label: requestData.categoria }]);
            }
        } catch (err) {
            setError('Falha ao adicionar transação.');
        }
    };

    // Estilos do formulário (tema escuro)
    const formStyle = { display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', background: '#2d3748', padding: 16, borderRadius: 8, marginBottom: 16, color: '#e2e8f0' };
    const inputStyle = { padding: 10, borderRadius: 6, border: '1px solid #4a5568', background: '#1a202c', color: '#e2e8f0' };
    const fullRow = { gridColumn: '1 / -1' };
    const buttonStyle = { ...inputStyle, background: '#00C49F', border: 'none', color: '#0b1513', fontWeight: 700, cursor: 'pointer' };

    // Estilos do react-select para combinar com tema escuro
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: '#1a202c',
            borderColor: state.isFocused ? '#00C49F' : '#4a5568',
            boxShadow: 'none',
            ':hover': { borderColor: '#00C49F' },
            color: '#e2e8f0',
        }),
        menu: (base) => ({ ...base, backgroundColor: '#1a202c', color: '#e2e8f0' }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#2d3748' : '#1a202c',
            color: '#e2e8f0',
            ':active': { backgroundColor: '#2d3748' },
        }),
        singleValue: (base) => ({ ...base, color: '#e2e8f0' }),
        input: (base) => ({ ...base, color: '#e2e8f0' }),
        placeholder: (base) => ({ ...base, color: '#a0aec0' }),
        clearIndicator: (base) => ({ ...base, color: '#a0aec0' }),
        dropdownIndicator: (base) => ({ ...base, color: '#a0aec0' }),
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <h4 style={{ margin: 0, ...fullRow }}>Adicionar Nova Transação</h4>
            <input type="number" step="0.01" placeholder="Valor (ex: 50.75)" value={valor} onChange={(e) => setValor(e.target.value)} required style={inputStyle} />

            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyle}>
                <option value="SAIDA">Despesa</option>
                <option value="ENTRADA">Receita</option>
            </select>

            <CreatableSelect
                isClearable
                isDisabled={isLoadingCategorias}
                isLoading={isLoadingCategorias}
                onChange={(newValue) => setCategoria(newValue)}
                options={categoriasExistentes}
                value={categoria}
                placeholder="Selecione ou digite uma categoria..."
                styles={selectStyles}
            />

            <input type="text" placeholder="Descrição (ex: Almoço com amigos)" value={descricao} onChange={(e) => setDescricao(e.target.value)} required style={inputStyle} />

            <div style={fullRow}>
                <button type="submit" style={buttonStyle}>Adicionar</button>
            </div>
            {success && <p style={{ color: '#00C49F', ...fullRow }}>{success}</p>}
            {error && <p style={{ color: '#FF8042', ...fullRow }}>{error}</p>}
        </form>
    );
};

export default AdicionarTransacaoForm;
