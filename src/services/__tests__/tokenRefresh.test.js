import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deveTentarRefresh, renovarSessao, __resetParaTestes } from '../tokenRefresh';

const erro = ({ status = 401, url = '/investimentos/portfolio', retry = false } = {}) => ({
  response: { status },
  config: { url, _retry: retry },
});

describe('tokenRefresh (ADR-029)', () => {
  beforeEach(() => {
    localStorage.clear();
    __resetParaTestes();
  });

  describe('deveTentarRefresh', () => {
    it('401 com refresh token salvo → true', () => {
      localStorage.setItem('refreshToken', 'rt-1');
      expect(deveTentarRefresh(erro())).toBe(true);
    });

    it('sem refresh token salvo → false', () => {
      expect(deveTentarRefresh(erro())).toBe(false);
    });

    it('status diferente de 401 → false', () => {
      localStorage.setItem('refreshToken', 'rt-1');
      expect(deveTentarRefresh(erro({ status: 400 }))).toBe(false);
      expect(deveTentarRefresh(erro({ status: 403 }))).toBe(false);
    });

    it('request já re-tentada (_retry) → false (nunca loop)', () => {
      localStorage.setItem('refreshToken', 'rt-1');
      expect(deveTentarRefresh(erro({ retry: true }))).toBe(false);
    });

    it('endpoints de auth nunca disparam refresh', () => {
      localStorage.setItem('refreshToken', 'rt-1');
      expect(deveTentarRefresh(erro({ url: '/auth/login' }))).toBe(false);
      expect(deveTentarRefresh(erro({ url: '/auth/refresh' }))).toBe(false);
      expect(deveTentarRefresh(erro({ url: '/auth/registrar' }))).toBe(false);
    });
  });

  describe('renovarSessao', () => {
    it('persiste o novo par e resolve com o novo access token', async () => {
      localStorage.setItem('refreshToken', 'rt-antigo');
      const instancia = {
        post: vi.fn().mockResolvedValue({ data: { token: 'jwt-novo', refreshToken: 'rt-novo' } }),
      };

      const token = await renovarSessao(instancia);

      expect(token).toBe('jwt-novo');
      expect(instancia.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'rt-antigo' });
      expect(localStorage.getItem('authToken')).toBe('jwt-novo');
      expect(localStorage.getItem('refreshToken')).toBe('rt-novo');
    });

    it('single-flight: chamadas simultâneas compartilham UMA requisição', async () => {
      localStorage.setItem('refreshToken', 'rt-antigo');
      const instancia = {
        post: vi.fn().mockResolvedValue({ data: { token: 'jwt', refreshToken: 'rt' } }),
      };

      await Promise.all([renovarSessao(instancia), renovarSessao(instancia), renovarSessao(instancia)]);

      expect(instancia.post).toHaveBeenCalledTimes(1);
    });

    it('após falha, uma nova tentativa dispara nova requisição (promise não fica presa)', async () => {
      localStorage.setItem('refreshToken', 'rt');
      const instancia = { post: vi.fn().mockRejectedValue(new Error('401')) };

      await expect(renovarSessao(instancia)).rejects.toThrow();

      instancia.post.mockResolvedValue({ data: { token: 'jwt', refreshToken: 'rt2' } });
      await expect(renovarSessao(instancia)).resolves.toBe('jwt');
      expect(instancia.post).toHaveBeenCalledTimes(2);
    });
  });
});
