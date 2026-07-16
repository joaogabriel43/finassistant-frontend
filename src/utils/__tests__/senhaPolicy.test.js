import { describe, it, expect } from 'vitest';
import { regrasSenha, senhaValida } from '../senhaPolicy';

describe('senhaPolicy (espelho do backend — ADR-028)', () => {
  it('senha vazia falha em todas as regras', () => {
    expect(regrasSenha('')).toEqual({ tamanho: false, letra: false, numero: false });
    expect(senhaValida('')).toBe(false);
  });

  it('senha curta com letra e número falha só no tamanho', () => {
    expect(regrasSenha('abc1')).toEqual({ tamanho: false, letra: true, numero: true });
    expect(senhaValida('abc1')).toBe(false);
  });

  it('senha só numérica falha na regra de letra', () => {
    expect(regrasSenha('12345678')).toEqual({ tamanho: true, letra: false, numero: true });
    expect(senhaValida('12345678')).toBe(false);
  });

  it('senha só alfabética falha na regra de número', () => {
    expect(regrasSenha('abcdefgh')).toEqual({ tamanho: true, letra: true, numero: false });
    expect(senhaValida('abcdefgh')).toBe(false);
  });

  it('senha válida passa em todas as regras', () => {
    expect(regrasSenha('senha123')).toEqual({ tamanho: true, letra: true, numero: true });
    expect(senhaValida('senha123')).toBe(true);
  });

  it('null/undefined são tratados como vazia (nunca lança)', () => {
    expect(senhaValida(null)).toBe(false);
    expect(senhaValida(undefined)).toBe(false);
  });
});
