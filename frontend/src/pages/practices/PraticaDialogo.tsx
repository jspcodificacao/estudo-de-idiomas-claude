import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { postExercicio, generateAudio, transcribeAudio, chatWithOllama } from '../../services/api'
import type {
  IdiomaConhecimentoEnum,
  ResultadoDialogo,
  Exercicio,
  CorretoEnum
} from '../../types/api'

type DialogueStage = 'greeting' | 'intermediate' | 'farewell' | 'final'
type RecordingState = 'idle' | 'recording' | 'recorded'

interface AudioData {
  normal: {
    audioBase64: string
    mimeType: string
  }
  lento?: {
    audioBase64: string
    mimeType: string
  }
}

interface DialogueTurn {
  speaker: 'app' | 'user'
  text: string
  transcription?: string
  coherent?: boolean
}

interface InterlocutorData {
  nome: string
  idade: string
  altura: string
  peso: string
}

export default function PraticaDialogo() {
  const navigate = useNavigate()
  const { frasesDialogo, prompts, loading, errors } = useData()

  // Dialogue state
  const [selectedIdioma, setSelectedIdioma] = useState<IdiomaConhecimentoEnum>('alemao')
  const [dialogueStage, setDialogueStage] = useState<DialogueStage>('greeting')
  const [dialogueHistory, setDialogueHistory] = useState<DialogueTurn[]>([])
  const [currentPhrase, setCurrentPhrase] = useState<string>('')
  const [intermediatePhrasesUsed, setIntermediatePhrasesUsed] = useState<Set<number>>(new Set())

  // Audio state
  const [audioData, setAudioData] = useState<AudioData | null>(null)
  const [generatingAudio, setGeneratingAudio] = useState(false)
  const [generatingSlowAudio, setGeneratingSlowAudio] = useState(false)

  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Verification state
  const [verifying, setVerifying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentCoherence, setCurrentCoherence] = useState<boolean | null>(null)
  const [currentTranscription, setCurrentTranscription] = useState<string>('')

  // Final result
  const [interlocutorData, setInterlocutorData] = useState<InterlocutorData | null>(null)
  const [analyzingDialogue, setAnalyzingDialogue] = useState(false)

  // Map idioma enum to display name
  const getIdiomaDisplayName = (idioma: IdiomaConhecimentoEnum): string => {
    const mapping: Record<IdiomaConhecimentoEnum, string> = {
      'alemao': 'Alemão',
      'ingles': 'Inglês'
    }
    return mapping[idioma] || idioma
  }

  // Generate audio for phrase
  const generatePhraseAudio = async (text: string, includeSlowAudio: boolean = true): Promise<AudioData> => {
    setGeneratingAudio(true)

    try {
      const normalAudio = await generateAudio({
        text,
        speed: 1.0
      })

      const result: AudioData = {
        normal: {
          audioBase64: normalAudio.audio,
          mimeType: normalAudio.mimeType
        }
      }

      if (includeSlowAudio) {
        const slowAudio = await generateAudio({
          text,
          speed: 0.5
        })

        result.lento = {
          audioBase64: slowAudio.audio,
          mimeType: slowAudio.mimeType
        }
      }

      return result
    } finally {
      setGeneratingAudio(false)
    }
  }

  // Generate slow audio on demand
  const generateSlowAudio = async () => {
    if (!currentPhrase || audioData?.lento) return

    setGeneratingSlowAudio(true)

    try {
      const slowAudio = await generateAudio({
        text: currentPhrase,
        speed: 0.5
      })

      setAudioData(prev => ({
        ...prev!,
        lento: {
          audioBase64: slowAudio.audio,
          mimeType: slowAudio.mimeType
        }
      }))
    } catch (error) {
      console.error('Erro ao gerar áudio lento:', error)
      alert('Erro ao gerar áudio lento.')
    } finally {
      setGeneratingSlowAudio(false)
    }
  }

  // Play audio
  const playAudio = (audioBase64: string, mimeType: string) => {
    try {
      const byteCharacters = atob(audioBase64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      const url = URL.createObjectURL(blob)

      const audio = new Audio(url)
      audio.play()
      audio.onended = () => URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error)
      alert('Erro ao reproduzir áudio.')
    }
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
    setCurrentTranscription('')
    setCurrentCoherence(null)
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
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '')
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

  // Start dialogue - greeting phase
  useEffect(() => {
    if (frasesDialogo && dialogueStage === 'greeting' && !currentPhrase) {
      const startGreeting = async () => {
        setCurrentPhrase(frasesDialogo.saudacao)
        const audio = await generatePhraseAudio(frasesDialogo.saudacao, true)
        setAudioData(audio)
        setDialogueHistory([{ speaker: 'app', text: frasesDialogo.saudacao }])
      }
      startGreeting()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frasesDialogo, dialogueStage, currentPhrase])

  // Handle confirm for greeting
  const handleConfirmGreeting = async () => {
    // Don't process greeting audio, just move to intermediate phase
    setDialogueStage('intermediate')
    clearRecording()
    setAudioData(null)
    setCurrentPhrase('')

    // Load first intermediate phrase
    if (!frasesDialogo) return

    const randomIndex = Math.floor(Math.random() * frasesDialogo.intermediarias.length)
    const selectedPhrase = frasesDialogo.intermediarias[randomIndex]
    setIntermediatePhrasesUsed(new Set([randomIndex]))

    setCurrentPhrase(selectedPhrase)
    const audio = await generatePhraseAudio(selectedPhrase, true)
    setAudioData(audio)
    setDialogueHistory(prev => [...prev, { speaker: 'app', text: selectedPhrase }])
  }

  // Handle confirm for intermediate
  const handleConfirmIntermediate = async () => {
    if (!audioBlob || !currentPhrase) return

    setVerifying(true)

    try {
      // Transcribe audio
      console.log('🎤 Transcrevendo áudio...')
      const transcriptionResult = await transcribeAudio(audioBlob)
      const transcription = transcriptionResult.text
      setCurrentTranscription(transcription)

      console.log('📝 Transcrição:', transcription)

      // Check coherence with LLM
      const promptTemplate = getPromptTemplate('dialogo_avaliacao_coerencia')
      if (promptTemplate) {
        const prompt = replacePromptParams(promptTemplate, {
          idioma: getIdiomaDisplayName(selectedIdioma),
          pergunta: currentPhrase,
          resposta: transcription
        })

        console.log('🤖 Consultando LLM para avaliar coerência...')
        const response = await chatWithOllama({
          messages: [
            { role: 'user', content: prompt }
          ]
        })

        const cleanedResponse = cleanJsonResponse(response.message.content)
        console.log('🤖 Resposta LLM:', cleanedResponse)

        const resultJson = JSON.parse(cleanedResponse)
        const isCoherent = resultJson.coerente === 'True' || resultJson.coerente === true
        setCurrentCoherence(isCoherent)

        console.log('✅ Coerente:', isCoherent)

        // Add to dialogue history
        setDialogueHistory(prev => [
          ...prev,
          {
            speaker: 'user',
            text: transcription,
            transcription: transcription,
            coherent: isCoherent
          }
        ])
      }
    } catch (error) {
      console.error('Erro ao verificar coerência:', error)
      alert('Erro ao verificar coerência. Verifique se os serviços STT e Ollama estão rodando.')
    } finally {
      setVerifying(false)
    }
  }

  // Handle next intermediate phrase
  const handleNextIntermediate = async () => {
    if (!frasesDialogo) return

    const availablePhrases = frasesDialogo.intermediarias.filter(
      (_, index) => !intermediatePhrasesUsed.has(index)
    )

    if (availablePhrases.length === 0) {
      // No more intermediate phrases, move to farewell
      setDialogueStage('farewell')
      clearRecording()
      setAudioData(null)
      setCurrentPhrase('')
      setCurrentTranscription('')
      setCurrentCoherence(null)
      return
    }

    // Select random phrase
    const randomIndex = Math.floor(Math.random() * frasesDialogo.intermediarias.length)

    // Make sure it hasn't been used
    if (intermediatePhrasesUsed.has(randomIndex)) {
      handleNextIntermediate()
      return
    }

    const selectedPhrase = frasesDialogo.intermediarias[randomIndex]
    setIntermediatePhrasesUsed(prev => new Set([...prev, randomIndex]))
    setCurrentPhrase(selectedPhrase)

    // Generate normal audio only (slow audio generated on demand)
    const audio = await generatePhraseAudio(selectedPhrase, false)
    setAudioData(audio)

    // Add to dialogue history
    setDialogueHistory(prev => [...prev, { speaker: 'app', text: selectedPhrase }])

    // Clear recording and results
    clearRecording()
    setCurrentTranscription('')
    setCurrentCoherence(null)
  }

  // Start farewell phase
  useEffect(() => {
    if (frasesDialogo && dialogueStage === 'farewell' && !currentPhrase) {
      const startFarewell = async () => {
        setCurrentPhrase(frasesDialogo.despedida)
        const audio = await generatePhraseAudio(frasesDialogo.despedida, true)
        setAudioData(audio)
        setDialogueHistory(prev => [...prev, { speaker: 'app', text: frasesDialogo.despedida }])
      }
      startFarewell()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frasesDialogo, dialogueStage, currentPhrase])

  // Handle confirm for farewell
  const handleConfirmFarewell = async () => {
    // Don't process farewell audio, analyze complete dialogue
    setDialogueStage('final')
    setAnalyzingDialogue(true)

    try {
      // Build complete dialogue text
      const dialogueText = dialogueHistory
        .map(turn => `${turn.speaker === 'app' ? 'App' : 'Usuário'}: ${turn.text}`)
        .join('\n')

      console.log('📝 Diálogo completo:', dialogueText)

      // Query LLM to extract interlocutor data
      const promptTemplate = getPromptTemplate('dialogo_dados_interlocutor')
      if (promptTemplate) {
        const prompt = replacePromptParams(promptTemplate, {
          idioma: getIdiomaDisplayName(selectedIdioma),
          dialogo: dialogueText
        })

        console.log('🤖 Consultando LLM para extrair dados do interlocutor...')
        const response = await chatWithOllama({
          messages: [
            { role: 'user', content: prompt }
          ]
        })

        const cleanedResponse = cleanJsonResponse(response.message.content)
        console.log('🤖 Resposta LLM:', cleanedResponse)

        const resultJson = JSON.parse(cleanedResponse)
        setInterlocutorData(resultJson)

        console.log('✅ Dados do interlocutor:', resultJson)

        // Save exercise
        setSaving(true)
        try {
          const exercicio: Exercicio = {
            data_hora: new Date().toISOString(),
            exercicio_id: crypto.randomUUID(),
            conhecimento_id: 'dialogo_practice',
            idioma: selectedIdioma as any,
            tipo_pratica: 'dialogo' as any,
            resultado_exercicio: {
              correto: CorretoEnum.Sim // Simplified - could be more complex
            } as ResultadoDialogo
          }

          await postExercicio(exercicio)
        } catch (error) {
          console.error('Erro ao salvar exercício:', error)
        } finally {
          setSaving(false)
        }
      }
    } catch (error) {
      console.error('Erro ao analisar diálogo:', error)
      alert('Erro ao analisar diálogo. Verifique se o serviço Ollama está rodando.')
    } finally {
      setAnalyzingDialogue(false)
    }
  }

  // Handle exit
  const handleExit = () => {
    if (recordingState === 'recording' && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    navigate('/')
  }

  // Handle restart
  const handleRestart = () => {
    setDialogueStage('greeting')
    setDialogueHistory([])
    setCurrentPhrase('')
    setIntermediatePhrasesUsed(new Set())
    setAudioData(null)
    clearRecording()
    setCurrentTranscription('')
    setCurrentCoherence(null)
    setInterlocutorData(null)
  }

  // Loading state
  if (loading.frasesDialogo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando frases de diálogo...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (errors.frasesDialogo) {
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
              <p className="text-gray-700 mb-4">{errors.frasesDialogo}</p>
              <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                ← Voltar para Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Final result screen
  if (dialogueStage === 'final' && interlocutorData) {
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
              Resultado do Diálogo
            </h1>

            {/* Interlocutor data */}
            <div className="mb-8 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
              <h2 className="text-2xl font-bold text-green-900 mb-4">Dados do Interlocutor</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Nome</label>
                  <p className="text-lg font-semibold text-green-900">{interlocutorData.nome}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Idade</label>
                  <p className="text-lg font-semibold text-green-900">{interlocutorData.idade}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Altura</label>
                  <p className="text-lg font-semibold text-green-900">{interlocutorData.altura}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Peso</label>
                  <p className="text-lg font-semibold text-green-900">{interlocutorData.peso}</p>
                </div>
              </div>
            </div>

            {/* Dialogue history */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Histórico do Diálogo</h2>
              <div className="space-y-3">
                {dialogueHistory.map((turn, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      turn.speaker === 'app'
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'bg-gray-50 border-l-4 border-gray-500'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {turn.speaker === 'app' ? 'Aplicação' : 'Você'}
                    </p>
                    <p className="text-gray-800">{turn.text}</p>
                    {turn.coherent !== undefined && (
                      <p className={`text-sm mt-2 ${turn.coherent ? 'text-green-600' : 'text-red-600'}`}>
                        {turn.coherent ? '✓ Coerente' : '✗ Não coerente'}
                      </p>
                    )}
                  </div>
                ))}
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
                onClick={handleRestart}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Novo Diálogo
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main dialogue screen
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
              Prática de Diálogo
            </h1>
            <p className="text-gray-600">
              {dialogueStage === 'greeting' && 'Ouça a saudação e responda'}
              {dialogueStage === 'intermediate' && 'Continue o diálogo'}
              {dialogueStage === 'farewell' && 'Ouça a despedida e responda'}
            </p>
          </div>

          {/* Language selector (only at start) */}
          {dialogueStage === 'greeting' && dialogueHistory.length === 0 && (
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
          )}

          {generatingAudio ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Gerando áudios...</p>
            </div>
          ) : currentPhrase && audioData ? (
            <>
              {/* App's message card */}
              <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <label className="block text-sm font-medium text-blue-700 mb-3">
                  Aplicação
                </label>

                {/* Audio players */}
                <div className="space-y-3">
                  <button
                    onClick={() => playAudio(audioData.normal.audioBase64, audioData.normal.mimeType)}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Play Normal
                  </button>

                  {audioData.lento ? (
                    <button
                      onClick={() => playAudio(audioData.lento!.audioBase64, audioData.lento!.mimeType)}
                      className="w-full px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Play Lento
                    </button>
                  ) : (
                    <button
                      onClick={generateSlowAudio}
                      disabled={generatingSlowAudio}
                      className="w-full px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-gray-400"
                    >
                      {generatingSlowAudio ? 'Gerando...' : 'Gerar Play Lento'}
                    </button>
                  )}
                </div>
              </div>

              {/* User's response card */}
              <div className="mb-6 p-6 bg-gray-50 border-2 border-gray-300 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sua Resposta
                </label>

                {/* Recording controls */}
                {recordingState === 'idle' && (
                  <button
                    onClick={startRecording}
                    className="w-full px-6 py-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                    Gravar Resposta
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
                      className="w-full px-6 py-4 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                    >
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
                      className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Ouvir
                    </button>
                    <button
                      onClick={clearRecording}
                      className="w-full px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Gravar Novamente
                    </button>
                    <button
                      onClick={
                        dialogueStage === 'greeting' ? handleConfirmGreeting :
                        dialogueStage === 'intermediate' ? handleConfirmIntermediate :
                        handleConfirmFarewell
                      }
                      disabled={verifying || analyzingDialogue}
                      className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                    >
                      {verifying ? 'Verificando...' : analyzingDialogue ? 'Analisando...' : 'Confirmar'}
                    </button>
                  </div>
                )}

                {/* Show transcription and coherence for intermediate phrases */}
                {dialogueStage === 'intermediate' && currentTranscription && (
                  <div className="mt-4 p-4 bg-white border-2 border-gray-300 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Transcrição:</p>
                    <p className="text-gray-900 mb-3">{currentTranscription}</p>
                    {currentCoherence !== null && (
                      <div className={`flex items-center ${currentCoherence ? 'text-green-600' : 'text-red-600'}`}>
                        {currentCoherence ? (
                          <>
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-semibold">Resposta coerente</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="font-semibold">Resposta não coerente</span>
                          </>
                        )}
                      </div>
                    )}
                    <button
                      onClick={handleNextIntermediate}
                      className="mt-4 w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Próxima Frase
                    </button>
                  </div>
                )}
              </div>

              {/* Exit button */}
              {!currentTranscription && (
                <button
                  onClick={handleExit}
                  className="w-full px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={recordingState === 'recording'}
                >
                  Sair
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
