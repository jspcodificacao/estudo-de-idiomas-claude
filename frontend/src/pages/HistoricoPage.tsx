import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { IdiomaEnum, TipoPraticaEnum, type Exercicio } from '../types/api'

// Funções auxiliares para obter labels e ícones
function getTipoPraticaLabel(tipo: TipoPraticaEnum): string {
  const labels: Record<string, string> = {
    'traducao': 'Tradução',
    'audicao': 'Audição',
    'pronuncia': 'Pronúncia',
    'dialogo': 'Diálogo',
    'pronuncia_de_numeros': 'Pronúncia de Números'
  }
  return labels[tipo] || tipo
}

function getTipoPraticaIcon(tipo: TipoPraticaEnum): string {
  const icons: Record<string, string> = {
    'traducao': '📝',
    'audicao': '👂',
    'pronuncia': '🗣️',
    'dialogo': '💬',
    'pronuncia_de_numeros': '🔢'
  }
  return icons[tipo] || '📄'
}

function getIdiomaColor(idioma: IdiomaEnum): string {
  const colors: Record<string, string> = {
    'Inglês': 'bg-blue-100 text-blue-800',
    'Francês': 'bg-purple-100 text-purple-800',
    'Alemão': 'bg-yellow-100 text-yellow-800',
    'Espanhol': 'bg-red-100 text-red-800'
  }
  return colors[idioma] || 'bg-gray-100 text-gray-800'
}

function HistoricoPage() {
  const { historico, loading: dataLoading, errors: dataErrors } = useData()
  const [filtroIdioma, setFiltroIdioma] = useState<IdiomaEnum | 'todos'>('todos')
  const [filtroTipo, setFiltroTipo] = useState<TipoPraticaEnum | 'todos'>('todos')
  const [ordenacao, setOrdenacao] = useState<'recente' | 'antigo'>('recente')

  const loading = dataLoading.historico
  const error = dataErrors.historico
  const exercicios = historico?.exercicios || []

  // Filtrar e ordenar exercícios
  const exerciciosFiltrados = exercicios
    .filter(ex => filtroIdioma === 'todos' || ex.idioma === filtroIdioma)
    .filter(ex => filtroTipo === 'todos' || ex.tipo_pratica === filtroTipo)
    .sort((a, b) => {
      const dataA = new Date(a.data_hora).getTime()
      const dataB = new Date(b.data_hora).getTime()
      return ordenacao === 'recente' ? dataB - dataA : dataA - dataB
    })

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

  const obterResultadoTexto = (exercicio: Exercicio): string => {
    const resultado = exercicio.resultado_exercicio as any

    switch (exercicio.tipo_pratica) {
      case TipoPraticaEnum.Traducao:
        const acertos = resultado.campos_resultados?.filter((r: boolean) => r).length || 0
        const total = resultado.campos_resultados?.length || 0
        return `${acertos}/${total} acertos`

      case TipoPraticaEnum.Audicao:
        return resultado.correto ? 'Correto' : 'Incorreto'

      case TipoPraticaEnum.Pronuncia:
        return resultado.correto || 'Não avaliado'

      case TipoPraticaEnum.Dialogo:
        return resultado.correto || 'Não avaliado'

      case TipoPraticaEnum.PronunciaDeNumeros:
        return resultado.acertou ? 'Acertou' : 'Errou'

      default:
        return 'N/A'
    }
  }

  const obterCorResultado = (exercicio: Exercicio): string => {
    const resultado = exercicio.resultado_exercicio as any

    switch (exercicio.tipo_pratica) {
      case TipoPraticaEnum.Traducao:
        const acertos = resultado.campos_resultados?.filter((r: boolean) => r).length || 0
        const total = resultado.campos_resultados?.length || 0
        return acertos === total ? 'text-green-600' : acertos > 0 ? 'text-yellow-600' : 'text-red-600'

      case TipoPraticaEnum.Audicao:
      case TipoPraticaEnum.PronunciaDeNumeros:
        return resultado.correto || resultado.acertou ? 'text-green-600' : 'text-red-600'

      case TipoPraticaEnum.Pronuncia:
      case TipoPraticaEnum.Dialogo:
        const correto = resultado.correto
        return correto === 'Sim' ? 'text-green-600' : correto === 'Parcial' ? 'text-yellow-600' : 'text-red-600'

      default:
        return 'text-gray-600'
    }
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
            <p className="text-gray-600 mt-4">Carregando histórico de exercícios...</p>
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
                Erro ao carregar histórico
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
            Histórico de Exercícios
          </h1>
          <p className="text-gray-600">
            Total de {exerciciosFiltrados.length} exercício(s) encontrado(s)
          </p>
        </div>

        {/* Filtros e Ordenação */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros e Ordenação</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por Idioma */}
            <div>
              <label htmlFor="filtro-idioma" className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                id="filtro-idioma"
                value={filtroIdioma}
                onChange={(e) => setFiltroIdioma(e.target.value as IdiomaEnum | 'todos')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos os idiomas</option>
                {Object.values(IdiomaEnum).map(idioma => (
                  <option key={idioma} value={idioma}>{idioma}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Tipo */}
            <div>
              <label htmlFor="filtro-tipo" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Exercício
              </label>
              <select
                id="filtro-tipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as TipoPraticaEnum | 'todos')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos os tipos</option>
                {Object.values(TipoPraticaEnum).map((tipo) => (
                  <option key={tipo} value={tipo}>{getTipoPraticaLabel(tipo)}</option>
                ))}
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label htmlFor="ordenacao" className="block text-sm font-medium text-gray-700 mb-2">
                Ordenação
              </label>
              <select
                id="ordenacao"
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as 'recente' | 'antigo')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recente">Mais recente primeiro</option>
                <option value="antigo">Mais antigo primeiro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Exercícios */}
        {exerciciosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 text-3xl mb-4">
              📋
            </div>
            <p className="text-gray-600">Nenhum exercício encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exerciciosFiltrados.map((exercicio) => (
              <div
                key={exercicio.exercicio_id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Ícone do tipo */}
                    <div className="text-4xl">
                      {getTipoPraticaIcon(exercicio.tipo_pratica)}
                    </div>

                    {/* Informações do exercício */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {getTipoPraticaLabel(exercicio.tipo_pratica)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIdiomaColor(exercicio.idioma)}`}>
                          {exercicio.idioma}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Data:</span> {formatarData(exercicio.data_hora)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">ID do Conhecimento:</span>{' '}
                        <span className="font-mono text-xs">{exercicio.conhecimento_id}</span>
                      </p>
                    </div>
                  </div>

                  {/* Resultado */}
                  <div className="md:text-right">
                    <p className="text-sm text-gray-600 mb-1">Resultado</p>
                    <p className={`text-lg font-bold ${obterCorResultado(exercicio)}`}>
                      {obterResultadoTexto(exercicio)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoricoPage
