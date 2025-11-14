import { Routes, Route } from 'react-router-dom'
import { DataProvider } from './contexts/DataContext'
import Home from './pages/Home'
import NotImplemented from './pages/NotImplemented'
import HistoricoPage from './pages/HistoricoPage'
import PromptsPage from './pages/PromptsPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import DialogPhrasesPage from './pages/DialogPhrasesPage'

// Práticas
import PraticaTraducao from './pages/practices/PraticaTraducao'
import PraticaAudicao from './pages/practices/PraticaAudicao'
import PraticaPronuncia from './pages/practices/PraticaPronuncia'
import PraticaDialogo from './pages/practices/PraticaDialogo'
import PraticaNumeros from './pages/practices/PraticaNumeros'
import PraticaSubstantivos from './pages/practices/PraticaSubstantivos'

function App() {
  return (
    <DataProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Rotas de Práticas */}
          <Route path="/pratica-traducao" element={<PraticaTraducao />} />
          <Route path="/pratica-audicao" element={<PraticaAudicao />} />
          <Route path="/pratica-pronuncia" element={<PraticaPronuncia />} />
          <Route path="/pratica-dialogo" element={<PraticaDialogo />} />
          <Route path="/pratica-numeros" element={<PraticaNumeros />} />
          <Route path="/pratica-substantivos" element={<PraticaSubstantivos />} />

          {/* Rotas de Manutenção */}
          <Route path="/editar-prompts" element={<PromptsPage />} />
          <Route path="/mudar-base-conhecimento" element={<KnowledgeBasePage />} />
          <Route path="/navegar-historico" element={<HistoricoPage />} />
          <Route path="/editar-frases-dialogo" element={<DialogPhrasesPage />} />
        </Routes>
      </div>
    </DataProvider>
  )
}

export default App
