import React, { useState } from 'react'
import { Badge, Box, Button, IconButton, Snackbar, Tooltip, Typography } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import BarChartIcon from '@mui/icons-material/BarChart'
import { useNotificacoes } from '../../hooks/useNotificacoes'
import NotificacoesDrawer from './NotificacoesDrawer'

/**
 * Ícone de sino com badge vermelho para notificações não lidas.
 * Abre NotificacoesDrawer ao clicar.
 *
 * Também renderiza Snackbars especiais:
 * - META_ATINGIDA: celebração ao atingir meta financeira
 * - DIGEST_SEMANAL: aviso de resumo semanal com botão "Ver resumo"
 */
export default function NotificacoesBadge() {
  const [open, setOpen] = useState(false)
  const {
    notificacoes,
    naoLidas,
    marcarComoLida,
    metaAtingidaOpen,
    metaAtingidaMensagem,
    fecharMetaAtingida,
    digestSemanalOpen,
    digestSemanalMensagem,
    fecharDigestSemanal,
  } = useNotificacoes()

  const handleVerResumo = () => {
    fecharDigestSemanal()
    setOpen(true)
  }

  return (
    <>
      <Tooltip title="Notificações">
        <IconButton
          color="inherit"
          onClick={() => setOpen(true)}
          aria-label="abrir notificações"
        >
          <Badge
            badgeContent={naoLidas > 0 ? naoLidas : null}
            color="error"
            max={99}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <NotificacoesDrawer
        open={open}
        onClose={() => setOpen(false)}
        notificacoes={notificacoes}
        onMarcarComoLida={marcarComoLida}
      />

      {/* Snackbar especial para META_ATINGIDA — celebração ao atingir meta financeira */}
      <Snackbar
        open={metaAtingidaOpen}
        autoHideDuration={8000}
        onClose={fecharMetaAtingida}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ zIndex: 9500 }}
      >
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 2.5, py: 1.5,
          background: '#1a472a',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          minWidth: 300,
        }}>
          <EmojiEventsIcon sx={{ color: '#4ade80', fontSize: 24, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', flex: 1 }}>
            {metaAtingidaMensagem}
          </Typography>
        </Box>
      </Snackbar>

      {/* Snackbar especial para DIGEST_SEMANAL — aviso de resumo semanal */}
      <Snackbar
        open={digestSemanalOpen}
        autoHideDuration={8000}
        onClose={fecharDigestSemanal}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ zIndex: 9500, bottom: { xs: 80, sm: 24 } }}
      >
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 2.5, py: 1.5,
          background: '#0d2137',
          border: '1px solid rgba(76, 175, 80, 0.35)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          minWidth: 320,
        }}>
          <BarChartIcon sx={{ color: '#4caf50', fontSize: 24, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', flex: 1 }}>
            📊 Seu resumo semanal chegou!
          </Typography>
          <Button
            size="small"
            onClick={handleVerResumo}
            sx={{ color: '#4caf50', fontWeight: 600, ml: 0.5, whiteSpace: 'nowrap' }}
          >
            Ver resumo
          </Button>
        </Box>
      </Snackbar>
    </>
  )
}
