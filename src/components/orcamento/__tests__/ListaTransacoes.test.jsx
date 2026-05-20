import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks — must be hoisted before imports that reference these modules
// ---------------------------------------------------------------------------

// Mock AuthContext so that ListaTransacoes receives a stable user without
// needing a real Router or JWT token.
vi.mock('../../../contexts/AuthContext', () => ({
    useAuth: () => ({ user: { id: 'test-user-id' } }),
    AuthContext: { Provider: ({ children }) => children },
}))

// Mock the api service — we control get/delete/put per test.
const mockApiGet = vi.fn()
const mockApiDelete = vi.fn()
const mockApiPut = vi.fn()
vi.mock('../../../services/api', () => ({
    default: {
        get: (...args) => mockApiGet(...args),
        delete: (...args) => mockApiDelete(...args),
        put: (...args) => mockApiPut(...args),
    },
}))

// Mock utility functions to avoid locale/timezone issues in CI.
vi.mock('../../../utils/dateUtils', () => ({
    formatarDataLocal: (d) => d,
}))
vi.mock('../../../utils/formatters', () => ({
    formatCurrency: (v) => `R$ ${v}`,
    formatCurrencyInText: (t) => t,
}))

// react-modal calls Modal.setAppElement — suppress the warning in jsdom.
vi.mock('react-modal', () => {
    const MockModal = ({ isOpen, children }) =>
        isOpen ? <div data-testid="modal">{children}</div> : null
    MockModal.setAppElement = () => {}
    return { default: MockModal }
})

// MUI icons — lightweight stubs so tests don't pull the full icon bundle.
vi.mock('@mui/icons-material/Edit', () => ({ default: () => <span>EditIcon</span> }))
vi.mock('@mui/icons-material/Delete', () => ({ default: () => <span>DeleteIcon</span> }))

// ---------------------------------------------------------------------------
// Import component under test AFTER mocks are in place
// ---------------------------------------------------------------------------
import ListaTransacoes from '../ListaTransacoes'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const mockTransacao = {
    id: 'txn-1',
    descricao: 'Almoço',
    categoria: 'alimentacao',
    valor: { quantia: 50.0 },
    tipo: 'DEBIT',
    data: '2026-05-01',
}

