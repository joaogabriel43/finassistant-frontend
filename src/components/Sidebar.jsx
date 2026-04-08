import React from 'react'
import { NavLink } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import NotificacoesBadge from './notificacoes/NotificacoesBadge'
import UserMenu from './layout/UserMenu'

const NAV_LINKS = [
  { to: '/dashboard',       label: 'Dashboard' },
  { to: '/chat',            label: 'Chat' },
  { to: '/orcamento',       label: 'Orçamento' },
  { to: '/investimentos',   label: 'Investimentos' },
  { to: '/calculadoras',    label: 'Calculadoras' },
  { to: '/fire-calculator', label: 'FIRE Calculator' },
  { to: '/fluxo-caixa',    label: 'Fluxo de Caixa' },
  { to: '/metas',          label: 'Metas' },
  { to: '/status',         label: 'Status' },
]

const Sidebar = () => {
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
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: '#7C6AF7', letterSpacing: '-0.5px', lineHeight: 1.2 }}
          >
            FortunAI
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
            Assistente Financeiro
          </Typography>
        </Box>

        {/* Notificações + Avatar — visível apenas em desktop (md+) */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <NotificacoesBadge />
          <UserMenu />
        </Box>
      </Box>

      {/* MEIO: Navegação */}
      <Box component="nav" sx={{ flexGrow: 1, px: 1.5, py: 2, overflow: 'hidden' }}>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
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
            {label}
          </NavLink>
        ))}
      </Box>

      {/* RODAPÉ: Ambiente */}
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
          Ambiente: {import.meta.env.MODE.toUpperCase()}
        </Typography>
      </Box>
    </Box>
  )
}

export default Sidebar
