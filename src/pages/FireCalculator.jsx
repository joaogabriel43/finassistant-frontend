import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    LinearProgress,
    TextField,
    Typography,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useFireCalculator } from '../hooks/useFireCalculator';

const cardStyle = {
    p: 3,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    boxShadow: 'none',
};

const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

const PERFIS = [
    { key: 'conservador', label: 'Conservador', taxa: '6% aa',  color: '#64B5F6', anosKey: 'anosAteFireConservador', idadeKey: 'idadeFireConservador' },
    { key: 'moderado',    label: 'Moderado',    taxa: '8% aa',  color: '#81C784', anosKey: 'anosAteFireModerado',    idadeKey: 'idadeFireModerado' },
    { key: 'arrojado',    label: 'Arrojado',    taxa: '12% aa', color: '#9575CD', anosKey: 'anosAteFireArrojado',    idadeKey: 'idadeFireArrojado' },
];

// Gera dados de projeção patrimonial para o gráfico
function gerarDadosGrafico(patrimonioAtual, aporteMensal, resultado) {
    if (!resultado) return [];

    const pv  = Number(patrimonioAtual) || 0;
    const pmt = (Number(aporteMensal) || 0) * 12;

    const taxas = {
        conservador: 0.06,
        moderado:    0.08,
        arrojado:    0.12,
    };

    const maxAnos = Math.min(
        Math.ceil(resultado.anosAteFireConservador || 0) + 2,
        60
    );

    const dados = [];
    for (let ano = 0; ano <= maxAnos; ano++) {
        const ponto = { ano };
        for (const [perfil, r] of Object.entries(taxas)) {
            const fv = pmt === 0
                ? pv * Math.pow(1 + r, ano)
                : pv * Math.pow(1 + r, ano) + pmt * (Math.pow(1 + r, ano) - 1) / r;
            ponto[perfil] = Math.round(fv);
        }
        dados.push(ponto);
    }
    return dados;
}

