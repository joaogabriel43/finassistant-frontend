import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordField from './PasswordField';

describe('PasswordField — mostrar/ocultar senha', () => {
  it('renderiza como type="password" por padrão, com o botão "Mostrar senha"', () => {
    render(<PasswordField label="Senha" value="" onChange={() => {}} />);

    expect(screen.getByLabelText('Senha', { exact: true })).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /mostrar senha/i })).toBeInTheDocument();
  });

  it('ao clicar no ícone, alterna para type="text" e o botão vira "Ocultar senha"', () => {
    render(<PasswordField label="Senha" value="abc123" onChange={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /mostrar senha/i }));

    expect(screen.getByLabelText('Senha', { exact: true })).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /ocultar senha/i })).toBeInTheDocument();
  });

  it('ao clicar novamente, volta para type="password"', () => {
    render(<PasswordField label="Senha" value="abc123" onChange={() => {}} />);

    const botao = () => screen.getByRole('button', { name: /(mostrar|ocultar) senha/i });
    fireEvent.click(botao());
    fireEvent.click(botao());

    expect(screen.getByLabelText('Senha', { exact: true })).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /mostrar senha/i })).toBeInTheDocument();
  });

  it('repassa props extras (id, name, required, fullWidth) para o TextField interno', () => {
    render(
      <PasswordField
        label="Senha"
        id="senha"
        name="senha"
        required
        fullWidth
        value=""
        onChange={() => {}}
      />
    );

    const input = screen.getByLabelText(/^senha/i);
    expect(input).toHaveAttribute('id', 'senha');
    expect(input).toHaveAttribute('name', 'senha');
    expect(input).toBeRequired();
  });
});
