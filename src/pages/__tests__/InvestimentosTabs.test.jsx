import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../../theme'
import Investimentos from '../Investimentos'

// --- MOCK: todos os painéis pesados viram stubs identificáveis ---
vi.mock('../../components/investimentos/AlocacaoAtivosChart', () => ({ default: () => <div data-testid="stub-alocacao" /> }))
vi.mock('../../components/investimentos/BenchmarkChart', () => ({ default: () => <div data-testid="stub-benchmark" /> }))
vi.mock('../../components/investimentos/BenchmarkJanelasPanel', () => ({ default: () => <div data-testid="stub-benchmark-janelas" /> }))
vi.mock('../../components/investimentos/RendaPassivaPanel', () => ({ default: () => <div data-testid="stub-renda-passiva" /> }))
vi.mock('../../components/investimentos/CalendarioProventosPanel', () => ({ default: () => <div data-testid="stub-calendario-proventos" /> }))
vi.mock('../../components/investimentos/EventosCorporativosPanel', () => ({ default: () => <div data-testid="stub-eventos" /> }))
vi.mock('../../components/investimentos/RentabilidadePanel', () => ({ default: () => <div data-testid="stub-rentabilidade" /> }))
vi.mock('../../components/investimentos/MarkowitzPanel', () => ({ default: () => <div data-testid="stub-markowitz" /> }))
vi.mock('../../components/dashboard/PortfolioTable', () => ({ default: () => <div data-testid="stub-portfolio" /> }))
vi.mock('../../components/investimentos/EstrategiaForm', () => ({ default: () => <div data-testid="stub-estrategia-form" /> }))
vi.mock('../../components/investimentos/EstrategiaSetoresPanel', () => ({ default: () => <div data-testid="stub-setores" /> }))
vi.mock('../../components/investimentos/SaudeCarteiraPanel', () => ({ default: () => <div data-testid="stub-saude" /> }))
vi.mock('../../components/investimentos/PrecoTetoPanel', () => ({ default: () => <div data-testid="stub-preco-teto" /> }))
vi.mock('../../components/investimentos/CorrelacaoPanel', () => ({ default: () => <div data-testid="stub-correlacao" /> }))
vi.mock('../../components/investimentos/FronteiraPanel', () => ({ default: () => <div data-testid="stub-fronteira" /> }))
vi.mock('../../components/investimentos/AdicionarAtivoForm', () => ({ default: () => <div data-testid="stub-adicionar" /> }))
vi.mock('../../components/investimentos/EditarAtivoDialog', () => ({ default: () => <div data-testid="stub-editar-dialog" /> }))
vi.mock('../../components/investimentos/RemoverAtivoDialog', () => ({ default: () => <div data-testid="stub-remover-dialog" /> }))
vi.mock('../../components/notificacoes/ConfigurarAlertasModal', () => ({ default: () => <div data-testid="stub-alertas-modal" /> }))

vi.mock('../../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }))
vi.mock('../../services/investimentoService', () => ({ investimentoService: {} }))
vi.mock('../../hooks/useExportacao', () => ({
    useExportacao: () => ({ loading: false, error: null, downloadArquivo: vi.fn(), clearError: vi.fn() }),
}))
vi.mock('../../services/api', () => ({
    default: { get: vi.fn(), put: vi.fn() },
}))

import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

const renderPage = () =>
    render(
        <ThemeProvider theme={theme}>
            <Investimentos />
        </ThemeProvider>
    )

describe('Investimentos — sub-abas + ordem customizada (ADR-037)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAuth.mockReturnValue({ user: { id: 'u1', perfilInvestidor: 'MODERADO' } })
        api.get.mockImplementation((url) => {
            if (url.includes('ordem-cards')) return Promise.resolve({ data: { ordem: [] } })
            return Promise.resolve({ data: {} })
        })
        api.put.mockResolvedValue({ data: { ordem: [] } })
    })

    it('renderiza as 5 sub-abas e abre na Carteira', async () => {
        renderPage()
        await waitFor(() => expect(screen.getByTestId('tab-carteira')).toBeInTheDocument())
        expect(screen.getByTestId('tab-rentabilidade')).toBeInTheDocument()
        expect(screen.getByTestId('tab-proventos')).toBeInTheDocument()
        expect(screen.getByTestId('tab-estrategia')).toBeInTheDocument()
        expect(screen.getByTestId('tab-risco')).toBeInTheDocument()

        // Carteira visível; cards de outras abas não montados
        expect(screen.getByTestId('stub-portfolio')).toBeInTheDocument()
        expect(screen.getByTestId('stub-alocacao')).toBeInTheDocument()
        expect(screen.queryByTestId('stub-renda-passiva')).not.toBeInTheDocument()
        expect(screen.queryByTestId('stub-correlacao')).not.toBeInTheDocument()
    })

    it('trocar de aba mostra apenas os cards do tema', async () => {
        renderPage()
        await waitFor(() => expect(screen.getByTestId('tab-proventos')).toBeInTheDocument())
        fireEvent.click(screen.getByTestId('tab-proventos'))

        expect(screen.getByTestId('stub-renda-passiva')).toBeInTheDocument()
        expect(screen.getByTestId('stub-calendario-proventos')).toBeInTheDocument()
        expect(screen.getByTestId('stub-eventos')).toBeInTheDocument()
        expect(screen.queryByTestId('stub-portfolio')).not.toBeInTheDocument()
    })

    it('ordem salva no backend reordena os cards da aba', async () => {
        api.get.mockImplementation((url) => {
            if (url.includes('ordem-cards'))
                return Promise.resolve({ data: { ordem: ['adicionar-ativo', 'portfolio', 'alocacao-ativos'] } })
            return Promise.resolve({ data: {} })
        })
        renderPage()

        await waitFor(() => {
            const cards = screen.getAllByTestId(/^card-/)
            expect(cards[0]).toHaveAttribute('data-testid', 'card-adicionar-ativo')
        })
    })

    it('modo Organizar Cards mostra setas e salva a nova ordem via PUT', async () => {
        renderPage()
        await waitFor(() => expect(screen.getByTestId('btn-organizar-cards')).toBeInTheDocument())
        fireEvent.click(screen.getByTestId('btn-organizar-cards'))

        // desce o primeiro card da Carteira (alocacao-ativos)
        fireEvent.click(screen.getByLabelText('Descer Alocação por Tipo de Ativo'))
        fireEvent.click(screen.getByTestId('btn-salvar-ordem'))

        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith(
                '/usuario/preferencias/ordem-cards-investimentos',
                { ordem: expect.arrayContaining(['portfolio', 'alocacao-ativos']) }
            )
        })
        const ordemEnviada = api.put.mock.calls[0][1].ordem
        expect(ordemEnviada.indexOf('portfolio')).toBeLessThan(ordemEnviada.indexOf('alocacao-ativos'))
    })

    it('Cancelar reverte a reordenação sem chamar o PUT', async () => {
        renderPage()
        await waitFor(() => expect(screen.getByTestId('btn-organizar-cards')).toBeInTheDocument())
        fireEvent.click(screen.getByTestId('btn-organizar-cards'))
        fireEvent.click(screen.getByLabelText('Descer Alocação por Tipo de Ativo'))
        fireEvent.click(screen.getByText('Cancelar'))

        expect(api.put).not.toHaveBeenCalled()
        const cards = screen.getAllByTestId(/^card-/)
        expect(cards[0]).toHaveAttribute('data-testid', 'card-alocacao-ativos')
    })
})
