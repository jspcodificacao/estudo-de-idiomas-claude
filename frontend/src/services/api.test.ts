import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getHistoricoPratica, ApiError } from './api'
import type { BaseHistoricoPratica } from '../types/api'
import { IdiomaEnum, TipoPraticaEnum } from '../types/api'

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
})
