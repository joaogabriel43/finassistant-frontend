import React from 'react'
import {
  Box, Typography, Card, CardContent, Chip, Button, Divider,
  List, ListItem, ListItemIcon, ListItemText, Accordion,
  AccordionSummary, AccordionDetails,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import StarIcon from '@mui/icons-material/Star'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useNavigate } from 'react-router-dom'
import usePlano from '../hooks/usePlano'

const FEATURES_FREE = [
  { texto: 'Orçamento ilimitado', incluido: true },
  { texto: 'Metas financeiras', incluido: true },
  { texto: 'Calculadoras FIRE e Juros', incluido: true },
  { texto: '10 mensagens de IA por dia', incluido: true },
  { texto: '3 análises de anomalias por mês', incluido: true },
  { texto: 'Exportação PDF/CSV', incluido: false },
  { texto: 'Alertas de preço', incluido: false },
  { texto: 'Otimização Markowitz ilimitada', incluido: false },
  { texto: 'Chat ilimitado', incluido: false },
]

const FEATURES_PREMIUM = FEATURES_FREE.map(f => ({ ...f, incluido: true }))

const FAQ = [
  {
    q: 'Como faço upgrade?',
    a: 'Entre em contato por e-mail em contato@fortunai.app e nossa equipe ativa o Premium manualmente.',
  },
  {
    q: 'Posso cancelar?',
    a: 'Sim, a qualquer momento. Basta nos contatar e seu plano volta para Free imediatamente.',
  },
  {
    q: 'Meus dados ficam salvos?',
    a: 'Sim, todos os seus dados ficam preservados independente do plano.',
  },
]

const PlanoPage = () => {
  const { plano, isPremium, loading } = usePlano()
  // useNavigate kept for potential future use (back button, etc.)
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate()

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#fff', mb: 1 }}>
          Escolha seu plano
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Comece gratuitamente, faça upgrade quando precisar
        </Typography>
        {!loading && (
          <Chip
            icon={<StarIcon sx={{ fontSize: '14px !important' }} />}
            label={`Plano atual: ${plano}`}
            sx={{
              bgcolor: isPremium ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
              color: isPremium ? '#f59e0b' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${isPremium ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}`,
            }}
          />
        )}
      </Box>

      {/* Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 5 }}>

        {/* Free card */}
        <Card sx={{
          background: '#111118',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>Free</Typography>
              {!isPremium && (
                <Chip
                  label="Seu plano atual"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                />
              )}
            </Box>
            <Typography variant="h3" fontWeight={900} sx={{ color: '#fff', mb: 0.5 }}>Gratuito</Typography>
            <Typography variant="caption" color="text.secondary">Para sempre</Typography>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
            <List dense disablePadding>
              {FEATURES_FREE.map((f, i) => (
                <ListItem key={i} sx={{ px: 0, py: 0.3 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    {f.incluido
                      ? <CheckIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                      : <CloseIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.2)' }} />
                    }
                  </ListItemIcon>
                  <ListItemText
                    primary={f.texto}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { color: f.incluido ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Premium card */}
        <Card sx={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(109,40,217,0.08) 100%)',
          border: '2px solid rgba(124,58,237,0.4)',
          borderRadius: '16px',
          position: 'relative',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>Premium</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label="Recomendado"
                  size="small"
                  sx={{ bgcolor: 'rgba(124,58,237,0.3)', color: '#a78bfa', fontSize: 11 }}
                />
                {isPremium && (
                  <Chip
                    label="Plano ativo"
                    size="small"
                    sx={{ bgcolor: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: 11 }}
                  />
                )}
              </Box>
            </Box>
            <Typography variant="h3" fontWeight={900} sx={{ color: '#fff', mb: 0.5 }}>R$ 19,90</Typography>
            <Typography variant="caption" color="text.secondary">por mês · cancele quando quiser</Typography>
            <Divider sx={{ my: 2, borderColor: 'rgba(124,58,237,0.2)' }} />
            <List dense disablePadding>
              {FEATURES_PREMIUM.map((f, i) => (
                <ListItem key={i} sx={{ px: 0, py: 0.3 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={f.texto}
                    primaryTypographyProps={{ variant: 'body2', sx: { color: 'rgba(255,255,255,0.85)' } }}
                  />
                </ListItem>
              ))}
            </List>
            <Button
              variant="contained"
              fullWidth
              disabled={isPremium}
              startIcon={<StarIcon />}
              onClick={() => {
                if (!isPremium) {
                  window.location.href = 'mailto:contato@fortunai.app?subject=Upgrade Premium FortunAI'
                }
              }}
              sx={{
                mt: 3, bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' },
                borderRadius: '10px', textTransform: 'none', fontWeight: 700, py: 1.2,
              }}
            >
              {isPremium ? 'Plano ativo' : 'Começar Premium'}
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* FAQ */}
      <Typography variant="h6" fontWeight={600} sx={{ color: '#fff', mb: 2 }}>
        Perguntas frequentes
      </Typography>
      {FAQ.map((item, i) => (
        <Accordion
          key={i}
          sx={{
            background: '#111118',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px !important',
            mb: 1,
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
            <Typography variant="body2" fontWeight={600} sx={{ color: '#fff' }}>{item.q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">{item.a}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

export default PlanoPage
