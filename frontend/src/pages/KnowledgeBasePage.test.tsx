import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import KnowledgeBasePage from './KnowledgeBasePage'
import * as DataContext from '../contexts/DataContext'
import type { ConhecimentoIdioma } from '../types/api'
import { IdiomaConhecimentoEnum, TipoConhecimentoEnum } from '../types/api'

// Mock do DataContext
vi.mock('../contexts/DataContext', async () => {
  const actual = await vi.importActual('../contexts/DataContext')
  return {
    ...actual,
    useData: vi.fn()
  }
})

const mockConhecimentos: ConhecimentoIdioma[] = [
  {
    conhecimento_id: '40986742-86a6-4bc6-bae3-41e34ce5298d',
    data_hora: '2025-10-05T14:35:06.829Z',
    idioma: IdiomaConhecimentoEnum.Alemao,
    tipo_conhecimento: TipoConhecimentoEnum.Frase,
    texto_original: 'Hallo!',
    transcricao_ipa: 'haˈloː',
    traducao: 'Olá!',
    divisao_silabica: 'Hal-lo'
  },
  {
    conhecimento_id: '411aede2-40ca-4744-8e0d-36d3dddf3de5',
    data_hora: '2025-10-05T17:42:40.425Z',
    idioma: IdiomaConhecimentoEnum.Alemao,
    tipo_conhecimento: TipoConhecimentoEnum.Frase,
    texto_original: 'Danke.',
    transcricao_ipa: 'ˈdaŋkə',
    traducao: 'Obrigado.',
    divisao_silabica: 'Dan-ke'
  },
  {
    conhecimento_id: 'f2a3b4c5-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
    data_hora: '2025-10-07T10:20:00.000Z',
    idioma: IdiomaConhecimentoEnum.Ingles,
    tipo_conhecimento: TipoConhecimentoEnum.Palavra,
    texto_original: 'Hello',
    transcricao_ipa: 'həˈloʊ',
    traducao: 'Olá',
    divisao_silabica: 'Hel-lo'
  }
]

// Helper function to create mock data context
function createMockDataContext(baseConhecimento: ConhecimentoIdioma[] | null = mockConhecimentos, loading = false, error: string | null = null) {
  return {
    historico: { exercicios: [] },
    prompts: { descricao: '', data_atualizacao: '', marcador_de_paramentros: '', prompts: [] },
    baseConhecimento,
    frasesDialogo: { saudacao: '', despedida: '', intermediarias: [] },
    loading: {
      historico: false,
      prompts: false,
      baseConhecimento: loading,
      frasesDialogo: false
    },
    errors: {
      historico: null,
      prompts: null,
      baseConhecimento: error,
      frasesDialogo: null
    },
    refreshHistorico: vi.fn(),
    refreshPrompts: vi.fn(),
    refreshBaseConhecimento: vi.fn(),
    refreshFrasesDialogo: vi.fn(),
    refreshAll: vi.fn()
  }
}

function renderKnowledgeBasePage() {
  return render(
    <BrowserRouter>
      <KnowledgeBasePage />
    </BrowserRouter>
  )
}

