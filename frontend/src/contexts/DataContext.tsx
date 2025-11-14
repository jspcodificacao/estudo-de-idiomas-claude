import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  getHistoricoPratica,
  getPrompts,
  getBaseConhecimento,
  getFrasesDialogo,
  ApiError
} from '../services/api'
import type {
  BaseHistoricoPratica,
  BasePrompts,
  ConhecimentoIdioma,
  FrasesDialogo
} from '../types/api'

interface DataContextType {
  // Data
  historico: BaseHistoricoPratica | null
  prompts: BasePrompts | null
  baseConhecimento: ConhecimentoIdioma[] | null
  frasesDialogo: FrasesDialogo | null

  // Loading states
  loading: {
    historico: boolean
    prompts: boolean
    baseConhecimento: boolean
    frasesDialogo: boolean
  }

  // Error states
  errors: {
    historico: string | null
    prompts: string | null
    baseConhecimento: string | null
    frasesDialogo: string | null
  }

  // Refresh functions
  refreshHistorico: () => Promise<void>
  refreshPrompts: () => Promise<void>
  refreshBaseConhecimento: () => Promise<void>
  refreshFrasesDialogo: () => Promise<void>
  refreshAll: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  // Data state
  const [historico, setHistorico] = useState<BaseHistoricoPratica | null>(null)
  const [prompts, setPrompts] = useState<BasePrompts | null>(null)
  const [baseConhecimento, setBaseConhecimento] = useState<ConhecimentoIdioma[] | null>(null)
  const [frasesDialogo, setFrasesDialogo] = useState<FrasesDialogo | null>(null)

  // Loading states
  const [loading, setLoading] = useState({
    historico: true,
    prompts: true,
    baseConhecimento: true,
    frasesDialogo: true
  })

  // Error states
  const [errors, setErrors] = useState({
    historico: null as string | null,
    prompts: null as string | null,
    baseConhecimento: null as string | null,
    frasesDialogo: null as string | null
  })

  // Load historico
  const loadHistorico = async () => {
    try {
      setLoading(prev => ({ ...prev, historico: true }))
      setErrors(prev => ({ ...prev, historico: null }))
      const data = await getHistoricoPratica()
      setHistorico(data)
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? `Erro ao carregar histórico: ${err.message}`
        : 'Erro desconhecido ao carregar histórico'
      setErrors(prev => ({ ...prev, historico: errorMessage }))
    } finally {
      setLoading(prev => ({ ...prev, historico: false }))
    }
  }

  // Load prompts
  const loadPrompts = async () => {
    try {
      setLoading(prev => ({ ...prev, prompts: true }))
      setErrors(prev => ({ ...prev, prompts: null }))
      const data = await getPrompts()
      setPrompts(data)
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? `Erro ao carregar prompts: ${err.message}`
        : 'Erro desconhecido ao carregar prompts'
      setErrors(prev => ({ ...prev, prompts: errorMessage }))
    } finally {
      setLoading(prev => ({ ...prev, prompts: false }))
    }
  }

  // Load base de conhecimento
  const loadBaseConhecimento = async () => {
    try {
      setLoading(prev => ({ ...prev, baseConhecimento: true }))
      setErrors(prev => ({ ...prev, baseConhecimento: null }))
      const data = await getBaseConhecimento()
      setBaseConhecimento(data)
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? `Erro ao carregar base de conhecimento: ${err.message}`
        : 'Erro desconhecido ao carregar base de conhecimento'
      setErrors(prev => ({ ...prev, baseConhecimento: errorMessage }))
    } finally {
      setLoading(prev => ({ ...prev, baseConhecimento: false }))
    }
  }

  // Load frases do dialogo
  const loadFrasesDialogo = async () => {
    try {
      setLoading(prev => ({ ...prev, frasesDialogo: true }))
      setErrors(prev => ({ ...prev, frasesDialogo: null }))
      const data = await getFrasesDialogo()
      setFrasesDialogo(data)
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? `Erro ao carregar frases do diálogo: ${err.message}`
        : 'Erro desconhecido ao carregar frases do diálogo'
      setErrors(prev => ({ ...prev, frasesDialogo: errorMessage }))
    } finally {
      setLoading(prev => ({ ...prev, frasesDialogo: false }))
    }
  }

  // Load all data once on mount
  useEffect(() => {
    loadHistorico()
    loadPrompts()
    loadBaseConhecimento()
    loadFrasesDialogo()
  }, [])

  // Refresh functions
  const refreshAll = async () => {
    await Promise.all([
      loadHistorico(),
      loadPrompts(),
      loadBaseConhecimento(),
      loadFrasesDialogo()
    ])
  }

  const value: DataContextType = {
    historico,
    prompts,
    baseConhecimento,
    frasesDialogo,
    loading,
    errors,
    refreshHistorico: loadHistorico,
    refreshPrompts: loadPrompts,
    refreshBaseConhecimento: loadBaseConhecimento,
    refreshFrasesDialogo: loadFrasesDialogo,
    refreshAll
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
