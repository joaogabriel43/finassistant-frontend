import api from './api';

// Realiza login e armazena o par de tokens (access + refresh — ADR-029) no localStorage
export async function login(username, password) {
  const response = await api.post('/auth/login', { username, password });
  const { token, refreshToken } = response.data || {};
  if (token) {
    localStorage.setItem('authToken', token);
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  return response.data;
}

// Registra novo usuário
export async function registrar(email, senha) {
  const response = await api.post('/auth/registrar', { email, senha });
  return response.data;
}

// Limpa a sessão local e revoga os refresh tokens no backend (best-effort).
// Storage é limpo ANTES da chamada de rede: o logout local nunca depende do servidor.
export function logout() {
  const token = localStorage.getItem('authToken');
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  
  // SEC-10: Limpar caches do PWA (Service Worker) para evitar vazamento de dados 
  // do Cache Storage (como respostas JSON da API) para o proximo usuario no mesmo browser.
  if ('caches' in window) {
    caches.keys().then(names => {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }

  if (token) {
    api.post('/auth/logout', null, { headers: { Authorization: `Bearer ${token}` } })
      .catch(() => { /* revogação best-effort — sessão local já foi encerrada */ });
  }
}

// Utilitário opcional
export function getToken() {
  return localStorage.getItem('authToken');
}

// Export default para permitir import authService como objeto
export default { login, registrar, logout, getToken };