describe('KnowledgeBasePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock padrão para useData
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
  })

  it('deve exibir estado de carregamento inicialmente', () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(null, true))

    renderKnowledgeBasePage()

    expect(screen.getByText(/Carregando base de conhecimento/i)).toBeInTheDocument()
  })

  it('deve carregar e exibir os conhecimentos', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    expect(screen.getByText('Hallo!')).toBeInTheDocument()
    expect(screen.getByText('Danke.')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('deve exibir mensagem de erro quando falha ao carregar', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(null, false, 'Erro ao carregar base de conhecimento: Erro de rede'))

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar base de conhecimento')).toBeInTheDocument()
    })

    expect(screen.getByText(/Erro ao carregar base de conhecimento:/i)).toBeInTheDocument()
  })

  it('deve exibir contador de registros', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    expect(screen.getByText('Mostrando 3 de 3 registros')).toBeInTheDocument()
  })

  it('deve filtrar por idioma alemão', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    const idiomaSelect = screen.getByLabelText('Idioma')
    await user.selectOptions(idiomaSelect, 'alemao')

    await waitFor(() => {
      expect(screen.getByText('Mostrando 2 de 3 registros')).toBeInTheDocument()
    })

    expect(screen.getByText('Hallo!')).toBeInTheDocument()
    expect(screen.getByText('Danke.')).toBeInTheDocument()
    expect(screen.queryByText('Hello')).not.toBeInTheDocument()
  })

  it('deve filtrar por idioma inglês', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    const idiomaSelect = screen.getByLabelText('Idioma')
    await user.selectOptions(idiomaSelect, 'ingles')

    await waitFor(() => {
      expect(screen.getByText('Mostrando 1 de 3 registros')).toBeInTheDocument()
    })

    expect(screen.queryByText('Hallo!')).not.toBeInTheDocument()
    expect(screen.queryByText('Danke.')).not.toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('deve filtrar por tipo frase', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    const tipoSelect = screen.getByLabelText('Tipo')
    await user.selectOptions(tipoSelect, 'frase')

    await waitFor(() => {
      expect(screen.getByText('Mostrando 2 de 3 registros')).toBeInTheDocument()
    })

    expect(screen.getByText('Hallo!')).toBeInTheDocument()
    expect(screen.getByText('Danke.')).toBeInTheDocument()
    expect(screen.queryByText('Hello')).not.toBeInTheDocument()
  })

  it('deve filtrar por tipo palavra', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    const tipoSelect = screen.getByLabelText('Tipo')
    await user.selectOptions(tipoSelect, 'palavra')

    await waitFor(() => {
      expect(screen.getByText('Mostrando 1 de 3 registros')).toBeInTheDocument()
    })

    expect(screen.queryByText('Hallo!')).not.toBeInTheDocument()
    expect(screen.queryByText('Danke.')).not.toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('deve buscar por texto original', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    const searchInput = screen.getByLabelText('Buscar')
    await user.type(searchInput, 'Hallo')

    await waitFor(() => {
      expect(screen.getByText('Mostrando 1 de 3 registros')).toBeInTheDocument()
    })

    expect(screen.getByText('Hallo!')).toBeInTheDocument()
    expect(screen.queryByText('Danke.')).not.toBeInTheDocument()
    expect(screen.queryByText('Hello')).not.toBeInTheDocument()
  })

  it('deve buscar por tradução', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    const searchInput = screen.getByLabelText('Buscar')
    await user.type(searchInput, 'Obrigado')

    await waitFor(() => {
      expect(screen.getByText('Mostrando 1 de 3 registros')).toBeInTheDocument()
    })

    expect(screen.queryByText('Hallo!')).not.toBeInTheDocument()
    expect(screen.getByText('Danke.')).toBeInTheDocument()
    expect(screen.queryByText('Hello')).not.toBeInTheDocument()
  })

  it('deve buscar por transcrição IPA', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    const searchInput = screen.getByLabelText('Buscar')
    await user.type(searchInput, 'həˈloʊ')

    await waitFor(() => {
      expect(screen.getByText('Mostrando 1 de 3 registros')).toBeInTheDocument()
    })

    expect(screen.queryByText('Hallo!')).not.toBeInTheDocument()
    expect(screen.queryByText('Danke.')).not.toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('deve combinar filtros de idioma e tipo', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    const idiomaSelect = screen.getByLabelText('Idioma')
    const tipoSelect = screen.getByLabelText('Tipo')

    await user.selectOptions(idiomaSelect, 'alemao')
    await user.selectOptions(tipoSelect, 'frase')

    await waitFor(() => {
      expect(screen.getByText('Mostrando 2 de 3 registros')).toBeInTheDocument()
    })

    expect(screen.getByText('Hallo!')).toBeInTheDocument()
    expect(screen.getByText('Danke.')).toBeInTheDocument()
    expect(screen.queryByText('Hello')).not.toBeInTheDocument()
  })

  it('deve exibir mensagem quando nenhum registro é encontrado', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    const searchInput = screen.getByLabelText('Buscar')
    await user.type(searchInput, 'xxxnonexistentxxx')

    await waitFor(() => {
      expect(screen.getByText('Nenhum registro encontrado com os filtros aplicados.')).toBeInTheDocument()
    })
  })

  it('deve exibir informações detalhadas do conhecimento', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    // Check first item details
    expect(screen.getByText('Hallo!')).toBeInTheDocument()
    expect(screen.getByText('Olá!')).toBeInTheDocument()
    expect(screen.getByText('haˈloː')).toBeInTheDocument()
    expect(screen.getByText('Hal-lo')).toBeInTheDocument()
  })

  it('deve exibir tags de idioma e tipo', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    const alemaoTags = screen.getAllByText('Alemão')
    const fraseTags = screen.getAllByText('Frase')
    const inglesTags = screen.getAllByText('Inglês')
    const palavraTags = screen.getAllByText('Palavra')

    expect(alemaoTags.length).toBeGreaterThan(0)
    expect(fraseTags.length).toBeGreaterThan(0)
    expect(inglesTags.length).toBeGreaterThan(0)
    expect(palavraTags.length).toBeGreaterThan(0)
  })

  it('deve ter link para voltar à página inicial', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    const voltarLink = screen.getByText('← Voltar')
    expect(voltarLink).toBeInTheDocument()
    expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('deve resetar filtros ao selecionar "Todos"', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderKnowledgeBasePage()

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })

    // Apply filters
    const idiomaSelect = screen.getByLabelText('Idioma')
    await user.selectOptions(idiomaSelect, 'alemao')

    await waitFor(() => {
      expect(screen.getByText('Mostrando 2 de 3 registros')).toBeInTheDocument()
    })

    // Reset filters
    await user.selectOptions(idiomaSelect, 'todos')

    await waitFor(() => {
      expect(screen.getByText('Mostrando 3 de 3 registros')).toBeInTheDocument()
    })

    expect(screen.getByText('Hallo!')).toBeInTheDocument()
    expect(screen.getByText('Danke.')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
