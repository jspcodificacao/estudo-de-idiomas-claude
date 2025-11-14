# Testar o Frontend da Aplicação de Estudo de Idiomas

Este documento fornece instruções detalhadas para configurar e executar testes no frontend da aplicação.

## Visão Geral de Testes

Para garantir a qualidade do frontend, recomenda-se implementar três tipos de testes:

1. **Testes Unitários** - Testam componentes isolados
2. **Testes de Integração** - Testam interação entre componentes
3. **Testes E2E (End-to-End)** - Testam fluxos completos da aplicação

## Ferramentas Recomendadas

- **Vitest** - Framework de testes (alternativa ao Jest, otimizado para Vite)
- **React Testing Library** - Testes de componentes React
- **jsdom** - Simulação do DOM
- **Playwright** ou **Cypress** - Testes E2E (opcional)

## Parte 1: Configurar Testes Unitários e de Integração

### Passo 1: Instalar Dependências de Teste

Navegue até a pasta `frontend` e instale as dependências:

```bash
cd frontend
npm install --save-dev vitest @vitest/ui jsdom
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Passo 2: Configurar Vitest

Crie o arquivo `vitest.config.ts` na pasta `frontend`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
})
```

### Passo 3: Criar Arquivo de Setup

Crie a pasta e arquivo `src/test/setup.ts`:

```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Executar cleanup após cada teste
afterEach(() => {
  cleanup()
})
```

### Passo 4: Atualizar package.json

Adicione os scripts de teste ao `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Passo 5: Criar Testes de Exemplo

### Teste do Componente Home

Crie o arquivo `src/pages/Home.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from './Home'

describe('Home Component', () => {
  it('deve renderizar o título da aplicação', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Estudo de Idiomas')).toBeInTheDocument()
  })

  it('deve renderizar os 4 cards de funcionalidades', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
    expect(screen.getByText('Mudar Base de Conhecimento')).toBeInTheDocument()
    expect(screen.getByText('Navegar no Histórico')).toBeInTheDocument()
    expect(screen.getByText('Editar Frases do Diálogo')).toBeInTheDocument()
  })

  it('deve renderizar os ícones dos cards', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    // Verificar se os ícones estão presentes
    expect(screen.getByText('📝')).toBeInTheDocument()
    expect(screen.getByText('📚')).toBeInTheDocument()
    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('💬')).toBeInTheDocument()
  })

  it('deve ter links funcionais para cada funcionalidade', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)
  })
})
```

### Teste do Componente NotImplemented

Crie o arquivo `src/pages/NotImplemented.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NotImplemented from './NotImplemented'

