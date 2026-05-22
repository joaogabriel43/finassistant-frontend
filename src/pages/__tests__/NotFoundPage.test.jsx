import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import NotFound from '../NotFound'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('NotFound Page', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('renderiza título "Página não encontrada"', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>)
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
  })

  it('renderiza botão "Voltar ao Dashboard"', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /voltar ao dashboard/i })).toBeInTheDocument()
  })

  it('clicar no botão navega para /dashboard', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /voltar ao dashboard/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })
})
