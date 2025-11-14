import { Link } from 'react-router-dom'

function Home() {
  const practices = [
    {
      title: 'Prática de Tradução',
      description: 'Pratique traduzindo textos entre idiomas',
      path: '/pratica-traducao',
      icon: '🔄',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Prática de Audição',
      description: 'Aprimore sua compreensão auditiva',
      path: '/pratica-audicao',
      icon: '🎧',
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Prática de Pronúncia',
      description: 'Melhore sua pronúncia e sotaque',
      path: '/pratica-pronuncia',
      icon: '🗣️',
      color: 'from-green-500 to-teal-600'
    },
    {
      title: 'Prática de Diálogo',
      description: 'Pratique conversações naturais',
      path: '/pratica-dialogo',
      icon: '💬',
      color: 'from-orange-500 to-red-600'
    },
    {
      title: 'Prática de Números',
      description: 'Aprenda números e quantidades',
      path: '/pratica-numeros',
      icon: '🔢',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      title: 'Prática de Substantivos',
      description: 'Domine substantivos e vocabulário',
      path: '/pratica-substantivos',
      icon: '📖',
      color: 'from-cyan-500 to-blue-600'
    }
  ]

  const maintenanceFeatures = [
    {
      title: 'Editar Prompts',
      description: 'Gerenciar e editar os prompts da aplicação',
      path: '/editar-prompts',
      icon: '📝'
    },
    {
      title: 'Mudar Base de Conhecimento',
      description: 'Adicionar e modificar palavras e frases',
      path: '/mudar-base-conhecimento',
      icon: '📚'
    },
    {
      title: 'Navegar no Histórico',
      description: 'Visualizar histórico de exercícios praticados',
      path: '/navegar-historico',
      icon: '📊'
    },
    {
      title: 'Editar Frases do Diálogo',
      description: 'Configurar frases de saudação e despedida',
      path: '/editar-frases-dialogo',
      icon: '💭'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Estudo de Idiomas
          </h1>
          <p className="text-xl text-gray-600">
            Pratique e aprenda novos idiomas de forma interativa
          </p>
        </header>

        {/* Seção de Práticas - Destaque */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Práticas Interativas
            </h2>
            <p className="text-gray-600">
              Escolha uma prática para começar a aprender
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practices.map((practice) => (
              <Link
                key={practice.path}
                to={practice.path}
                className="group block"
              >
                <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 h-full transform hover:-translate-y-2 border-2 border-transparent hover:border-indigo-300">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${practice.color} text-white text-4xl mb-4 shadow-lg`}>
                    {practice.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors">
                    {practice.title}
                  </h3>
                  <p className="text-gray-600">
                    {practice.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Seção de Manutenção - Menor destaque */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Configurações e Manutenção
            </h2>
            <p className="text-sm text-gray-500">
              Gerencie a base de conhecimento e configurações da aplicação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {maintenanceFeatures.map((feature) => (
              <Link
                key={feature.path}
                to={feature.path}
                className="group block"
              >
                <div className="bg-gray-50 rounded-lg shadow hover:shadow-md transition-all duration-200 p-6 h-full hover:bg-white border border-gray-200">
                  <div className="text-3xl mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2 group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Aplicação de Estudo de Idiomas v1.0.0</p>
        </footer>
      </div>
    </div>
  )
}

export default Home
