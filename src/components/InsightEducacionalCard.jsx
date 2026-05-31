import React, { useState } from 'react'
import { Box, Button, Fade, Paper, Typography } from '@mui/material'
import api from '../services/api'

/**
 * Mapa de cores por TipoInsight — define a borda esquerda do card.
 * Valores espelham as prioridades do IrApuracaoService.java:
 * vermelho (crítico) → laranja (atenção) → azul (neutro) → verde (positivo).
 */
const COR_POR_TIPO = {
  FUNDO_EMERGENCIA:         '#F59E0B', // laranja — urgente, base financeira em risco
  SCORE_SAUDE_BAIXO:        '#EF4444', // vermelho — saúde financeira crítica
  REGRA_50_30_20:           '#3B82F6', // azul — ajuste de comportamento
  DIVERSIFICACAO_PORTFOLIO: '#7C3AED', // roxo — investimentos
  CONSISTENCIA_APORTES:     '#10B981', // verde — hábito positivo
  MAIOR_CATEGORIA_GASTO:    '#6B7280', // cinza — informativo
}

const COR_FALLBACK = '#7C6AF7' // roxo padrão FortunAI

/**
 * Converte **texto** → <strong>texto</strong> no conteúdo do insight.
 * Retorna array de nós React para renderização.
 */
function parseBold(texto) {
  const partes = texto.split(/\*\*(.+?)\*\*/g)
  return partes.map((parte, i) =>
    i % 2 === 1 ? <strong key={i}>{parte}</strong> : parte
  )
}

/**
 * Card educacional contextual — mostra uma micro-lição financeira para o usuário.
 *
 * @param {object|null} insight - InsightDTO ou null (retorna null sem ocupar espaço)
 * @param {function} onDismiss  - callback chamado após a animação de saída (300ms)
 */
const InsightEducacionalCard = ({ insight, onDismiss }) => {
  const [visible, setVisible] = useState(true)

  // Sem insight elegível → retorna null — sem wrapper, sem gap no layout
  // Guard robusto: rejeita null, undefined e objetos sem id/titulo (API retornou {} vazio)
  if (!insight || !insight.id || !insight.titulo) return null

  const cor = COR_POR_TIPO[insight.tipoInsight] ?? COR_FALLBACK

  const handleEntendi = () => {
    // 1. POST best-effort — não bloqueia UX se falhar
    if (insight?.id) {
      api.post(`/api/insights/${insight.id}/visto`).catch(() => {})
    }
    // 2. Inicia animação de saída
    setVisible(false)
    // 3. Após fade-out (300ms), remove do DOM chamando onDismiss
    setTimeout(() => onDismiss?.(), 300)
  }

  return (
    <Fade in={visible} timeout={300}>
      <Paper
        data-testid="insight-card"
        elevation={0}
        sx={{
          borderLeft: `4px solid ${cor}`,
          borderRadius: '12px',
          border: `1px solid rgba(255,255,255,0.08)`,
          borderLeftColor: cor,
          borderLeftWidth: 4,
          p: 2,
          background: `${cor}0D`, // 5% opacity da cor do tipo
          boxShadow: 'none',
        }}
      >
        {/* Cabeçalho: label de categoria */}
        <Typography
          variant="caption"
          sx={{
            color: cor,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            fontSize: 10,
            display: 'block',
            mb: 0.5,
          }}
        >
          💡 Dica financeira
        </Typography>

        {/* Título */}
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.75, lineHeight: 1.4 }}>
          {insight.titulo}
        </Typography>

        {/* Conteúdo — suporta **bold** inline */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6, mb: 1.5 }}
        >
          {parseBold(insight.conteudo)}
        </Typography>

        {/* Footer: botão "Entendi" alinhado à direita */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="text"
            size="small"
            onClick={handleEntendi}
            sx={{
              color: cor,
              fontWeight: 600,
              '&:hover': { bgcolor: `${cor}1A` },
            }}
          >
            Entendi ✓
          </Button>
        </Box>
      </Paper>
    </Fade>
  )
}

export default InsightEducacionalCard
