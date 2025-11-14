import { Link } from 'react-router-dom'

function Home() {
  const features = [
    {
      title: 'Editar Prompts',
      description: 'Gerenciar e editar os prompts da aplicação',
      path: '/editar-prompts',
      icon: '📝',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Mudar Base de Conhecimento',
      description: 'Adicionar e modificar palavras e frases',
      path: '/mudar-base-conhecimento',
      icon: '📚',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Navegar no Histórico',
      description: 'Visualizar histórico de exercícios praticados',
      path: '/navegar-historico',
      icon: '📊',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Editar Frases do Diálogo',
      description: 'Configurar frases de saudação e despedida',
      path: '/editar-frases-dialogo',
      icon: '💬',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Estudo de Idiomas
          </h1>
          <p className="text-xl text-gray-600">
            Gerencie sua plataforma de aprendizado de idiomas
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.path}
              to={feature.path}
              className="group block"
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 h-full transform hover:-translate-y-1">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} text-white text-3xl mb-4`}>
                  {feature.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h2>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Aplicação de Estudo de Idiomas v1.0.0</p>
        </footer>
      </div>
    </div>
  )
}

export default Home
