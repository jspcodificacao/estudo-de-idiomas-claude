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

    expect(screen.getByText('Gerencie sua plataforma de aprendizado de idiomas')).toBeInTheDocument()
  })

  it('deve renderizar os 4 cards de funcionalidades', () => {
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

  it('deve renderizar as descrições dos cards', () => {
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

  it('deve renderizar os ícones dos cards', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('📝')).toBeInTheDocument()
    expect(screen.getByText('📚')).toBeInTheDocument()
    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('💬')).toBeInTheDocument()
  })

  it('deve ter links funcionais para cada funcionalidade', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)

    expect(links[0]).toHaveAttribute('href', '/editar-prompts')
    expect(links[1]).toHaveAttribute('href', '/mudar-base-conhecimento')
    expect(links[2]).toHaveAttribute('href', '/navegar-historico')
    expect(links[3]).toHaveAttribute('href', '/editar-frases-dialogo')
  })

  it('deve renderizar o footer com versão', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Aplicação de Estudo de Idiomas v1.0.0')).toBeInTheDocument()
  })

  it('deve ter a estrutura de container e grid', () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const gridElement = container.querySelector('.grid')
    expect(gridElement).toBeInTheDocument()
    expect(gridElement).toHaveClass('grid-cols-1')
  })
})
