import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Divider,
    Typography,
    useTheme,
} from '@mui/material';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import {
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { investimentoService } from '../../services/investimentoService';
import { extrairMensagemErroApi } from '../../utils/apiErrorUtils';

/**
 * Fronteira eficiente de Markowitz (ADR-033): scatter risco×retorno anualizados
 * com a fronteira de Pareto, a carteira max-Sharpe (com pesos sugeridos) e a
 * posição da carteira atual.
 */

const fmtPct = (v) => `${(v * 100).toFixed(1).replace('.', ',')}%`;

const FronteiraPanel = ({ refreshKey }) => {
    const theme = useTheme();
    const [fronteira, setFronteira] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        let ativo = true;
        setCarregando(true);
        investimentoService.obterFronteira()
            .then((dados) => { if (ativo) setFronteira(dados); })
            .catch((e) => {
                if (ativo) setErro(extrairMensagemErroApi(e, 'Não foi possível calcular a fronteira eficiente.'));
            })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, [refreshKey]);

    if (carregando) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
            </Box>
        );
    }
    if (erro) {
        return <Alert severity="error">{erro}</Alert>;
    }
    if (!fronteira) return null;

    const { pontos, maxSharpe, carteiraAtual, motivoIndisponivel, disclaimer } = fronteira;

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SsidChartIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                <Typography variant="h6">Fronteira eficiente</Typography>
            </Box>

            {motivoIndisponivel ? (
                <Alert severity="info">{motivoIndisponivel}</Alert>
            ) : (
                <Box data-testid="grafico-fronteira">
                    <ResponsiveContainer width="100%" height={320}>
                        <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis type="number" dataKey="risco" name="Risco (a.a.)"
                                   tickFormatter={fmtPct} stroke={theme.palette.text.secondary}
                                   fontSize={11} />
                            <YAxis type="number" dataKey="retorno" name="Retorno (a.a.)"
                                   tickFormatter={fmtPct} stroke={theme.palette.text.secondary}
                                   fontSize={11} />
                            <Tooltip
                                formatter={(value) => fmtPct(value)}
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                }}
                            />
                            <Legend />
                            <Scatter name="Fronteira" data={pontos} line
                                     fill={theme.palette.primary.main} />
                            {maxSharpe && (
                                <Scatter name="Máx. Sharpe" data={[maxSharpe]}
                                         fill={theme.palette.success.main} shape="star" />
                            )}
                            {carteiraAtual && (
                                <Scatter name="Sua carteira" data={[carteiraAtual]}
                                         fill={theme.palette.warning.main} shape="diamond" />
                            )}
                        </ScatterChart>
                    </ResponsiveContainer>

                    {maxSharpe?.pesos && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                Composição máx. Sharpe (índice {maxSharpe.sharpe.toFixed(2).replace('.', ',')})
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {Object.entries(maxSharpe.pesos).map(([ticker, peso]) => (
                                    <Chip key={ticker} size="small" variant="outlined"
                                          label={`${ticker} ${fmtPct(peso)}`} />
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">{disclaimer}</Typography>
        </Box>
    );
};

export default FronteiraPanel;
