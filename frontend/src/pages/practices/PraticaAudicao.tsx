import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { postExercicio, generateAudio } from '../../services/api'
import {
  VelocidadeEnum
} from '../../types/api'
import type {
  ConhecimentoIdioma,
  IdiomaConhecimentoEnum,
  TipoConhecimentoEnum,
  ResultadoAudicao,
  Exercicio
} from '../../types/api'

interface AudioData {
  normal: {
    audioBase64: string
    mimeType: string
  }
  lento: {
    audioBase64: string
    mimeType: string
  }
}

interface CompatibilidadeResult {
  compatibilidade: 'Sim' | 'Não'
  comentario: string
}

export default function PraticaAudicao() {
  const navigate = useNavigate()
  const { baseConhecimento, loading, errors } = useData()

  // Selectors state
  const [selectedIdioma, setSelectedIdioma] = useState<IdiomaConhecimentoEnum | ''>('')
  const [selectedTipo, setSelectedTipo] = useState<TipoConhecimentoEnum | 'todos'>('todos')

  // Exercise state
  const [currentExercise, setCurrentExercise] = useState<ConhecimentoIdioma | null>(null)
  const [practicedRecords, setPracticedRecords] = useState<Set<string>>(new Set())
  const [audioData, setAudioData] = useState<AudioData | null>(null)
  const [generatingAudio, setGeneratingAudio] = useState(false)

  // Form state
  const [transcricaoUsuario, setTranscricaoUsuario] = useState('')

  // Result state
  const [showResult, setShowResult] = useState(false)
  const [compatibilidadeResult, setCompatibilidadeResult] = useState<CompatibilidadeResult | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [saving, setSaving] = useState(false)

  // Completion state
  const [allPracticed, setAllPracticed] = useState(false)

  // Textarea ref for cursor position
  const transcricaoRef = useRef<HTMLTextAreaElement>(null)

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

  // Generate audio for exercise
  const generateExerciseAudio = async (text: string): Promise<AudioData> => {
    try {
      setGeneratingAudio(true)

      // Generate normal speed audio
      const normalAudio = await generateAudio({
        text,
        speed: 1.0
      })

      // Generate slow speed audio
      const slowAudio = await generateAudio({
        text,
        speed: 0.5
      })

      return {
        normal: {
          audioBase64: normalAudio.audio,  // API retorna "audio" não "audioBase64"
          mimeType: normalAudio.mimeType
        },
        lento: {
          audioBase64: slowAudio.audio,  // API retorna "audio" não "audioBase64"
          mimeType: slowAudio.mimeType
        }
      }
    } catch (error) {
      console.error('Erro ao gerar áudio:', error)
      throw error
    } finally {
      setGeneratingAudio(false)
    }
  }

  // Start new exercise
  const startNewExercise = async () => {
    if (unpracticedRecords.length === 0) {
      setAllPracticed(true)
      return
    }

    // Select random record from unpracticed
    const randomIndex = Math.floor(Math.random() * unpracticedRecords.length)
    const selectedRecord = unpracticedRecords[randomIndex]

    try {
      // Generate audios
      const audios = await generateExerciseAudio(selectedRecord.texto_original)

      // Set current exercise
      setCurrentExercise(selectedRecord)
      setAudioData(audios)

      // Clear form
      setTranscricaoUsuario('')

      // Clear results
      setShowResult(false)
      setCompatibilidadeResult(null)
      setAllPracticed(false)
    } catch (error) {
      console.error('Erro ao iniciar exercício:', error)
      alert('Erro ao gerar áudios para o exercício. Verifique se o serviço TTS está rodando.')
    }
  }

  // Reset practiced records when type changes
  useEffect(() => {
    setPracticedRecords(new Set())
    setCurrentExercise(null)
    setAudioData(null)
    setShowResult(false)
    setAllPracticed(false)
  }, [selectedTipo, selectedIdioma])

  // Initial exercise when component mounts or filters change
  useEffect(() => {
    if (filteredRecords.length > 0 && !currentExercise && !showResult && !generatingAudio && !allPracticed) {
      startNewExercise()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredRecords.length, currentExercise, showResult, generatingAudio, allPracticed])

  // Handle exit button
  const handleExit = () => {
    navigate('/')
  }

  // Play audio
  const playAudio = (audioBase64: string, mimeType: string) => {
    try {
      console.log('Tentando reproduzir áudio...')
      console.log('MIME Type:', mimeType)
      console.log('Base64 length:', audioBase64.length)
      console.log('Base64 preview:', audioBase64.substring(0, 50))

      // Criar um blob ao invés de usar data URL diretamente
      // Isso funciona melhor com alguns navegadores e formatos de áudio
      const byteCharacters = atob(audioBase64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      const url = URL.createObjectURL(blob)

      console.log('Blob URL criada:', url)

      const audio = new Audio(url)
      audio.onloadeddata = () => {
        console.log('Áudio carregado com sucesso')
      }
      audio.onerror = (e) => {
        console.error('Erro ao carregar áudio:', e)
        console.error('Audio error details:', audio.error)
      }

      audio.play()
        .then(() => {
          console.log('Reprodução iniciada com sucesso')
          // Liberar URL quando terminar
          audio.onended = () => URL.revokeObjectURL(url)
        })
        .catch(err => {
          console.error('Erro ao reproduzir áudio:', err)
          URL.revokeObjectURL(url)
          alert(`Erro ao reproduzir áudio: ${err.message}\nMIME Type: ${mimeType}`)
        })
    } catch (error) {
      console.error('Erro ao criar áudio:', error)
      alert(`Erro ao criar objeto de áudio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // Map idioma enum to display name
  const getIdiomaDisplayName = (idioma: IdiomaConhecimentoEnum): string => {
    const mapping: Record<IdiomaConhecimentoEnum, string> = {
      'alemao': 'Alemão',
      'ingles': 'Inglês'
    }
    return mapping[idioma] || idioma
  }

  // Remove punctuation from text
  const removePunctuation = (text: string): string => {
    // Remove sinais de pontuação: ! , : ? .
    return text.replace(/[!,:?.]/g, '').trim()
  }

  // Insert character at cursor position
  const insertCharacterAtCursor = (character: string) => {
    const textarea = transcricaoRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart || 0
    const currentValue = textarea.value

    // Insert character at cursor position
    const newValue = currentValue.slice(0, cursorPos) + character + currentValue.slice(cursorPos)
    const newCursorPos = cursorPos + character.length

    // Update state
    setTranscricaoUsuario(newValue)

    // Set cursor position after React updates
    setTimeout(() => {
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  // Handle verify button
  const handleVerify = async () => {
    if (!currentExercise || !transcricaoUsuario.trim()) {
      alert('Por favor, preencha a transcrição antes de verificar.')
      return
    }

    setVerifying(true)

    try {
      // Compare texts directly (case sensitive, without punctuation)
      const originalClean = removePunctuation(currentExercise.texto_original)
      const transcricaoClean = removePunctuation(transcricaoUsuario.trim())

      console.log('📝 Texto original (limpo):', originalClean)
      console.log('📝 Transcrição usuário (limpo):', transcricaoClean)
      console.log('🔍 Comparação case-sensitive:', originalClean === transcricaoClean)

      const isCorrect = originalClean === transcricaoClean

      const resultJson: CompatibilidadeResult = {
        compatibilidade: isCorrect ? 'Sim' : 'Não',
        comentario: isCorrect
          ? 'Perfeito! Sua transcrição está correta.'
          : `Sua transcrição: "${transcricaoUsuario.trim()}". Esperado: "${currentExercise.texto_original}".`
      }

      console.log('✅ Resultado:', resultJson)

      setCompatibilidadeResult(resultJson)
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
          tipo_pratica: 'audicao' as any,
          resultado_exercicio: {
            texto_original: currentExercise.texto_original,
            transcricao_usuario: transcricaoUsuario.trim(),
            correto: resultJson.compatibilidade === 'Sim',
            velocidade_utilizada: VelocidadeEnum.Normal
          } as ResultadoAudicao
        }

        await postExercicio(exercicio)
      } catch (error) {
        console.error('Erro ao salvar exercício:', error)
      } finally {
        setSaving(false)
      }
    } catch (error) {
      console.error('Erro ao verificar compatibilidade:', error)
      alert('Erro ao verificar a transcrição. Verifique se o serviço Ollama está rodando.')
    } finally {
      setVerifying(false)
    }
  }

  // Handle next exercise
  const handleNext = () => {
    startNewExercise()
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
                    setAudioData(null)
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
  if (showResult && currentExercise && compatibilidadeResult) {
    const isCorrect = compatibilidadeResult.compatibilidade === 'Sim'

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

            {/* Result status */}
            <div className={`mb-8 p-6 rounded-lg text-center ${
              isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
            }`}>
              <div className="flex items-center justify-center mb-2">
                {isCorrect ? (
                  <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-16 w-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="text-2xl font-bold mb-2">
                {isCorrect ? 'Correto!' : 'Incorreto'}
              </p>
              <p className="text-lg text-gray-700">{compatibilidadeResult.comentario}</p>
            </div>

            {/* Comparison */}
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                <label className="block text-sm font-medium text-green-700 mb-2">
                  Texto Original
                </label>
                <p className="text-xl font-semibold text-green-900">
                  {currentExercise.texto_original}
                </p>
              </div>

              <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Sua Transcrição
                </label>
                <p className="text-xl font-semibold text-blue-900">
                  {transcricaoUsuario}
                </p>
              </div>
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
                disabled={saving || generatingAudio}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                {generatingAudio ? 'Gerando áudios...' : unpracticedRecords.length > 0 ? 'Próximo Exercício' : 'Ver Conclusão'}
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
              Prática de Audição
            </h1>
            <p className="text-gray-600">
              Ouça o áudio e transcreva o que você ouviu
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
                disabled={generatingAudio}
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
                disabled={generatingAudio}
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

          {generatingAudio ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Gerando áudios do exercício...</p>
            </div>
          ) : currentExercise && audioData ? (
            <>
              {/* Idioma display */}
              <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
                <label className="block text-sm font-medium text-purple-700 mb-1">
                  Idioma
                </label>
                <p className="text-xl font-bold text-purple-900 capitalize">
                  {getIdiomaDisplayName(currentExercise.idioma)}
                </p>
              </div>

              {/* Audio players */}
              <div className="mb-6 space-y-4">
                <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                  <label className="block text-sm font-medium text-green-700 mb-3">
                    Áudio Normal (Velocidade 1.0)
                  </label>
                  <button
                    onClick={() => playAudio(audioData.normal.audioBase64, audioData.normal.mimeType)}
                    className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reproduzir Normal
                  </button>
                </div>

                <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  <label className="block text-sm font-medium text-yellow-700 mb-3">
                    Áudio Lento (Velocidade 0.5)
                  </label>
                  <button
                    onClick={() => playAudio(audioData.lento.audioBase64, audioData.lento.mimeType)}
                    className="w-full px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reproduzir Lento
                  </button>
                </div>
              </div>

              {/* Transcription input */}
              <div className="mb-6">
                <label htmlFor="transcricao" className="block text-sm font-medium text-gray-700 mb-2">
                  Transcrição
                </label>
                <textarea
                  id="transcricao"
                  ref={transcricaoRef}
                  value={transcricaoUsuario}
                  onChange={(e) => setTranscricaoUsuario(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Digite o que você ouviu no áudio"
                  rows={4}
                />

                {/* Special character button */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => insertCharacterAtCursor('ß')}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-lg"
                    title="Inserir caractere ß"
                  >
                    ß
                  </button>
                  <span className="ml-2 text-sm text-gray-600">Clique para inserir o caractere "ß" na posição do cursor</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
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
                  disabled={verifying || saving || !transcricaoUsuario.trim()}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                >
                  {verifying ? 'Verificando...' : saving ? 'Salvando...' : 'Verificar'}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
