import React from 'react'
import { Box, Typography, Button, Chip } from '@mui/material'
import { alpha } from '@mui/material/styles'
import StarIcon from '@mui/icons-material/Star'
import { useNavigate } from 'react-router-dom'

const MENSAGENS = {
  CHAT_MENSAGEM: {
    titulo: 'Limite do plano gratuito atingido',
    descricao: (uso) => `Você usou ${uso?.usado ?? '?'}/${uso?.limite ?? '?'} mensagens hoje. Faça upgrade para mensagens ilimitadas.`,
    resetavel: true,
  },
  ANOMALIA_DETECCAO: {
    titulo: 'Limite mensal atingido',
    descricao: (uso) => `Você usou ${uso?.usado ?? '?'}/${uso?.limite ?? '?'} análises de anomalias este mês.`,
    resetavel: true,
  },
  MARKOWITZ: {
    titulo: 'Limite mensal atingido',
    descricao: (uso) => `Você usou ${uso?.usado ?? '?'}/${uso?.limite ?? '?'} otimizações de portfólio este mês.`,
    resetavel: true,
  },
  EXPORTACAO_PDF: {
    titulo: 'Recurso exclusivo Premium',
    descricao: () => 'Exportação de relatórios em PDF é exclusiva do plano Premium.',
    resetavel: false,
  },
  ALERTA_PRECO: {
    titulo: 'Recurso exclusivo Premium',
    descricao: () => 'Alertas de preço são exclusivos do plano Premium.',
    resetavel: false,
  },
}

const PremiumBanner = ({ recurso, uso, onDismiss }) => {
  const navigate = useNavigate()
  const info = MENSAGENS[recurso] ?? {
    titulo: 'Limite atingido',
    descricao: () => 'Faça upgrade para continuar usando este recurso.',
    resetavel: true,
  }

  return (
    <Box sx={(theme) => ({
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.dark, 0.06)} 100%)`,
      border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
      borderRadius: '12px',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    })}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StarIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
          {info.titulo}
        </Typography>
        <Chip label="Premium" size="small"
          sx={(theme) => ({ ml: 'auto', bgcolor: alpha(theme.palette.primary.main, 0.2), color: theme.palette.primary.light, fontSize: 11 })} />
      </Box>

      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {info.descricao(uso)}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<StarIcon />}
          onClick={() => navigate('/plano')}
          sx={{
            textTransform: 'none', fontSize: 12, borderRadius: '8px',
          }}
        >
          Conhecer Premium
        </Button>
        {info.resetavel && onDismiss && (
          <Button size="small" onClick={onDismiss}
            sx={{ color: 'text.disabled', textTransform: 'none', fontSize: 12 }}>
            Lembrar amanhã
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default PremiumBanner
