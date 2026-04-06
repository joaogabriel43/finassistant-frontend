import api from './api'

export const configuracaoService = {
  getPerfil: () => api.get('/usuario/perfil').then((r) => r.data),

  atualizarPerfil: (nome, email) =>
    api.put('/usuario/perfil', { nome, email }).then((r) => r.data),

  alterarSenha: (senhaAtual, novaSenha) =>
    api.put('/usuario/senha', { senhaAtual, novaSenha }),

  getPreferencias: () => api.get('/usuario/preferencias').then((r) => r.data),

  atualizarPreferencias: (prefs) =>
    api.put('/usuario/preferencias', prefs).then((r) => r.data),

  uploadFoto: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/usuario/foto', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.fotoUrl)
  },

  desativarConta: () => api.delete('/usuario/conta'),
}
