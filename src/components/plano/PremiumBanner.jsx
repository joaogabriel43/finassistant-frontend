import React from 'react'
import { Box, Typography, Button, Chip } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'

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
  const info = MENSAGENS[recurso] ?? {
    titulo: 'Limite atingido',
    descricao: () => 'Faça upgrade para continuar usando este recurso.',
    resetavel: true,
  }

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(109,40,217,0.06) 100%)',
      border: '1px solid rgba(124,58,237,0.25)',
      borderRadius: '12px',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StarIcon sx={{ color: '#7C3AED', fontSize: 20 }} />
        <Typography variant="body2" fontWeight={600} sx={{ color: '#fff' }}>
          {info.titulo}
        </Typography>
        <Chip label="Premium" size="small"
          sx={{ ml: 'auto', bgcolor: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontSize: 11 }} />
      </Box>

      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
        {info.descricao(uso)}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<StarIcon />}
          href="mailto:contato@fortunai.app?subject=Upgrade Premium"
          sx={{
            bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' },
            textTransform: 'none', fontSize: 12, borderRadius: '8px',
          }}
        >
          Conhecer Premium
        </Button>
        {info.resetavel && onDismiss && (
          <Button size="small" onClick={onDismiss}
            sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'none', fontSize: 12 }}>
            Lembrar amanhã
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default PremiumBanner
