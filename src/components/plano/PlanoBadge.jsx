import React from 'react'
import { Chip, Tooltip } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import LockIcon from '@mui/icons-material/Lock'
import { useNavigate } from 'react-router-dom'
import usePlano from '../../hooks/usePlano'

const PlanoBadge = () => {
  const { plano, isPremium, loading } = usePlano()
  const navigate = useNavigate()
  if (loading) return null

  if (isPremium) {
    return (
      <Tooltip title="Plano Premium">
        <Chip
          icon={<StarIcon sx={(t) => ({ fontSize: '14px !important', color: `${t.palette.accent.copperText} !important` })} />}
          label="Premium"
          size="small"
          onClick={() => navigate('/plano')}
          sx={{
            bgcolor: 'transparent',
            color: 'accent.copperText',
            border: '1px solid',
            borderColor: 'accent.copperText',
            fontSize: 11,
            height: 22,
            cursor: 'pointer',
          }}
        />
      </Tooltip>
    )
  }

  return (
    <Tooltip title="Plano Free — clique para conhecer o Premium">
      <Chip
        icon={<LockIcon sx={(t) => ({ fontSize: '12px !important', color: `${t.palette.text.secondary} !important` })} />}
        label="Free"
        size="small"
        onClick={() => navigate('/plano')}
        sx={{
          bgcolor: 'transparent',
          // O chip e acionavel (navega para /plano): a isencao de contraste
          // dos controles desabilitados nao se aplica aqui.
          color: 'text.secondary',
          border: '1px solid',
          borderColor: 'lines.subtle',
          fontSize: 11,
          height: 22,
          cursor: 'pointer',
        }}
      />
    </Tooltip>
  )
}

export default PlanoBadge
