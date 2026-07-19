import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Select, MenuItem, FormControl,
  InputLabel, Chip, Button, Collapse, IconButton, Skeleton, Alert,
  FormControlLabel, Switch, Paper, Divider,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../contexts/AuthContext';
import useResumoInteligente from '../hooks/useResumoInteligente';

// ── Constantes ────────────────────────────────────────────────────────────────

const MESES = [
  { value: 1, label: 'Janeiro' },  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },    { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },     { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },    { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },{ value: 12, label: 'Dezembro' },
];

const anoAtual = new Date().getFullYear();
const ANOS = [anoAtual - 2, anoAtual - 1, anoAtual];

// Mapa tipo → apresentação (ícone + cor). O tipo vem do backend (ADR-045).
const TIPO_META = {
  CONQUISTA:    { icon: EmojiEventsIcon,       cor: '#4caf50', rotulo: 'Conquista' },
  ALERTA:       { icon: WarningAmberIcon,      cor: '#ef5350', rotulo: 'Alerta' },
  OPORTUNIDADE: { icon: LightbulbOutlinedIcon, cor: '#FFC107', rotulo: 'Oportunidade' },
  INVESTIMENTO: { icon: ShowChartIcon,         cor: '#7C6AF7', rotulo: 'Investimento' },
  TENDENCIA:    { icon: TimelineIcon,          cor: '#29b6f6', rotulo: 'Tendência' },
  IMPACTO:      { icon: TrendingUpIcon,        cor: '#ff9800', rotulo: 'Impacto' },
};

const cardStyle = {
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  boxShadow: 'none',
};

// ── Card de um insight, com botão "por quê?" ─────────────────────────────────

const InsightCard = ({ insight, destaque }) => {
  const [aberto, setAberto] = useState(false);
  const meta = TIPO_META[insight.tipo] || TIPO_META.TENDENCIA;
  const Icone = meta.icon;

  return (
    <Card
      sx={{
        ...cardStyle,
        borderColor: destaque ? `${meta.cor}66` : 'rgba(255,255,255,0.08)',
        bgcolor: destaque ? `${meta.cor}0d` : 'transparent',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: 2, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: `${meta.cor}1a`,
            }}
          >
            <Icone sx={{ color: meta.cor, fontSize: 20 }} />
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                {insight.titulo}
              </Typography>
              <Chip
                label={meta.rotulo}
                size="small"
                sx={{
                  height: 18, fontSize: 10, fontWeight: 700,
                  bgcolor: `${meta.cor}1a`, color: meta.cor,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              {insight.texto}
            </Typography>

            {insight.porQue && (
              <>
                <Button
                  size="small"
                  startIcon={<HelpOutlineIcon sx={{ fontSize: 16 }} />}
                  endIcon={
                    <ExpandMoreIcon
                      sx={{
                        fontSize: 16,
                        transform: aberto ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                      }}
                    />
                  }
                  onClick={() => setAberto((v) => !v)}
                  aria-expanded={aberto}
                  sx={{
                    mt: 1, px: 1, minWidth: 0, textTransform: 'none',
                    color: meta.cor, fontSize: 12, fontWeight: 600,
                  }}
                >
                  por quê?
                </Button>
                <Collapse in={aberto}>
                  <Box
                    sx={{
                      mt: 1, p: 1.5, borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.04)',
                      borderLeft: `3px solid ${meta.cor}`,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {insight.porQue}
                    </Typography>
                  </Box>
                </Collapse>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ── Disclaimer ────────────────────────────────────────────────────────────────

const Disclaimer = ({ texto }) => (
  <Paper
    elevation={0}
    sx={{
      mt: 3, p: 2, borderRadius: 2,
      border: '1px solid rgba(255,255,255,0.1)',
      bgcolor: 'rgba(255,255,255,0.03)',
      display: 'flex', alignItems: 'flex-start', gap: 1.5,
    }}
  >
    <WarningAmberIcon sx={{ color: 'text.disabled', mt: 0.2, flexShrink: 0, fontSize: 20 }} />
    <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
      {texto}
    </Typography>
  </Paper>
);

// ── Estado vazio ──────────────────────────────────────────────────────────────

const SemInsights = () => (
  <Card sx={{ ...cardStyle }}>
    <CardContent sx={{ py: 5, textAlign: 'center' }}>
      <AutoAwesomeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
      <Typography color="text.secondary">
        Nenhum destaque relevante neste período. Registre mais lançamentos para
        receber insights sobre suas finanças.
      </Typography>
    </CardContent>
  </Card>
);

// ── Página principal ──────────────────────────────────────────────────────────

const ResumoInteligente = () => {
  const { user } = useAuth();
  const { resumo, loading, error, gerar } = useResumoInteligente();

  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [modoDireto, setModoDireto] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    gerar(mes, ano, modoDireto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, mes, ano, modoDireto]);

  const top = resumo?.topInsights ?? [];
  const outros = resumo?.outrosInsights ?? [];
  const semDestaques = !loading && resumo && top.length === 0 && outros.length === 0;

  return (
    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', px: { xs: 1.5, md: 3 }, py: 2 }}>

      {/* Header */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 2, mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AutoAwesomeIcon sx={{ color: '#7C6AF7', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Resumo Inteligente do Período
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Conquistas, alertas e oportunidades priorizados do seu mês.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Mês</InputLabel>
            <Select value={mes} label="Mês" onChange={(e) => setMes(e.target.value)}>
              {MESES.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel>Ano</InputLabel>
            <Select value={ano} label="Ano" onChange={(e) => setAno(e.target.value)}>
              {ANOS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Toggle modo direto */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={modoDireto}
              onChange={(e) => setModoDireto(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="caption" color="text.secondary">
              Modo direto (só os números, sem narrativa de IA)
            </Typography>
          }
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
      )}

      {loading && (
        <Box>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              animation="wave"
              variant="rectangular"
              height={90}
              sx={{ mb: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }}
            />
          ))}
        </Box>
      )}

      {!loading && resumo && (
        <>
          {/* Narrativa da IA (modo completo com cota) */}
          {resumo.geradoComIa && resumo.narrativa && (
            <Card sx={{ ...cardStyle, mb: 3, bgcolor: 'rgba(124,106,247,0.06)',
                borderColor: 'rgba(124,106,247,0.3)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AutoAwesomeIcon sx={{ color: '#7C6AF7', fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#7C6AF7' }}>
                    Resumo do mês
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {resumo.narrativa}
                </Typography>
              </CardContent>
            </Card>
          )}

          {semDestaques ? (
            <SemInsights />
          ) : (
            <>
              {/* TOP 3 — os mais relevantes */}
              {top.length > 0 && (
                <Box sx={{ mb: outros.length > 0 ? 3 : 0 }}>
                  <Typography
                    variant="overline"
                    sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}
                  >
                    Destaques do mês
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                    {top.map((ins, i) => (
                      <InsightCard key={`top-${i}`} insight={ins} destaque />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Outros insights */}
              {outros.length > 0 && (
                <Box>
                  <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
                  <Typography
                    variant="overline"
                    sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}
                  >
                    Outros pontos
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                    {outros.map((ins, i) => (
                      <InsightCard key={`outro-${i}`} insight={ins} />
                    ))}
                  </Box>
                </Box>
              )}
            </>
          )}

          {resumo.disclaimer && <Disclaimer texto={resumo.disclaimer} />}
        </>
      )}
    </Box>
  );
};

export default ResumoInteligente;
