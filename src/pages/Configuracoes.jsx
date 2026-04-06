import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert, Avatar, Box, Button, CircularProgress, Divider,
  Paper, Snackbar, Stack, Switch, Tab, Tabs, TextField, Typography,
} from '@mui/material'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import { useAuth } from '../contexts/AuthContext'
import { useColorMode } from '../contexts/ColorModeContext'
import { configuracaoService } from '../services/configuracaoService'

function TabPanel({ children, value, index }) {
  if (value !== index) return null
  return <Box sx={{ pt: 3 }}>{children}</Box>
}

// ── Aba Perfil ───────────────────────────────────────────────────────────────

function TabPerfil({ onSuccess }) {
  const { user, updateUser } = useAuth()
  const [nome, setNome] = useState(user?.nome || '')
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const handleSalvar = async () => {
    setError('')
    if (!nome.trim() || !email.trim()) { setError('Nome e email sao obrigatorios'); return }
    setLoading(true)
    try {
      await configuracaoService.atualizarPerfil(nome.trim(), email.trim())
      await updateUser()
      onSuccess('Perfil atualizado com sucesso')
    } catch {
      setError('Nao foi possivel salvar o perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleFoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      await configuracaoService.uploadFoto(file)
      await updateUser()
      onSuccess('Foto atualizada com sucesso')
    } catch {
      setError('Erro ao enviar foto. Verifique o formato e tamanho.')
    } finally {
      setLoading(false)
    }
  }

  const displayName = user?.nome || user?.email || ''
  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={user?.fotoUrl || undefined}
            sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 24, fontWeight: 700 }}
          >
            {!user?.fotoUrl && initials}
          </Avatar>
          <Box
            component="button"
            onClick={() => fileRef.current?.click()}
            sx={{
              position: 'absolute', bottom: 0, right: 0,
              bgcolor: 'primary.main', border: 'none', borderRadius: '50%',
              width: 24, height: 24, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', p: 0,
            }}
          >
            <CameraAltIcon sx={{ fontSize: 14, color: '#fff' }} />
          </Box>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFoto} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>{displayName || 'Usuario'}</Typography>
          <Typography variant="caption" color="text.secondary">JPG ou PNG, ate 5 MB</Typography>
        </Box>
      </Stack>

      <TextField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} fullWidth />
      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth type="email" />

      {error && <Alert severity="error">{error}</Alert>}

      <Button variant="contained" onClick={handleSalvar} disabled={loading} sx={{ alignSelf: 'flex-start' }}>
        {loading ? <CircularProgress size={20} color="inherit" /> : 'Salvar perfil'}
      </Button>
    </Stack>
  )
}

// ── Aba Seguranca ────────────────────────────────────────────────────────────

function TabSeguranca({ onSuccess }) {
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAlterarSenha = async () => {
    setError('')
    if (!senhaAtual || !novaSenha || !confirmar) { setError('Preencha todos os campos'); return }
    if (novaSenha !== confirmar) { setError('A nova senha e confirmacao nao coincidem'); return }
    if (novaSenha.length < 6) { setError('A nova senha deve ter pelo menos 6 caracteres'); return }
    setLoading(true)
    try {
      await configuracaoService.alterarSenha(senhaAtual, novaSenha)
      setSenhaAtual(''); setNovaSenha(''); setConfirmar('')
      onSuccess('Senha alterada com sucesso')
    } catch (err) {
      const status = err.response?.status
      setError(status === 422 ? 'Senha atual incorreta' : 'Nao foi possivel alterar a senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      <TextField label="Senha atual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} fullWidth />
      <TextField label="Nova senha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} fullWidth />
      <TextField label="Confirmar nova senha" type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} fullWidth />

      {error && <Alert severity="error">{error}</Alert>}

      <Button variant="contained" onClick={handleAlterarSenha} disabled={loading} sx={{ alignSelf: 'flex-start' }}>
        {loading ? <CircularProgress size={20} color="inherit" /> : 'Alterar senha'}
      </Button>
    </Stack>
  )
}

// ── Aba Notificacoes ─────────────────────────────────────────────────────────

function PrefsRow({ label, desc, checked, onChange }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="body1" fontWeight={500}>{label}</Typography>
        <Typography variant="caption" color="text.secondary">{desc}</Typography>
      </Box>
      <Switch checked={checked} onChange={onChange} />
    </Stack>
  )
}

