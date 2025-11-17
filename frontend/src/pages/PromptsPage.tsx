import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { updatePrompts } from '../services/api'
import type { BasePrompts, PromptItem } from '../types/api'

function PromptsPage() {
  const { prompts, loading: dataLoading, errors: dataErrors } = useData()
  const [promptsData, setPromptsData] = useState<BasePrompts | null>(null)
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null)
  const [editedPrompt, setEditedPrompt] = useState<PromptItem | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  const loading = dataLoading.prompts
  const error = dataErrors.prompts

  // Use prompts from context if local state is null
  const displayData = promptsData || prompts

  const handleEdit = (prompt: PromptItem) => {
    setEditingPromptId(prompt.prompt_id)
    setEditedPrompt({ ...prompt })
    setHasUnsavedChanges(false)
  }

  const handleCancel = () => {
    setEditingPromptId(null)
    setEditedPrompt(null)
    setHasUnsavedChanges(false)
    setIsCreatingNew(false)
  }

  const handleSave = async () => {
    if (editedPrompt && displayData) {
      let updatedPrompts: PromptItem[]

      if (isCreatingNew) {
        // Add new prompt to the list
        updatedPrompts = [...displayData.prompts, editedPrompt]
      } else {
        // Update existing prompt
        updatedPrompts = displayData.prompts.map(p =>
          p.prompt_id === editedPrompt.prompt_id ? editedPrompt : p
        )
      }

      const newPromptsData: BasePrompts = {
        ...displayData,
        prompts: updatedPrompts,
        data_atualizacao: new Date().toISOString()
      }

      try {
        // Save to backend
        await updatePrompts(newPromptsData)

        // Update local state after successful save
        setPromptsData(newPromptsData)
        setEditingPromptId(null)
        setEditedPrompt(null)
        setHasUnsavedChanges(false)
        setIsCreatingNew(false)

        alert('Prompts salvos com sucesso!')
      } catch (error) {
        console.error('Erro ao salvar prompts:', error)
        alert('Erro ao salvar prompts. Verifique o console para mais detalhes.')
      }
    }
  }

  const handleCreateNew = () => {
    const newPrompt: PromptItem = {
      prompt_id: '',
      descricao: '',
      template: '',
      parametros: [],
      resposta_estruturada: false,
      estrutura_esperada: undefined,
      ultima_edicao: new Date().toISOString()
    }
    setEditedPrompt(newPrompt)
    setEditingPromptId('__new__')
    setIsCreatingNew(true)
    setHasUnsavedChanges(false)
  }

  const handleFieldChange = (field: keyof PromptItem, value: any) => {
    if (editedPrompt) {
      setEditedPrompt({
        ...editedPrompt,
        [field]: value
      })
      setHasUnsavedChanges(true)
    }
  }

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-gray-600 mt-4">Carregando prompts...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 text-3xl mb-4">
                ❌
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Erro ao carregar prompts
              </h1>
              <p className="text-red-600">{error}</p>
            </div>
            <Link
              to="/"
              className="block text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!displayData) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Voltar
          </Link>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-800">
              Editar Prompts
            </h1>
            {!isCreatingNew && !editingPromptId && (
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Prompt
              </button>
            )}
          </div>
          <p className="text-gray-600">
            {displayData.descricao}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Última atualização: {formatarData(displayData.data_atualizacao)}
          </p>
          <p className="text-sm text-gray-500">
            Marcador de parâmetros: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{displayData.marcador_de_paramentros}</span>
          </p>
        </div>

        {/* New Prompt Form */}
        {isCreatingNew && editedPrompt && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-2 border-green-500">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Criar Novo Prompt
                </h2>
                {hasUnsavedChanges && (
                  <span className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                    Campos preenchidos
                  </span>
                )}
              </div>

              {/* Prompt ID */}
              <div>
                <label htmlFor="prompt-id-input" className="block text-sm font-medium text-gray-700 mb-2">
                  ID do Prompt <span className="text-red-500">*</span>
                </label>
                <input
                  id="prompt-id-input"
                  type="text"
                  value={editedPrompt.prompt_id}
                  onChange={(e) => handleFieldChange('prompt_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ex: meu_novo_prompt"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Identificador único para este prompt (sem espaços)
                </p>
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="descricao-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="descricao-input"
                  value={editedPrompt.descricao}
                  onChange={(e) => handleFieldChange('descricao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={2}
                  placeholder="Descreva a finalidade deste prompt"
                />
              </div>

              {/* Template */}
              <div>
                <label htmlFor="template-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Template <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="template-input"
                  value={editedPrompt.template}
                  onChange={(e) => handleFieldChange('template', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                  rows={6}
                  placeholder="Digite o template do prompt. Use {{parametro}} para parâmetros."
                />
              </div>

              {/* Parâmetros */}
              <div>
                <label htmlFor="parametros-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Parâmetros (separados por vírgula)
                </label>
                <input
                  id="parametros-input"
                  type="text"
                  value={editedPrompt.parametros.join(', ')}
                  onChange={(e) => handleFieldChange('parametros', e.target.value.split(',').map(p => p.trim()).filter(p => p))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ex: idioma, texto, numero"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Liste os parâmetros usados no template
                </p>
              </div>

              {/* Resposta Estruturada */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="resposta-estruturada"
                  checked={editedPrompt.resposta_estruturada}
                  onChange={(e) => handleFieldChange('resposta_estruturada', e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="resposta-estruturada" className="text-sm font-medium text-gray-700">
                  Espera resposta estruturada (JSON)
                </label>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  disabled={!editedPrompt.prompt_id || !editedPrompt.descricao || !editedPrompt.template}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Criar Prompt
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prompts List */}
        <div className="space-y-6">
          {displayData.prompts.map((prompt) => (
            <div
              key={prompt.prompt_id}
              className="bg-white rounded-xl shadow-md p-6"
            >
              {editingPromptId === prompt.prompt_id && editedPrompt ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      Editando: {prompt.prompt_id}
                    </h2>
                    {hasUnsavedChanges && (
                      <span className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                        Alterações não salvas
                      </span>
                    )}
                  </div>

                  {/* Descrição */}
                  <div>
                    <label htmlFor="descricao-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      id="descricao-input"
                      value={editedPrompt.descricao}
                      onChange={(e) => handleFieldChange('descricao', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                    />
                  </div>

                  {/* Template */}
                  <div>
                    <label htmlFor="template-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Template
                    </label>
                    <textarea
                      id="template-input"
                      value={editedPrompt.template}
                      onChange={(e) => handleFieldChange('template', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      rows={4}
                    />
                  </div>

                  {/* Parâmetros */}
                  <div>
                    <label htmlFor="parametros-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Parâmetros (separados por vírgula)
                    </label>
                    <input
                      id="parametros-input"
                      type="text"
                      value={editedPrompt.parametros.join(', ')}
                      onChange={(e) => handleFieldChange('parametros', e.target.value.split(',').map(p => p.trim()))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Resposta Estruturada */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="resposta-estruturada"
                      checked={editedPrompt.resposta_estruturada}
                      onChange={(e) => handleFieldChange('resposta_estruturada', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="resposta-estruturada" className="text-sm font-medium text-gray-700">
                      Espera resposta estruturada (JSON)
                    </label>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Salvar Alterações
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">
                        {prompt.prompt_id}
                      </h2>
                      <p className="text-gray-600 mb-3">{prompt.descricao}</p>
                    </div>
                    <button
                      onClick={() => handleEdit(prompt)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Editar
                    </button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Template:</p>
                    <p className="font-mono text-sm text-gray-800 whitespace-pre-wrap">{prompt.template}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Parâmetros:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {prompt.parametros.map((param, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                            {param}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Resposta estruturada:</p>
                      <p className={`mt-1 ${prompt.resposta_estruturada ? 'text-green-600' : 'text-gray-600'}`}>
                        {prompt.resposta_estruturada ? 'Sim' : 'Não'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Última edição: {formatarData(prompt.ultima_edicao)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PromptsPage
