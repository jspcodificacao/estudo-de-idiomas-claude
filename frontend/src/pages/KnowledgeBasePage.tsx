import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBaseConhecimento, ApiError } from '../services/api'
import type { ConhecimentoIdioma, IdiomaConhecimentoEnum, TipoConhecimentoEnum } from '../types/api'

function KnowledgeBasePage() {
  const [conhecimentos, setConhecimentos] = useState<ConhecimentoIdioma[]>([])
  const [filteredConhecimentos, setFilteredConhecimentos] = useState<ConhecimentoIdioma[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIdioma, setSelectedIdioma] = useState<IdiomaConhecimentoEnum | 'todos'>('todos')
  const [selectedTipo, setSelectedTipo] = useState<TipoConhecimentoEnum | 'todos'>('todos')

  useEffect(() => {
    async function carregarConhecimentos() {
      try {
        setLoading(true)
        setError(null)
        const data = await getBaseConhecimento()
        setConhecimentos(data)
        setFilteredConhecimentos(data)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`Erro ao carregar base de conhecimento: ${err.message}`)
        } else {
          setError('Erro desconhecido ao carregar base de conhecimento')
        }
      } finally {
        setLoading(false)
      }
    }

    carregarConhecimentos()
  }, [])

  useEffect(() => {
    let filtered = conhecimentos

    // Filter by language
    if (selectedIdioma !== 'todos') {
      filtered = filtered.filter(c => c.idioma === selectedIdioma)
    }

    // Filter by type
    if (selectedTipo !== 'todos') {
      filtered = filtered.filter(c => c.tipo_conhecimento === selectedTipo)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(c =>
        c.texto_original.toLowerCase().includes(searchLower) ||
        c.traducao.toLowerCase().includes(searchLower) ||
        c.transcricao_ipa?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredConhecimentos(filtered)
  }, [searchTerm, selectedIdioma, selectedTipo, conhecimentos])

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

  const getIdiomaLabel = (idioma: IdiomaConhecimentoEnum) => {
    return idioma === 'alemao' ? 'Alemão' : 'Inglês'
  }

  const getTipoLabel = (tipo: TipoConhecimentoEnum) => {
    return tipo === 'frase' ? 'Frase' : 'Palavra'
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
            <p className="text-gray-600 mt-4">Carregando base de conhecimento...</p>
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
                Erro ao carregar base de conhecimento
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Base de Conhecimento
          </h1>
          <p className="text-gray-600">
            Navegue e filtre a base de conhecimento de idiomas
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Texto, tradução ou IPA..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Language Filter */}
            <div>
              <label htmlFor="idioma" className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                id="idioma"
                value={selectedIdioma}
                onChange={(e) => setSelectedIdioma(e.target.value as IdiomaConhecimentoEnum | 'todos')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="alemao">Alemão</option>
                <option value="ingles">Inglês</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                id="tipo"
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value as TipoConhecimentoEnum | 'todos')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="frase">Frase</option>
                <option value="palavra">Palavra</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredConhecimentos.length} de {conhecimentos.length} registros
          </div>
        </div>

        {/* Knowledge Items List */}
        <div className="space-y-4">
          {filteredConhecimentos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-600">Nenhum registro encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            filteredConhecimentos.map((item) => (
              <div
                key={item.conhecimento_id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.idioma === 'alemao'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {getIdiomaLabel(item.idioma)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {getTipoLabel(item.tipo_conhecimento)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatarData(item.data_hora)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Texto Original</p>
                    <p className="text-lg font-semibold text-gray-900">{item.texto_original}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Tradução</p>
                    <p className="text-lg text-gray-900">{item.traducao}</p>
                  </div>
                </div>

                {(item.transcricao_ipa || item.divisao_silabica) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    {item.transcricao_ipa && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Transcrição IPA</p>
                        <p className="text-sm font-mono text-gray-900">{item.transcricao_ipa}</p>
                      </div>
                    )}
                    {item.divisao_silabica && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Divisão Silábica</p>
                        <p className="text-sm text-gray-900">{item.divisao_silabica}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default KnowledgeBasePage
