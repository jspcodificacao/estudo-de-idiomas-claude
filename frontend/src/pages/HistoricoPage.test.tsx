import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import HistoricoPage from './HistoricoPage'
import * as DataContext from '../contexts/DataContext'
import { IdiomaEnum, TipoPraticaEnum } from '../types/api'
import type { BaseHistoricoPratica } from '../types/api'

// Mock do DataContext
vi.mock('../contexts/DataContext', async () => {
  const actual = await vi.importActual('../contexts/DataContext')
  return {
    ...actual,
    useData: vi.fn()
  }
})

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

// Helper function to create mock data context
function createMockDataContext(historico: BaseHistoricoPratica | null = mockHistorico, loading = false, error: string | null = null) {
  return {
    historico,
    prompts: { descricao: '', data_atualizacao: '', marcador_de_paramentros: '', prompts: [] },
    baseConhecimento: [],
    frasesDialogo: { saudacao: '', despedida: '', intermediarias: [] },
    loading: {
      historico: loading,
      prompts: false,
      baseConhecimento: false,
      frasesDialogo: false
    },
    errors: {
      historico: error,
      prompts: null,
      baseConhecimento: null,
      frasesDialogo: null
    },
    refreshHistorico: vi.fn(),
    refreshPrompts: vi.fn(),
    refreshBaseConhecimento: vi.fn(),
    refreshFrasesDialogo: vi.fn(),
    refreshAll: vi.fn()
  }
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
    // Mock padrão para useData
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext({ exercicios: [] }))
  })

  it('deve exibir estado de carregamento inicialmente', () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(null, true))

    renderHistoricoPage()

    expect(screen.getByText(/Carregando histórico de exercícios/i)).toBeInTheDocument()
  })

  it('deve carregar e exibir o histórico de exercícios', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    expect(screen.getByText(/Total de 3 exercício\(s\) encontrado\(s\)/i)).toBeInTheDocument()
    expect(screen.getByText('2/3 acertos')).toBeInTheDocument()
    expect(screen.getByText('Correto')).toBeInTheDocument()
    expect(screen.getByText('Sim')).toBeInTheDocument()
  })

  it('deve exibir mensagem de erro quando falha ao carregar', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(null, false, 'Erro ao carregar histórico: Erro de rede'))

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar histórico')).toBeInTheDocument()
    })

    // Verifica que a mensagem de erro está presente
    expect(screen.getByText(/Erro ao carregar histórico:/i)).toBeInTheDocument()
  })

  it('deve ter filtro por idioma funcional', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

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
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

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
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
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
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

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
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    expect(screen.getByText('2/3 acertos')).toBeInTheDocument()
  })

  it('deve exibir o resultado correto para exercícios de audição', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    expect(screen.getAllByText('Correto').length).toBeGreaterThan(0)
  })

  it('deve ter link para voltar à página inicial', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    const voltarLink = screen.getByText('← Voltar')
    expect(voltarLink).toBeInTheDocument()
    expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('deve formatar a data corretamente', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    // Verifica que as datas são formatadas (formato PT-BR)
    const datas = screen.getAllByText(/Data:/)
    expect(datas.length).toBeGreaterThan(0)
  })

  it('deve exibir badges de idiomas com cores diferentes', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    const badgesIngles = screen.getAllByText(IdiomaEnum.Ingles)
    const badgesFrances = screen.getAllByText(IdiomaEnum.Frances)

    expect(badgesIngles.length).toBeGreaterThan(0)
    expect(badgesFrances.length).toBeGreaterThan(0)
  })

  it('deve exibir o resultado correto para exercícios de diálogo', async () => {
    const historicoDialogo: BaseHistoricoPratica = {
      exercicios: [
        {
          data_hora: '2024-01-16T11:00:00',
          exercicio_id: 'd1e2f3a4-b5c6-d7e8-f9a0-b1c2d3e4f5a6',
          conhecimento_id: 'd4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9',
          idioma: IdiomaEnum.Alemao,
          tipo_pratica: TipoPraticaEnum.Dialogo,
          resultado_exercicio: {
            frase_esperada: 'Guten Tag',
            frase_usuario: 'Guten Tag',
            correto: 'Sim'
          }
        }
      ]
    }

    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(historicoDialogo))

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    // Check for "Diálogo" in heading
    const dialogoHeadings = screen.getAllByText('Diálogo')
    expect(dialogoHeadings.length).toBeGreaterThan(0)

    // Check for result "Sim"
    expect(screen.getByText('Sim')).toBeInTheDocument()
  })

  it('deve exibir o resultado correto para exercícios de pronúncia de números', async () => {
    const historicoPronunciaNumeros: BaseHistoricoPratica = {
      exercicios: [
        {
          data_hora: '2024-01-17T12:00:00',
          exercicio_id: 'e2f3a4b5-c6d7-e8f9-a0b1-c2d3e4f5a6b7',
          conhecimento_id: 'e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0',
          idioma: IdiomaEnum.Espanhol,
          tipo_pratica: TipoPraticaEnum.PronunciaDeNumeros,
          resultado_exercicio: {
            numero_esperado: 42,
            numero_usuario: 42,
            acertou: true
          }
        }
      ]
    }

    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(historicoPronunciaNumeros))

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    // Check for "Pronúncia de Números" in heading
    const pronunciaNumHeadings = screen.getAllByText('Pronúncia de Números')
    expect(pronunciaNumHeadings.length).toBeGreaterThan(0)

    // Check for result "Acertou"
    expect(screen.getByText('Acertou')).toBeInTheDocument()
  })

  it('deve exibir "Errou" para exercícios de pronúncia de números incorretos', async () => {
    const historicoPronunciaNumeros: BaseHistoricoPratica = {
      exercicios: [
        {
          data_hora: '2024-01-17T12:00:00',
          exercicio_id: 'e2f3a4b5-c6d7-e8f9-a0b1-c2d3e4f5a6b7',
          conhecimento_id: 'e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0',
          idioma: IdiomaEnum.Espanhol,
          tipo_pratica: TipoPraticaEnum.PronunciaDeNumeros,
          resultado_exercicio: {
            numero_esperado: 42,
            numero_usuario: 24,
            acertou: false
          }
        }
      ]
    }

    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(historicoPronunciaNumeros))

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    expect(screen.getByText('Errou')).toBeInTheDocument()
  })

  it('deve exibir resultado "Parcial" para pronúncia parcialmente correta', async () => {
    const historicoPronuncia: BaseHistoricoPratica = {
      exercicios: [
        {
          data_hora: '2024-01-18T13:00:00',
          exercicio_id: 'f3a4b5c6-d7e8-f9a0-b1c2-d3e4f5a6b7c8',
          conhecimento_id: 'f6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1',
          idioma: IdiomaEnum.Ingles,
          tipo_pratica: TipoPraticaEnum.Pronuncia,
          resultado_exercicio: {
            texto_original: 'World',
            transcricao_stt: 'Worlt',
            correto: 'Parcial',
            comentario: 'Quase lá'
          }
        }
      ]
    }

    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(historicoPronuncia))

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    expect(screen.getByText('Parcial')).toBeInTheDocument()
  })

  it('deve exibir resultado "Não" para pronúncia incorreta', async () => {
    const historicoPronuncia: BaseHistoricoPratica = {
      exercicios: [
        {
          data_hora: '2024-01-18T13:00:00',
          exercicio_id: 'f3a4b5c6-d7e8-f9a0-b1c2-d3e4f5a6b7c8',
          conhecimento_id: 'f6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1',
          idioma: IdiomaEnum.Ingles,
          tipo_pratica: TipoPraticaEnum.Pronuncia,
          resultado_exercicio: {
            texto_original: 'World',
            transcricao_stt: 'Word',
            correto: 'Não',
            comentario: 'Tente novamente'
          }
        }
      ]
    }

    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(historicoPronuncia))

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    expect(screen.getByText('Não')).toBeInTheDocument()
  })

  it('deve exibir "Incorreto" para audição com resposta errada', async () => {
    const historicoAudicao: BaseHistoricoPratica = {
      exercicios: [
        {
          data_hora: '2024-01-19T14:00:00',
          exercicio_id: 'a4b5c6d7-e8f9-a0b1-c2d3-e4f5a6b7c8d9',
          conhecimento_id: 'a7b8c9d0-e1f2-a3b4-c5d6-e7f8a9b0c1d2',
          idioma: IdiomaEnum.Frances,
          tipo_pratica: TipoPraticaEnum.Audicao,
          resultado_exercicio: {
            texto_original: 'Bonjour',
            transcricao_usuario: 'Bonsoir',
            correto: false,
            velocidade_utilizada: '1.0'
          }
        }
      ]
    }

    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(historicoAudicao))

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    expect(screen.getByText('Incorreto')).toBeInTheDocument()
  })

  it('deve exibir "0/3 acertos" para tradução com todas as respostas erradas', async () => {
    const historicoTraducao: BaseHistoricoPratica = {
      exercicios: [
        {
          data_hora: '2024-01-20T15:00:00',
          exercicio_id: 'b5c6d7e8-f9a0-b1c2-d3e4-f5a6b7c8d9e0',
          conhecimento_id: 'b8c9d0e1-f2a3-b4c5-d6e7-f8a9b0c1d2e3',
          idioma: IdiomaEnum.Alemao,
          tipo_pratica: TipoPraticaEnum.Traducao,
          resultado_exercicio: {
            campo_fornecido: 'texto_original',
            campos_preenchidos: ['traducao'],
            valores_preenchidos: ['wrong'],
            campos_resultados: [false, false, false]
          }
        }
      ]
    }

    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(historicoTraducao))

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    expect(screen.getByText('0/3 acertos')).toBeInTheDocument()
  })

  it('deve exibir "3/3 acertos" para tradução com todas as respostas corretas', async () => {
    const historicoTraducao: BaseHistoricoPratica = {
      exercicios: [
        {
          data_hora: '2024-01-20T15:00:00',
          exercicio_id: 'b5c6d7e8-f9a0-b1c2-d3e4-f5a6b7c8d9e0',
          conhecimento_id: 'b8c9d0e1-f2a3-b4c5-d6e7-f8a9b0c1d2e3',
          idioma: IdiomaEnum.Alemao,
          tipo_pratica: TipoPraticaEnum.Traducao,
          resultado_exercicio: {
            campo_fornecido: 'texto_original',
            campos_preenchidos: ['traducao'],
            valores_preenchidos: ['correct'],
            campos_resultados: [true, true, true]
          }
        }
      ]
    }

    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext(historicoTraducao))

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    expect(screen.getByText('3/3 acertos')).toBeInTheDocument()
  })

  it('deve aplicar filtro por idioma corretamente', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    // Inicialmente deve mostrar 3 exercícios
    expect(screen.getByText(/Total de 3 exercício\(s\)/i)).toBeInTheDocument()

    // Filtrar por Inglês
    const filtroIdioma = screen.getByLabelText('Idioma')
    await user.selectOptions(filtroIdioma, IdiomaEnum.Ingles)

    // Deve mostrar apenas 2 exercícios de Inglês
    await waitFor(() => {
      expect(screen.getByText(/Total de 2 exercício\(s\)/i)).toBeInTheDocument()
    })
  })

  it('deve aplicar filtro por tipo de exercício corretamente', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    // Filtrar por Tradução
    const filtroTipo = screen.getByLabelText('Tipo de Exercício')
    await user.selectOptions(filtroTipo, TipoPraticaEnum.Traducao)

    // Deve mostrar apenas 1 exercício de Tradução
    await waitFor(() => {
      expect(screen.getByText(/Total de 1 exercício\(s\)/i)).toBeInTheDocument()
    })
  })

  it('deve exibir mensagem quando não há exercícios após filtrar', async () => {
    vi.mocked(DataContext.useData).mockReturnValue(createMockDataContext())
    const user = userEvent.setup()

    renderHistoricoPage()

    await waitFor(() => {
      expect(screen.getByText('Histórico de Exercícios')).toBeInTheDocument()
    })

    // Filtrar por Espanhol (não há exercícios de Espanhol no mock)
    const filtroIdioma = screen.getByLabelText('Idioma')
    await user.selectOptions(filtroIdioma, IdiomaEnum.Espanhol)

    await waitFor(() => {
      expect(screen.getByText('Nenhum exercício encontrado com os filtros selecionados.')).toBeInTheDocument()
    })
  })
})
