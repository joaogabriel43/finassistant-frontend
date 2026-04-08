import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar, Box, Divider, IconButton, ListItemIcon,
  Menu, MenuItem, Tooltip, Typography,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import { useAuth } from '../../contexts/AuthContext'

const UserMenu = () => {
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
        <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small" sx={{ ml: 0.5 }}>
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

export default UserMenu
