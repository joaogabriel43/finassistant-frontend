import React from 'react'
import { Box, Skeleton } from '@mui/material'

// Espaçamento entre seções — o MESMO de Dashboard.jsx (secaoSx), para que a
// troca de esqueleto por conteúdo real não desloque a página.
const secaoSx = { mt: { xs: '42px', md: '58px' } }

// Cabeça de seção: título + descrição, na altura que SectionHead ocupa.
function CabecaDeSecao() {
  return (
    <Box sx={{ mb: '18px' }}>
      <Skeleton data-testid="skeleton" variant="text" width={210} height={26} />
      <Skeleton data-testid="skeleton" variant="text" width={300} height={18} />
    </Box>
  )
}

/**
 * Esqueleto de carregamento do dashboard Pondero.
 *
 * Reserva a MESMA hierarquia da tela final — panorama dominante no topo,
 * depois evolução, composição + saúde, transações e proventos — em vez de
 * três cartões iguais. Assim o layout não "pula" quando os dados chegam.
 */
export default function DashboardSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Carregando seu painel financeiro"
      sx={{ p: { xs: '12px', md: '24px 28px 48px' }, width: '100%', boxSizing: 'border-box' }}
    >
      {/* 1. Cabeçalho operacional -------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'flex-end' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: '14px',
          mb: { xs: '22px', md: '30px' },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Skeleton data-testid="skeleton" variant="text" width={190} height={16} />
          <Skeleton data-testid="skeleton" variant="text" width={260} height={34} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Skeleton data-testid="skeleton" variant="rounded" width={110} height={32} sx={{ borderRadius: 999 }} />
          <Skeleton data-testid="skeleton" variant="rounded" width={168} height={40} />
        </Box>
      </Box>

      {/* 2. Panorama financeiro G3-A ----------------------------------- */}
      <Skeleton
        data-testid="skeleton-panorama"
        variant="rounded"
        sx={(t) => ({
          height: { xs: 420, md: 330 },
          borderRadius: `${t.radius.xl}px`,
          transform: 'none',
        })}
      >
        <span data-testid="skeleton" />
      </Skeleton>

      {/* 3. Evolução do saldo (gráfico + resumo do mês) ----------------- */}
      <Box data-testid="skeleton-secao-evolucao" sx={secaoSx}>
        <CabecaDeSecao />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 240px' },
            gap: { xs: '20px', md: '28px' },
          }}
        >
          <Skeleton data-testid="skeleton" variant="rounded" height={260} sx={{ transform: 'none' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {[1, 2, 3].map((i) => (
              <Box key={i}>
                <Skeleton data-testid="skeleton" variant="text" width={120} height={14} />
                <Skeleton data-testid="skeleton" variant="text" width={150} height={26} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* 4. Composição por ativo + saúde financeira --------------------- */}
      <Box
        data-testid="skeleton-secao-composicao"
        sx={{
          ...secaoSx,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.36fr) minmax(300px, 0.64fr)' },
          gap: { xs: '32px', md: '28px' },
        }}
      >
        <Box>
          <CabecaDeSecao />
          <Skeleton data-testid="skeleton" variant="rounded" height={280} sx={{ transform: 'none' }} />
        </Box>
        <Box>
          <CabecaDeSecao />
          <Skeleton data-testid="skeleton" variant="rounded" height={280} sx={{ transform: 'none' }} />
        </Box>
      </Box>

      {/* 5. Transações recentes ---------------------------------------- */}
      <Box data-testid="skeleton-secao-transacoes" sx={secaoSx}>
        <CabecaDeSecao />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              data-testid="skeleton"
              variant="rounded"
              height={56}
              sx={{ transform: 'none' }}
            />
          ))}
        </Box>
      </Box>

      {/* 6. Proventos --------------------------------------------------- */}
      <Box data-testid="skeleton-secao-proventos" sx={secaoSx}>
        <CabecaDeSecao />
        <Skeleton data-testid="skeleton" variant="rounded" height={180} sx={{ transform: 'none' }} />
      </Box>
    </Box>
  )
}
