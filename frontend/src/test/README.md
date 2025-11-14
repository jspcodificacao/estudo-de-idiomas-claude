# Testes do Frontend

Este diretório contém a configuração e utilitários para os testes do frontend.

## Arquivos

- **setup.ts** - Configuração global dos testes
  - Importa `@testing-library/jest-dom` para matchers personalizados
  - Configura cleanup automático após cada teste

## Estrutura de Testes

```
src/
├── test/
│   ├── setup.ts           # Setup global
│   └── README.md          # Esta documentação
├── pages/
│   ├── Home.tsx
│   ├── Home.test.tsx      # 8 testes
│   ├── NotImplemented.tsx
│   └── NotImplemented.test.tsx  # 7 testes
├── App.tsx
└── App.test.tsx           # 7 testes
```

## Total de Testes

**22 testes** distribuídos em 3 arquivos:
- Home.test.tsx: 8 testes
- NotImplemented.test.tsx: 7 testes
- App.test.tsx: 7 testes

## Executar Testes

```bash
# Executar todos os testes
npm test

# Executar com interface gráfica
npm run test:ui

# Executar com cobertura
npm run test:coverage
```

## Cobertura Esperada

Os testes cobrem:
- ✓ Renderização de componentes
- ✓ Textos e conteúdo
- ✓ Ícones e elementos visuais
- ✓ Links e navegação
- ✓ Rotas da aplicação
- ✓ Props dos componentes
- ✓ Estrutura HTML e classes CSS

## Ferramentas Utilizadas

- **Vitest** - Framework de testes
- **React Testing Library** - Testes de componentes React
- **jsdom** - Simulação do DOM
- **@testing-library/jest-dom** - Matchers customizados

## Adicionar Novos Testes

Para adicionar um novo teste:

1. Crie um arquivo `*.test.tsx` ao lado do componente
2. Importe as dependências necessárias:
   ```typescript
   import { describe, it, expect } from 'vitest'
   import { render, screen } from '@testing-library/react'
   import { BrowserRouter } from 'react-router-dom'
   ```
3. Escreva os testes usando o padrão AAA (Arrange, Act, Assert)

## Matchers Disponíveis

Graças ao `@testing-library/jest-dom`:
- `toBeInTheDocument()`
- `toHaveAttribute(attr, value)`
- `toHaveClass(className)`
- `toHaveStyle(styles)`
- `toBeVisible()`
- E muitos outros...

## Boas Práticas

1. Use queries semânticas (`getByRole`, `getByLabelText`)
2. Teste comportamento, não implementação
3. Evite testar detalhes de estilo
4. Mantenha testes simples e focados
5. Use `describe` para agrupar testes relacionados
