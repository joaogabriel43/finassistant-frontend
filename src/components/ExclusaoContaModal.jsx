import React, { useState } from 'react'
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Typography,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const CONFIRMACAO_REQUIRED = 'EXCLUIR'

/**
 * Modal de exclusão de conta — LGPD Art. 18 (Direito ao Esquecimento).
 * Exige digitação de "EXCLUIR" para confirmar — ação irreversível.
 *
 * @param {boolean}  open    - controla visibilidade
 * @param {function} onClose - fechar sem excluir
 */
const ExclusaoContaModal = ({ open, onClose }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  const podeConfirmar = texto === CONFIRMACAO_REQUIRED

  if (!open) return null

  const handleFechar = () => {
    setTexto('')
    setErro(null)
    onClose()
  }

  const handleExcluir = async () => {
    if (!podeConfirmar) return
    setLoading(true)
    setErro(null)
    try {
      await api.delete('/conta', {
        data: { confirmacao: CONFIRMACAO_REQUIRED },
      })
      logout()
      navigate('/')
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.mensagem ||
        'Não foi possível excluir a conta. Tente novamente.'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleFechar}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, bgcolor: '#1a1a2e', border: '1px solid #EF4444' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#EF4444' }}>
        <WarningAmberIcon />
        <Typography variant="h6" fontWeight={700} sx={{ color: '#EF4444' }} data-testid="exclusao-titulo">
          Excluir conta permanentemente
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          <strong>Esta ação é permanente e não pode ser desfeita.</strong>{' '}
          Todos os seus dados serão removidos: transações, investimentos, metas, histórico de chat
          e configurações.
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Digite <strong style={{ color: '#EF4444' }}>EXCLUIR</strong> para confirmar:
        </Typography>

        <TextField
          fullWidth
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="EXCLUIR"
          size="small"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: texto === CONFIRMACAO_REQUIRED ? '#EF4444' : 'rgba(255,255,255,0.2)' },
            },
          }}
          inputProps={{ 'aria-label': 'confirmação de exclusão' }}
        />

        {erro && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{erro}</Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleFechar} variant="outlined" color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleExcluir}
          variant="contained"
          disabled={!podeConfirmar || loading}
          sx={{
            bgcolor: '#EF4444',
            '&:hover': { bgcolor: '#DC2626' },
            fontWeight: 700,
          }}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Excluir minha conta
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ExclusaoContaModal
