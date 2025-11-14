import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import PromptsPage from './PromptsPage'
import * as api from '../services/api'
import type { BasePrompts } from '../types/api'

// Mock do módulo de API
vi.mock('../services/api')

const mockPrompts: BasePrompts = {
  descricao: 'Uma coleção de prompts para tarefas de geração e manipulação de texto.',
  data_atualizacao: '2025-11-13T09:00:00Z',
  marcador_de_paramentros: '{{param}}',
  prompts: [
    {
      prompt_id: 'gerador_resumo_v1',
      descricao: 'Cria um resumo de um texto fornecido pelo usuário',
      template: 'Por favor, gere um resumo conciso do seguinte texto: "{{texto_completo}}".',
      parametros: ['texto_completo', 'numero_de_paragrafos'],
      resposta_estruturada: true,
      estrutura_esperada: {
        type: 'object',
        properties: {
          resumo_gerado: { type: 'string' }
        }
      },
      ultima_edicao: '2025-11-13T08:45:00Z'
    },
    {
      prompt_id: 'tradutor_texto_v2',
      descricao: 'Traduz um trecho de texto de um idioma de origem para um idioma de destino',
      template: 'Traduza o texto "{{texto_original}}" do idioma "{{idioma_origem}}" para o idioma "{{idioma_destino}}".',
      parametros: ['texto_original', 'idioma_origem', 'idioma_destino'],
      resposta_estruturada: false,
      ultima_edicao: '2025-10-28T14:20:00Z'
    }
  ]
}

function renderPromptsPage() {
  return render(
    <BrowserRouter>
      <PromptsPage />
    </BrowserRouter>
  )
}

