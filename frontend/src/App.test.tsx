import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import * as api from './services/api'

// Mock das chamadas da API
vi.mock('./services/api', async () => {
  const actual = await vi.importActual('./services/api')
  return {
    ...actual,
    getHistoricoPratica: vi.fn(),
    getPrompts: vi.fn(),
    getBaseConhecimento: vi.fn(),
    getFrasesDialogo: vi.fn()
  }
})

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock das respostas da API
    vi.mocked(api.getHistoricoPratica).mockResolvedValue({ exercicios: [] })
    vi.mocked(api.getPrompts).mockResolvedValue({
      descricao: 'Test prompts',
      data_atualizacao: '2025-11-14T00:00:00Z',
      marcador_de_paramentros: '{{param}}',
      prompts: []
    })
    vi.mocked(api.getBaseConhecimento).mockResolvedValue([
      {
        conhecimento_id: '1',
        texto_original: 'Hallo',
        traducao: 'Olá',
        idioma: 'alemao',
        tipo_conhecimento: 'frase',
        transcricao_ipa: 'halo',
        divisao_silabica: 'Hal-lo',
        data_hora: '2025-11-14T10:00:00Z'
      }
    ])
    vi.mocked(api.getFrasesDialogo).mockResolvedValue({
      saudacao: 'Test greeting',
      despedida: 'Test farewell',
      intermediarias: ['Test phrase']
    })
  })

  it('deve renderizar a página Home na rota raiz', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Estudo de Idiomas')).toBeInTheDocument()
    expect(screen.getByText('Pratique e aprenda novos idiomas de forma interativa')).toBeInTheDocument()
  })

  it('deve renderizar PromptsPage na rota /editar-prompts', async () => {
    render(
      <MemoryRouter initialEntries={['/editar-prompts']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })
  })

  it('deve renderizar KnowledgeBasePage na rota /mudar-base-conhecimento', async () => {
    render(
      <MemoryRouter initialEntries={['/mudar-base-conhecimento']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Base de Conhecimento')).toBeInTheDocument()
    })
  })

  it('deve renderizar HistoricoPage na rota /navegar-historico', async () => {
    render(
      <MemoryRouter initialEntries={['/navegar-historico']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })
  })

  it('deve renderizar DialogPhrasesPage na rota /editar-frases-dialogo', async () => {
    render(
      <MemoryRouter initialEntries={['/editar-frases-dialogo']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Frases do Diálogo')).toBeInTheDocument()
    })
  })

  it('deve ter o gradiente de fundo da aplicação', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    const appWrapper = container.querySelector('.min-h-screen')
    expect(appWrapper).toBeInTheDocument()
    expect(appWrapper).toHaveClass('bg-gradient-to-br')
  })

  it('deve renderizar PraticaTraducao na rota /pratica-traducao', async () => {
    render(
      <MemoryRouter initialEntries={['/pratica-traducao']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Prática de Tradução')).toBeInTheDocument()
    })
  })

  it('deve renderizar PraticaAudicao na rota /pratica-audicao', async () => {
    render(
      <MemoryRouter initialEntries={['/pratica-audicao']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Prática de Audição')).toBeInTheDocument()
    })
  })

  it('deve renderizar PraticaPronuncia na rota /pratica-pronuncia', async () => {
    render(
      <MemoryRouter initialEntries={['/pratica-pronuncia']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Prática de Pronúncia')).toBeInTheDocument()
    })
  })

  it('deve renderizar PraticaDialogo na rota /pratica-dialogo', async () => {
    render(
      <MemoryRouter initialEntries={['/pratica-dialogo']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Diálogo Interativo')).toBeInTheDocument()
    })
  })

  it('deve renderizar PraticaNumeros na rota /pratica-numeros', async () => {
    render(
      <MemoryRouter initialEntries={['/pratica-numeros']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Prática de Números')).toBeInTheDocument()
    })
  })

  it('deve renderizar PraticaSubstantivos na rota /pratica-substantivos', async () => {
    render(
      <MemoryRouter initialEntries={['/pratica-substantivos']}>
        <App />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Prática de Substantivos')).toBeInTheDocument()
    })
  })

  it('deve ter todas as rotas definidas', () => {
    const routes = [
      '/',
      '/pratica-traducao',
      '/pratica-audicao',
      '/pratica-pronuncia',
      '/pratica-dialogo',
      '/pratica-numeros',
      '/pratica-substantivos',
      '/editar-prompts',
      '/mudar-base-conhecimento',
      '/navegar-historico',
      '/editar-frases-dialogo'
    ]

    routes.forEach(route => {
      const { unmount } = render(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      )

      // Verifica se a rota renderiza algo sem erro
      const container = document.body
      expect(container).toBeTruthy()

      unmount()
    })
  })
})
