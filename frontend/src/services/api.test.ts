import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getHistoricoPratica, getPrompts, getBaseConhecimento, getFrasesDialogo, ApiError } from './api'
import type { BaseHistoricoPratica, BasePrompts, ConhecimentoIdioma, FrasesDialogo } from '../types/api'
import { IdiomaEnum, TipoPraticaEnum, IdiomaConhecimentoEnum, TipoConhecimentoEnum } from '../types/api'

// Mock do fetch global
global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getHistoricoPratica', () => {
    it('deve buscar o histórico de prática com sucesso', async () => {
      const mockData: BaseHistoricoPratica = {
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
              campos_resultados: [true]
            }
          }
        ]
      }

      const mockResponse = {
        ok: true,
        json: async () => mockData
      }

      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await getHistoricoPratica()

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3010/api/historico_de_pratica')
      expect(result).toEqual(mockData)
      expect(result.exercicios).toHaveLength(1)
      expect(result.exercicios[0].idioma).toBe(IdiomaEnum.Ingles)
    })

    it('deve lançar ApiError quando a resposta não é ok', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      }

      ;(global.fetch as any).mockResolvedValue(mockResponse)

      await expect(getHistoricoPratica()).rejects.toThrow(ApiError)
      await expect(getHistoricoPratica()).rejects.toThrow('Erro ao buscar dados: Not Found')
    })

    it('deve lançar ApiError quando ocorre erro de rede', async () => {
      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      await expect(getHistoricoPratica()).rejects.toThrow(ApiError)
      await expect(getHistoricoPratica()).rejects.toThrow('Network error')
    })

    it('deve lançar ApiError quando ocorre erro desconhecido', async () => {
      ;(global.fetch as any).mockRejectedValue('Unknown error')

      await expect(getHistoricoPratica()).rejects.toThrow(ApiError)
      await expect(getHistoricoPratica()).rejects.toThrow('Erro desconhecido ao buscar dados')
    })
  })

  describe('ApiError', () => {
    it('deve criar uma instância de ApiError com todas as propriedades', () => {
      const error = new ApiError('Test error', 500, 'Internal Server Error')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ApiError)
      expect(error.name).toBe('ApiError')
      expect(error.message).toBe('Test error')
      expect(error.status).toBe(500)
      expect(error.statusText).toBe('Internal Server Error')
    })

    it('deve criar uma instância de ApiError sem status', () => {
      const error = new ApiError('Test error')

      expect(error.message).toBe('Test error')
      expect(error.status).toBeUndefined()
      expect(error.statusText).toBeUndefined()
    })
  })

  describe('getPrompts', () => {
    it('deve buscar os prompts com sucesso', async () => {
      const mockData: BasePrompts = {
        descricao: 'Test prompts collection',
        data_atualizacao: '2025-11-14T00:00:00Z',
        marcador_de_paramentros: '{{param}}',
        prompts: [
          {
            prompt_id: 'test_prompt_1',
            descricao: 'Test prompt description',
            template: 'Test template with {{param}}',
            parametros: ['param'],
            resposta_estruturada: true,
            estrutura_esperada: { type: 'object' },
            ultima_edicao: '2025-11-14T00:00:00Z'
          }
        ]
      }

      const mockResponse = {
        ok: true,
        json: async () => mockData
      }

      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await getPrompts()

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3010/api/prompts')
      expect(result).toEqual(mockData)
      expect(result.prompts).toHaveLength(1)
      expect(result.prompts[0].prompt_id).toBe('test_prompt_1')
    })

    it('deve lançar ApiError quando a resposta não é ok', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      }

      ;(global.fetch as any).mockResolvedValue(mockResponse)

      await expect(getPrompts()).rejects.toThrow(ApiError)
      await expect(getPrompts()).rejects.toThrow('Erro ao buscar dados: Not Found')
    })

    it('deve lançar ApiError quando ocorre erro de rede', async () => {
      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      await expect(getPrompts()).rejects.toThrow(ApiError)
      await expect(getPrompts()).rejects.toThrow('Network error')
    })
  })

  describe('getBaseConhecimento', () => {
    it('deve buscar a base de conhecimento com sucesso', async () => {
      const mockData: ConhecimentoIdioma[] = [
        {
          conhecimento_id: '40986742-86a6-4bc6-bae3-41e34ce5298d',
          data_hora: '2025-10-05T14:35:06.829Z',
          idioma: IdiomaConhecimentoEnum.Alemao,
          tipo_conhecimento: TipoConhecimentoEnum.Frase,
          texto_original: 'Hallo!',
          transcricao_ipa: 'haˈloː',
          traducao: 'Olá!',
          divisao_silabica: 'Hal-lo'
        }
      ]

      const mockResponse = {
        ok: true,
        json: async () => mockData
      }

      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await getBaseConhecimento()

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3010/api/base_de_conhecimento')
      expect(result).toEqual(mockData)
      expect(result).toHaveLength(1)
      expect(result[0].conhecimento_id).toBe('40986742-86a6-4bc6-bae3-41e34ce5298d')
      expect(result[0].idioma).toBe(IdiomaConhecimentoEnum.Alemao)
    })

    it('deve lançar ApiError quando a resposta não é ok', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      }

      ;(global.fetch as any).mockResolvedValue(mockResponse)

      await expect(getBaseConhecimento()).rejects.toThrow(ApiError)
      await expect(getBaseConhecimento()).rejects.toThrow('Erro ao buscar dados: Not Found')
    })

    it('deve lançar ApiError quando ocorre erro de rede', async () => {
      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      await expect(getBaseConhecimento()).rejects.toThrow(ApiError)
      await expect(getBaseConhecimento()).rejects.toThrow('Network error')
    })
  })

  describe('getFrasesDialogo', () => {
    it('deve buscar as frases do diálogo com sucesso', async () => {
      const mockData: FrasesDialogo = {
        saudacao: 'Hallo',
        despedida: 'Tschüss',
        intermediarias: [
          'Wie heißen Sie?',
          'Wie groß sind Sie?'
        ]
      }

      const mockResponse = {
        ok: true,
        json: async () => mockData
      }

      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await getFrasesDialogo()

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3010/api/frases_do_dialogo')
      expect(result).toEqual(mockData)
      expect(result.saudacao).toBe('Hallo')
      expect(result.despedida).toBe('Tschüss')
      expect(result.intermediarias).toHaveLength(2)
    })

    it('deve lançar ApiError quando a resposta não é ok', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      }

      ;(global.fetch as any).mockResolvedValue(mockResponse)

      await expect(getFrasesDialogo()).rejects.toThrow(ApiError)
      await expect(getFrasesDialogo()).rejects.toThrow('Erro ao buscar dados: Not Found')
    })

    it('deve lançar ApiError quando ocorre erro de rede', async () => {
      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      await expect(getFrasesDialogo()).rejects.toThrow(ApiError)
      await expect(getFrasesDialogo()).rejects.toThrow('Network error')
    })
  })
})
