import api from './api';

// Realiza login e armazena o token JWT no localStorage
export async function login(username, password) {
  const response = await api.post('/auth/login', { username, password });
  const { token } = response.data || {};
  if (token) {
    localStorage.setItem('authToken', token);
  }
  return response.data;
}

// Registra novo usuário
export async function registrar(email, senha) {
  const response = await api.post('/auth/registrar', { email, senha });
  return response.data;
}

// Remove o token do armazenamento local
export function logout() {
  localStorage.removeItem('authToken');
}

// Utilitário opcional
export function getToken() {
  return localStorage.getItem('authToken');
}

// Export default para permitir import authService como objeto
export default { login, registrar, logout, getToken };
