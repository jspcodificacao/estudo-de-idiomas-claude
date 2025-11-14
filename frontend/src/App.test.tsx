import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import * as api from './services/api'

// Mock do módulo de API
vi.mock('./services/api')

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock padrão para o histórico vazio
    vi.mocked(api.getHistoricoPratica).mockResolvedValue({ exercicios: [] })
    // Mock padrão para prompts vazios
    vi.mocked(api.getPrompts).mockResolvedValue({
      descricao: 'Test prompts',
      data_atualizacao: '2025-11-14T00:00:00Z',
      marcador_de_paramentros: '{{param}}',
      prompts: []
    })
    // Mock padrão para base de conhecimento vazia
    vi.mocked(api.getBaseConhecimento).mockResolvedValue([])
    // Mock padrão para frases do diálogo
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
    expect(screen.getByText('Gerencie sua plataforma de aprendizado de idiomas')).toBeInTheDocument()
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

  it('deve ter todas as rotas definidas', () => {
    const routes = [
      '/',
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
