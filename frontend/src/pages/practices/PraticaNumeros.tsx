import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { postExercicio, transcribeAudio, chatWithOllama } from '../../services/api'
import type {
  IdiomaConhecimentoEnum,
  ResultadoPronunciaNumeros,
  Exercicio
} from '../../types/api'

type ScreenState = 'setup' | 'exercise' | 'result'
type RecordingState = 'idle' | 'recording' | 'recorded'

interface VerificationResult {
  texto_correto?: boolean
  texto_comentario?: string
  audio_correto?: boolean
  audio_comentario?: string
  audio_transcricao?: string
}

export default function PraticaNumeros() {
  const navigate = useNavigate()
  const { prompts } = useData()

  // Screen state
  const [screenState, setScreenState] = useState<ScreenState>('setup')

  // Setup state
  const [selectedIdioma, setSelectedIdioma] = useState<IdiomaConhecimentoEnum>('alemao')
  const [minValue, setMinValue] = useState<string>('0')
  const [maxValue, setMaxValue] = useState<string>('100')

  // Exercise state
  const [currentNumber, setCurrentNumber] = useState<number | null>(null)
  const [textoUsuario, setTextoUsuario] = useState('')

  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Result state
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [saving, setSaving] = useState(false)

  // Map idioma enum to display name
  const getIdiomaDisplayName = (idioma: IdiomaConhecimentoEnum): string => {
    const mapping: Record<IdiomaConhecimentoEnum, string> = {
      'alemao': 'Alemão',
      'ingles': 'Inglês'
    }
    return mapping[idioma] || idioma
  }

  // Handle start exercise
  const handleStartExercise = () => {
    const min = parseInt(minValue)
    const max = parseInt(maxValue)

    if (isNaN(min) || isNaN(max)) {
      alert('Por favor, insira valores numéricos válidos.')
      return
    }

    if (min >= max) {
      alert('O valor mínimo deve ser menor que o valor máximo.')
      return
    }

    // Generate random number
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
    setCurrentNumber(randomNumber)

    // Clear previous state
    setTextoUsuario('')
    setAudioBlob(null)
    setRecordingState('idle')
    setVerificationResult(null)

    // Go to exercise screen
    setScreenState('exercise')
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

  // Clean JSON response from LLM
  const cleanJsonResponse = (text: string): string => {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '')

    // Trim whitespace
    cleaned = cleaned.trim()

    return cleaned
  }

  // Get prompt template
  const getPromptTemplate = (promptId: string): string | null => {
    if (!prompts) return null
    const prompt = prompts.prompts.find(p => p.prompt_id === promptId)
    return prompt?.template || null
  }

  // Replace prompt parameters
  const replacePromptParams = (template: string, params: Record<string, string>): string => {
    let result = template
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    return result
  }

  // Handle verify button
  const handleVerify = async () => {
    if (!currentNumber) return

    if (!textoUsuario.trim() && !audioBlob) {
      alert('Por favor, escreva o número por extenso e/ou grave sua pronúncia.')
      return
    }

    setVerifying(true)

    try {
      const result: VerificationResult = {}

      // Verify text if provided
      if (textoUsuario.trim()) {
        const promptTemplate = getPromptTemplate('numeros_verificar_texto')
        if (promptTemplate) {
          const prompt = replacePromptParams(promptTemplate, {
            numero: currentNumber.toString(),
            texto_usuario: textoUsuario.trim(),
            idioma: getIdiomaDisplayName(selectedIdioma)
          })

          console.log('📝 Verificando texto com LLM...')
          const response = await chatWithOllama({
            messages: [
              { role: 'user', content: prompt }
            ]
          })

          const cleanedResponse = cleanJsonResponse(response.message.content)
          console.log('🤖 Resposta LLM (texto):', cleanedResponse)

          const resultJson = JSON.parse(cleanedResponse)
          result.texto_correto = resultJson.equivalente
          result.texto_comentario = resultJson.equivalente
            ? 'Correto! Você escreveu o número corretamente.'
            : 'Incorreto. Revise como escrever este número.'
        }
      }

      // Verify audio if provided
      if (audioBlob) {
        // First, transcribe the audio
        console.log('🎤 Transcrevendo áudio...')
        const transcriptionResult = await transcribeAudio(audioBlob)
        const transcricao = transcriptionResult.text
        result.audio_transcricao = transcricao

        console.log('📝 Transcrição:', transcricao)

        // Then verify with LLM using the same prompt as text
        const promptTemplate = getPromptTemplate('numeros_verificar_texto')
        if (promptTemplate) {
          const prompt = replacePromptParams(promptTemplate, {
            numero: currentNumber.toString(),
            texto_usuario: transcricao,
            idioma: getIdiomaDisplayName(selectedIdioma)
          })

          console.log('📝 Verificando áudio com LLM...')
          const response = await chatWithOllama({
            messages: [
              { role: 'user', content: prompt }
            ]
          })

          const cleanedResponse = cleanJsonResponse(response.message.content)
          console.log('🤖 Resposta LLM (áudio):', cleanedResponse)

          const resultJson = JSON.parse(cleanedResponse)
          result.audio_correto = resultJson.equivalente
          result.audio_comentario = resultJson.equivalente
            ? 'Correto! Sua pronúncia está correta.'
            : 'Incorreto. Revise a pronúncia deste número.'
        }
      }

      console.log('✅ Resultado final:', result)

      setVerificationResult(result)

      // Save exercise to backend
      setSaving(true)
      try {
        const exercicio: Exercicio = {
          data_hora: new Date().toISOString(),
          exercicio_id: crypto.randomUUID(),
          conhecimento_id: `numero_${currentNumber}`,
          idioma: selectedIdioma as any,
          tipo_pratica: 'pronuncia_de_numeros' as any,
          resultado_exercicio: {
            numero_referencia: currentNumber.toString(),
            texto_usuario: textoUsuario.trim() || undefined,
            texto_correto: result.texto_correto,
            texto_comentario: result.texto_comentario,
            audio_transcricao: result.audio_transcricao,
            audio_correto: result.audio_correto,
            audio_comentario: result.audio_comentario
          } as ResultadoPronunciaNumeros
        }

        await postExercicio(exercicio)
      } catch (error) {
        console.error('Erro ao salvar exercício:', error)
      } finally {
        setSaving(false)
      }

      // Go to result screen
      setScreenState('result')
    } catch (error) {
      console.error('Erro ao verificar número:', error)
      alert('Erro ao verificar. Verifique se os serviços STT e Ollama estão rodando.')
    } finally {
      setVerifying(false)
    }
  }

  // Handle new exercise
  const handleNewExercise = () => {
    handleStartExercise()
  }

  // Handle back to setup
  const handleBackToSetup = () => {
    setScreenState('setup')
    setCurrentNumber(null)
    setTextoUsuario('')
    setAudioBlob(null)
    setRecordingState('idle')
    setVerificationResult(null)
  }

  // Handle exit
  const handleExit = () => {
    // Stop recording if active
    if (recordingState === 'recording' && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    navigate('/')
  }

  // Setup screen
  if (screenState === 'setup') {
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
                Prática de Números
              </h1>
              <p className="text-gray-600">
                Configure o intervalo de números e comece a praticar
              </p>
            </div>

            {/* Language Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                value={selectedIdioma}
                onChange={(e) => setSelectedIdioma(e.target.value as IdiomaConhecimentoEnum)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="alemao">Alemão</option>
                <option value="ingles">Inglês</option>
              </select>
            </div>

            {/* Range inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label htmlFor="min-value" className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Mínimo
                </label>
                <input
                  type="number"
                  id="min-value"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="max-value" className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Máximo
                </label>
                <input
                  type="number"
                  id="max-value"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="100"
                />
              </div>
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
                onClick={handleStartExercise}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Iniciar Prática
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Result screen
  if (screenState === 'result' && verificationResult) {
    const hasTextResult = verificationResult.texto_correto !== undefined
    const hasAudioResult = verificationResult.audio_correto !== undefined
    const allCorrect = (!hasTextResult || verificationResult.texto_correto) &&
                       (!hasAudioResult || verificationResult.audio_correto)

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

            {/* Overall result */}
            <div className={`mb-8 p-6 rounded-lg text-center ${
              allCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-yellow-50 border-2 border-yellow-300'
            }`}>
              <div className="flex items-center justify-center mb-2">
                {allCorrect ? (
                  <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-16 w-16 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <p className="text-2xl font-bold mb-2">
                {allCorrect ? 'Parabéns!' : 'Quase lá!'}
              </p>
              <p className="text-lg text-gray-700">
                Número: <span className="font-bold">{currentNumber}</span>
              </p>
            </div>

            {/* Text verification result */}
            {hasTextResult && (
              <div className={`mb-6 p-4 rounded-lg ${
                verificationResult.texto_correto ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
              }`}>
                <div className="flex items-center mb-2">
                  {verificationResult.texto_correto ? (
                    <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className="font-semibold text-gray-800">Texto Escrito</span>
                </div>
                <p className="text-sm text-gray-600 ml-8">{verificationResult.texto_comentario}</p>
              </div>
            )}

            {/* Audio verification result */}
            {hasAudioResult && (
              <div className={`mb-6 p-4 rounded-lg ${
                verificationResult.audio_correto ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
              }`}>
                <div className="flex items-center mb-2">
                  {verificationResult.audio_correto ? (
                    <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className="font-semibold text-gray-800">Áudio Gravado</span>
                </div>
                {verificationResult.audio_transcricao && (
                  <p className="text-sm text-gray-600 ml-8 mb-1">
                    Transcrição: <span className="font-medium">{verificationResult.audio_transcricao}</span>
                  </p>
                )}
                <p className="text-sm text-gray-600 ml-8">{verificationResult.audio_comentario}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleBackToSetup}
                className="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Voltar para Configuração
              </button>
              <button
                onClick={handleNewExercise}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Novo Exercício
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Exercise screen
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
              Prática de Números
            </h1>
            <p className="text-gray-600">
              Escreva ou pronuncie o número mostrado
            </p>
          </div>

          {/* Language display */}
          <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
            <label className="block text-sm font-medium text-purple-700 mb-1">
              Idioma
            </label>
            <p className="text-xl font-bold text-purple-900">
              {getIdiomaDisplayName(selectedIdioma)}
            </p>
          </div>

          {/* Number display */}
          <div className="mb-8 p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
            <label className="block text-sm font-medium text-green-700 mb-3 text-center">
              Número
            </label>
            <p className="text-6xl font-bold text-green-900 text-center">
              {currentNumber}
            </p>
          </div>

          {/* Text input */}
          <div className="mb-6">
            <label htmlFor="texto-numero" className="block text-sm font-medium text-gray-700 mb-2">
              Número por Extenso (opcional)
            </label>
            <input
              type="text"
              id="texto-numero"
              value={textoUsuario}
              onChange={(e) => setTextoUsuario(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Digite o número por extenso"
            />
          </div>

          {/* Recording controls */}
          <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <label className="block text-sm font-medium text-yellow-700 mb-3">
              Gravação de Áudio (opcional)
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
                Gravar
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
                  Ouvir
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

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleBackToSetup}
              className="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              disabled={recordingState === 'recording'}
            >
              Voltar
            </button>
            <button
              onClick={handleVerify}
              disabled={verifying || saving || recordingState === 'recording' || (!textoUsuario.trim() && !audioBlob)}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            >
              {verifying ? 'Verificando...' : saving ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
