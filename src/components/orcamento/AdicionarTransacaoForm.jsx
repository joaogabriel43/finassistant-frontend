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
import api from '../../services/api';
import CreatableSelect from 'react-select/creatable';

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
    const [valor, setValor] = useState('');
    const [categoria, setCategoria] = useState(null);
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
            if (!user || !user.id) { setError('Usuário não autenticado.'); return; }
            if (!categoria || !categoria.value) { setError('Selecione ou informe uma categoria.'); return; }
            const requestData = { valor, categoria: categoria.value, descricao, tipo };
            await api.post(`/orcamento/transacao/${user.id}`, requestData);
            setSuccess('Transação adicionada com sucesso!');
            setValor('');
            setCategoria(null);
            setDescricao('');
            setTipo('SAIDA');
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

                <Box sx={{ gridColumn: '1 / -1' }}>
                    <Button type="submit" variant="contained" fullWidth>
                        Adicionar
                    </Button>
                </Box>
            </Box>

            {success && <Alert severity="success" sx={{ mt: 1.5 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
        </Box>
    );
};

export default AdicionarTransacaoForm;
