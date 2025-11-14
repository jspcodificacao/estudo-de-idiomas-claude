import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFrasesDialogo, ApiError } from '../services/api'
import type { FrasesDialogo } from '../types/api'

function DialogPhrasesPage() {
  const [frasesData, setFrasesData] = useState<FrasesDialogo | null>(null)
  const [editedFrases, setEditedFrases] = useState<FrasesDialogo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    async function carregarFrases() {
      try {
        setLoading(true)
        setError(null)
        const data = await getFrasesDialogo()
        setFrasesData(data)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`Erro ao carregar frases do diálogo: ${err.message}`)
        } else {
          setError('Erro desconhecido ao carregar frases do diálogo')
        }
      } finally {
        setLoading(false)
      }
    }

    carregarFrases()
  }, [])

  const handleEdit = () => {
    if (frasesData) {
      setEditedFrases({ ...frasesData })
      setIsEditing(true)
      setHasUnsavedChanges(false)
    }
  }

  const handleCancel = () => {
    setEditedFrases(null)
    setIsEditing(false)
    setHasUnsavedChanges(false)
  }

  const handleSave = () => {
    if (editedFrases) {
      setFrasesData(editedFrases)
      setIsEditing(false)
      setHasUnsavedChanges(false)
      // TODO: Add API call to save to backend when endpoint is available
    }
  }

  const handleFieldChange = (field: 'saudacao' | 'despedida', value: string) => {
    if (editedFrases) {
      setEditedFrases({
        ...editedFrases,
        [field]: value
      })
      setHasUnsavedChanges(true)
    }
  }

  const handleIntermediariasChange = (index: number, value: string) => {
    if (editedFrases) {
      const newIntermediarias = [...editedFrases.intermediarias]
      newIntermediarias[index] = value
      setEditedFrases({
        ...editedFrases,
        intermediarias: newIntermediarias
      })
      setHasUnsavedChanges(true)
    }
  }

  const handleAddIntermediaria = () => {
    if (editedFrases) {
      setEditedFrases({
        ...editedFrases,
        intermediarias: [...editedFrases.intermediarias, '']
      })
      setHasUnsavedChanges(true)
    }
  }

  const handleRemoveIntermediaria = (index: number) => {
    if (editedFrases && editedFrases.intermediarias.length > 1) {
      const newIntermediarias = editedFrases.intermediarias.filter((_, i) => i !== index)
      setEditedFrases({
        ...editedFrases,
        intermediarias: newIntermediarias
      })
      setHasUnsavedChanges(true)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-gray-600 mt-4">Carregando frases do diálogo...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 text-3xl mb-4">
                ❌
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Erro ao carregar frases do diálogo
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

  if (!frasesData) {
    return null
  }

  const displayData = isEditing ? editedFrases : frasesData

  if (!displayData) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Voltar
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Frases do Diálogo
              </h1>
              <p className="text-gray-600">
                Configure as frases usadas nos diálogos de prática
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                Editar
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {hasUnsavedChanges && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                Alterações não salvas
              </p>
            </div>
          )}

          {/* Saudação */}
          <div className="mb-6">
            <label htmlFor="saudacao" className="block text-sm font-medium text-gray-700 mb-2">
              Saudação (Greeting)
            </label>
            {isEditing ? (
              <input
                id="saudacao"
                type="text"
                value={displayData.saudacao}
                onChange={(e) => handleFieldChange('saudacao', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite a frase de saudação"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-900">{displayData.saudacao}</p>
              </div>
            )}
          </div>

          {/* Despedida */}
          <div className="mb-6">
            <label htmlFor="despedida" className="block text-sm font-medium text-gray-700 mb-2">
              Despedida (Farewell)
            </label>
            {isEditing ? (
              <input
                id="despedida"
                type="text"
                value={displayData.despedida}
                onChange={(e) => handleFieldChange('despedida', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite a frase de despedida"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-900">{displayData.despedida}</p>
              </div>
            )}
          </div>

          {/* Intermediárias */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Frases Intermediárias (Intermediate Phrases)
              </label>
              {isEditing && (
                <button
                  onClick={handleAddIntermediaria}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  + Adicionar
                </button>
              )}
            </div>
            <div className="space-y-3">
              {displayData.intermediarias.map((frase, index) => (
                <div key={index} className="flex gap-2">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={frase}
                        onChange={(e) => handleIntermediariasChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Frase intermediária ${index + 1}`}
                      />
                      {displayData.intermediarias.length > 1 && (
                        <button
                          onClick={() => handleRemoveIntermediaria(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          aria-label={`Remover frase ${index + 1}`}
                        >
                          ✕
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">
                        <span className="text-gray-500 mr-2">{index + 1}.</span>
                        {frase}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
              >
                Salvar Alterações
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DialogPhrasesPage
