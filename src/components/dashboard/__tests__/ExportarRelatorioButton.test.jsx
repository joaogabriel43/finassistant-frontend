import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ExportarRelatorioButton from '../ExportarRelatorioButton'

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn() },
}))

import api from '../../../services/api'

describe('ExportarRelatorioButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('deve renderizar botao de exportar', () => {
    render(<ExportarRelatorioButton />)
    expect(screen.getByTestId('exportar-relatorio-btn')).toBeInTheDocument()
    expect(screen.getByText('Exportar PDF')).toBeInTheDocument()
  })

  it('deve chamar API ao clicar e gerar download', async () => {
    const mockBlob = new Blob(['%PDF-fake'], { type: 'application/pdf' })
    api.get.mockResolvedValue({ data: mockBlob })

    render(<ExportarRelatorioButton />)
    fireEvent.click(screen.getByText('Exportar PDF'))

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('/relatorio/mensal?mes='),
        expect.objectContaining({ responseType: 'blob' })
      )
    })
  })

  it('deve exibir loading durante geracao', async () => {
    api.get.mockImplementation(() => new Promise(() => {}))

    render(<ExportarRelatorioButton />)
    fireEvent.click(screen.getByText('Exportar PDF'))

    expect(screen.getByText('Gerando...')).toBeInTheDocument()
  })
})