describe('ListaTransacoes — editar e excluir (TDD RED phase)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Default: GET returns one transaction
        mockApiGet.mockResolvedValue({ data: [mockTransacao] })
    })

    // -----------------------------------------------------------------------
    // Test 1 — GREEN: edit and delete icons are rendered in each row
    // -----------------------------------------------------------------------
    it('exibe botões de editar e excluir em cada linha', async () => {
        render(<ListaTransacoes />)

        // Wait for async data load
        await screen.findByText('Almoço')

        const editButtons = screen.getAllByRole('button', { name: /EditIcon/i })
        const deleteButtons = screen.getAllByRole('button', { name: /DeleteIcon/i })

        expect(editButtons.length).toBeGreaterThanOrEqual(1)
        expect(deleteButtons.length).toBeGreaterThanOrEqual(1)
    })

    // -----------------------------------------------------------------------
    // Test 2 — GREEN: clicking edit opens modal pre-filled with transaction data
    // -----------------------------------------------------------------------
    it('clicar em editar abre modal com dados da transação', async () => {
        render(<ListaTransacoes />)

        // Wait for data to load and row to appear
        const row = await screen.findByText('Almoço')
        expect(row).toBeInTheDocument()

        const editButton = screen.getByRole('button', { name: /EditIcon/i })
        await waitFor(() => fireEvent.click(editButton))

        // Modal should be visible — useEffect inside EditarTransacaoModal
        // populates formData after transacao prop is set; wait for the input.
        const descricaoInput = await screen.findByDisplayValue('Almoço')
        expect(descricaoInput).toBeInTheDocument()
    })

    // -----------------------------------------------------------------------
    // Test 3 — RED: clicking delete opens ConfirmarExclusaoDialog (not window.confirm)
    //
    // WHY FAILS: ListaTransacoes uses window.confirm() — there is no
    // ConfirmarExclusaoDialog rendered in the DOM. The test looks for
    // data-testid="confirmar-exclusao-dialog" which never appears.
    // -----------------------------------------------------------------------
    it('clicar em excluir abre dialog de confirmação em vez de window.confirm', async () => {
        render(<ListaTransacoes />)

        await screen.findByText('Almoço')

        const deleteButton = screen.getByRole('button', { name: /DeleteIcon/i })
        fireEvent.click(deleteButton)

        // Expect a MUI confirmation dialog in the DOM
        // FAILS RED: ListaTransacoes uses window.confirm(), not a Dialog component
        const dialog = screen.getByTestId('confirmar-exclusao-dialog')
        expect(dialog).toBeInTheDocument()
    })

    // -----------------------------------------------------------------------
    // Test 4 — RED: confirming delete calls api.delete and removes the row
    //
    // WHY FAILS: The confirmation flow relies on window.confirm(), which is
    // not interactive in jsdom (returns undefined/false). Even if we spy on
    // window.confirm to return true, the test cannot reliably simulate the
    // user pressing "OK" on a real MUI Dialog — the design contract requires
    // a controlled React component.
    // -----------------------------------------------------------------------
    it('confirmar exclusão chama DELETE e remove da lista', async () => {
        // Spy window.confirm to return true — workaround to expose the actual
        // gap: even with confirm=true the component doesn't use a controlled
        // dialog, so this test documents the design contract.
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        mockApiDelete.mockResolvedValue({})

        render(<ListaTransacoes />)

        await screen.findByText('Almoço')

        const deleteButton = screen.getByRole('button', { name: /DeleteIcon/i })
        fireEvent.click(deleteButton)

        // Simulating dialog confirm programmatically — this is where the gap is.
        // In the current implementation window.confirm is called; after the fix,
        // there will be a Dialog with a "Confirmar" button we can click.
        // The test below looks for the Dialog confirm button (doesn't exist yet).
        // FAILS RED: no "Confirmar" button inside a controlled Dialog
        const confirmButton = await screen.findByRole('button', { name: /confirmar/i })
        fireEvent.click(confirmButton)

        await waitFor(() => {
            expect(mockApiDelete).toHaveBeenCalledWith(
                `/orcamento/transacao/test-user-id/txn-1`
            )
        })

        // Row should be removed from the list
        expect(screen.queryByText('Almoço')).not.toBeInTheDocument()

        vi.restoreAllMocks()
    })

    // -----------------------------------------------------------------------
    // Test 5 — RED: cancelling delete does NOT call api.delete
    //
    // WHY FAILS: Same reason as Test 4 — no controlled Dialog cancel button.
    // -----------------------------------------------------------------------
    it('cancelar exclusão não chama api.delete', async () => {
        render(<ListaTransacoes />)

        await screen.findByText('Almoço')

        const deleteButton = screen.getByRole('button', { name: /DeleteIcon/i })
        fireEvent.click(deleteButton)

        // Look for a cancel button inside the Dialog — doesn't exist yet.
        // FAILS RED: no "Cancelar" button inside a controlled Dialog
        const cancelButton = await screen.findByRole('button', { name: /cancelar/i })
        fireEvent.click(cancelButton)

        expect(mockApiDelete).not.toHaveBeenCalled()
    })

    // -----------------------------------------------------------------------
    // Test 6 — RED: saving an edit calls api.put and updates the list
    //
    // WHY FAILS: The EditarTransacaoModal does not have a date field. After
    // the fix, the modal will include a date input and the form submission
    // flow will use it. Additionally, this test verifies the full round-trip
    // including list refresh — the current implementation does call api.put
    // but the modal structure may differ from what this test expects once
    // the date field is added. Marked RED to track that contract.
    // -----------------------------------------------------------------------
    it('salvar edição chama PUT e atualiza a lista', async () => {
        mockApiPut.mockResolvedValue({})
        // Second GET after save returns the updated transaction
        mockApiGet
            .mockResolvedValueOnce({ data: [mockTransacao] })         // initial load
            .mockResolvedValueOnce({ data: [{ ...mockTransacao, descricao: 'Almoço editado' }] }) // after update

        render(<ListaTransacoes />)

        await screen.findByText('Almoço')

        // Open the edit modal
        const editButton = screen.getByRole('button', { name: /EditIcon/i })
        fireEvent.click(editButton)

        // The modal must contain a date input field — FAILS RED: no date field yet
        const dateInput = screen.getByRole('textbox', { name: /data/i })
        expect(dateInput).toBeInTheDocument()

        // Submit the form
        const saveButton = screen.getByRole('button', { name: /salvar alterações/i })
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockApiPut).toHaveBeenCalledWith(
                `/orcamento/transacao/test-user-id/txn-1`,
                expect.any(Object)
            )
        })
    })
})
