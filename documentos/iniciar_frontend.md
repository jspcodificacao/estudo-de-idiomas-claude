# Iniciar o Frontend da Aplicação de Estudo de Idiomas

Este documento fornece instruções detalhadas para configurar e iniciar a aplicação web frontend.

## Pré-requisitos

- Node.js 18 ou superior
- npm (gerenciador de pacotes Node.js) ou yarn
- Acesso ao diretório raiz do projeto
- Backend em execução (opcional, mas recomendado)

## Estrutura do Frontend

```
frontend/
├── src/
│   ├── App.tsx              # Componente principal com rotas
│   ├── main.tsx            # Ponto de entrada da aplicação
│   ├── index.css           # Estilos globais com Tailwind
│   ├── pages/
│   │   ├── Home.tsx        # Página inicial
│   │   └── NotImplemented.tsx  # Página de funcionalidade não implementada
│   └── vite-env.d.ts       # Tipos do Vite
├── index.html              # HTML principal
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração TypeScript
├── vite.config.ts          # Configuração Vite com porta dinâmica
├── tailwind.config.js      # Configuração Tailwind CSS
├── postcss.config.js       # Configuração PostCSS
└── README.md               # Documentação do frontend
```

## Passo 1: Verificar Variáveis de Ambiente

O frontend utiliza variáveis de ambiente definidas no arquivo `.env` na raiz do projeto.

**Arquivo `.env` (na raiz do projeto):**
```env
BACKEND_PORT=3010
FRONTEND_PORT=5173
```

- `FRONTEND_PORT`: Porta onde o servidor de desenvolvimento será executado (padrão: 5173)

Se o arquivo `.env` não existir, crie-o com o conteúdo acima.

**Importante:** O Vite carrega variáveis do arquivo `.env` na raiz do projeto através da configuração `envDir: '../'` no arquivo `vite.config.ts`.

## Passo 2: Verificar Node.js e npm

Verifique se o Node.js e npm estão instalados:

```bash
node --version
# Deve mostrar v18.x.x ou superior

npm --version
# Deve mostrar 9.x.x ou superior
```

Se não estiverem instalados, baixe em: https://nodejs.org/

## Passo 3: Instalar Dependências

Navegue até a pasta `frontend` e instale as dependências:

```bash
cd frontend
npm install
```

### Dependências Principais Instaladas:

**Produção:**
- `react@^18.2.0` - Biblioteca UI
- `react-dom@^18.2.0` - React DOM
- `react-router-dom@^6.20.0` - Roteamento

**Desenvolvimento:**
- `vite@^5.0.8` - Build tool e dev server
- `typescript@^5.2.2` - Tipagem estática
- `@vitejs/plugin-react@^4.2.1` - Plugin React para Vite
- `tailwindcss@^3.3.6` - Framework CSS
- `autoprefixer@^10.4.16` - Prefixos CSS automáticos
- `postcss@^8.4.32` - Processamento CSS
- `eslint@^8.55.0` - Linter JavaScript/TypeScript
- `@types/react@^18.2.43` - Tipos TypeScript para React
- `@types/react-dom@^18.2.17` - Tipos TypeScript para React DOM

### Solução de Problemas na Instalação

Se houver erros durante a instalação:

```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

## Passo 4: Executar em Modo de Desenvolvimento

Existem várias formas de iniciar o servidor de desenvolvimento:

### Opção 1: Usando npm (Recomendado)

```bash
npm run dev
```

Este comando irá:
- Iniciar o servidor Vite
- Habilitar Hot Module Replacement (HMR)
- Abrir automaticamente no navegador (opcional)
- Usar a porta definida em `FRONTEND_PORT` (5173)

### Opção 2: Usando Vite diretamente

```bash
npx vite
```

### Opção 3: Especificando porta manualmente

```bash
npx vite --port 5173
```

### Saída Esperada

Após executar o comando, você verá algo similar a:

```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h to show help
```

## Passo 5: Acessar a Aplicação

Abra o navegador e acesse:

```
http://localhost:5173/
```

### Tela Inicial

Você verá a página inicial com 4 cards de funcionalidades:

1. **📝 Editar Prompts**
   - Descrição: "Gerenciar e editar os prompts da aplicação"
   - Ao clicar: mostra mensagem "Funcionalidade não implementada"

2. **📚 Mudar Base de Conhecimento**
   - Descrição: "Adicionar e modificar palavras e frases"
   - Ao clicar: mostra mensagem "Funcionalidade não implementada"

3. **📊 Navegar no Histórico**
   - Descrição: "Visualizar histórico de exercícios praticados"
   - Ao clicar: mostra mensagem "Funcionalidade não implementada"

4. **💬 Editar Frases do Diálogo**
   - Descrição: "Configurar frases de saudação e despedida"
   - Ao clicar: mostra mensagem "Funcionalidade não implementada"

## Passo 6: Hot Module Replacement (HMR)

O Vite possui HMR ativado por padrão. Isso significa que:
- Alterações no código são refletidas instantaneamente no navegador
- Não é necessário recarregar a página manualmente
- O estado da aplicação é preservado

**Teste o HMR:**
1. Abra `src/pages/Home.tsx`
2. Altere o título "Estudo de Idiomas"
3. Salve o arquivo
4. Veja a mudança instantânea no navegador

## Passo 7: Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Este comando irá:
- Compilar TypeScript
- Otimizar e minificar o código
- Gerar arquivos estáticos na pasta `dist/`

### Saída Esperada

```
vite v5.0.8 building for production...
✓ 234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-abc123.css      1.23 kB │ gzip:  0.45 kB
dist/assets/index-def456.js      75.45 kB │ gzip: 24.12 kB
✓ built in 3.45s
```

### Preview da Build de Produção

Para visualizar a build de produção localmente:

```bash
npm run preview
```

Acesse: `http://localhost:4173/`

