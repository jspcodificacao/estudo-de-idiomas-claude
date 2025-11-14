import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NotImplemented from './pages/NotImplemented'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editar-prompts" element={<NotImplemented feature="Editar Prompts" />} />
        <Route path="/mudar-base-conhecimento" element={<NotImplemented feature="Mudar Base de Conhecimento" />} />
        <Route path="/navegar-historico" element={<NotImplemented feature="Navegar no Histórico" />} />
        <Route path="/editar-frases-dialogo" element={<NotImplemented feature="Editar Frases do Diálogo" />} />
      </Routes>
    </div>
  )
}

export default App
