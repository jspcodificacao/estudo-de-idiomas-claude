import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import type { ConhecimentoIdioma, IdiomaConhecimentoEnum, TipoConhecimentoEnum } from '../../types/api'

export default function PraticaTraducao() {
  const navigate = useNavigate()
  const { baseConhecimento, historico, loading, errors } = useData()

  // Selectors state
  const [selectedIdioma, setSelectedIdioma] = useState<IdiomaConhecimentoEnum | ''>('')
  const [selectedTipo, setSelectedTipo] = useState<TipoConhecimentoEnum | ''>('')

  // Form fields state
  const [textoOriginal, setTextoOriginal] = useState('')
  const [transcricaoIpa, setTranscricaoIpa] = useState('')
  const [traducao, setTraducao] = useState('')
  const [divisaoSilabica, setDivisaoSilabica] = useState('')

  // Current exercise state
  const [currentExercise, setCurrentExercise] = useState<ConhecimentoIdioma | null>(null)

  // Extract unique languages from knowledge base
  const availableLanguages = useMemo(() => {
    if (!baseConhecimento) return []
    const uniqueLanguages = new Set(baseConhecimento.map(item => item.idioma))
    return Array.from(uniqueLanguages).sort()
  }, [baseConhecimento])

  // Extract unique knowledge types from knowledge base
  const availableTypes = useMemo(() => {
    if (!baseConhecimento) return []
    const uniqueTypes = new Set(baseConhecimento.map(item => item.tipo_conhecimento))
    return Array.from(uniqueTypes).sort()
  }, [baseConhecimento])

  // Set default values when data loads
  useEffect(() => {
    if (availableLanguages.length > 0 && !selectedIdioma) {
      setSelectedIdioma(availableLanguages[0])
    }
    if (availableTypes.length > 0 && !selectedTipo) {
      setSelectedTipo(availableTypes[0])
    }
  }, [availableLanguages, availableTypes, selectedIdioma, selectedTipo])

  // Handle exit button
  const handleExit = () => {
    navigate('/')
  }

  // Handle verify button
  const handleVerify = () => {
    // TODO: Implement verification logic
    console.log('Verificando respostas...', {
      textoOriginal,
      transcricaoIpa,
      traducao,
      divisaoSilabica
    })
  }

  // Loading state
  if (loading.baseConhecimento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando base de conhecimento...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (errors.baseConhecimento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700 mb-4">{errors.baseConhecimento}</p>
              <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                ← Voltar para Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty knowledge base
  if (!baseConhecimento || baseConhecimento.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <p className="text-gray-700 mb-4">Nenhum conhecimento disponível na base de dados.</p>
              <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                ← Voltar para Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Voltar
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Prática de Tradução
            </h1>
            <p className="text-gray-600">
              Preencha os campos com as informações correspondentes
            </p>
          </div>

          {/* Language Label */}
          {selectedIdioma && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
              <span className="text-sm font-medium text-indigo-700 uppercase tracking-wide">
                Idioma Atual:
              </span>
              <span className="ml-3 text-lg font-semibold text-indigo-900 capitalize">
                {selectedIdioma}
              </span>
            </div>
          )}

          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Language Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Idioma
              </label>
              <select
                value={selectedIdioma}
                onChange={(e) => setSelectedIdioma(e.target.value as IdiomaConhecimentoEnum)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Selecione um idioma</option>
                {availableLanguages.map((idioma) => (
                  <option key={idioma} value={idioma} className="capitalize">
                    {idioma}
                  </option>
                ))}
              </select>
            </div>

            {/* Knowledge Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Conhecimento
              </label>
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value as TipoConhecimentoEnum)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Selecione um tipo</option>
                {availableTypes.map((tipo) => (
                  <option key={tipo} value={tipo} className="capitalize">
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Fields */}
          <form className="space-y-6">
            {/* Texto Original */}
            <div>
              <label htmlFor="texto-original" className="block text-sm font-medium text-gray-700 mb-2">
                Texto Original
              </label>
              <input
                type="text"
                id="texto-original"
                value={textoOriginal}
                onChange={(e) => setTextoOriginal(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Digite o texto no idioma original"
              />
            </div>

            {/* Transcrição IPA */}
            <div>
              <label htmlFor="transcricao-ipa" className="block text-sm font-medium text-gray-700 mb-2">
                Transcrição IPA
              </label>
              <input
                type="text"
                id="transcricao-ipa"
                value={transcricaoIpa}
                onChange={(e) => setTranscricaoIpa(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Digite a transcrição fonética (IPA)"
              />
            </div>

            {/* Tradução */}
            <div>
              <label htmlFor="traducao" className="block text-sm font-medium text-gray-700 mb-2">
                Tradução
              </label>
              <input
                type="text"
                id="traducao"
                value={traducao}
                onChange={(e) => setTraducao(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Digite a tradução"
              />
            </div>

            {/* Divisão Silábica */}
            <div>
              <label htmlFor="divisao-silabica" className="block text-sm font-medium text-gray-700 mb-2">
                Divisão Silábica
              </label>
              <input
                type="text"
                id="divisao-silabica"
                value={divisaoSilabica}
                onChange={(e) => setDivisaoSilabica(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Digite a divisão silábica"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleExit}
                className="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Sair
              </button>
              <button
                type="button"
                onClick={handleVerify}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Verificar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
