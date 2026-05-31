import React from 'react'
import { NavLink } from 'react-router-dom'
import { Box, Chip, Typography } from '@mui/material'
import NotificacoesBadge from './notificacoes/NotificacoesBadge'
import UserMenu from './layout/UserMenu'
import PlanoBadge from './plano/PlanoBadge'
import usePlano from '../hooks/usePlano'

const NAV_LINKS = [
  { to: '/dashboard',       label: 'Dashboard' },
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
      {/* TOPO: Logo + controles de usuário */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {/* Esquerda: logo + subtítulo apenas — sem badge aqui */}
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography
            variant="h6"
            fontWeight={700}
            noWrap
            sx={{ color: '#7C6AF7', letterSpacing: '-0.5px', lineHeight: 1.2 }}
          >
            FortunAI
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{ color: 'text.secondary', fontSize: 11, display: 'block' }}
          >
            Assistente Financeiro
          </Typography>
        </Box>

        {/* Direita: [PlanoBadge] [Notificações] [Avatar] — alinhados em linha */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            flexShrink: 0,
            gap: 0.75,
          }}
        >
          <PlanoBadge />
          <NotificacoesBadge />
          <UserMenu />
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
