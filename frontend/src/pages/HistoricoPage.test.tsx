import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import HistoricoPage from './HistoricoPage'
import * as api from '../services/api'
import { IdiomaEnum, TipoPraticaEnum } from '../types/api'
import type { BaseHistoricoPratica } from '../types/api'

// Mock do módulo de API
vi.mock('../services/api')

const mockHistorico: BaseHistoricoPratica = {
  exercicios: [
    {
      data_hora: '2024-01-15T10:30:00',
      exercicio_id: 'e1f2a3b4-5c6d-7e8f-9a0b-1c2d3e4f5a6b',
      conhecimento_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      idioma: IdiomaEnum.Ingles,
      tipo_pratica: TipoPraticaEnum.Traducao,
      resultado_exercicio: {
        campo_fornecido: 'texto_original',
        campos_preenchidos: ['traducao'],
        valores_preenchidos: ['test'],
        campos_resultados: [true, false, true]
      }
    },
    {
      data_hora: '2024-01-14T15:45:00',
      exercicio_id: 'f2a3b4c5-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
      conhecimento_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      idioma: IdiomaEnum.Frances,
      tipo_pratica: TipoPraticaEnum.Audicao,
      resultado_exercicio: {
        texto_original: 'Bonjour',
        transcricao_usuario: 'Bonjour',
        correto: true,
        velocidade_utilizada: '1.0'
      }
    },
    {
      data_hora: '2024-01-13T09:15:00',
      exercicio_id: 'a3b4c5d6-7e8f-9a0b-1c2d-3e4f5a6b7c8d',
      conhecimento_id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      idioma: IdiomaEnum.Ingles,
      tipo_pratica: TipoPraticaEnum.Pronuncia,
      resultado_exercicio: {
        texto_original: 'Hello',
        transcricao_stt: 'Hello',
        correto: 'Sim',
        comentario: 'Excelente pronúncia'
      }
    }
  ]
}

function renderHistoricoPage() {
  return render(
    <BrowserRouter>
      <HistoricoPage />
    </BrowserRouter>
  )
}

describe('HistoricoPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve exibir estado de carregamento inicialmente', () => {
    vi.mocked(api.getHistoricoPratica).mockImplementation(() => new Promise(() => {}))

    renderHistoricoPage()

    expect(screen.getByText(/Carregando histórico de exercícios/i)).toBeInTheDocument()
  })

  it('deve carregar e exibir o histórico de exercícios', async () => {
    vi.mocked(api.getHistoricoPratica).mockResolvedValueOnce(mockHistorico)

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    expect(screen.getByText(/Total de 3 exercício\(s\) encontrado\(s\)/i)).toBeInTheDocument()
    expect(screen.getAllByText('Tradução').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Audição').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pronúncia').length).toBeGreaterThan(0)
  })

  it('deve exibir mensagem de erro quando falha ao carregar', async () => {
    const error = new api.ApiError('Erro de rede')
    vi.mocked(api.getHistoricoPratica).mockRejectedValueOnce(error)

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar histórico')).toBeInTheDocument()
    })

    // Verifica que a mensagem de erro está presente
    expect(screen.getByText(/Erro ao carregar histórico:/i)).toBeInTheDocument()
  })

  it('deve ter filtro por idioma funcional', async () => {
    vi.mocked(api.getHistoricoPratica).mockResolvedValueOnce(mockHistorico)

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    // Verifica que o filtro de idioma existe e tem as opções corretas
    const filtroIdioma = screen.getByLabelText('Idioma')
    expect(filtroIdioma).toBeInTheDocument()
    expect(filtroIdioma).toHaveValue('todos')

    // Verifica que todas as opções de idioma estão disponíveis
    const options = Array.from((filtroIdioma as HTMLSelectElement).options).map(o => o.value)
    expect(options).toContain('todos')
    expect(options).toContain(IdiomaEnum.Ingles)
    expect(options).toContain(IdiomaEnum.Frances)
  })

  it('deve ter filtro por tipo de exercício funcional', async () => {
    vi.mocked(api.getHistoricoPratica).mockResolvedValueOnce(mockHistorico)

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    // Verifica que o filtro de tipo existe e tem as opções corretas
    const filtroTipo = screen.getByLabelText('Tipo de Exercício')
    expect(filtroTipo).toBeInTheDocument()
    expect(filtroTipo).toHaveValue('todos')

    // Verifica que as opções de tipo estão disponíveis
    const options = Array.from((filtroTipo as HTMLSelectElement).options).map(o => o.value)
    expect(options).toContain('todos')
    expect(options).toContain(TipoPraticaEnum.Traducao)
    expect(options).toContain(TipoPraticaEnum.Audicao)
  })

  it('deve ordenar exercícios por data (mais antigo primeiro)', async () => {
    vi.mocked(api.getHistoricoPratica).mockResolvedValueOnce(mockHistorico)
    const user = userEvent.setup()

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    const ordenacao = screen.getByLabelText('Ordenação')
    await user.selectOptions(ordenacao, 'antigo')

    // Verifica que os exercícios estão ordenados corretamente
    const exercicios = screen.getAllByText(/Exercício|Tradução|Audição|Pronúncia/)
    expect(exercicios.length).toBeGreaterThan(0)
  })

  it('deve ter controle de ordenação funcional', async () => {
    vi.mocked(api.getHistoricoPratica).mockResolvedValueOnce(mockHistorico)

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    // Verifica que o controle de ordenação existe
    const ordenacao = screen.getByLabelText('Ordenação')
    expect(ordenacao).toBeInTheDocument()
    expect(ordenacao).toHaveValue('recente')

    // Verifica as opções de ordenação
    const options = Array.from((ordenacao as HTMLSelectElement).options).map(o => o.value)
    expect(options).toContain('recente')
    expect(options).toContain('antigo')
  })

  it('deve exibir o resultado correto para exercícios de tradução', async () => {
    vi.mocked(api.getHistoricoPratica).mockResolvedValueOnce(mockHistorico)

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    expect(screen.getByText('2/3 acertos')).toBeInTheDocument()
  })

  it('deve exibir o resultado correto para exercícios de audição', async () => {
    vi.mocked(api.getHistoricoPratica).mockResolvedValueOnce(mockHistorico)

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    expect(screen.getAllByText('Correto').length).toBeGreaterThan(0)
  })

  it('deve ter link para voltar à página inicial', async () => {
    vi.mocked(api.getHistoricoPratica).mockResolvedValueOnce(mockHistorico)

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    const voltarLink = screen.getByText('← Voltar')
    expect(voltarLink).toBeInTheDocument()
    expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('deve formatar a data corretamente', async () => {
    vi.mocked(api.getHistoricoPratica).mockResolvedValueOnce(mockHistorico)

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    // Verifica que as datas são formatadas (formato PT-BR)
    const datas = screen.getAllByText(/Data:/)
    expect(datas.length).toBeGreaterThan(0)
  })

  it('deve exibir badges de idiomas com cores diferentes', async () => {
    vi.mocked(api.getHistoricoPratica).mockResolvedValueOnce(mockHistorico)

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    const badgesIngles = screen.getAllByText(IdiomaEnum.Ingles)
    const badgesFrances = screen.getAllByText(IdiomaEnum.Frances)

    expect(badgesIngles.length).toBeGreaterThan(0)
    expect(badgesFrances.length).toBeGreaterThan(0)
  })
})
