import type { BaseHistoricoPratica } from '../types/api'

const API_BASE_URL = `http://localhost:${import.meta.env.VITE_BACKEND_PORT || 3010}`

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)

    if (!response.ok) {
      throw new ApiError(
        `Erro ao buscar dados: ${response.statusText}`,
        response.status,
        response.statusText
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Erro desconhecido ao buscar dados'
    )
  }
}

export async function getHistoricoPratica(): Promise<BaseHistoricoPratica> {
  return fetchApi<BaseHistoricoPratica>('/api/historico_de_pratica')
}
