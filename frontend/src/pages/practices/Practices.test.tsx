import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { DataProvider } from '../../contexts/DataContext'
import * as api from '../../services/api'
import PraticaTraducao from './PraticaTraducao'
import PraticaAudicao from './PraticaAudicao'
import PraticaPronuncia from './PraticaPronuncia'
import PraticaDialogo from './PraticaDialogo'
import PraticaNumeros from './PraticaNumeros'
import PraticaSubstantivos from './PraticaSubstantivos'

// Mock das chamadas da API
vi.mock('../../services/api', async () => {
  const actual = await vi.importActual('../../services/api')
  return {
    ...actual,
    getHistoricoPratica: vi.fn(),
    getPrompts: vi.fn(),
    getBaseConhecimento: vi.fn(),
    getFrasesDialogo: vi.fn()
  }
})

describe('Práticas Components', () => {
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

  describe('PraticaTraducao', () => {
    it('deve renderizar o título', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaTraducao />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Prática de Tradução')).toBeInTheDocument()
      })
    })

    it('deve exibir os campos do formulário', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaTraducao />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Digite o texto no idioma original')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Digite a tradução')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Digite a divisão silábica')).toBeInTheDocument()
      })
    })

    it('deve ter link para voltar', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaTraducao />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        const voltarLink = screen.getByText('← Voltar')
        expect(voltarLink).toBeInTheDocument()
        expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
      })
    })
  })

  describe('PraticaAudicao', () => {
    it('deve renderizar o título', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaAudicao />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Prática de Audição')).toBeInTheDocument()
      })
    })

    it('deve exibir mensagem de carregamento de áudios', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaAudicao />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Gerando áudios do exercício...')).toBeInTheDocument()
      })
    })

    it('deve ter link para voltar', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaAudicao />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        const voltarLink = screen.getByText('← Voltar')
        expect(voltarLink).toBeInTheDocument()
        expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
      })
    })
  })

  describe('PraticaPronuncia', () => {
    it('deve renderizar o título', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaPronuncia />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Prática de Pronúncia')).toBeInTheDocument()
      })
    })

    it('deve exibir seção de gravação', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaPronuncia />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Texto para Pronunciar')).toBeInTheDocument()
        expect(screen.getByText('Iniciar Gravação')).toBeInTheDocument()
      })
    })

    it('deve ter link para voltar', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaPronuncia />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        const voltarLink = screen.getByText('← Voltar')
        expect(voltarLink).toBeInTheDocument()
        expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
      })
    })
  })

  describe('PraticaDialogo', () => {
    it('deve renderizar o título', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaDialogo />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Diálogo Interativo')).toBeInTheDocument()
      })
    })

    it('deve exibir mensagem de carregamento de áudios', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaDialogo />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Gerando áudios...')).toBeInTheDocument()
      })
    })

    it('deve ter link para voltar', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaDialogo />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        const voltarLink = screen.getByText('← Voltar')
        expect(voltarLink).toBeInTheDocument()
        expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
      })
    })
  })

  describe('PraticaNumeros', () => {
    it('deve renderizar o título', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaNumeros />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Prática de Números')).toBeInTheDocument()
      })
    })

    it('deve exibir campos de configuração', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaNumeros />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Valor Mínimo')).toBeInTheDocument()
        expect(screen.getByLabelText('Valor Máximo')).toBeInTheDocument()
        expect(screen.getByText('Iniciar Prática')).toBeInTheDocument()
      })
    })

    it('deve ter link para voltar', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaNumeros />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        const voltarLink = screen.getByText('← Voltar')
        expect(voltarLink).toBeInTheDocument()
        expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
      })
    })
  })

  describe('PraticaSubstantivos', () => {
    it('deve renderizar o título', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaSubstantivos />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Prática de Substantivos')).toBeInTheDocument()
      })
    })

    it('deve exibir mensagem de não implementado', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaSubstantivos />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Funcionalidade ainda não implementada!')).toBeInTheDocument()
      })
    })

    it('deve ter link para voltar', async () => {
      render(
        <DataProvider>
          <BrowserRouter>
            <PraticaSubstantivos />
          </BrowserRouter>
        </DataProvider>
      )

      await waitFor(() => {
        const voltarLink = screen.getByText('← Voltar')
        expect(voltarLink).toBeInTheDocument()
        expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
      })
    })
  })
})
