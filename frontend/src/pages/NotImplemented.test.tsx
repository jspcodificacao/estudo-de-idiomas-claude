import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NotImplemented from './NotImplemented'

describe('NotImplemented Component', () => {
  it('deve renderizar a mensagem de funcionalidade não implementada', () => {
    render(
      <BrowserRouter>
        <NotImplemented feature="Teste" />
      </BrowserRouter>
    )

    expect(screen.getByText('Funcionalidade não implementada')).toBeInTheDocument()
  })

  it('deve renderizar o nome da funcionalidade fornecido via props', () => {
    render(
      <BrowserRouter>
        <NotImplemented feature="Editar Prompts" />
      </BrowserRouter>
    )

    expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
  })

  it('deve renderizar o ícone de construção', () => {
    render(
      <BrowserRouter>
        <NotImplemented feature="Teste" />
      </BrowserRouter>
    )

    expect(screen.getByText('🚧')).toBeInTheDocument()
  })

  it('deve ter um link para voltar à página inicial', () => {
    render(
      <BrowserRouter>
        <NotImplemented feature="Teste" />
      </BrowserRouter>
    )

    const backLink = screen.getByRole('link', { name: /voltar para a página inicial/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/')
  })

  it('deve renderizar a mensagem de desenvolvimento', () => {
    render(
      <BrowserRouter>
        <NotImplemented feature="Teste" />
      </BrowserRouter>
    )

    expect(screen.getByText(/Esta funcionalidade está em desenvolvimento/i)).toBeInTheDocument()
  })

  it('deve renderizar corretamente com diferentes nomes de funcionalidades', () => {
    const { rerender } = render(
      <BrowserRouter>
        <NotImplemented feature="Funcionalidade A" />
      </BrowserRouter>
    )

    expect(screen.getByText('Funcionalidade A')).toBeInTheDocument()

    rerender(
      <BrowserRouter>
        <NotImplemented feature="Funcionalidade B" />
      </BrowserRouter>
    )

    expect(screen.getByText('Funcionalidade B')).toBeInTheDocument()
  })

  it('deve ter a estrutura de container centralizado', () => {
    const { container } = render(
      <BrowserRouter>
        <NotImplemented feature="Teste" />
      </BrowserRouter>
    )

    const containerDiv = container.querySelector('.container')
    expect(containerDiv).toBeInTheDocument()
  })
})
