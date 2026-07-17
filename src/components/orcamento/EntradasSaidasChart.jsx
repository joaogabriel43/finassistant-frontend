import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatBRLShort } from '@/components/ui';
import api from '../../services/api';
import { extrairMensagemErroApi } from '../../utils/apiErrorUtils';

/**
 * Entradas × Saídas (ADR-036): barras de receitas vs despesas por mês
 * com linha de saldo — mostra visualmente o diferencial mensal.
 */
const EntradasSaidasChart = () => {
  const theme = useTheme();
  const [serie, setSerie] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    api.get('/orcamento/entradas-saidas', { params: { meses: 6 } })
      .then(({ data }) => { if (ativo) setSerie(data); })
      .catch((e) => {
        if (ativo) setErro(extrairMensagemErroApi(e, 'Não foi possível carregar entradas × saídas.'));
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CompareArrowsIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Entradas × Saídas</Typography>
        </Box>

        {erro && <Alert severity="error">{erro}</Alert>}

        {carregando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={26} />
          </Box>
        ) : serie && (
          <Box data-testid="grafico-entradas-saidas">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={serie} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="mes" stroke={theme.palette.text.secondary} fontSize={11} />
                <YAxis tickFormatter={formatBRLShort}
                       stroke={theme.palette.text.secondary} fontSize={11} />
                <Tooltip
                  formatter={(value) => formatBRLShort(value)}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
                <Legend />
                <Bar name="Receitas" dataKey="receitas" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} />
                <Bar name="Despesas" dataKey="despesas" fill={theme.palette.error.main} radius={[4, 4, 0, 0]} />
                <Line name="Saldo" dataKey="saldo" stroke={theme.palette.primary.main}
                      strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default EntradasSaidasChart;
