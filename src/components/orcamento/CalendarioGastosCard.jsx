import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { formatBRL } from '@/components/ui';
import api from '../../services/api';
import { extrairMensagemErroApi } from '../../utils/apiErrorUtils';

/**
 * Calendário de gastos (ADR-036): heatmap do mês — intensidade da célula
 * proporcional ao gasto do dia (normalizada pelo maiorGastoDia do backend).
 */

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const CalendarioGastosCard = () => {
  const theme = useTheme();
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(() => {
    setCarregando(true);
    api.get('/orcamento/calendario', { params: { mes, ano } })
      .then(({ data }) => { setDados(data); setErro(''); })
      .catch((e) => setErro(extrairMensagemErroApi(e, 'Não foi possível carregar o calendário.')))
      .finally(() => setCarregando(false));
  }, [mes, ano]);

  useEffect(() => { carregar(); }, [carregar]);

  const navegar = (delta) => {
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes < 1) { novoMes = 12; novoAno -= 1; }
    if (novoMes > 12) { novoMes = 1; novoAno += 1; }
    setMes(novoMes);
    setAno(novoAno);
  };

  const corDoDia = (dia) => {
    const maior = Number(dados?.maiorGastoDia ?? 0);
    const gasto = Number(dia.totalDebito);
    if (gasto <= 0) return theme.palette.action.hover;
    const alpha = maior > 0 ? 0.15 + (gasto / maior) * 0.75 : 0.5;
    return `${theme.palette.error.main}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Calendário de gastos</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" aria-label="mês anterior" onClick={() => navegar(-1)}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: 130, textAlign: 'center' }}>
              {MESES[mes - 1]} {ano}
            </Typography>
            <IconButton size="small" aria-label="próximo mês" onClick={() => navegar(1)}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

        {carregando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={26} />
          </Box>
        ) : dados && (
          <Box data-testid="heatmap-calendario">
            <Box sx={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5,
            }}>
              {dados.dias.map((d) => (
                <Tooltip key={d.dia}
                         title={`Dia ${d.dia}: gastos ${formatBRL(d.totalDebito)}${Number(d.totalCredito) > 0 ? ` · entradas ${formatBRL(d.totalCredito)}` : ''}`}>
                  <Box sx={{
                    aspectRatio: '1', borderRadius: 1,
                    backgroundColor: corDoDia(d),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'default',
                  }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.primary }}>
                      {d.dia}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1, fontFamily: theme.typography.fontFamilyMono }}>
              Total do mês: {formatBRL(dados.totalDebitos)} em gastos · {formatBRL(dados.totalCreditos)} em entradas
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarioGastosCard;
