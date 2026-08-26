import React, { useState } from 'react'
import { Box, Button, Fade, Paper, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import api from '../services/api'

/**
 * Rótulo legível por TipoInsight.
 *
 * Antes existia aqui um mapa de CORES por tipo (laranja/vermelho/azul/roxo)
 * que pintava uma faixa lateral no card. Duas razões para trocar por texto:
 * o ambiente Pondero não usa faixa lateral colorida, e semântica financeira
 * nunca pode depender só de cor (WCAG 2.2 AA, 1.4.1). O tipo agora é dito
 * por extenso — legível também por leitor de tela.
 */
const ROTULO_POR_TIPO = {
  FUNDO_EMERGENCIA: 'Reserva de emergência',
  SCORE_SAUDE_BAIXO: 'Saúde financeira',
  REGRA_50_30_20: 'Equilíbrio do orçamento',
  DIVERSIFICACAO_PORTFOLIO: 'Diversificação',
  CONSISTENCIA_APORTES: 'Consistência de aportes',
  MAIOR_CATEGORIA_GASTO: 'Concentração de gastos',
}

const ROTULO_PADRAO = 'Dica financeira'

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
 * @param {object|null} insight - InsightDTO ou null/incompleto → renderiza estado vazio
 *                                (placeholder desfocado + overlay) para preservar a forma
 *                                do card no bento grid — nunca retorna null.
 * @param {function} onDismiss  - callback chamado após a animação de saída (300ms)
 */
const InsightEducacionalCard = ({ insight, onDismiss }) => {
  const [visible, setVisible] = useState(true)
  const theme = useTheme()

  // Guard robusto: rejeita null, undefined e objetos sem id/titulo (API retornou {} vazio)
  const insightValido = insight && insight.id && insight.titulo

  if (!insightValido) {
    return (
      <Paper
        data-testid="insight-card-empty"
        elevation={0}
        sx={{
          position: 'relative',
          borderRadius: `${theme.radius.md}px`,
          border: `1px solid ${theme.palette.lines.subtle}`,
          p: 2,
          background: theme.palette.background.paper,
          boxShadow: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Conteúdo placeholder — mesma estrutura do card preenchido, desfocado */}
        <Box sx={{ filter: 'blur(4px)', opacity: 0.25 }} aria-hidden="true">
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              fontSize: 10,
              display: 'block',
              mb: 0.5,
            }}
          >
            Dica financeira
          </Typography>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.75, lineHeight: 1.4 }}>
            Dica financeira
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 1.5 }}>
            Continue registrando suas transações e investimentos para que possamos
            identificar padrões e gerar recomendações personalizadas para você.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="text" size="small" tabIndex={-1} sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
              Entendi ✓
            </Button>
          </Box>
        </Box>

        {/* Overlay — ícone + mensagem explicativa sobre o estado vazio */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 1,
            px: 3,
            background: theme.palette.background.paper,
            opacity: 0.94,
          }}
        >
          <Typography sx={{ fontSize: 28, lineHeight: 1 }} aria-hidden="true">🔒</Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.5, maxWidth: 320 }}>
            Dados insuficientes ainda — continue registrando para receber insights personalizados
          </Typography>
        </Box>
      </Paper>
    )
  }

  // O backend já respondeu `tipo` e `tipoInsight` em versões diferentes do
  // contrato — normaliza aqui em vez de assumir uma das duas grafias.
  const tipoDoInsight = insight.tipo ?? insight.tipoInsight ?? null
  const rotulo = ROTULO_POR_TIPO[tipoDoInsight] ?? ROTULO_PADRAO

  const handleEntendi = () => {
    // 1. POST best-effort — não bloqueia UX se falhar
    if (insight?.id) {
      // baseURL do axios já contém /api — prefixar de novo geraria /api/api.
      api.post(`/insights/${insight.id}/visto`).catch(() => {})
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
        sx={(t) => ({
          borderRadius: `${t.radius.md}px`,
          border: `1px solid ${t.palette.lines.subtle}`,
          p: { xs: 2, md: '20px 22px' },
          // Lavagem suave do acento primário — mesma família do ambiente nos
          // dois temas, sem placa colorida nem faixa lateral.
          background: t.palette.accent.primarySoft,
          boxShadow: 'none',
        })}
      >
        {/* Cabeçalho: rótulo do tipo, em texto (não em cor) */}
        <Typography
          variant="caption"
          sx={(t) => ({
            color: t.palette.primary.main,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
            fontSize: 10.5,
            display: 'block',
            mb: 0.75,
          })}
        >
          {rotulo}
        </Typography>

        {/* Título — momento editorial curto, na fonte display */}
        <Typography
          component="h3"
          sx={(t) => ({
            fontFamily: t.typography.fontFamilyDisplay,
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: '-0.015em',
            lineHeight: 1.3,
            m: 0,
            mb: 0.75,
          })}
        >
          {insight.titulo}
        </Typography>

        {/* Conteúdo — suporta **bold** inline */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6, mb: 1.5, maxWidth: 620 }}
        >
          {parseBold(insight.conteudo)}
        </Typography>

        {/* Footer: botão "Entendi" alinhado à direita */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="text"
            size="small"
            onClick={handleEntendi}
            sx={(t) => ({
              color: t.palette.primary.main,
              fontWeight: 700,
              '&:hover': { bgcolor: t.palette.accent.naturalSoft },
            })}
          >
            Entendi ✓
          </Button>
        </Box>
      </Paper>
    </Fade>
  )
}

export default InsightEducacionalCard
