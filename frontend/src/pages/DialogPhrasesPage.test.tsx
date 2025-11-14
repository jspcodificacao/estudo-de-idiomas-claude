import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import DialogPhrasesPage from './DialogPhrasesPage'
import * as DataContext from '../contexts/DataContext'
import type { FrasesDialogo } from '../types/api'

// Mock do DataContext
vi.mock('../contexts/DataContext', async () => {
  const actual = await vi.importActual('../contexts/DataContext')
  return {
    ...actual,
    useData: vi.fn()
  }
})

const mockFrases: FrasesDialogo = {
  saudacao: 'Hallo',
  despedida: 'Tschüss',
  intermediarias: [
    'Wie heißen Sie?',
    'Wie groß sind Sie?',
    'Wie alt sind Sie?'
  ]
}

// Helper function to create mock data context
function createMockDataContext(frasesDialogo: FrasesDialogo | null = mockFrases, loading = false, error: string | null = null) {
  return {
    historico: { exercicios: [] },
    prompts: { descricao: '', data_atualizacao: '', marcador_de_paramentros: '', prompts: [] },
    baseConhecimento: [],
    frasesDialogo,
    loading: {
      historico: false,
      prompts: false,
      baseConhecimento: false,
      frasesDialogo: loading
    },
    errors: {
      historico: null,
      prompts: null,
      baseConhecimento: null,
      frasesDialogo: error
    },
    refreshHistorico: vi.fn(),
    refreshPrompts: vi.fn(),
    refreshBaseConhecimento: vi.fn(),
    refreshFrasesDialogo: vi.fn(),
    refreshAll: vi.fn()
  }
}

function renderDialogPhrasesPage() {
  return render(
    <BrowserRouter>
      <DialogPhrasesPage />
    </BrowserRouter>
  )
}

describe('DialogPhrasesPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock padrão para useData
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
  })

  it('deve exibir estado de carregamento inicialmente', () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(null, true))

    renderDialogPhrasesPage()

    expect(screen.getByText(/Carregando frases do diálogo/i)).toBeInTheDocument()
  })

  it('deve carregar e exibir as frases do diálogo', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    expect(screen.getByText('Hallo')).toBeInTheDocument()
    expect(screen.getByText('Tschüss')).toBeInTheDocument()
    expect(screen.getByText('Wie heißen Sie?')).toBeInTheDocument()
    expect(screen.getByText('Wie groß sind Sie?')).toBeInTheDocument()
    expect(screen.getByText('Wie alt sind Sie?')).toBeInTheDocument()
  })

  it('deve exibir mensagem de erro quando falha ao carregar', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(null, false, 'Erro ao carregar frases do diálogo: Erro de rede'))

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar frases do diálogo')).toBeInTheDocument()
    })

    expect(screen.getByText(/Erro ao carregar frases do diálogo:/i)).toBeInTheDocument()
  })

  it('deve ativar modo de edição ao clicar em Editar', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: 'Editar' })
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar Alterações' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    })
  })

  it('deve permitir editar a saudação', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: 'Editar' })
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar Alterações' })).toBeInTheDocument()
    })

    const saudacaoInput = screen.getByLabelText('Saudação (Greeting)')
    await user.clear(saudacaoInput)
    await user.type(saudacaoInput, 'Guten Tag')

    expect(saudacaoInput).toHaveValue('Guten Tag')
    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()
  })

  it('deve permitir editar a despedida', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: 'Editar' })
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar Alterações' })).toBeInTheDocument()
    })

    const despedidaInput = screen.getByLabelText('Despedida (Farewell)')
    await user.clear(despedidaInput)
    await user.type(despedidaInput, 'Auf Wiedersehen')

    expect(despedidaInput).toHaveValue('Auf Wiedersehen')
    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()
  })

  it('deve permitir editar frases intermediárias', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: 'Editar' })
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar Alterações' })).toBeInTheDocument()
    })

    const inputs = screen.getAllByPlaceholderText(/Frase intermediária/i)
    await user.clear(inputs[0])
    await user.type(inputs[0], 'Woher kommen Sie?')

    expect(inputs[0]).toHaveValue('Woher kommen Sie?')
    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()
  })

  it('deve adicionar nova frase intermediária', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: 'Editar' })
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar Alterações' })).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: '+ Adicionar' })
    await user.click(addButton)

    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText(/Frase intermediária/i)
      expect(inputs.length).toBe(4) // 3 originais + 1 nova
    })

    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()
  })

  it('deve remover frase intermediária', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: 'Editar' })
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar Alterações' })).toBeInTheDocument()
    })

    const removeButtons = screen.getAllByRole('button', { name: /Remover frase/i })
    await user.click(removeButtons[0])

    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText(/Frase intermediária/i)
      expect(inputs.length).toBe(2) // 3 originais - 1 removida
    })

    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()
  })

  it('não deve permitir remover a última frase intermediária', async () => {
    const singlePhraseMock: FrasesDialogo = {
      saudacao: 'Hallo',
      despedida: 'Tschüss',
      intermediarias: ['Wie heißen Sie?']
    }

    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(singlePhraseMock))
    const user = userEvent.setup()

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: 'Editar' })
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar Alterações' })).toBeInTheDocument()
    })

    // Should not have a remove button when there's only one phrase
    const removeButtons = screen.queryAllByRole('button', { name: /Remover frase/i })
    expect(removeButtons.length).toBe(0)
  })

  it('deve salvar alterações e sair do modo de edição', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: 'Editar' })
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar Alterações' })).toBeInTheDocument()
    })

    const saudacaoInput = screen.getByLabelText('Saudação (Greeting)')
    await user.clear(saudacaoInput)
    await user.type(saudacaoInput, 'Guten Morgen')

    const saveButton = screen.getByRole('button', { name: 'Salvar Alterações' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Salvar Alterações' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    })

    expect(screen.getByText('Guten Morgen')).toBeInTheDocument()
  })

  it('deve cancelar edição e descartar alterações', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    const originalSaudacao = mockFrases.saudacao

    const editButton = screen.getByRole('button', { name: 'Editar' })
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar Alterações' })).toBeInTheDocument()
    })

    const saudacaoInput = screen.getByLabelText('Saudação (Greeting)')
    await user.clear(saudacaoInput)
    await user.type(saudacaoInput, 'Temporary Greeting')

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Salvar Alterações' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    })

    // Verify original greeting is restored
    expect(screen.getByText(originalSaudacao)).toBeInTheDocument()
    expect(screen.queryByText('Temporary Greeting')).not.toBeInTheDocument()
  })

  it('deve exibir contador de frases intermediárias', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    expect(screen.getByText(/1\./)).toBeInTheDocument()
    expect(screen.getByText(/2\./)).toBeInTheDocument()
    expect(screen.getByText(/3\./)).toBeInTheDocument()
  })

  it('deve ter link para voltar à página inicial', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    const voltarLink = screen.getByText('← Voltar')
    expect(voltarLink).toBeInTheDocument()
    expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('deve exibir labels descritivos', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    expect(screen.getByText('Saudação (Greeting)')).toBeInTheDocument()
    expect(screen.getByText('Despedida (Farewell)')).toBeInTheDocument()
    expect(screen.getByText('Frases Intermediárias (Intermediate Phrases)')).toBeInTheDocument()
  })

  it('não deve exibir botão "Editar" quando em modo de edição', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderDialogPhrasesPage()

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: 'Editar' })
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
    })
  })
})
