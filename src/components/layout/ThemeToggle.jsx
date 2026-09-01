import React from 'react'
import { IconButton, Tooltip } from '@mui/material'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import { useColorMode } from '../../contexts/colorMode'

/**
 * Alternador de tema claro/escuro.
 *
 * O nome acessível descreve a AÇÃO ("Ativar tema claro"), não o estado —
 * um leitor de tela precisa saber o que acontece ao acionar, e o ícone
 * sozinho não carrega essa informação.
 */
const ThemeToggle = ({ size = 'small' }) => {
  const { mode, toggleColorMode } = useColorMode()
  const vaiParaClaro = mode === 'dark'
  const rotulo = vaiParaClaro ? 'Ativar tema claro' : 'Ativar tema escuro'

  return (
    <Tooltip title={rotulo}>
      <IconButton
        data-testid="theme-toggle"
        onClick={toggleColorMode}
        size={size}
        aria-label={rotulo}
        sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
      >
        {vaiParaClaro
          ? <LightModeOutlinedIcon fontSize="small" />
          : <DarkModeOutlinedIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  )
}

export default ThemeToggle
