import React, { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import {
  AppBar, Box, Drawer, IconButton, Toolbar, Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import Sidebar from '../Sidebar'
import { useAuth } from '../../contexts/AuthContext'
import NotificacoesBadge from '../notificacoes/NotificacoesBadge'
import UserMenu from './UserMenu'
// TutorialOnboarding, PWAInstallBanner e OfflinePage movidos para AppContent (App.jsx)
// para que o tutorial só apareça APÓS aceite dos Termos de Uso.

const DRAWER_WIDTH = 220

const drawerPaperSx = {
  width: DRAWER_WIDTH,
  boxSizing: 'border-box',
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  background: '#111118',
  borderRight: '1px solid rgba(255,255,255,0.06)',
}

const Layout = () => {
  useAuth() // manter contexto disponível
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleToggle = () => setMobileOpen((prev) => !prev)
  const handleClose = () => setMobileOpen(false)

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* AppBar — visível apenas em mobile para o hamburger menu */}
      <AppBar
        data-testid="app-bar"
        position="fixed"
        sx={{
          display: { xs: 'block', md: 'none' },
          bgcolor: '#111118',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Toolbar sx={{ minHeight: 56 }}>
          <IconButton
            data-testid="menu-toggle"
            color="inherit"
            edge="start"
            onClick={handleToggle}
            aria-expanded={mobileOpen.toString()}
            aria-label="abrir menu de navegação"
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          {/* gap: 0.5 evita sobreposição entre sino e avatar no AppBar mobile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <NotificacoesBadge />
            <UserMenu />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': drawerPaperSx,
          }}
        >
          <Sidebar />
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': drawerPaperSx,
          }}
        >
          <Sidebar />
        </Drawer>
      </Box>

      {/* Conteúdo principal — mt só em mobile para compensar AppBar fixo */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: 0,
          height: { xs: 'calc(100vh - 56px)', md: '100vh' },
          mt: { xs: '56px', md: 0 },
          overflowY: 'auto',
          overflowX: 'hidden',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>

        {/* Footer legal LGPD — links para Termos e Privacidade */}
        <Box
          component="footer"
          sx={{
            py: 1.5,
            px: 3,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
            © 2026 FortunAI
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>·</Typography>
          <Typography
            variant="caption"
            component={Link}
            to="/termos"
            sx={{ fontSize: 11, color: 'text.disabled', textDecoration: 'none', '&:hover': { color: 'text.secondary' } }}
          >
            Termos de Uso
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>·</Typography>
          <Typography
            variant="caption"
            component={Link}
            to="/privacidade"
            sx={{ fontSize: 11, color: 'text.disabled', textDecoration: 'none', '&:hover': { color: 'text.secondary' } }}
          >
            Política de Privacidade
          </Typography>
        </Box>
      </Box>


    </Box>
  )
}

export default Layout
