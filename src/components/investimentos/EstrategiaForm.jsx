import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
    Box,
    Button,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const TIPOS = [
    { key: 'ACAO', label: 'Ações' },
    { key: 'FUNDO_IMOBILIARIO', label: 'Fundos Imobiliários' },
    { key: 'RENDA_FIXA', label: 'Renda Fixa' },
    { key: 'CRIPTOMOEDA', label: 'Criptomoedas' },
];

export default function EstrategiaForm() {
    const { user } = useAuth();
    const [linhas, setLinhas] = useState([]);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState(null);
    const [analise, setAnalise] = useState([]);

    const soma = useMemo(() => linhas.reduce((acc, l) => acc + (Number(l.pct) || 0), 0), [linhas]);
    const valido = Math.abs(soma - 100) <= 0.5 && linhas.length > 0 && linhas.every(l => l.pct >= 0 && l.pct <= 100);

    const carregar = async () => {
        if (!user?.id) return;
        console.log('EstrategiaForm.jsx: Tentando carregar. Token no localStorage:', localStorage.getItem('authToken'));
        try {
            // Atualizado para endpoint legacy
            const res = await api.get(`/investimentos/estrategia-legacy`);
            const mapa = res.data?.alocacaoAlvo || {};
            const novas = Object.entries(mapa).map(([k, v]) => ({ tipo: k, pct: Math.round((v || 0) * 10000) / 100 }));
            if (novas.length === 0) {
                setLinhas([{ tipo: 'ACAO', pct: 25 }, { tipo: 'FUNDO_IMOBILIARIO', pct: 25 }, { tipo: 'RENDA_FIXA', pct: 50 }]);
            } else {
                setLinhas(novas);
            }
        } catch (e) {
            console.error('EstrategiaForm.jsx: Falha ao carregar estratégia', e);
            setLinhas([{ tipo: 'ACAO', pct: 25 }, { tipo: 'FUNDO_IMOBILIARIO', pct: 25 }, { tipo: 'RENDA_FIXA', pct: 50 }]);
        }
    };

    useEffect(() => {
        carregar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const addLinha = () => setLinhas(prev => [...prev, { tipo: 'ACAO', pct: 0 }]);
    const rmLinha = (idx) => setLinhas(prev => prev.filter((_, i) => i !== idx));
    const changeTipo = (idx, tipo) => setLinhas(prev => prev.map((l, i) => i === idx ? { ...l, tipo } : l));
    const changePct = (idx, pct) => setLinhas(prev => prev.map((l, i) => i === idx ? { ...l, pct: Number(pct) } : l));

    const salvar = async () => {
        if (!user?.id) return;
        setMensagem(null);
        setAnalise([]);
        if (!valido) {
            setMensagem('A soma deve ser 100% e todos valores entre 0 e 100.');
            return;
        }
        setSalvando(true);
        try {
            const mapa = Object.fromEntries(linhas.map(l => [l.tipo, (Number(l.pct) || 0) / 100]));
            // Atualizado para endpoint legacy; payload sem usuarioId
            await api.post(`/investimentos/estrategia-legacy`, { alocacaoAlvo: mapa });
            setMensagem('Estratégia salva com sucesso.');
        } catch (e) {
            console.error(e);
            setMensagem('Falha ao salvar estratégia.');
        } finally {
            setSalvando(false);
        }
    };

    const executarAnalise = async () => {
        if (!user?.id) return;
        setAnalise([]);
        try {
            // Atualizado para endpoint legacy
            const res = await api.get(`/investimentos/estrategia-legacy/analise`);
            const mensagens = Array.isArray(res.data) ? res.data : (res.data?.mensagens || []);
            setAnalise(mensagens);
        } catch (e) {
            console.error(e);
            setAnalise(['Não foi possível gerar a análise agora.']);
        }
    };

    return (
        <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Defina sua alocação-alvo por classe (deve somar 100%).
            </Typography>

            {linhas.map((l, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Classe</InputLabel>
                        <Select
                            value={l.tipo}
                            label="Classe"
                            onChange={(e) => changeTipo(idx, e.target.value)}
                        >
                            {TIPOS.map(t => (
                                <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        type="number"
                        size="small"
                        label="%"
                        inputProps={{ min: 0, max: 100, step: 0.5 }}
                        value={l.pct}
                        onChange={(e) => changePct(idx, e.target.value)}
                        sx={{ width: 90 }}
                    />

                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>%</Typography>

                    <IconButton
                        color="error"
                        aria-label="remover linha"
                        onClick={() => rmLinha(idx)}
                        size="small"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Button variant="outlined" size="small" onClick={addLinha}>
                    Adicionar Tipo de Ativo
                </Button>
                <Typography
                    variant="body2"
                    sx={{ color: valido ? 'success.main' : 'error.main', fontWeight: 600 }}
                >
                    Soma: {soma.toFixed(1)}%
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                    variant="contained"
                    disabled={!valido || salvando}
                    onClick={salvar}
                >
                    {salvando ? 'Salvando...' : 'Salvar Estratégia'}
                </Button>
                <Button variant="outlined" onClick={executarAnalise}>
                    Analisar Rebalanceamento
                </Button>
            </Box>

            {mensagem && (
                <Typography variant="body2" sx={{ mt: 1.5, color: mensagem.includes('sucesso') ? 'success.main' : 'error.main' }}>
                    {mensagem}
                </Typography>
            )}

            {analise.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Sugestões de Rebalanceamento
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {analise.map((m, i) => (
                            <Typography key={i} component="li" variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                {m}
                            </Typography>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
}
