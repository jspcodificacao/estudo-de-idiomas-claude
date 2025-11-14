import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PraticaTraducao from './PraticaTraducao'
import PraticaAudicao from './PraticaAudicao'
import PraticaPronuncia from './PraticaPronuncia'
import PraticaDialogo from './PraticaDialogo'
import PraticaNumeros from './PraticaNumeros'
import PraticaSubstantivos from './PraticaSubstantivos'

describe('Práticas Components', () => {
  describe('PraticaTraducao', () => {
    it('deve renderizar o título', () => {
      render(
        <BrowserRouter>
          <PraticaTraducao />
        </BrowserRouter>
      )

      expect(screen.getByText('Prática de Tradução')).toBeInTheDocument()
    })

    it('deve exibir mensagem de não implementado', () => {
      render(
        <BrowserRouter>
          <PraticaTraducao />
        </BrowserRouter>
      )

      expect(screen.getByText('Funcionalidade ainda não implementada!')).toBeInTheDocument()
    })

    it('deve ter link para voltar', () => {
      render(
        <BrowserRouter>
          <PraticaTraducao />
        </BrowserRouter>
      )

      const voltarLink = screen.getByText('← Voltar')
      expect(voltarLink).toBeInTheDocument()
      expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('PraticaAudicao', () => {
    it('deve renderizar o título', () => {
      render(
        <BrowserRouter>
          <PraticaAudicao />
        </BrowserRouter>
      )

      expect(screen.getByText('Prática de Audição')).toBeInTheDocument()
    })

    it('deve exibir mensagem de não implementado', () => {
      render(
        <BrowserRouter>
          <PraticaAudicao />
        </BrowserRouter>
      )

      expect(screen.getByText('Funcionalidade ainda não implementada!')).toBeInTheDocument()
    })

    it('deve ter link para voltar', () => {
      render(
        <BrowserRouter>
          <PraticaAudicao />
        </BrowserRouter>
      )

      const voltarLink = screen.getByText('← Voltar')
      expect(voltarLink).toBeInTheDocument()
      expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('PraticaPronuncia', () => {
    it('deve renderizar o título', () => {
      render(
        <BrowserRouter>
          <PraticaPronuncia />
        </BrowserRouter>
      )

      expect(screen.getByText('Prática de Pronúncia')).toBeInTheDocument()
    })

    it('deve exibir mensagem de não implementado', () => {
      render(
        <BrowserRouter>
          <PraticaPronuncia />
        </BrowserRouter>
      )

      expect(screen.getByText('Funcionalidade ainda não implementada!')).toBeInTheDocument()
    })

    it('deve ter link para voltar', () => {
      render(
        <BrowserRouter>
          <PraticaPronuncia />
        </BrowserRouter>
      )

      const voltarLink = screen.getByText('← Voltar')
      expect(voltarLink).toBeInTheDocument()
      expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('PraticaDialogo', () => {
    it('deve renderizar o título', () => {
      render(
        <BrowserRouter>
          <PraticaDialogo />
        </BrowserRouter>
      )

      expect(screen.getByText('Prática de Diálogo')).toBeInTheDocument()
    })

    it('deve exibir mensagem de não implementado', () => {
      render(
        <BrowserRouter>
          <PraticaDialogo />
        </BrowserRouter>
      )

      expect(screen.getByText('Funcionalidade ainda não implementada!')).toBeInTheDocument()
    })

    it('deve ter link para voltar', () => {
      render(
        <BrowserRouter>
          <PraticaDialogo />
        </BrowserRouter>
      )

      const voltarLink = screen.getByText('← Voltar')
      expect(voltarLink).toBeInTheDocument()
      expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('PraticaNumeros', () => {
    it('deve renderizar o título', () => {
      render(
        <BrowserRouter>
          <PraticaNumeros />
        </BrowserRouter>
      )

      expect(screen.getByText('Prática de Números')).toBeInTheDocument()
    })

    it('deve exibir mensagem de não implementado', () => {
      render(
        <BrowserRouter>
          <PraticaNumeros />
        </BrowserRouter>
      )

      expect(screen.getByText('Funcionalidade ainda não implementada!')).toBeInTheDocument()
    })

    it('deve ter link para voltar', () => {
      render(
        <BrowserRouter>
          <PraticaNumeros />
        </BrowserRouter>
      )

      const voltarLink = screen.getByText('← Voltar')
      expect(voltarLink).toBeInTheDocument()
      expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('PraticaSubstantivos', () => {
    it('deve renderizar o título', () => {
      render(
        <BrowserRouter>
          <PraticaSubstantivos />
        </BrowserRouter>
      )

      expect(screen.getByText('Prática de Substantivos')).toBeInTheDocument()
    })

    it('deve exibir mensagem de não implementado', () => {
      render(
        <BrowserRouter>
          <PraticaSubstantivos />
        </BrowserRouter>
      )

      expect(screen.getByText('Funcionalidade ainda não implementada!')).toBeInTheDocument()
    })

    it('deve ter link para voltar', () => {
      render(
        <BrowserRouter>
          <PraticaSubstantivos />
        </BrowserRouter>
      )

      const voltarLink = screen.getByText('← Voltar')
      expect(voltarLink).toBeInTheDocument()
      expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
    })
  })
})
