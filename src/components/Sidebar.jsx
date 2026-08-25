import React from 'react'
import { NavLink } from 'react-router-dom'
import { Box, Chip, Typography, useTheme } from '@mui/material'
import NotificacoesBadge from './notificacoes/NotificacoesBadge'
import UserMenu from './layout/UserMenu'
import ThemeToggle from './layout/ThemeToggle'
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
  // NavLink usa `style` (função), fora do sistema `sx` do MUI — por isso os
  // tokens precisam ser lidos do tema aqui, e não escritos à mão.
  const theme = useTheme()

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
           Linha 1: [FortunAI]  →  [tema] [🔔] [J]
           Linha 2: [Assistente Financeiro] [Free/Premium]         */}
      <Box
        sx={{
          px: 2.5,
          pt: 2,
          pb: 1.5,
          borderBottom: `1px solid ${theme.palette.lines.subtle}`,
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
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'text.primary',
              letterSpacing: '-0.04em',
              lineHeight: 1.2,
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { opacity: 0.85 },
            }}
          >
            {/* Marca geométrica do protótipo — decorativa, sem conteúdo semântico */}
            <Box
              aria-hidden="true"
              sx={{
                position: 'relative',
                width: 26,
                height: 26,
                flexShrink: 0,
                borderRadius: '9px',
                border: `1px solid ${theme.palette.primary.main}`,
                backgroundColor: theme.palette.accent.primarySoft,
                '&::before, &::after': {
                  content: '""',
                  position: 'absolute',
                  left: '6px',
                  height: '2px',
                  borderRadius: '999px',
                  backgroundColor: theme.palette.primary.main,
                },
                '&::before': { top: '8px', width: '12px', transform: 'rotate(24deg)' },
                '&::after': { top: '15px', width: '14px', transform: 'rotate(-24deg)' },
              }}
            />
            FortunAI
          </Typography>

          {/* Tema + Notificações + Avatar — visíveis apenas em desktop */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 0.25,
              flexShrink: 0,
            }}
          >
            <ThemeToggle />
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
          <Box
            key={to}
            component={NavLink}
            to={to}
            {...(tutorial ? { 'data-tutorial': tutorial } : {})}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 40,
              px: 1.75,
              py: 1.25,
              mb: 0.5,
              borderRadius: '11px',
              textDecoration: 'none',
              color: 'text.secondary',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'background-color .16s ease, color .16s ease',
              '&:hover': {
                backgroundColor: 'accent.primarySoft',
                color: 'text.primary',
              },
              // Item ativo não depende só de cor: o peso da fonte também muda.
              '&.active': {
                backgroundColor: 'accent.primarySoft',
                color: 'primary.main',
                fontWeight: 700,
              },
            }}
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
                  bgcolor: 'transparent',
                  color: 'accent.copper',
                  border: `1px solid ${theme.palette.accent.copper}`,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
          </Box>
        ))}
      </Box>

      {/* RODAPÉ: Ambiente — visível apenas em development */}
      {import.meta.env.MODE === 'development' && (
        <Box
          sx={{
            px: 1.5,
            py: 2,
            borderTop: `1px solid ${theme.palette.lines.subtle}`,
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
