import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Alert,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useMesOrcamento } from '../../contexts/MesOrcamentoContext';
import api from '../../services/api';
import CreatableSelect from 'react-select/creatable';

const hoje = () => new Date().toISOString().split('T')[0]; // "yyyy-MM-dd"

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const selectStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: 'transparent',
        borderColor: state.isFocused ? '#7C6AF7' : 'rgba(255,255,255,0.12)',
        borderRadius: 8,
        boxShadow: 'none',
        minHeight: 40,
        ':hover': { borderColor: 'rgba(255,255,255,0.24)' },
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: '#1A1A2E',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        zIndex: 9999,
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? 'rgba(124,106,247,0.12)' : 'transparent',
        color: '#fff',
        ':active': { backgroundColor: 'rgba(124,106,247,0.2)' },
    }),
    singleValue: (base) => ({ ...base, color: '#fff' }),
    input: (base) => ({ ...base, color: '#fff' }),
    placeholder: (base) => ({ ...base, color: '#8B8BA8' }),
    clearIndicator: (base) => ({ ...base, color: '#8B8BA8', ':hover': { color: '#fff' } }),
    dropdownIndicator: (base) => ({ ...base, color: '#8B8BA8', ':hover': { color: '#fff' } }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: 'rgba(255,255,255,0.12)' }),
};

const AdicionarTransacaoForm = ({ onTransacaoAdicionada }) => {
    const { user } = useAuth();
    const { mes, ano, isMesAtual, primeiroDiaMes, ultimoDiaMes } = useMesOrcamento();
    const hojeDate = new Date();
    const isMesFuturo = !isMesAtual
        && (ano > hojeDate.getFullYear() || (ano === hojeDate.getFullYear() && mes > hojeDate.getMonth() + 1));
    const isMesPassado = !isMesAtual && !isMesFuturo;

    const [valor, setValor] = useState('');
    const [categoria, setCategoria] = useState(null);
    const [descricao, setDescricao] = useState('');
    const [tipo, setTipo] = useState('SAIDA');
    const [data, setData] = useState(hoje());
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [categoriasExistentes, setCategoriasExistentes] = useState([]);
    const [isLoadingCategorias, setIsLoadingCategorias] = useState(true);

    // O back-end nunca aceita data futura (@PastOrPresent — ver CLAUDE.md).
    // Ao trocar o mês de referência: em mês passado, pré-preenche uma data
    // dentro dele; em mês atual/futuro, a data de lançamento continua sendo hoje.
    useEffect(() => {
        setData(isMesPassado ? ultimoDiaMes : hoje());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mes, ano]);

    useEffect(() => {
        if (!user || !user.id) return;
        setIsLoadingCategorias(true);
        // União: categorias gerenciadas (ADR-038, vêm primeiro) + categorias já
        // usadas em transações; dedupe case-insensitive. Texto livre continua valendo.
        Promise.all([
            api.get('/orcamento/categorias-gerenciadas').then((r) => r.data ?? []).catch(() => []),
            api.get(`/orcamento/categorias/${user.id}`).then((r) => r.data ?? []).catch(() => []),
        ])
            .then(([gerenciadas, usadas]) => {
                const options = [];
                const vistos = new Set();
                gerenciadas.forEach((c) => {
                    const chave = c.nome.trim().toLowerCase();
                    if (!vistos.has(chave)) {
                        vistos.add(chave);
                        options.push({ value: c.nome, label: c.nome });
                    }
                });
                usadas.forEach((cat) => {
                    const chave = String(cat).trim().toLowerCase();
                    if (!vistos.has(chave)) {
                        vistos.add(chave);
                        options.push({ value: cat, label: cat });
                    }
                });
                setCategoriasExistentes(options);
            })
            .finally(() => setIsLoadingCategorias(false));
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (data > hoje()) {
            setError('A data da transação não pode ser futura.');
            return;
        }
        try {
            if (!user || !user.id) { setError('Usuário não autenticado.'); return; }
            if (!categoria || !categoria.value) { setError('Selecione ou informe uma categoria.'); return; }
            const requestData = { valor, categoria: categoria.value, descricao, tipo, data };
            await api.post(`/orcamento/transacao/${user.id}`, requestData);
            setSuccess('Transação adicionada com sucesso!');
            setValor('');
            setCategoria(null);
            setDescricao('');
            setTipo('SAIDA');
            setData(isMesPassado ? ultimoDiaMes : hoje());
            if (onTransacaoAdicionada) onTransacaoAdicionada();
            if (!categoriasExistentes.find((opt) => opt.value === requestData.categoria)) {
                setCategoriasExistentes((prev) => [...prev, { value: requestData.categoria, label: requestData.categoria }]);
            }
        } catch (err) {
            setError('Falha ao adicionar transação.');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Adicionar Nova Transação
            </Typography>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                <TextField
                    type="number"
                    label="Valor (R$)"
                    size="small"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                    inputProps={{ step: '0.01', min: 0 }}
                />

                <FormControl size="small">
                    <InputLabel>Tipo</InputLabel>
                    <Select value={tipo} label="Tipo" onChange={(e) => setTipo(e.target.value)}>
                        <MenuItem value="SAIDA">Despesa</MenuItem>
                        <MenuItem value="ENTRADA">Receita</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                        Categoria
                    </Typography>
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
                </Box>

                <TextField
                    label="Descrição"
                    size="small"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                    placeholder="Ex: Almoço com amigos"
                    sx={{ gridColumn: '1 / -1' }}
                />

                <TextField
                    type="date"
                    label="Data da transação"
                    size="small"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    inputProps={{ max: hoje(), min: isMesPassado ? primeiroDiaMes : undefined }}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ gridColumn: '1 / -1' }}
                />

                <Box sx={{ gridColumn: '1 / -1' }}>
                    <Button type="submit" variant="contained" fullWidth>
                        Adicionar
                    </Button>
                </Box>
            </Box>

            {isMesPassado && (
                <Alert severity="info" sx={{ mt: 1.5 }}>
                    Adicionando a {MESES[mes - 1]}/{ano}.
                </Alert>
            )}
            {isMesFuturo && (
                <Alert severity="warning" sx={{ mt: 1.5 }}>
                    Você está visualizando {MESES[mes - 1]}/{ano}. Novos lançamentos sempre usam a data
                    de hoje — o sistema não aceita transações com data futura.
                </Alert>
            )}

            {success && <Alert severity="success" sx={{ mt: 1.5 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
        </Box>
    );
};

export default AdicionarTransacaoForm;