## Passo 8: Rotas Disponíveis

A aplicação possui as seguintes rotas:

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Home | Tela inicial com links |
| `/editar-prompts` | NotImplemented | Funcionalidade não implementada |
| `/mudar-base-conhecimento` | NotImplemented | Funcionalidade não implementada |
| `/navegar-historico` | NotImplemented | Funcionalidade não implementada |
| `/editar-frases-dialogo` | NotImplemented | Funcionalidade não implementada |

## Passo 9: Conectar com o Backend

Para conectar o frontend com o backend:

1. **Inicie o backend primeiro:**
   ```bash
   cd backend
   python main.py
   ```
   O backend estará em: `http://localhost:3010`

2. **Configure a URL da API no frontend:**

   Crie um arquivo de configuração em `src/config.ts`:
   ```typescript
   export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3010'
   ```

3. **Adicione a variável ao .env:**
   ```env
   VITE_BACKEND_URL=http://localhost:3010
   ```

4. **Use a configuração nos componentes:**
   ```typescript
   import { API_BASE_URL } from './config'

   fetch(`${API_BASE_URL}/api/base_de_conhecimento`)
   ```

**Nota:** Variáveis de ambiente no Vite devem começar com `VITE_` para serem expostas ao código do cliente.

## Passo 10: Scripts Disponíveis

No arquivo `package.json`, os seguintes scripts estão disponíveis:

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Criar build de produção
npm run build

# Visualizar build de produção
npm run preview

# Executar linter
npm run lint
```

## Solução de Problemas

### Erro: "Port 5173 is already in use"

**Problema:** A porta 5173 já está sendo usada.

**Solução 1:** Encerre o processo que está usando a porta.

**Solução 2:** Altere a porta no `.env`:
```env
FRONTEND_PORT=5174
```

**Solução 3:** Especifique porta manualmente:
```bash
npx vite --port 5174
```

### Erro: "Cannot find module"

**Problema:** Dependências não foram instaladas.

**Solução:**
```bash
npm install
```

### Erro: "Tailwind CSS not working"

**Problema:** Classes Tailwind não estão sendo aplicadas.

**Solução:**
1. Verifique se `@tailwind` está em `src/index.css`
2. Verifique se `postcss.config.js` e `tailwind.config.js` existem
3. Reinicie o servidor de desenvolvimento

### Erro: "TypeScript errors"

**Problema:** Erros de tipo no código.

**Solução:**
1. Verifique o código TypeScript
2. Execute: `npm run build` para ver todos os erros
3. Corrija os erros indicados

### Página em branco no navegador

**Problema:** A aplicação não carrega.

**Solução:**
1. Abra o console do navegador (F12)
2. Verifique se há erros JavaScript
3. Verifique se `index.html` possui `<div id="root">`
4. Verifique se `main.tsx` está sendo carregado

### Erro: "Failed to fetch dynamically imported module"

**Problema:** Módulos não estão sendo carregados corretamente.

**Solução:**
1. Limpe o cache do navegador
2. Delete a pasta `node_modules/.vite`
3. Reinicie o servidor

## Desenvolvimento

### Estrutura de Componentes

```
src/
├── App.tsx              # Componente raiz com BrowserRouter
├── main.tsx            # Ponto de entrada
├── pages/
│   ├── Home.tsx        # Página inicial
│   └── NotImplemented.tsx  # Página padrão
```

### Adicionar Nova Página

1. **Crie o componente:**
   ```typescript
   // src/pages/MinhaFuncionalidade.tsx
   function MinhaFuncionalidade() {
     return (
       <div className="container mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold">Minha Funcionalidade</h1>
       </div>
     )
   }
   export default MinhaFuncionalidade
   ```

2. **Adicione a rota em App.tsx:**
   ```typescript
   import MinhaFuncionalidade from './pages/MinhaFuncionalidade'

   <Route path="/minha-funcionalidade" element={<MinhaFuncionalidade />} />
   ```

3. **Adicione o link em Home.tsx:**
   ```typescript
   <Link to="/minha-funcionalidade">Minha Funcionalidade</Link>
   ```

### Usar Tailwind CSS

Tailwind CSS está configurado e pronto para uso:

```typescript
<div className="bg-blue-500 text-white p-4 rounded-lg shadow-md hover:bg-blue-600">
  Meu componente estilizado
</div>
```

Consulte a documentação: https://tailwindcss.com/docs

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Executar linter
npm run lint

# Limpar cache
rm -rf node_modules/.vite

# Reinstalar tudo
rm -rf node_modules package-lock.json && npm install
```

## Tecnologias Utilizadas

- **Vite** - Build tool ultra-rápido
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento SPA
- **PostCSS** - Processamento CSS
- **ESLint** - Linter

## Recursos Adicionais

- [Documentação do Vite](https://vitejs.dev/)
- [Documentação do React](https://react.dev/)
- [Documentação do TypeScript](https://www.typescriptlang.org/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/)
- [Documentação do React Router](https://reactrouter.com/)

## Próximos Passos

Após iniciar o frontend com sucesso:
1. Explore as rotas disponíveis
2. Conecte com o backend
3. Implemente as funcionalidades planejadas
4. Execute os testes (consulte `testar_frontend.md`)

## Suporte

Para mais informações sobre testes, consulte o documento `testar_frontend.md`.
