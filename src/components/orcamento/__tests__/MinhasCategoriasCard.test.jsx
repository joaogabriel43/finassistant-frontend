import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ThemeProvider } from '@mui/material/styles'
import theme, { tokens } from '../../../theme'
import MinhasCategoriasCard from '../MinhasCategoriasCard'

vi.mock('../../../services/api', () => ({
    default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

import api from '../../../services/api'

const CATS = [
    { id: 'c1', nome: 'Casa', cor: '#00AA00', categoriaPaiId: null },
    { id: 'c2', nome: 'Energia', cor: '#00BB00', categoriaPaiId: 'c1' },
    { id: 'c3', nome: 'Lazer', cor: '#FF00AA', categoriaPaiId: null },
]

const renderCard = () =>
    render(
        <ThemeProvider theme={theme}>
            <MinhasCategoriasCard />
        </ThemeProvider>
    )

describe('MinhasCategoriasCard — gestão de categorias (ADR-038)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        api.get.mockResolvedValue({ data: CATS })
    })

    it('lista raízes com subcategorias agrupadas', async () => {
        renderCard()
        await waitFor(() => expect(screen.getByTestId('cat-chip-Casa')).toBeInTheDocument())
        expect(screen.getByTestId('cat-chip-Energia')).toBeInTheDocument()
        expect(screen.getByTestId('cat-chip-Lazer')).toBeInTheDocument()
    })

    it('cria nova categoria via dialog (POST) e recarrega', async () => {
        api.post.mockResolvedValue({ data: { id: 'c4' } })
        renderCard()
        await waitFor(() => expect(screen.getByTestId('btn-nova-categoria')).toBeInTheDocument())

        fireEvent.click(screen.getByTestId('btn-nova-categoria'))
        fireEvent.change(screen.getByTestId('input-nome-categoria'), { target: { value: 'Mercado' } })
        fireEvent.click(screen.getByTestId('btn-salvar-categoria'))

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/orcamento/categorias-gerenciadas', {
                nome: 'Mercado',
                // Espelha FORM_VAZIO.cor do componente: valor SUGERIDO para
                // categoria nova, agora vindo da serie do tema. Referencia o
                // token em vez do hex para nao voltar a divergir.
                cor: tokens.colors.series[1],
                categoriaPaiId: null,
            })
        })
        // recarrega a lista após salvar (GET inicial + GET pós-save)
        expect(api.get).toHaveBeenCalledTimes(2)
    })

    it('exclui após confirmação (DELETE)', async () => {
        api.delete.mockResolvedValue({})
        renderCard()
        await waitFor(() => expect(screen.getByLabelText('Excluir Lazer')).toBeInTheDocument())

        fireEvent.click(screen.getByLabelText('Excluir Lazer'))
        fireEvent.click(screen.getByTestId('btn-confirmar-exclusao'))

        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith('/orcamento/categorias-gerenciadas/c3')
        })
    })

    it('erro da API (422 com filhos) aparece como alerta', async () => {
        api.delete.mockRejectedValue({
            response: { data: { message: 'Remova as subcategorias antes de excluir esta categoria.' } },
        })
        renderCard()
        await waitFor(() => expect(screen.getByLabelText('Excluir Casa')).toBeInTheDocument())

        fireEvent.click(screen.getByLabelText('Excluir Casa'))
        fireEvent.click(screen.getByTestId('btn-confirmar-exclusao'))

        await waitFor(() => {
            expect(screen.getByText(/Remova as subcategorias/)).toBeInTheDocument()
        })
    })
})
