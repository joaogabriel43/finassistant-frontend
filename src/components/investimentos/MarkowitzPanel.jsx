import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Alert,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useTheme } from '@mui/material/styles';
import { useMarkowitz } from '../../hooks/useMarkowitz';


const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;

const MarkowitzPanel = () => {
    const theme = useTheme();
    // A barra da alocacao ATUAL fica neutra e a OTIMA recebe a cor de
    // destaque — a recomendacao e que precisa saltar aos olhos.
    const COLORS_ATUAL = theme.palette.series[1];
    const COLORS_OTIMA = theme.palette.primary.main;
    const { loading, error, resultado, otimizar } = useMarkowitz();

    // Transforma os dados para o BarChart comparativo
    // Filtra resultados inválidos: se todos os pesos ótimos são 0, não renderiza gráfico
    const chartData = React.useMemo(() => {
        if (!resultado || !resultado.alocacaoOtima) return [];
        const otima = resultado.alocacaoOtima;
        const somaPesosOtimos = Object.values(otima).reduce((s, v) => s + v, 0);
        if (somaPesosOtimos < 0.01) return []; // pesos zerados = resultado inválido
        const tickers = new Set([
            ...Object.keys(resultado.alocacaoAtual || {}),
            ...Object.keys(otima),
        ]);
        return Array.from(tickers)
            .map((ticker) => ({
                ticker: ticker.replace('.SA', ''),
                atual: resultado.alocacaoAtual?.[ticker] || 0,
                otima: otima[ticker] || 0,
            }))
            .sort((a, b) => b.otima - a.otima);
    }, [resultado]);

    const hasData = chartData.length > 0;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                    Otimizador Markowitz
                </Typography>
                <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AutoFixHighIcon />}
                    disabled={loading}
                    onClick={otimizar}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                >
                    {loading ? 'Otimizando...' : 'Otimizar Portfólio'}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!hasData && !loading && !error && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Clique em "Otimizar Portfólio" para calcular a alocação ótima
                        usando o modelo Markowitz (Monte Carlo + Sharpe).
                    </Typography>
                </Box>
            )}

            {hasData && (
                <>
                    <Box sx={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barGap={4}>
                                <XAxis
                                    dataKey="ticker"
                                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                    axisLine={{ stroke: theme.palette.lines.subtle }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tickFormatter={formatPercent}
                                    tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={50}
                                />
                                <Tooltip
                                    formatter={(value, name) => [
                                        formatPercent(value),
                                        name === 'atual' ? 'Alocação Atual' : 'Alocação Ótima',
                                    ]}
                                    contentStyle={{
                                        background: theme.palette.surfaces.raised,
                                        border: `1px solid ${theme.palette.lines.strong}`,
                                        borderRadius: 8,
                                    }}
                                    labelStyle={{ color: theme.palette.text.primary }}
                                    itemStyle={{ color: theme.palette.text.primary }}
                                />
                                <Legend
                                    formatter={(value) =>
                                        value === 'atual' ? 'Alocação Atual' : 'Alocação Ótima (Markowitz)'
                                    }
                                    wrapperStyle={{ color: theme.palette.text.secondary, fontSize: 12 }}
                                />
                                <Bar dataKey="atual" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                    {chartData.map((_, idx) => (
                                        <Cell key={`atual-${idx}`} fill={COLORS_ATUAL} opacity={0.6} />
                                    ))}
                                </Bar>
                                <Bar dataKey="otima" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                    {chartData.map((_, idx) => (
                                        <Cell key={`otima-${idx}`} fill={COLORS_OTIMA} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>

                    {resultado?.taxaLivreDeRisco > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Taxa livre de risco (Selic): {formatPercent(resultado.taxaLivreDeRisco)} a.a.
                            &nbsp;|&nbsp; Simulação: 10.000 portfólios aleatórios (Monte Carlo)
                        </Typography>
                    )}
                </>
            )}
        </Box>
    );
};

export default MarkowitzPanel;
