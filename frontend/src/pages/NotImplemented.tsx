import { Link } from 'react-router-dom'

interface NotImplementedProps {
  feature: string
}

function NotImplemented({ feature }: NotImplementedProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100 text-yellow-600 text-5xl mb-4">
              🚧
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Funcionalidade não implementada
            </h1>
            <p className="text-xl text-gray-600">
              {feature}
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-gray-700">
              Esta funcionalidade está em desenvolvimento e estará disponível em breve.
            </p>
          </div>

          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotImplemented
