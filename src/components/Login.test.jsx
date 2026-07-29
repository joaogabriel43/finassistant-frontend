import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn().mockResolvedValue({ token: 'fake' }) }),
}));

describe('Login — mostrar/ocultar senha', () => {
  it('campo de senha começa oculto (type="password") com botão "Mostrar senha"', () => {
    render(<Login />);

    expect(screen.getByLabelText(/^senha/i)).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /mostrar senha/i })).toBeInTheDocument();
  });

  it('clicar no ícone de olho revela a senha (type="text")', () => {
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: /mostrar senha/i }));

    expect(screen.getByLabelText(/^senha/i)).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /ocultar senha/i })).toBeInTheDocument();
  });
});
