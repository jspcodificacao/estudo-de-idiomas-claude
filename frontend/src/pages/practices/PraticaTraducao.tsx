import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { postExercicio } from '../../services/api'
import VirtualKeyboard from '../../components/VirtualKeyboard'
import type {
  ConhecimentoIdioma,
  IdiomaConhecimentoEnum,
  TipoConhecimentoEnum,
  CampoEnum,
  ResultadoTraducao,
  Exercicio
} from '../../types/api'

type FieldKey = 'texto_original' | 'transcricao_ipa' | 'traducao' | 'divisao_silabica'

interface FieldResult {
  field: FieldKey
  userValue: string
  correctValue: string
  isCorrect: boolean
}

export default function PraticaTraducao() {
  const navigate = useNavigate()
  const { baseConhecimento, loading, errors } = useData()

  // Selectors state
  const [selectedIdioma, setSelectedIdioma] = useState<IdiomaConhecimentoEnum | ''>('')
  const [selectedTipo, setSelectedTipo] = useState<TipoConhecimentoEnum | 'todos'>('todos')

  // Exercise state
  const [currentExercise, setCurrentExercise] = useState<ConhecimentoIdioma | null>(null)
  const [providedField, setProvidedField] = useState<FieldKey | null>(null)
  const [practicedRecords, setPracticedRecords] = useState<Set<string>>(new Set())

  // Form fields state
  const [textoOriginal, setTextoOriginal] = useState('')
  const [transcricaoIpa, setTranscricaoIpa] = useState('')
  const [traducao, setTraducao] = useState('')
  const [divisaoSilabica, setDivisaoSilabica] = useState('')

  // Result state
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState<FieldResult[]>([])
  const [saving, setSaving] = useState(false)

  // Completion state
  const [allPracticed, setAllPracticed] = useState(false)

  // Virtual keyboard state
  const [focusedField, setFocusedField] = useState<FieldKey | null>(null)
  const textoOriginalRef = useRef<HTMLInputElement>(null)
  const transcricaoIpaRef = useRef<HTMLInputElement>(null)
  const traducaoRef = useRef<HTMLInputElement>(null)
  const divisaoSilabicaRef = useRef<HTMLInputElement>(null)

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
  }, [availableLanguages, selectedIdioma])

  // Filter records based on selected language and type
  const filteredRecords = useMemo(() => {
    if (!baseConhecimento || !selectedIdioma) return []

    return baseConhecimento.filter(record => {
      const matchesLanguage = record.idioma === selectedIdioma
      const matchesType = selectedTipo === 'todos' || record.tipo_conhecimento === selectedTipo
      return matchesLanguage && matchesType
    })
  }, [baseConhecimento, selectedIdioma, selectedTipo])

  // Get unpracticed records
  const unpracticedRecords = useMemo(() => {
    return filteredRecords.filter(record => !practicedRecords.has(record.conhecimento_id))
  }, [filteredRecords, practicedRecords])

  // Select random field
  const selectRandomField = (): FieldKey => {
    const fields: FieldKey[] = ['texto_original', 'transcricao_ipa', 'traducao', 'divisao_silabica']
    const randomIndex = Math.floor(Math.random() * fields.length)
    return fields[randomIndex]
  }

  // Start new exercise
  const startNewExercise = () => {
    if (unpracticedRecords.length === 0) {
      setAllPracticed(true)
      return
    }

    // Select random record from unpracticed
    const randomIndex = Math.floor(Math.random() * unpracticedRecords.length)
    const selectedRecord = unpracticedRecords[randomIndex]

    // Select random field
    const selectedField = selectRandomField()

    // Set current exercise
    setCurrentExercise(selectedRecord)
    setProvidedField(selectedField)

    // Clear form fields
    setTextoOriginal('')
    setTranscricaoIpa('')
    setTraducao('')
    setDivisaoSilabica('')

    // Clear results
    setShowResult(false)
    setResults([])
    setAllPracticed(false)
  }

  // Reset practiced records when type changes
  useEffect(() => {
    setPracticedRecords(new Set())
    setCurrentExercise(null)
    setShowResult(false)
    setAllPracticed(false)
  }, [selectedTipo, selectedIdioma])

  // Initial exercise when component mounts or filters change
  useEffect(() => {
    if (filteredRecords.length > 0 && !currentExercise && !showResult && !allPracticed) {
      startNewExercise()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredRecords.length, currentExercise, showResult, allPracticed])

  // Handle exit button
  const handleExit = () => {
    navigate('/')
  }

  // Map field keys to CampoEnum
  const fieldKeyToCampoEnum = (key: FieldKey): CampoEnum => {
    const mapping: Record<FieldKey, CampoEnum> = {
      'texto_original': 'texto_original' as CampoEnum,
      'transcricao_ipa': 'transcricao_ipa' as CampoEnum,
      'traducao': 'traducao' as CampoEnum,
      'divisao_silabica': 'divisao_silabica' as CampoEnum,
    }
    return mapping[key]
  }

  // Handle verify button
  const handleVerify = async () => {
    if (!currentExercise || !providedField) return

    // Collect user inputs
    const userInputs: Record<FieldKey, string> = {
      texto_original: textoOriginal,
      transcricao_ipa: transcricaoIpa,
      traducao: traducao,
      divisao_silabica: divisaoSilabica,
    }

    // Get fields that user filled (excluding the provided field)
    const filledFields: FieldKey[] = (Object.keys(userInputs) as FieldKey[]).filter(
      key => key !== providedField && userInputs[key].trim() !== ''
    )

    // Verify each filled field
    const fieldResults: FieldResult[] = filledFields.map(field => {
      const userValue = userInputs[field].trim()
      const correctValue = (currentExercise[field] as string) || ''
      const isCorrect = userValue.toLowerCase() === correctValue.toLowerCase()

      return {
        field,
        userValue,
        correctValue,
        isCorrect,
      }
    })

    setResults(fieldResults)
    setShowResult(true)

    // Mark record as practiced
    setPracticedRecords(prev => new Set([...prev, currentExercise.conhecimento_id]))

    // Save exercise to backend
    setSaving(true)
    try {
      const exercicio: Exercicio = {
        data_hora: new Date().toISOString(),
        exercicio_id: crypto.randomUUID(),
        conhecimento_id: currentExercise.conhecimento_id,
        idioma: currentExercise.idioma as any,
        tipo_pratica: 'traducao' as any,
        resultado_exercicio: {
          campo_fornecido: fieldKeyToCampoEnum(providedField),
          campos_preenchidos: filledFields.map(f => fieldKeyToCampoEnum(f)),
          valores_preenchidos: filledFields.map(f => userInputs[f].trim()),
          campos_resultados: fieldResults.map(r => r.isCorrect),
        } as ResultadoTraducao,
      }

      await postExercicio(exercicio)
    } catch (error) {
      console.error('Erro ao salvar exercício:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle next exercise
  const handleNext = () => {
    startNewExercise()
  }

  // Get field label in Portuguese
  const getFieldLabel = (field: FieldKey): string => {
    const labels: Record<FieldKey, string> = {
      texto_original: 'Texto Original',
      transcricao_ipa: 'Transcrição IPA',
      traducao: 'Tradução',
      divisao_silabica: 'Divisão Silábica',
    }
    return labels[field]
  }

  // Handle virtual keyboard key press
  const handleKeyPress = (character: string) => {
    if (!focusedField) return

    // Get current value and cursor position from the focused field
    const fieldRef = {
      texto_original: textoOriginalRef,
      transcricao_ipa: transcricaoIpaRef,
      traducao: traducaoRef,
      divisao_silabica: divisaoSilabicaRef,
    }[focusedField]

    const currentRef = fieldRef?.current
    if (!currentRef) return

    const cursorPos = currentRef.selectionStart || 0
    const currentValue = currentRef.value

    // Special character combination rules
    const subscriptArch = '\u032F' // ̯
    const syllabicityMark = '\u0329' // ̩
    const topTieBar = '\u0361' // ͡

    const ipaVowels = ['ə', 'ɪ', 'ɛ', 'ʏ', 'ɐ', 'ʊ', 'ɔ']
    const ipaConsonants = ['m', 'n', 'ŋ', 'l', 'r', 'ɹ']

    let newValue = currentValue
    let newCursorPos = cursorPos

    // Rule for Subscript arch (̯) - applies to IPA vowels
    if (character === subscriptArch) {
      const charBeforeCursor = currentValue.charAt(cursorPos - 1)
      if (ipaVowels.includes(charBeforeCursor)) {
        // Combine with previous vowel
        newValue = currentValue.slice(0, cursorPos) + character + currentValue.slice(cursorPos)
        newCursorPos = cursorPos + character.length
      }
    }
    // Rule for Syllabicity mark (̩) - applies to consonants
    else if (character === syllabicityMark) {
      const charBeforeCursor = currentValue.charAt(cursorPos - 1)
      if (ipaConsonants.includes(charBeforeCursor)) {
        // Combine with previous consonant
        newValue = currentValue.slice(0, cursorPos) + character + currentValue.slice(cursorPos)
        newCursorPos = cursorPos + character.length
      }
    }
    // Rule for Top tie bar (͡) - applies to two consecutive consonants
    else if (character === topTieBar) {
      if (cursorPos >= 2) {
        // Insert between the two consonants before cursor
        newValue = currentValue.slice(0, cursorPos - 1) + character + currentValue.slice(cursorPos - 1)
        newCursorPos = cursorPos + character.length
      }
    }
    // Regular character insertion
    else {
      newValue = currentValue.slice(0, cursorPos) + character + currentValue.slice(cursorPos)
      newCursorPos = cursorPos + character.length
    }

    // Update the field state
    switch (focusedField) {
      case 'texto_original':
        setTextoOriginal(newValue)
        break
      case 'transcricao_ipa':
        setTranscricaoIpa(newValue)
        break
      case 'traducao':
        setTraducao(newValue)
        break
      case 'divisao_silabica':
        setDivisaoSilabica(newValue)
        break
    }

    // Set cursor position after React updates
    setTimeout(() => {
      if (currentRef) {
        currentRef.setSelectionRange(newCursorPos, newCursorPos)
        currentRef.focus()
      }
    }, 0)
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

  // All practiced - completion message
  if (allPracticed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-green-600 mb-4">
                <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Parabéns!</h2>
              <p className="text-lg text-gray-700 mb-6">
                Você já praticou todos os registros disponíveis para{' '}
                <span className="font-semibold capitalize">
                  {selectedTipo === 'todos' ? 'todos os tipos' : selectedTipo}
                </span>
                {' '}em <span className="font-semibold capitalize">{selectedIdioma}</span>.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setPracticedRecords(new Set())
                    setAllPracticed(false)
                    setCurrentExercise(null)
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Recomeçar
                </button>
                <button
                  onClick={handleExit}
                  className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Voltar para Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Result screen
  if (showResult && currentExercise) {
    const correctCount = results.filter(r => r.isCorrect).length
    const totalCount = results.length

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
              ← Voltar
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
              Resultado do Exercício
            </h1>

            {/* Score */}
            <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg text-center">
              <p className="text-lg text-gray-700 mb-2">Você acertou:</p>
              <p className="text-5xl font-bold text-indigo-600">
                {correctCount} / {totalCount}
              </p>
            </div>

            {/* Field results */}
            <div className="space-y-4 mb-8">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    result.isCorrect
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {result.isCorrect ? (
                      <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className="font-semibold text-gray-800">{getFieldLabel(result.field)}</span>
                  </div>
                  <div className="ml-8">
                    <p className="text-sm text-gray-600">Sua resposta: <span className="font-medium">{result.userValue}</span></p>
                    {!result.isCorrect && (
                      <p className="text-sm text-gray-600">Resposta correta: <span className="font-medium text-green-700">{result.correctValue}</span></p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                Registros praticados: <span className="font-semibold">{practicedRecords.size}</span> / <span className="font-semibold">{filteredRecords.length}</span>
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleExit}
                className="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Sair
              </button>
              <button
                onClick={handleNext}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                {unpracticedRecords.length > 0 ? 'Próximo Exercício' : 'Ver Conclusão'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main exercise screen
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

          {/* Progress */}
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-700">
              Progresso: <span className="font-semibold">{practicedRecords.size}</span> / <span className="font-semibold">{filteredRecords.length}</span> registros praticados
            </p>
          </div>

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
                onChange={(e) => setSelectedTipo(e.target.value as TipoConhecimentoEnum | 'todos')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="todos">Todos</option>
                {availableTypes.map((tipo) => (
                  <option key={tipo} value={tipo} className="capitalize">
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentExercise && providedField && (
            <>
              {/* Provided field value */}
              <div className="mb-6 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
                <label className="block text-sm font-medium text-green-700 mb-2">
                  {getFieldLabel(providedField)}
                </label>
                <p className="text-2xl font-bold text-green-900">
                  {currentExercise[providedField] || '(vazio)'}
                </p>
              </div>

              {/* Form Fields - only show fields that are NOT the provided field */}
              <form className="space-y-6">
                {providedField !== 'texto_original' && (
                  <div>
                    <label htmlFor="texto-original" className="block text-sm font-medium text-gray-700 mb-2">
                      Texto Original
                    </label>
                    <input
                      type="text"
                      id="texto-original"
                      ref={textoOriginalRef}
                      value={textoOriginal}
                      onChange={(e) => setTextoOriginal(e.target.value)}
                      onFocus={() => setFocusedField('texto_original')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Digite o texto no idioma original"
                    />
                  </div>
                )}

                {providedField !== 'transcricao_ipa' && (
                  <div>
                    <label htmlFor="transcricao-ipa" className="block text-sm font-medium text-gray-700 mb-2">
                      Transcrição IPA
                    </label>
                    <input
                      type="text"
                      id="transcricao-ipa"
                      ref={transcricaoIpaRef}
                      value={transcricaoIpa}
                      onChange={(e) => setTranscricaoIpa(e.target.value)}
                      onFocus={() => setFocusedField('transcricao_ipa')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Digite a transcrição fonética (IPA)"
                    />
                  </div>
                )}

                {providedField !== 'traducao' && (
                  <div>
                    <label htmlFor="traducao" className="block text-sm font-medium text-gray-700 mb-2">
                      Tradução
                    </label>
                    <input
                      type="text"
                      id="traducao"
                      ref={traducaoRef}
                      value={traducao}
                      onChange={(e) => setTraducao(e.target.value)}
                      onFocus={() => setFocusedField('traducao')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Digite a tradução"
                    />
                  </div>
                )}

                {providedField !== 'divisao_silabica' && (
                  <div>
                    <label htmlFor="divisao-silabica" className="block text-sm font-medium text-gray-700 mb-2">
                      Divisão Silábica
                    </label>
                    <input
                      type="text"
                      id="divisao-silabica"
                      ref={divisaoSilabicaRef}
                      value={divisaoSilabica}
                      onChange={(e) => setDivisaoSilabica(e.target.value)}
                      onFocus={() => setFocusedField('divisao_silabica')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Digite a divisão silábica"
                    />
                  </div>
                )}

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
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                  >
                    {saving ? 'Salvando...' : 'Verificar'}
                  </button>
                </div>
              </form>

              {/* Virtual Keyboard */}
              {selectedIdioma && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Teclado Virtual
                  </h2>
                  <VirtualKeyboard
                    idioma={selectedIdioma}
                    onKeyPress={handleKeyPress}
                  />
                  {focusedField && (
                    <p className="mt-2 text-sm text-gray-600">
                      Campo ativo: <span className="font-semibold">{getFieldLabel(focusedField)}</span>
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
