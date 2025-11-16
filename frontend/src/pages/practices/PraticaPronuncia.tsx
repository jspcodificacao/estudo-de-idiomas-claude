import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { postExercicio, transcribeAudio } from '../../services/api'
import {
  CorretoEnum
} from '../../types/api'
import type {
  ConhecimentoIdioma,
  IdiomaConhecimentoEnum,
  TipoConhecimentoEnum,
  ResultadoPronuncia,
  Exercicio
} from '../../types/api'

type RecordingState = 'idle' | 'recording' | 'recorded'

interface VerificationResult {
  correto: CorretoEnum
  comentario: string
  transcricao_stt: string
}

export default function PraticaPronuncia() {
  const navigate = useNavigate()
  const { baseConhecimento, loading, errors } = useData()

  // Selectors state
  const [selectedIdioma, setSelectedIdioma] = useState<IdiomaConhecimentoEnum | ''>('')
  const [selectedTipo, setSelectedTipo] = useState<TipoConhecimentoEnum | 'todos'>('todos')

  // Exercise state
  const [currentExercise, setCurrentExercise] = useState<ConhecimentoIdioma | null>(null)
  const [practicedRecords, setPracticedRecords] = useState<Set<string>>(new Set())

  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Result state
  const [showResult, setShowResult] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [saving, setSaving] = useState(false)

  // Completion state
  const [allPracticed, setAllPracticed] = useState(false)

  // IPA visibility state
  const [showIPA, setShowIPA] = useState(false)

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

  // Start new exercise
  const startNewExercise = () => {
    if (unpracticedRecords.length === 0) {
      setAllPracticed(true)
      return
    }

    // Select random record from unpracticed
    const randomIndex = Math.floor(Math.random() * unpracticedRecords.length)
    const selectedRecord = unpracticedRecords[randomIndex]

    // Set current exercise
    setCurrentExercise(selectedRecord)

    // Clear recording
    setRecordingState('idle')
    setAudioBlob(null)

    // Clear results
    setShowResult(false)
    setVerificationResult(null)
    setAllPracticed(false)

    // Reset IPA visibility
    setShowIPA(false)
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
    // Stop recording if active
    if (recordingState === 'recording' && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    navigate('/')
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

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        setRecordingState('recorded')

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecordingState('recording')
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      alert('Erro ao acessar o microfone. Verifique as permissões do navegador.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  // Clear recording
  const clearRecording = () => {
    setAudioBlob(null)
    setRecordingState('idle')
    audioChunksRef.current = []
  }

  // Play recorded audio
  const playRecording = () => {
    if (!audioBlob) return

    const url = URL.createObjectURL(audioBlob)
    const audio = new Audio(url)
    audio.play()
    audio.onended = () => URL.revokeObjectURL(url)
  }

  // Handle verify button
  const handleVerify = async () => {
    if (!currentExercise || !audioBlob) {
      alert('Por favor, grave sua pronúncia antes de verificar.')
      return
    }

    setVerifying(true)

    try {
      // Transcribe audio using STT service
      const transcriptionResult = await transcribeAudio(audioBlob)
      const transcricao_stt = transcriptionResult.text

      console.log('📝 Texto original:', currentExercise.texto_original)
      console.log('🎤 Transcrição STT:', transcricao_stt)

      // Compare texts directly (case sensitive, without punctuation)
      const originalClean = removePunctuation(currentExercise.texto_original)
      const transcricaoClean = removePunctuation(transcricao_stt)

      console.log('📝 Texto original (limpo):', originalClean)
      console.log('📝 Transcrição STT (limpo):', transcricaoClean)
      console.log('🔍 Comparação case-sensitive:', originalClean === transcricaoClean)

      const isCorrect = originalClean === transcricaoClean

      const result: VerificationResult = {
        correto: isCorrect ? CorretoEnum.Sim : CorretoEnum.Nao,
        comentario: isCorrect
          ? 'Perfeito! Sua pronúncia está correta.'
          : `Transcrição da sua pronúncia: "${transcricao_stt}". Esperado: "${currentExercise.texto_original}".`,
        transcricao_stt
      }

      console.log('✅ Resultado:', result)

      setVerificationResult(result)
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
          tipo_pratica: 'pronuncia' as any,
          resultado_exercicio: {
            texto_original: currentExercise.texto_original,
            transcricao_stt: transcricao_stt,
            correto: result.correto,
            comentario: result.comentario
          } as ResultadoPronuncia
        }

        await postExercicio(exercicio)
      } catch (error) {
        console.error('Erro ao salvar exercício:', error)
      } finally {
        setSaving(false)
      }
    } catch (error) {
      console.error('Erro ao verificar pronúncia:', error)
      alert('Erro ao transcrever áudio. Verifique se o serviço STT está rodando.')
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
  if (showResult && currentExercise && verificationResult) {
    const isCorrect = verificationResult.correto === CorretoEnum.Sim

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
              <p className="text-lg text-gray-700">{verificationResult.comentario}</p>
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
                  Transcrição da Sua Pronúncia (STT)
                </label>
                <p className="text-xl font-semibold text-blue-900">
                  {verificationResult.transcricao_stt}
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
              Prática de Pronúncia
            </h1>
            <p className="text-gray-600">
              Leia o texto e grave sua pronúncia
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
                disabled={recordingState === 'recording'}
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
                disabled={recordingState === 'recording'}
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

          {currentExercise ? (
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

              {/* Text to pronounce */}
              <div className="mb-6 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
                <label className="block text-sm font-medium text-green-700 mb-3">
                  Texto para Pronunciar
                </label>
                <p className="text-3xl font-bold text-green-900 text-center">
                  {currentExercise.texto_original}
                </p>
              </div>

              {/* IPA Transcription with toggle */}
              {currentExercise.transcricao_ipa && (
                <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-blue-700">
                      Transcrição IPA
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowIPA(!showIPA)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                      title={showIPA ? 'Ocultar IPA' : 'Mostrar IPA'}
                    >
                      {showIPA ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {showIPA && (
                    <p className="text-2xl font-semibold text-blue-900 text-center">
                      {currentExercise.transcricao_ipa}
                    </p>
                  )}
                </div>
              )}

              {/* Recording controls */}
              <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <label className="block text-sm font-medium text-yellow-700 mb-3">
                  Gravação
                </label>

                {recordingState === 'idle' && (
                  <button
                    onClick={startRecording}
                    className="w-full px-6 py-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                    Iniciar Gravação
                  </button>
                )}

                {recordingState === 'recording' && (
                  <div>
                    <div className="flex items-center justify-center mb-4">
                      <div className="animate-pulse h-4 w-4 bg-red-600 rounded-full mr-2"></div>
                      <span className="text-red-600 font-semibold">Gravando...</span>
                    </div>
                    <button
                      onClick={stopRecording}
                      className="w-full px-6 py-4 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h12v12H6z"/>
                      </svg>
                      Parar Gravação
                    </button>
                  </div>
                )}

                {recordingState === 'recorded' && audioBlob && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center mb-2">
                      <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-600 font-semibold">Gravação concluída</span>
                    </div>
                    <button
                      onClick={playRecording}
                      className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Reproduzir Gravação
                    </button>
                    <button
                      onClick={clearRecording}
                      className="w-full px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Gravar Novamente
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleExit}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={recordingState === 'recording'}
                >
                  Sair
                </button>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying || saving || recordingState !== 'recorded' || !audioBlob}
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
