import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from './Home'

describe('Home Component', () => {
  it('deve renderizar o título da aplicação', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Estudo de Idiomas')).toBeInTheDocument()
  })

  it('deve renderizar o subtítulo da aplicação', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Pratique e aprenda novos idiomas de forma interativa')).toBeInTheDocument()
  })

  it('deve renderizar o título da seção de práticas', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Práticas Interativas')).toBeInTheDocument()
  })

  it('deve renderizar o título da seção de manutenção', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Configurações e Manutenção')).toBeInTheDocument()
  })

  it('deve renderizar as 6 práticas', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Prática de Tradução')).toBeInTheDocument()
    expect(screen.getByText('Prática de Audição')).toBeInTheDocument()
    expect(screen.getByText('Prática de Pronúncia')).toBeInTheDocument()
    expect(screen.getByText('Prática de Diálogo')).toBeInTheDocument()
    expect(screen.getByText('Prática de Números')).toBeInTheDocument()
    expect(screen.getByText('Prática de Substantivos')).toBeInTheDocument()
  })

  it('deve renderizar as descrições das práticas', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Pratique traduzindo textos entre idiomas')).toBeInTheDocument()
    expect(screen.getByText('Aprimore sua compreensão auditiva')).toBeInTheDocument()
    expect(screen.getByText('Melhore sua pronúncia e sotaque')).toBeInTheDocument()
    expect(screen.getByText('Pratique conversações naturais')).toBeInTheDocument()
    expect(screen.getByText('Aprenda números e quantidades')).toBeInTheDocument()
    expect(screen.getByText('Domine substantivos e vocabulário')).toBeInTheDocument()
  })

  it('deve renderizar as 4 funcionalidades de manutenção', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    expect(screen.getByText('Mudar Base de Conhecimento')).toBeInTheDocument()
    expect(screen.getByText('Navegar no Histórico')).toBeInTheDocument()
    expect(screen.getByText('Editar Frases do Diálogo')).toBeInTheDocument()
  })

  it('deve renderizar as descrições das funcionalidades de manutenção', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Gerenciar e editar os prompts da aplicação')).toBeInTheDocument()
    expect(screen.getByText('Adicionar e modificar palavras e frases')).toBeInTheDocument()
    expect(screen.getByText('Visualizar histórico de exercícios praticados')).toBeInTheDocument()
    expect(screen.getByText('Configurar frases de saudação e despedida')).toBeInTheDocument()
  })

  it('deve ter 10 links no total (6 práticas + 4 manutenção)', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(10)
  })

  it('deve ter links funcionais para as práticas', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const links = screen.getAllByRole('link')

    expect(links[0]).toHaveAttribute('href', '/pratica-traducao')
    expect(links[1]).toHaveAttribute('href', '/pratica-audicao')
    expect(links[2]).toHaveAttribute('href', '/pratica-pronuncia')
    expect(links[3]).toHaveAttribute('href', '/pratica-dialogo')
    expect(links[4]).toHaveAttribute('href', '/pratica-numeros')
    expect(links[5]).toHaveAttribute('href', '/pratica-substantivos')
  })

  it('deve ter links funcionais para as funcionalidades de manutenção', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const links = screen.getAllByRole('link')

    expect(links[6]).toHaveAttribute('href', '/editar-prompts')
    expect(links[7]).toHaveAttribute('href', '/mudar-base-conhecimento')
    expect(links[8]).toHaveAttribute('href', '/navegar-historico')
    expect(links[9]).toHaveAttribute('href', '/editar-frases-dialogo')
  })

  it('deve renderizar o footer com versão', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Aplicação de Estudo de Idiomas v1.0.0')).toBeInTheDocument()
  })

  it('deve ter a estrutura de seções separadas', () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const sections = container.querySelectorAll('section')
    expect(sections).toHaveLength(2) // Seção de práticas e seção de manutenção
  })
})
