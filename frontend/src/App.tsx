import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NotImplemented from './pages/NotImplemented'
import HistoricoPage from './pages/HistoricoPage'
import PromptsPage from './pages/PromptsPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import DialogPhrasesPage from './pages/DialogPhrasesPage'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editar-prompts" element={<PromptsPage />} />
        <Route path="/mudar-base-conhecimento" element={<KnowledgeBasePage />} />
        <Route path="/navegar-historico" element={<HistoricoPage />} />
        <Route path="/editar-frases-dialogo" element={<DialogPhrasesPage />} />
      </Routes>
    </div>
  )
}

export default App