describe('NotImplemented Component', () => {
  it('deve renderizar a mensagem de funcionalidade não implementada', () => {
    render(
      <BrowserRouter>
        <NotImplemented feature="Teste" />
      </BrowserRouter>
    )

    expect(screen.getByText('Funcionalidade não implementada')).toBeInTheDocument()
  })

  it('deve renderizar o nome da funcionalidade', () => {
    render(
      <BrowserRouter>
        <NotImplemented feature="Editar Prompts" />
      </BrowserRouter>
    )

    expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
  })

  it('deve renderizar o ícone de construção', () => {
    render(
      <BrowserRouter>
        <NotImplemented feature="Teste" />
      </BrowserRouter>
    )

    expect(screen.getByText('🚧')).toBeInTheDocument()
  })

  it('deve ter um botão para voltar à página inicial', () => {
    render(
      <BrowserRouter>
        <NotImplemented feature="Teste" />
      </BrowserRouter>
    )

    const backButton = screen.getByText(/voltar para a página inicial/i)
    expect(backButton).toBeInTheDocument()
  })
})
```

### Teste do Componente App

Crie o arquivo `src/App.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App Component', () => {
  it('deve renderizar a página Home na rota raiz', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Estudo de Idiomas')).toBeInTheDocument()
  })

  it('deve renderizar NotImplemented na rota /editar-prompts', () => {
    render(
      <MemoryRouter initialEntries={['/editar-prompts']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Funcionalidade não implementada')).toBeInTheDocument()
    expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
  })

  it('deve renderizar NotImplemented na rota /mudar-base-conhecimento', () => {
    render(
      <MemoryRouter initialEntries={['/mudar-base-conhecimento']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Mudar Base de Conhecimento')).toBeInTheDocument()
  })

  it('deve renderizar NotImplemented na rota /navegar-historico', () => {
    render(
      <MemoryRouter initialEntries={['/navegar-historico']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Navegar no Histórico')).toBeInTheDocument()
  })

  it('deve renderizar NotImplemented na rota /editar-frases-dialogo', () => {
    render(
      <MemoryRouter initialEntries={['/editar-frases-dialogo']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Editar Frases do Diálogo')).toBeInTheDocument()
  })
})
```

## Passo 6: Executar os Testes

### Executar Todos os Testes

```bash
npm test
```

### Executar Testes em Modo Watch

Os testes rodam automaticamente quando arquivos mudam:

```bash
npm test
```

### Executar Testes com Interface Gráfica

```bash
npm run test:ui
```

Abre uma interface web interativa em `http://localhost:51204/`

### Executar Testes com Cobertura

```bash
npm run test:coverage
```

Gera relatório em `coverage/index.html`

### Executar Testes Específicos

```bash
# Executar apenas testes de Home
npx vitest run src/pages/Home.test.tsx

# Executar apenas testes de NotImplemented
npx vitest run src/pages/NotImplemented.test.tsx

# Executar testes por padrão
npx vitest run --grep "renderizar"
```

## Passo 7: Testes de Interação do Usuário

Adicione testes de interação usando `@testing-library/user-event`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Home from './Home'

describe('Home - Interações do Usuário', () => {
  it('deve navegar ao clicar no card de Editar Prompts', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    const editarPromptsCard = screen.getByText('Editar Prompts')
    await user.click(editarPromptsCard)

    // Verificar navegação (em app real)
  })
})
```

## Passo 8: Mocks e Fixtures

### Criar Mocks de API

Crie `src/test/mocks/api.ts`:

```typescript
export const mockConhecimentos = [
  {
    conhecimento_id: '123e4567-e89b-12d3-a456-426614174000',
    data_hora: '2024-01-01T10:00:00Z',
    idioma: 'alemao',
    tipo_conhecimento: 'palavra',
    texto_original: 'Hallo',
    transcricao_ipa: 'haˈloː',
    traducao: 'Olá',
    divisao_silabica: 'Hal-lo'
  }
]

export const mockPrompts = {
  descricao: 'Base de prompts para testes',
  data_atualizacao: '2024-01-01T10:00:00Z',
  marcador_de_paramentros: '{{}}',
  prompts: [
    {
      prompt_id: 'test_001',
      descricao: 'Prompt de teste',
      template: 'Teste {{param}}',
      parametros: ['param'],
      resposta_estruturada: false,
      ultima_edicao: '2024-01-01T10:00:00Z'
    }
  ]
}
```

### Usar Mocks nos Testes

```typescript
import { vi } from 'vitest'
import { mockConhecimentos } from '../test/mocks/api'

// Mock de fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockConhecimentos),
  })
) as any
```

## Parte 2: Testes End-to-End (E2E) - Opcional

### Opção A: Usar Playwright

#### Instalar Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

#### Configurar Playwright

Crie `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

#### Criar Teste E2E

Crie `e2e/home.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Página Inicial', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Estudo de Idiomas')).toBeVisible()
  })

  test('deve navegar para Editar Prompts', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Editar Prompts')
    await expect(page.getByText('Funcionalidade não implementada')).toBeVisible()
  })

  test('deve ter 4 cards de funcionalidades', async ({ page }) => {
    await page.goto('/')
    const cards = await page.locator('.group').count()
    expect(cards).toBe(4)
  })
})
```

#### Executar Testes E2E

```bash
npx playwright test
npx playwright test --ui
npx playwright show-report
```

### Opção B: Usar Cypress

#### Instalar Cypress

```bash
npm install --save-dev cypress
```

#### Inicializar Cypress

```bash
npx cypress open
```

#### Criar Teste Cypress

Crie `cypress/e2e/home.cy.ts`:

```typescript
describe('Página Inicial', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('deve carregar a página inicial', () => {
    cy.contains('Estudo de Idiomas').should('be.visible')
  })

  it('deve navegar para Editar Prompts', () => {
    cy.contains('Editar Prompts').click()
    cy.contains('Funcionalidade não implementada').should('be.visible')
  })

  it('deve ter 4 cards de funcionalidades', () => {
    cy.get('.group').should('have.length', 4)
  })
})
```

## Estrutura de Testes Recomendada

```
frontend/
├── src/
│   ├── test/
│   │   ├── setup.ts           # Setup global
│   │   └── mocks/
│   │       └── api.ts         # Mocks de API
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Home.test.tsx
│   │   ├── NotImplemented.tsx
│   │   └── NotImplemented.test.tsx
│   ├── App.tsx
│   └── App.test.tsx
├── e2e/                       # Testes E2E (Playwright)
│   └── home.spec.ts
├── cypress/                   # Testes E2E (Cypress)
│   └── e2e/
│       └── home.cy.ts
├── vitest.config.ts
└── playwright.config.ts       # ou cypress.config.ts
```

## Comandos Úteis

```bash
# Testes unitários
npm test                       # Executar todos os testes
npm run test:ui               # Interface gráfica
npm run test:coverage         # Relatório de cobertura

# Testes E2E (Playwright)
npx playwright test           # Executar testes E2E
npx playwright test --ui      # Interface gráfica
npx playwright show-report    # Ver relatório

# Testes E2E (Cypress)
npx cypress open              # Interface gráfica
npx cypress run               # Executar no terminal
```

## Métricas de Qualidade

**Objetivos:**
- **Cobertura de código:** ≥ 80%
- **Tempo de execução:** < 10 segundos para testes unitários
- **Taxa de sucesso:** 100%

## Boas Práticas

### 1. Testar Comportamento, Não Implementação

❌ **Ruim:**
```typescript
expect(wrapper.find('.card').length).toBe(4)
```

✅ **Bom:**
```typescript
expect(screen.getByText('Editar Prompts')).toBeInTheDocument()
```

### 2. Usar Queries Semânticas

❌ **Ruim:**
```typescript
screen.getByTestId('edit-button')
```

✅ **Bom:**
```typescript
screen.getByRole('button', { name: 'Editar' })
```

### 3. Evitar Testes Frágeis

❌ **Ruim:**
```typescript
expect(element.className).toContain('bg-blue-500')
```

✅ **Bom:**
```typescript
expect(element).toHaveStyle({ backgroundColor: 'rgb(59, 130, 246)' })
```

### 4. Manter Testes Independentes

Cada teste deve ser executável independentemente.

### 5. Usar Fixtures e Mocks

Evite duplicação de dados de teste.

## Solução de Problemas

### Erro: "Cannot find module '@testing-library/react'"

**Solução:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### Erro: "ReferenceError: test is not defined"

**Solução:**
Adicione `globals: true` no `vitest.config.ts`

### Erro: "Document is not defined"

**Solução:**
Verifique se `environment: 'jsdom'` está no `vitest.config.ts`

### Testes falhando após mudanças no CSS

**Solução:**
Use queries semânticas ao invés de classes CSS.

## Integração Contínua

### GitHub Actions

Crie `.github/workflows/test.yml`:

```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Run tests
        run: |
          cd frontend
          npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Recursos Adicionais

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Cypress Documentation](https://www.cypress.io/)

## Próximos Passos

1. Implemente os testes sugeridos
2. Execute os testes regularmente
3. Adicione testes ao implementar novas funcionalidades
4. Configure CI/CD para executar testes automaticamente
5. Monitore a cobertura de código

## Suporte

Para mais informações sobre como iniciar o frontend, consulte `iniciar_frontend.md`.