describe('PromptsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve exibir estado de carregamento inicialmente', () => {
    vi.mocked(api.getPrompts).mockImplementation(() => new Promise(() => {}))

    renderPromptsPage()

    expect(screen.getByText(/Carregando prompts/i)).toBeInTheDocument()
  })

  it('deve carregar e exibir os prompts', async () => {
    vi.mocked(api.getPrompts).mockResolvedValueOnce(mockPrompts)

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })

    expect(screen.getByText(mockPrompts.descricao)).toBeInTheDocument()
    expect(screen.getByText('gerador_resumo_v1')).toBeInTheDocument()
    expect(screen.getByText('tradutor_texto_v2')).toBeInTheDocument()
  })

  it('deve exibir mensagem de erro quando falha ao carregar', async () => {
    const error = new api.ApiError('Erro de rede')
    vi.mocked(api.getPrompts).mockRejectedValueOnce(error)

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar prompts')).toBeInTheDocument()
    })

    expect(screen.getByText(/Erro ao carregar prompts:/i)).toBeInTheDocument()
  })

  it('deve exibir detalhes do prompt corretamente', async () => {
    vi.mocked(api.getPrompts).mockResolvedValueOnce(mockPrompts)

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })

    const prompt = mockPrompts.prompts[0]
    expect(screen.getByText(prompt.descricao)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(prompt.template.substring(0, 30)))).toBeInTheDocument()

    // Verifica parâmetros
    prompt.parametros.forEach(param => {
      expect(screen.getByText(param)).toBeInTheDocument()
    })
  })

  it('deve ativar modo de edição ao clicar em Editar', async () => {
    vi.mocked(api.getPrompts).mockResolvedValueOnce(mockPrompts)
    const user = userEvent.setup()

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: 'Editar' })
    await user.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Editando:/i)).toBeInTheDocument()
    })
  })

  it('deve permitir editar a descrição do prompt', async () => {
    vi.mocked(api.getPrompts).mockResolvedValueOnce(mockPrompts)
    const user = userEvent.setup()

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: 'Editar' })
    await user.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Editando:/i)).toBeInTheDocument()
    })

    const descricaoInput = screen.getByLabelText('Descrição')
    await user.clear(descricaoInput)
    await user.type(descricaoInput, 'Nova descrição do prompt')

    expect(descricaoInput).toHaveValue('Nova descrição do prompt')
    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()
  })

  it('deve permitir editar o template do prompt', async () => {
    vi.mocked(api.getPrompts).mockResolvedValueOnce(mockPrompts)
    const user = userEvent.setup()

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: 'Editar' })
    await user.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Editando:/i)).toBeInTheDocument()
    })

    const templateInput = screen.getByLabelText('Template')
    await user.clear(templateInput)
    await user.type(templateInput, 'Novo template: {{{{param1}}')

    expect(templateInput).toHaveValue('Novo template: {{param1}}')
  })

  it('deve permitir editar parâmetros do prompt', async () => {
    vi.mocked(api.getPrompts).mockResolvedValueOnce(mockPrompts)
    const user = userEvent.setup()

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: 'Editar' })
    await user.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Editando:/i)).toBeInTheDocument()
    })

    const parametrosInput = screen.getByLabelText(/Parâmetros/i)
    await user.clear(parametrosInput)
    await user.type(parametrosInput, 'param1, param2, param3')

    expect(parametrosInput).toHaveValue('param1, param2, param3')
  })

  it('deve permitir alternar resposta estruturada', async () => {
    vi.mocked(api.getPrompts).mockResolvedValueOnce(mockPrompts)
    const user = userEvent.setup()

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: 'Editar' })
    await user.click(editButtons[1]) // Segundo prompt tem resposta_estruturada: false

    await waitFor(() => {
      expect(screen.getByText(/Editando:/i)).toBeInTheDocument()
    })

    const checkbox = screen.getByLabelText(/Espera resposta estruturada/i)
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('deve salvar alterações e sair do modo de edição', async () => {
    vi.mocked(api.getPrompts).mockResolvedValueOnce(mockPrompts)
    const user = userEvent.setup()

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: 'Editar' })
    await user.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Editando:/i)).toBeInTheDocument()
    })

    const descricaoInput = screen.getByLabelText('Descrição')
    await user.clear(descricaoInput)
    await user.type(descricaoInput, 'Descrição alterada')

    const saveButton = screen.getByRole('button', { name: 'Salvar Alterações' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.queryByText(/Editando:/i)).not.toBeInTheDocument()
    })

    expect(screen.getByText('Descrição alterada')).toBeInTheDocument()
  })

  it('deve cancelar edição e descartar alterações', async () => {
    vi.mocked(api.getPrompts).mockResolvedValueOnce(mockPrompts)
    const user = userEvent.setup()

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })

    const originalDescricao = mockPrompts.prompts[0].descricao

    const editButtons = screen.getAllByRole('button', { name: 'Editar' })
    await user.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Editando:/i)).toBeInTheDocument()
    })

    const descricaoInput = screen.getByLabelText('Descrição')
    await user.clear(descricaoInput)
    await user.type(descricaoInput, 'Descrição temporária')

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText(/Editando:/i)).not.toBeInTheDocument()
    })

    // Verifica que a descrição original foi mantida
    expect(screen.getByText(originalDescricao)).toBeInTheDocument()
    expect(screen.queryByText('Descrição temporária')).not.toBeInTheDocument()
  })

  it('deve exibir marcador de parâmetros', async () => {
    vi.mocked(api.getPrompts).mockResolvedValueOnce(mockPrompts)

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })

    expect(screen.getByText('Marcador de parâmetros:')).toBeInTheDocument()
    expect(screen.getByText(mockPrompts.marcador_de_paramentros)).toBeInTheDocument()
  })

  it('deve formatar a data de atualização corretamente', async () => {
    vi.mocked(api.getPrompts).mockResolvedValueOnce(mockPrompts)

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })

    expect(screen.getByText(/Última atualização:/i)).toBeInTheDocument()
  })

  it('deve ter link para voltar à página inicial', async () => {
    vi.mocked(api.getPrompts).mockResolvedValueOnce(mockPrompts)

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })

    const voltarLink = screen.getByText('← Voltar')
    expect(voltarLink).toBeInTheDocument()
    expect(voltarLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('deve exibir indicador de resposta estruturada', async () => {
    vi.mocked(api.getPrompts).mockResolvedValueOnce(mockPrompts)

    renderPromptsPage()

    await waitFor(() => {
      expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    })

    const respostaEstruturadaLabels = screen.getAllByText('Resposta estruturada:')
    expect(respostaEstruturadaLabels.length).toBeGreaterThan(0)
  })
})
