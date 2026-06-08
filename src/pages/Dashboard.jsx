import React, { useEffect, useState } from 'react'
import { Alert, Box, Paper, Typography, useTheme } from '@mui/material'
import PieChartIcon from '@mui/icons-material/PieChart'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import api from '../services/api'

import { useDashboardData } from '../hooks/useDashboardData'
import { Sparkline, formatBRL } from '../components/ui'
import TransactionList from '../components/dashboard/TransactionList'
import ComposicaoCard from '../components/dashboard/ComposicaoCard'
import SaldoLineChart from '../components/dashboard/SaldoLineChart'
import EmptyState from '../components/dashboard/EmptyState'
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton'
import GastosPorCategoriaChart from '../components/dashboard/GastosPorCategoriaChart'
import DividendosCard from '../components/dashboard/DividendosCard'
import ScoreSaudeCard from '../components/dashboard/ScoreSaudeCard'
import ExportarRelatorioButton from '../components/dashboard/ExportarRelatorioButton'
import InsightEducacionalCard from '../components/InsightEducacionalCard'

// Fonte mono para valores monetários (token D4) — via callback sx.
const mono = (t) => t.typography.fontFamilyMono

// Título de seção dentro de um card do bento.
function CardTitle({ children, action }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
        {children}
      </Typography>
      {action}
    </Box>
  )
}

// Mini-stat exibido dentro da Hero section.
// Mantém data-testid="kpi-card" para compatibilidade com os testes existentes.
function MiniStat({ label, value }) {
  return (
    <Box data-testid="kpi-card" sx={{ minWidth: 0 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
        {label}
      </Typography>
      <Typography
        fontWeight={700}
        sx={{ fontFamily: mono, mt: 0.25, fontSize: { xs: '0.95rem', md: '1.1rem' } }}
      >
        {formatBRL(value)}
      </Typography>
    </Box>
  )
}

const Dashboard = () => {
  const theme = useTheme()
  const {
    loading,
    error,
    saldoAtual,
    totalInvestido,
    totalReceitas,
    maiorGasto,
    transacoes,
    portfolioComposition,
    evolucaoSaldo,
  } = useDashboardData()

  // Insight educacional — undefined = carregando (não renderiza), null = sem insight elegível.
  const [insight, setInsight] = useState(undefined)

  useEffect(() => {
    api.get('/api/insights/atual')
      .then((res) => setInsight(res.data ?? null))
      .catch(() => setInsight(null))
  }, [])

  const handleDismissInsight = () => setInsight(null)

  if (loading) return <DashboardSkeleton />

  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>

  const hasAnyData =
    saldoAtual > 0 ||
    totalInvestido > 0 ||
    transacoes.length > 0 ||
    portfolioComposition.length > 0

  if (!hasAnyData) {
    return (
      <Box sx={{ p: { xs: 1.5, md: 3 } }}>
        <EmptyState mensagem="Comece registrando uma transação no chat" icone={ReceiptLongIcon} />
        <Paper sx={{ p: 3, mt: 3, overflow: 'hidden' }}>
          <GastosPorCategoriaChart />
        </Paper>
      </Box>
    )
  }

  const patrimonioTotal = saldoAtual + totalInvestido
  const sparkData = evolucaoSaldo.map((p) => p.saldo)

  // Estilo base de cada célula do bento (estende o override de Paper do tema).
  const cellSx = { p: { xs: 2, md: 3 }, height: '100%', overflow: 'hidden' }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, width: '100%', boxSizing: 'border-box' }}>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          alignItems: 'stretch',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gridTemplateAreas: {
            xs: 'none',
            md: `
              "hero hero score insight"
              "hero hero score comp"
              "evo evo tx comp"
            `,
          },
        }}
      >
        {/* ── HERO — Patrimônio ─────────────────────────────────────────── */}
        <Paper
          data-tutorial="patrimonio"
          sx={{
            gridArea: { md: 'hero' },
            p: { xs: 2.5, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            border: `1px solid ${theme.palette.lines.strong}`,
            background: `radial-gradient(130% 130% at 0% 0%, ${theme.palette.accent.primarySoft} 0%, transparent 55%), ${theme.palette.surfaces.surface}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Patrimônio Total
            </Typography>
            <ExportarRelatorioButton />
          </Box>

          <Typography
            fontWeight={750}
            sx={{ fontFamily: mono, mt: 0.5, mb: 3, fontSize: { xs: '2rem', md: '2.6rem' }, lineHeight: 1.05 }}
          >
            {formatBRL(patrimonioTotal)}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
              gap: 2,
              mb: sparkData.length >= 2 ? 2.5 : 0,
            }}
          >
            <MiniStat label="Saldo Atual" value={saldoAtual} />
            <MiniStat label="Total Investido" value={totalInvestido} />
            <MiniStat label="Total Receitas" value={totalReceitas} />
            <MiniStat label="Maior Gasto" value={maiorGasto?.valor ?? 0} />
          </Box>

          {sparkData.length >= 2 && (
            <Box sx={{ mt: 'auto', mx: -1 }}>
              <Sparkline data={sparkData} color={theme.palette.primary.light} height={90} fill={0.3} />
            </Box>
          )}
        </Paper>

        {/* ── SCORE — Saúde financeira ──────────────────────────────────── */}
        <Paper sx={{ ...cellSx, gridArea: { md: 'score' } }}>
          <ScoreSaudeCard />
        </Paper>

        {/* ── INSIGHT — micro-lição (retorna null quando não elegível) ───── */}
        <Box sx={{ gridArea: { md: 'insight' } }}>
          {insight !== undefined && (
            <InsightEducacionalCard insight={insight} onDismiss={handleDismissInsight} />
          )}
        </Box>

        {/* ── COMPOSIÇÃO — Portfólio (Donut) ────────────────────────────── */}
        <Paper sx={{ ...cellSx, gridArea: { md: 'comp' } }}>
          <CardTitle>Composição do Portfólio</CardTitle>
          {portfolioComposition.length > 0
            ? <ComposicaoCard data={portfolioComposition} totalInvestido={totalInvestido} />
            : <EmptyState compact mensagem="Adicione ativos para ver sua composição" icone={PieChartIcon} />}
        </Paper>

        {/* ── EVOLUÇÃO — Saldo (AreaChart) ──────────────────────────────── */}
        <Paper sx={{ ...cellSx, gridArea: { md: 'evo' }, minHeight: 300 }}>
          <CardTitle>Evolução do Saldo</CardTitle>
          {evolucaoSaldo.length > 0
            ? <SaldoLineChart data={evolucaoSaldo} height={260} />
            : <EmptyState compact mensagem="Nenhuma movimentação registrada ainda" icone={ShowChartIcon} />}
        </Paper>

        {/* ── TRANSAÇÕES — Últimas ──────────────────────────────────────── */}
        <Paper sx={{ ...cellSx, gridArea: { md: 'tx' } }}>
          <CardTitle>Últimas Transações</CardTitle>
          {transacoes.length > 0
            ? <TransactionList transacoes={transacoes} />
            : <EmptyState compact mensagem="Comece registrando uma transação no chat" icone={ReceiptLongIcon} />}
        </Paper>
      </Box>

      {/* ── SEÇÃO SECUNDÁRIA — Dividendos (preservado) ──────────────────── */}
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: { xs: 2, md: 3 }, overflow: 'hidden' }}>
          <DividendosCard />
        </Paper>
      </Box>
    </Box>
  )
}

export default Dashboard