const FireCalculator = () => {
    const { loading, error, resultado, calcular } = useFireCalculator();

    const [form, setForm] = useState({
        patrimonioAtual: '',
        aporteMensal:    '',
        despesaMensal:   '',
        idadeAtual:      '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        calcular({
            patrimonioAtual: Number(form.patrimonioAtual) || 0,
            aporteMensal:    Number(form.aporteMensal) || 0,
            despesaMensal:   Number(form.despesaMensal) || 0,
            idadeAtual:      Number(form.idadeAtual) || 0,
        });
    };

    const dadosGrafico = gerarDadosGrafico(form.patrimonioAtual, form.aporteMensal, resultado);

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <RocketLaunchIcon sx={{ color: '#7C6AF7', fontSize: 28 }} />
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        FIRE Calculator
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Calcule quanto tempo falta para sua independência financeira
                    </Typography>
                </Box>
            </Box>

            {/* SEÇÃO 1 — Formulário */}
            <Card sx={cardStyle}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5 }}>
                        Seus dados financeiros
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                id="patrimonioAtual"
                                name="patrimonioAtual"
                                label="Patrimônio Atual"
                                type="number"
                                size="small"
                                value={form.patrimonioAtual}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                                helperText="Total investido hoje (R$)"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                id="aporteMensal"
                                name="aporteMensal"
                                label="Aporte Mensal"
                                type="number"
                                size="small"
                                value={form.aporteMensal}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                                helperText="Quanto você investe por mês (R$)"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                id="despesaMensal"
                                name="despesaMensal"
                                label="Despesa Mensal"
                                type="number"
                                size="small"
                                value={form.despesaMensal}
                                onChange={handleChange}
                                inputProps={{ min: 0.01 }}
                                helperText="Seus gastos mensais atuais (R$)"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                id="idadeAtual"
                                name="idadeAtual"
                                label="Idade Atual"
                                type="number"
                                size="small"
                                value={form.idadeAtual}
                                onChange={handleChange}
                                inputProps={{ min: 18, max: 80 }}
                                helperText="Sua idade hoje (18–80)"
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSubmit}
                            disabled={loading || !form.despesaMensal || Number(form.despesaMensal) <= 0}
                            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RocketLaunchIcon />}
                            sx={{ borderRadius: '10px', px: 4 }}
                        >
                            {loading ? 'Calculando...' : 'Calcular minha independência financeira'}
                        </Button>
                    </Box>

                    {error && (
                        <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
                            {error}
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* SEÇÃO 2 — Resultado */}
            {resultado && (
                <Box sx={{ mt: 3 }}>
                    {/* Hero: meta FIRE */}
                    <Card sx={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(124,106,247,0.15), rgba(124,106,247,0.05))', mb: 2 }}>
                        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                Meta FIRE — Patrimônio necessário para viver de renda
                            </Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ color: '#7C6AF7', letterSpacing: '-1px' }}>
                                {formatCurrency(resultado.metaPatrimonioFIRE)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Baseado na Regra dos 4% (25× sua despesa anual)
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        Progresso atual
                                    </Typography>
                                    <Typography variant="caption" fontWeight={600}>
                                        {resultado.percentualAtingido.toFixed(1)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(resultado.percentualAtingido, 100)}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: 'rgba(255,255,255,0.08)',
                                        '& .MuiLinearProgress-bar': { bgcolor: '#7C6AF7', borderRadius: 4 },
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>

                    {/* 3 cards por perfil */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        {PERFIS.map(({ key, label, taxa, color, anosKey, idadeKey }) => {
                            const anos  = resultado[anosKey];
                            const idade = resultado[idadeKey];
                            return (
                                <Grid key={key} size={{ xs: 12, md: 4 }}>
                                    <Card
                                        sx={{
                                            ...cardStyle,
                                            borderColor: `${color}33`,
                                            background: `linear-gradient(135deg, ${color}12, ${color}06)`,
                                        }}
                                    >
                                        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                                            <Typography variant="body2" fontWeight={700} sx={{ color, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
                                                {label}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                {taxa}
                                            </Typography>
                                            <Typography variant="h4" fontWeight={800} sx={{ color, mt: 1, letterSpacing: '-1px' }}>
                                                {anos != null ? Math.ceil(anos) : '–'}
                                                <Typography component="span" variant="body2" sx={{ color: 'text.secondary', ml: 0.5 }}>
                                                    anos
                                                </Typography>
                                            </Typography>
                                            {idade != null && (
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                                    Aos {idade} anos de idade
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Gráfico de projeção */}
                    <Card sx={cardStyle}>
                        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                Evolução patrimonial projetada
                            </Typography>
                            <Box sx={{ width: '100%', height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dadosGrafico} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis
                                            dataKey="ano"
                                            tick={{ fill: '#8B8BA8', fontSize: 11 }}
                                            label={{ value: 'Anos', position: 'insideBottom', offset: -2, fill: '#8B8BA8', fontSize: 11 }}
                                        />
                                        <YAxis
                                            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                                            tick={{ fill: '#8B8BA8', fontSize: 11 }}
                                            width={70}
                                        />
                                        <Tooltip
                                            formatter={(value, name) => [formatCurrency(value), name]}
                                            contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                            labelStyle={{ color: '#8B8BA8' }}
                                        />
                                        <ReferenceLine
                                            y={resultado.metaPatrimonioFIRE}
                                            stroke="#7C6AF7"
                                            strokeDasharray="6 3"
                                            label={{ value: 'Meta FIRE', fill: '#7C6AF7', fontSize: 11, position: 'right' }}
                                        />
                                        <Bar dataKey="conservador" name="Conservador" fill="#64B5F6" radius={[2, 2, 0, 0]} />
                                        <Bar dataKey="moderado"    name="Moderado"    fill="#81C784" radius={[2, 2, 0, 0]} />
                                        <Bar dataKey="arrojado"    name="Arrojado"    fill="#9575CD" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Box>
    );
};

export default FireCalculator;
