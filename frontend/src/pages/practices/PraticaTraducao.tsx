import { Link } from 'react-router-dom'

export default function PraticaTraducao() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Voltar
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Prática de Tradução
            </h1>

            <div className="mt-12 p-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <svg
                className="mx-auto h-16 w-16 text-yellow-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>

              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Funcionalidade ainda não implementada!
              </h2>

              <p className="text-gray-600">
                A prática de tradução estará disponível em breve.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
