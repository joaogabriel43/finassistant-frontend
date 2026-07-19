import React from 'react'
import { NavLink } from 'react-router-dom'
import { Box, Chip, Typography } from '@mui/material'
import NotificacoesBadge from './notificacoes/NotificacoesBadge'
import UserMenu from './layout/UserMenu'
import PlanoBadge from './plano/PlanoBadge'
import usePlano from '../hooks/usePlano'

const NAV_LINKS = [
  { to: '/dashboard',       label: 'Dashboard' },
  { to: '/resumo',          label: 'Resumo do Mês' },
  { to: '/chat',            label: 'Chat',            tutorial: 'chat' },
  { to: '/orcamento',       label: 'Orçamento',       tutorial: 'orcamento' },
  { to: '/investimentos',   label: 'Investimentos',   tutorial: 'investimentos' },
  { to: '/calculadoras',    label: 'Calculadoras',    tutorial: 'calculadoras' },
  { to: '/fluxo-caixa',    label: 'Fluxo de Caixa' },
  { to: '/metas',          label: 'Metas' },
  { to: '/ir',             label: 'IR Investimentos', premiumOnly: true },
  { to: '/configuracoes',  label: 'Configurações' },
  { to: '/status',         label: 'Status' },
]

const Sidebar = () => {
  const { isPremium } = usePlano()

  return (
    <Box
      component="aside"
      data-testid="sidebar"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* TOPO: Layout em 2 linhas para caber nos 220px da sidebar
           Linha 1: [FortunAI]  →  [🔔] [J]
           Linha 2: [Assistente Financeiro] [Free/Premium]         */}
      <Box
        sx={{
          px: 2.5,
          pt: 2,
          pb: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        {/* Linha 1: Logo ←→ Controles */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo clicável — convenção universal de web: marca leva à home */}
          <Typography
            component={NavLink}
            to="/dashboard"
            variant="h6"
            fontWeight={700}
            data-testid="logo-fortunai"
            sx={{
              color: '#7C6AF7',
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { opacity: 0.85 },
            }}
          >
            FortunAI
          </Typography>

          {/* Notificações + Avatar — visíveis apenas em desktop */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 0.5,
              flexShrink: 0,
            }}
          >
            <NotificacoesBadge />
            <UserMenu />
          </Box>
        </Box>

        {/* Linha 2: Subtítulo + Badge de plano */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
            Assistente Financeiro
          </Typography>
          <PlanoBadge />
        </Box>
      </Box>

      {/* MEIO: Navegação */}
      <Box component="nav" sx={{ flexGrow: 1, px: 1.5, py: 2, overflow: 'hidden' }}>
        {NAV_LINKS.map(({ to, label, tutorial, premiumOnly }) => (
          <NavLink
            key={to}
            to={to}
            {...(tutorial ? { 'data-tutorial': tutorial } : {})}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '4px',
              textDecoration: 'none',
              color: isActive ? '#ffffff' : '#8B8BA8',
              backgroundColor: isActive ? 'rgba(124, 106, 247, 0.15)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.875rem',
              transition: 'background-color 0.15s, color 0.15s',
            })}
          >
            <span>{label}</span>
            {premiumOnly && !isPremium && (
              <Chip
                label="Premium"
                size="small"
                sx={{
                  height: 16,
                  fontSize: 9,
                  fontWeight: 700,
                  bgcolor: 'rgba(255,215,0,0.15)',
                  color: '#FFD700',
                  border: '1px solid rgba(255,215,0,0.3)',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
          </NavLink>
        ))}
      </Box>

      {/* RODAPÉ: Ambiente — visível apenas em development */}
      {import.meta.env.MODE === 'development' && (
        <Box
          sx={{
            px: 1.5,
            py: 2,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', display: 'block', fontSize: 10, textAlign: 'center' }}
          >
            AMBIENTE: {import.meta.env.MODE.toUpperCase()}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default Sidebar
