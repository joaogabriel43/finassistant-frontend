import React from 'react'
import { Chip, Tooltip } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import LockIcon from '@mui/icons-material/Lock'
import usePlano from '../../hooks/usePlano'

const PlanoBadge = () => {
  const { plano, isPremium, loading } = usePlano()
  if (loading) return null

  if (isPremium) {
    return (
      <Tooltip title="Plano Premium">
        <Chip
          icon={<StarIcon sx={{ fontSize: '14px !important', color: '#f59e0b !important' }} />}
          label="Premium"
          size="small"
          sx={{
            bgcolor: 'rgba(245,158,11,0.15)',
            color: '#f59e0b',
            border: '1px solid rgba(245,158,11,0.3)',
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
        icon={<LockIcon sx={{ fontSize: '12px !important', color: 'rgba(255,255,255,0.4) !important' }} />}
        label="Free"
        size="small"
        sx={{
          bgcolor: 'rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: 11,
          height: 22,
          cursor: 'pointer',
        }}
      />
    </Tooltip>
  )
}

export default PlanoBadge
