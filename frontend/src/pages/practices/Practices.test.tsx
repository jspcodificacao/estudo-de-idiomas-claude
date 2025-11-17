import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import * as DataContext from '../../contexts/DataContext'
import PraticaTraducao from './PraticaTraducao'
import PraticaAudicao from './PraticaAudicao'
import PraticaPronuncia from './PraticaPronuncia'
import PraticaDialogo from './PraticaDialogo'
import PraticaNumeros from './PraticaNumeros'
import PraticaSubstantivos from './PraticaSubstantivos'

// Mock do DataContext
vi.mock('../../contexts/DataContext', async () => {
  const actual = await vi.importActual('../../contexts/DataContext')
  return {
    ...actual,
    useData: vi.fn()
  }
})

describe('Práticas Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock padrão para useData
    vi.mocked(DataContext.useData).mockReturnValue({
      historico: { exercicios: [] },
      prompts: {
        descricao: 'Test prompts',
        data_atualizacao: '2025-11-14T00:00:00Z',
        marcador_de_paramentros: '{{param}}',
        prompts: []
      },
      baseConhecimento: [
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
      ],
      frasesDialogo: {
        saudacao: 'Test greeting',
        despedida: 'Test farewell',
        intermediarias: ['Test phrase']
      },
      loading: {
        historico: false,
        prompts: false,
        baseConhecimento: false,
        frasesDialogo: false
      },
      errors: {
        historico: null,
        prompts: null,
        baseConhecimento: null,
        frasesDialogo: null
      },
      refreshHistorico: vi.fn(),
      refreshPrompts: vi.fn(),
      refreshBaseConhecimento: vi.fn(),
      refreshFrasesDialogo: vi.fn(),
      refreshAll: vi.fn()
    })
  })

  describe('PraticaTraducao', () => {
    it('deve renderizar o título', () => {
      render(
        <BrowserRouter>
          <PraticaTraducao />
        </BrowserRouter>
      )

      expect(screen.getByText('Prática de Tradução')).toBeInTheDocument()
    })

    it('deve exibir os campos do formulário', () => {
      render(
        <BrowserRouter>
          <PraticaTraducao />
        </BrowserRouter>
      )

      expect(screen.getByPlaceholderText('Digite o texto no idioma original')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Digite a tradução')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Digite a divisão silábica')).toBeInTheDocument()
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

    it('deve exibir mensagem de carregamento de áudios', () => {
      render(
        <BrowserRouter>
          <PraticaAudicao />
        </BrowserRouter>
      )

      expect(screen.getByText('Gerando áudios do exercício...')).toBeInTheDocument()
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

    it('deve exibir seção de gravação', () => {
      render(
        <BrowserRouter>
          <PraticaPronuncia />
        </BrowserRouter>
      )

      expect(screen.getByText('Texto para Pronunciar')).toBeInTheDocument()
      expect(screen.getByText('Iniciar Gravação')).toBeInTheDocument()
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

    it('deve exibir mensagem de carregamento de áudios', () => {
      render(
        <BrowserRouter>
          <PraticaDialogo />
        </BrowserRouter>
      )

      expect(screen.getByText('Gerando áudios...')).toBeInTheDocument()
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

    it('deve exibir campos de configuração', () => {
      render(
        <BrowserRouter>
          <PraticaNumeros />
        </BrowserRouter>
      )

      expect(screen.getByLabelText('Valor Mínimo')).toBeInTheDocument()
      expect(screen.getByLabelText('Valor Máximo')).toBeInTheDocument()
      expect(screen.getByText('Iniciar Prática')).toBeInTheDocument()
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
