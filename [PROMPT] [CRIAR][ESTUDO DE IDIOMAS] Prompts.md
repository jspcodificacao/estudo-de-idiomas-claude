# REGRA00: Faça só o que o prompt pedir e nada mais. Se você achar que é oportuno criar código adicional, faça, apenas, a sugestão.

# REGRA01: Nunca altere, nem apague, *em hipótese alguma* arquivos de dados ou de schemas sem que tenha sido explicitamente solicitado. Antes de criar um arquivo de dados ou de schema, veja se ele já existe.

# REGRA03: Crie um repositório Git e use-o de forma a fazer rollback facilmente a cada mensagem do usuário.

---

# PROMPT00: Crie a estrutura de pastas abaixo
/frontend
/backend
/public
/documentos
.env 

Inclua a variável BACKEND_PORT=3010 em .env.

---

# Tarefa do usuário: Mover manualmente a base de dados para a pasta /public

---

# PROMPT01: Crie um código Python para validar arquivos JSON contra os schemas fornecidos.
Crie modelos Pydantic 2. Use a pasta /backend. 

## Arquivos JSON
Todos os dados e schemas da aplicação ficam na pasta /public E JÁ ESTÃO PREENCHIDOS. *Não os modifique*.
*Não os apague*. *Não os crie*.

### 1. Base de Conhecimento de Idioma 
Dados: /public/[BASE] Conhecimento de idiomas.json. Obrigatório e não vazio.
Schema: /public/[BASE][SCHEMA] Conhecimento de idiomas.json. Obrigatório e não vazio.

### 2. Base de Prompts
Dados: /public/[BASE] Prompts.json. Obrigatório e não vazio.
Schema: /public/[BASE][SCHEMA] Prompts.json. Obrigatório e não vazio.

### 3. Histórico de Prática de Exercícios
Dados: /public/[BASE] Histórico de prática.json. Pode não existir. Neste casso a aplicação inicia um novo histórico. Se existir, não pode estar vazio.
Schema: /public/[BASE][SCHEMA] Histórico de prática.json. Obrigatório e não vazio.

### 4. Frases do Diálogo
Dados: /public/[BASE] Frases do diálogo.json. Obrigatório e não vazio.
Schema: /public/[BASE][SCHEMA] Frases do diálogo.json. Obrigatório e não vazio.

---

# PROMPT02: Crie um servidor FastAPI com os endpoints para carregamento dos dados da aplicação.
A porta do servidor está definida na variávem de ambiente BACKEND_PORT. Todos os endpoints devolvem um JSON que reflete o modelo Pydantic 2.

## /api/base_de_conhecimento (GET)
Ler e validar /public/[BASE] Conhecimento de idiomas.json.

## /api/prompts (GET)
ler e validar /public/[BASE] Prompts.json

## /api/historico_de_pratica (GET)
ler e validar /public/[BASE] Histórico de prática.json

## /api/frases_do_dialogo (GET)
ler e validar /public/[BASE] Frases do diálogo.json

---

# PROMPT03: Crie casos de testes para a validação dos JSON e para os endpoints do servidor da aplicação.

---

# PROMPT04: Crie os documentos chamados iniciar_backend.md e testar_backend.md e coloque as instruções neles.

---

# PROMPT05: Crie na pasta /frontend uma aplicação web usando Vite, TypeScript e Tailwindcss.
Esta aplicação é composta de uma tela inicial em que há links para as funcionalidades "Editar Prompts", "Mudar Base de Conhecimento", "Navegar no Histórico" e "Editar Frases do Diálogo". Quando usuário seleciona uma funcionalidade, aparece a mensagem "Funcionalidade não implementada". Configure a porta do frontend de acordo com a variável de ambiente FRONTEND_PORT.

---

# PROMPT06: Crie casos de testes para o frontend.

---

# PROMPT07: Crie os documentos chamados iniciar_frontend.md e testar_frontend.md e coloque as instruções neles.

---

# PROMPT08: Implemente a funcionadade "Navegar no Histórico".

---

