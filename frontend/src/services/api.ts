import type { BaseHistoricoPratica, BasePrompts, ConhecimentoIdioma, FrasesDialogo, Exercicio } from '../types/api'

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

export async function getPrompts(): Promise<BasePrompts> {
  return fetchApi<BasePrompts>('/api/prompts')
}

export async function getBaseConhecimento(): Promise<ConhecimentoIdioma[]> {
  return fetchApi<ConhecimentoIdioma[]>('/api/base_de_conhecimento')
}

export async function getFrasesDialogo(): Promise<FrasesDialogo> {
  return fetchApi<FrasesDialogo>('/api/frases_do_dialogo')
}

export async function postExercicio(exercicio: Exercicio): Promise<BaseHistoricoPratica> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/historico_de_pratica`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exercicio),
    })

    if (!response.ok) {
      throw new ApiError(
        `Erro ao salvar exercício: ${response.statusText}`,
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
      error instanceof Error ? error.message : 'Erro desconhecido ao salvar exercício'
    )
  }
}

export async function updatePrompts(prompts: BasePrompts): Promise<BasePrompts> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/prompts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompts),
    })

    if (!response.ok) {
      throw new ApiError(
        `Erro ao salvar prompts: ${response.statusText}`,
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
      error instanceof Error ? error.message : 'Erro desconhecido ao salvar prompts'
    )
  }
}

export interface GenerateAudioRequest {
  text: string
  voice?: string
  speed?: number
}

export interface GenerateAudioResponse {
  audio: string  // O serviço retorna "audio" não "audioBase64"
  mimeType: string
  metadata?: {
    speed: number
    length_scale: number
  }
}

export async function generateAudio(request: GenerateAudioRequest): Promise<GenerateAudioResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new ApiError(
        `Erro ao gerar áudio: ${response.statusText}`,
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
      error instanceof Error ? error.message : 'Erro desconhecido ao gerar áudio'
    )
  }
}

export interface OllamaMessage {
  role: string
  content: string
}

export interface OllamaChatRequest {
  model?: string
  messages: OllamaMessage[]
  stream?: boolean
}

export interface OllamaChatResponse {
  model: string
  created_at: string
  message: {
    role: string
    content: string
  }
  done: boolean
}

export async function chatWithOllama(request: OllamaChatRequest): Promise<OllamaChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,  // Se undefined, backend usa MODELO_OLLAMA do .env
        messages: request.messages,
        stream: request.stream || false,
      }),
    })

    if (!response.ok) {
      throw new ApiError(
        `Erro ao consultar LLM: ${response.statusText}`,
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
      error instanceof Error ? error.message : 'Erro desconhecido ao consultar LLM'
    )
  }
}

export interface TranscribeAudioResponse {
  text: string
  language: string
  segments?: Array<{
    text: string
    start: number
    end: number
  }>
}

export async function transcribeAudio(audioFile: Blob): Promise<TranscribeAudioResponse> {
  try {
    const formData = new FormData()
    formData.append('file', audioFile, 'audio.wav')

    const response = await fetch(`${API_BASE_URL}/api/transcrever-audio`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new ApiError(
        `Erro ao transcrever áudio: ${response.statusText}`,
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
      error instanceof Error ? error.message : 'Erro desconhecido ao transcrever áudio'
    )
  }
}