function TabNotificacoes({ onSuccess }) {
  const { mode, setMode } = useColorMode()
  const [prefs, setPrefs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    configuracaoService.getPreferencias()
      .then(setPrefs)
      .catch(() => setPrefs({ temaEscuro: mode === 'dark', notificacaoEmailAtiva: true, digestSemanalAtivo: true }))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }))

  const handleSalvar = async () => {
    setSaving(true)
    try {
      const saved = await configuracaoService.atualizarPreferencias(prefs)
      setMode(saved.temaEscuro)
      onSuccess('Preferencias salvas com sucesso')
    } catch {
      onSuccess('Erro ao salvar preferencias')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <CircularProgress size={24} />

  return (
    <Stack spacing={3}>
      <PrefsRow
        label="Tema escuro"
        desc="Interface com fundo escuro (recomendado)"
        checked={prefs.temaEscuro}
        onChange={() => toggle('temaEscuro')}
      />
      <Divider />
      <PrefsRow
        label="Notificacoes por e-mail"
        desc="Receba alertas de preco e orcamento por e-mail"
        checked={prefs.notificacaoEmailAtiva}
        onChange={() => toggle('notificacaoEmailAtiva')}
      />
      <Divider />
      <PrefsRow
        label="Digest semanal"
        desc="Resumo financeiro toda segunda-feira"
        checked={prefs.digestSemanalAtivo}
        onChange={() => toggle('digestSemanalAtivo')}
      />
      <Button variant="contained" onClick={handleSalvar} disabled={saving} sx={{ alignSelf: 'flex-start', mt: 1 }}>
        {saving ? <CircularProgress size={20} color="inherit" /> : 'Salvar preferencias'}
      </Button>
    </Stack>
  )
}

// ── Aba Conta ────────────────────────────────────────────────────────────────

function TabConta() {
  const { logout } = useAuth()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDesativar = async () => {
    setLoading(true)
    try {
      await configuracaoService.desativarConta()
      logout()
    } catch {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderColor: 'error.main' }}>
        <Typography variant="subtitle1" fontWeight={600} color="error" gutterBottom>
          Zona de perigo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ao desativar sua conta, todos os seus dados serao anonimizados e voce perdera acesso ao FortunAI.
          Esta acao e irreversivel.
        </Typography>
        {!confirm ? (
          <Button variant="outlined" color="error" onClick={() => setConfirm(true)}>
            Desativar minha conta
          </Button>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
            <Typography variant="body2" color="error" fontWeight={600}>
              Tem certeza? Isso nao pode ser desfeito.
            </Typography>
            <Button variant="contained" color="error" onClick={handleDesativar} disabled={loading}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirmar desativacao'}
            </Button>
            <Button onClick={() => setConfirm(false)}>Cancelar</Button>
          </Stack>
        )}
      </Paper>
    </Stack>
  )
}

// ── Pagina principal ─────────────────────────────────────────────────────────

export default function Configuracoes() {
  const [tab, setTab] = useState(0)
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' })

  const showToast = useCallback((msg, severity = 'success') => {
    setToast({ open: true, msg, severity })
  }, [])

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 680, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Configuracoes
      </Typography>

      <Paper sx={{ mt: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Perfil" />
          <Tab label="Seguranca" />
          <Tab label="Notificacoes" />
          <Tab label="Conta" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <TabPanel value={tab} index={0}><TabPerfil onSuccess={showToast} /></TabPanel>
          <TabPanel value={tab} index={1}><TabSeguranca onSuccess={showToast} /></TabPanel>
          <TabPanel value={tab} index={2}><TabNotificacoes onSuccess={showToast} /></TabPanel>
          <TabPanel value={tab} index={3}><TabConta onSuccess={showToast} /></TabPanel>
        </Box>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
