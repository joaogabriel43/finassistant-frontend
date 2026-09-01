import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AuthPageLayout from './AuthPageLayout';

describe('AuthPageLayout — scroll em viewports limitadas', () => {
  it('é o scrollport vertical das páginas públicas de autenticação', () => {
    render(
      <MemoryRouter>
        <AuthPageLayout>
          <div>Formulário de autenticação</div>
        </AuthPageLayout>
      </MemoryRouter>
    );

    const shell = screen.getByTestId('auth-page-shell');
    expect(shell).toHaveStyle({ overflowX: 'hidden' });
    expect(shell).toHaveStyle({
      height: '100vh',
      overflowY: 'auto',
    });
  });
});
