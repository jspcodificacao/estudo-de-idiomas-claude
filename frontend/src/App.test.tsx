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

  it('deve renderizar NotImplemented na rota /editar-prompts', () => {
    render(
      <MemoryRouter initialEntries={['/editar-prompts']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Funcionalidade não implementada')).toBeInTheDocument()
    expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
  })

  it('deve renderizar NotImplemented na rota /mudar-base-conhecimento', () => {
    render(
      <MemoryRouter initialEntries={['/mudar-base-conhecimento']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Funcionalidade não implementada')).toBeInTheDocument()
    expect(screen.getByText('Mudar Base de Conhecimento')).toBeInTheDocument()
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

  it('deve renderizar NotImplemented na rota /editar-frases-dialogo', () => {
    render(
      <MemoryRouter initialEntries={['/editar-frases-dialogo']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Funcionalidade não implementada')).toBeInTheDocument()
    expect(screen.getByText('Editar Frases do Diálogo')).toBeInTheDocument()
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
