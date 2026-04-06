import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
  AppBar, Avatar, Box, Drawer, IconButton, ListItemIcon,
  Menu, MenuItem, Toolbar, Tooltip, Typography, Divider,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import Sidebar from '../Sidebar'
import NotificacoesBadge from '../notificacoes/NotificacoesBadge'
import { useAuth } from '../../contexts/AuthContext'

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

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchor, setAnchor] = useState(null)

  const displayName = user?.nome || user?.email || ''
  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <>
      <Tooltip title="Conta">
        <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small" sx={{ ml: 1 }}>
          <Avatar
            src={user?.fotoUrl || undefined}
            sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}
          >
            {!user?.fotoUrl && initials}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { minWidth: 200, mt: 0.5 } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" fontWeight={600} noWrap>{displayName}</Typography>
          {user?.nome && (
            <Typography variant="caption" color="text.secondary" noWrap>{user.email}</Typography>
          )}
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAnchor(null); navigate('/configuracoes') }}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          Configurações
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); logout() }}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
    </>
  )
}

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleToggle = () => setMobileOpen((prev) => !prev)
  const handleClose = () => setMobileOpen(false)

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      <AppBar
        data-testid="app-bar"
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: '#111118',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Toolbar sx={{ display: { xs: 'flex', md: 'none' }, minHeight: 56 }}>
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
          <NotificacoesBadge />
          <UserMenu />
        </Toolbar>
        <Toolbar sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', minHeight: 48 }}>
          <NotificacoesBadge />
          <UserMenu />
        </Toolbar>
      </AppBar>

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
        }}
      >
        <Outlet />
      </Box>

    </Box>
  )
}

export default Layout
