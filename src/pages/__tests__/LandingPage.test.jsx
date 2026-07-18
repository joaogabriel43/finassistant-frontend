import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../../theme'
import LandingPage from '../LandingPage'
import HomeRoute from '../../components/HomeRoute'

vi.mock('../../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
import { useAuth } from '../../contexts/AuthContext'

const renderLanding = () =>
    render(
        <ThemeProvider theme={theme}>
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        </ThemeProvider>
    )

describe('LandingPage — página pública de apresentação (ADR-039)', () => {
    it('renderiza headline, CTAs de cadastro/login e footer legal', () => {
        renderLanding()
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/finanças/i)

        // CTA primário aponta para o registro; secundário para o login
        expect(screen.getByTestId('landing-cta-hero')).toHaveAttribute('href', '/registrar')
        expect(screen.getByTestId('landing-btn-criar-conta')).toHaveAttribute('href', '/registrar')
        expect(screen.getByTestId('landing-btn-entrar')).toHaveAttribute('href', '/login')
        expect(screen.getByTestId('landing-cta-final')).toHaveAttribute('href', '/registrar')

        // Links legais (LGPD) presentes
        expect(screen.getByText('Termos de Uso')).toHaveAttribute('href', '/termos')
        expect(screen.getByText('Política de Privacidade')).toHaveAttribute('href', '/privacidade')
    })

    it('mostra as 6 features e os placeholders de mídia (imagem e vídeo)', () => {
        renderLanding()
        expect(screen.getAllByTestId('landing-feature-card')).toHaveLength(6)
        expect(screen.getByTestId('landing-placeholder-screenshot')).toBeInTheDocument()
        expect(screen.getByTestId('landing-placeholder-video')).toBeInTheDocument()
    })

    it('não faz nenhuma chamada de API (página 100% estática)', () => {
        // sem mock de api: se algum fetch/api fosse chamado, o import real de axios
        // dispararia rede no jsdom e o teste falharia por unhandled rejection
        renderLanding()
        expect(screen.getByTestId('landing-placeholder-screenshot')).toBeInTheDocument()
    })
})

describe('HomeRoute — porta de entrada da rota /', () => {
    const LANDING_STUB = <div data-testid="landing-stub" />
    beforeEach(() => vi.clearAllMocks())

    const renderHome = () =>
        render(
            <ThemeProvider theme={theme}>
                <MemoryRouter initialEntries={['/']}>
                    <HomeRoute landing={LANDING_STUB} />
                </MemoryRouter>
            </ThemeProvider>
        )

    it('visitante (não autenticado) vê a landing', () => {
        useAuth.mockReturnValue({ isAuthenticated: false, loading: false })
        renderHome()
        expect(screen.getByTestId('landing-stub')).toBeInTheDocument()
    })

    it('enquanto a sessão carrega, não renderiza nada (sem flash)', () => {
        useAuth.mockReturnValue({ isAuthenticated: false, loading: true })
        renderHome()
        expect(screen.queryByTestId('landing-stub')).not.toBeInTheDocument()
    })

    it('usuário autenticado é redirecionado (landing não aparece)', () => {
        useAuth.mockReturnValue({ isAuthenticated: true, loading: false })
        renderHome()
        expect(screen.queryByTestId('landing-stub')).not.toBeInTheDocument()
    })
})
