# Iniciar o Backend da Aplicação de Estudo de Idiomas

Este documento fornece instruções detalhadas para configurar e iniciar o servidor backend da aplicação.

## Pré-requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)
- Acesso ao diretório raiz do projeto

## Estrutura do Backend

```
backend/
├── main.py              # Servidor FastAPI
├── models.py            # Modelos Pydantic
├── validator.py         # Validador de JSON
├── requirements.txt     # Dependências
└── tests/              # Testes automatizados
```

## Passo 1: Verificar Variáveis de Ambiente

O backend utiliza variáveis de ambiente definidas no arquivo `.env` na raiz do projeto.

**Arquivo `.env` (na raiz do projeto):**
```env
BACKEND_PORT=3010
FRONTEND_PORT=5173
```

- `BACKEND_PORT`: Porta onde o servidor backend será executado (padrão: 3010)

Se o arquivo `.env` não existir, crie-o com o conteúdo acima.

## Passo 2: Verificar Arquivos JSON

Os arquivos de dados devem estar na pasta `/public` na raiz do projeto:

### Arquivos Obrigatórios:
- `[BASE] Conhecimento de idiomas.json` - Base de conhecimento de idiomas
- `[BASE] Prompts.json` - Base de prompts
- `[BASE][SCHEMA] Conhecimento de idiomas.json` - Schema de validação
- `[BASE][SCHEMA] Prompts.json` - Schema de validação
- `[BASE] Frases do Diálogo.json` - Frases de diálogo
- `[BASE][SCHEMA] Frases do diálogo.json` - Schema de validação

### Arquivos Opcionais:
- `[BASE] Histórico de Prática.json` - Histórico de exercícios (se não existir, será criado vazio)
- `[BASE][SCHEMA] Histórico de Prática.json` - Schema de validação

**Importante:** O backend lê os arquivos da pasta `../public` (relativo ao diretório backend).

## Passo 3: Instalar Dependências

Navegue até a pasta `backend` e instale as dependências:

```bash
cd backend
pip install -r requirements.txt
```

### Dependências Instaladas:
- `pydantic>=2.0.0` - Validação de dados
- `fastapi>=0.104.0` - Framework web
- `uvicorn[standard]>=0.24.0` - Servidor ASGI
- `python-dotenv>=1.0.0` - Carregamento de variáveis de ambiente
- `pytest>=7.4.0` - Framework de testes
- `pytest-cov>=4.1.0` - Cobertura de testes
- `httpx>=0.25.0` - Cliente HTTP para testes

## Passo 4: Validar os Arquivos JSON (Opcional)

Antes de iniciar o servidor, você pode validar os arquivos JSON:

```bash
python validator.py
```

Este comando irá:
- Validar todos os arquivos JSON contra os schemas
- Mostrar estatísticas de cada arquivo
- Exibir erros caso existam

**Exemplo de saída:**
```
============================================================
VALIDADOR DE ARQUIVOS JSON - Estudo de Idiomas
============================================================

CONHECIMENTO IDIOMAS
----------------------------------------
Status: ✓ Válido
Total de registros: 150

PROMPTS
----------------------------------------
Status: ✓ Válido
Total de prompts: 5

HISTORICO PRATICA
----------------------------------------
Status: ✓ Válido
Total de exercícios: 23

FRASES DIALOGO
----------------------------------------
Status: ✓ Válido
Total de frases intermediárias: 10

============================================================
```

## Passo 5: Iniciar o Servidor

Existem duas formas de iniciar o servidor:

### Opção 1: Usando Python diretamente

```bash
python main.py
```

### Opção 2: Usando Uvicorn (recomendado para desenvolvimento)

```bash
uvicorn main:app --reload --host localhost --port 3010
```

**Parâmetros:**
- `--reload`: Recarrega automaticamente quando o código é alterado
- `--host localhost`: Servidor acessível apenas localmente (mais seguro)
- `--port 3010`: Define a porta (use o valor de BACKEND_PORT)

### Opção 3: Usando variável de ambiente

```bash
uvicorn main:app --reload --host localhost --port $BACKEND_PORT
```

## Passo 6: Verificar se o Servidor Está Funcionando

Após iniciar o servidor, você verá uma mensagem similar a:

```
Iniciando servidor em http://localhost:3010
INFO:     Uvicorn running on http://127.0.0.1:3010 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Testar os Endpoints

Acesse os seguintes URLs no navegador ou use ferramentas como curl/Postman:

1. **Endpoint raiz** (informações da API):
   ```
   http://localhost:3010/
   ```

2. **Base de conhecimento**:
   ```
   http://localhost:3010/api/base_de_conhecimento
   ```

3. **Prompts**:
   ```
   http://localhost:3010/api/prompts
   ```

4. **Histórico de prática**:
   ```
   http://localhost:3010/api/historico_de_pratica
   ```

5. **Frases do diálogo**:
   ```
   http://localhost:3010/api/frases_do_dialogo
   ```

### Documentação Interativa da API

O FastAPI gera automaticamente documentação interativa:

- **Swagger UI**: http://localhost:3010/docs
- **ReDoc**: http://localhost:3010/redoc

## Passo 7: Parar o Servidor

Para parar o servidor, pressione `CTRL+C` no terminal.

## Solução de Problemas

### Erro: "Arquivo não encontrado"

**Problema:** O servidor não encontra os arquivos JSON.

**Solução:**
1. Verifique se os arquivos estão na pasta `/public` na raiz do projeto
2. Verifique se os nomes dos arquivos estão corretos (incluindo acentos e maiúsculas)
3. Execute o servidor a partir da pasta `backend/`

### Erro: "Porta já em uso"

**Problema:** A porta 3010 já está sendo usada por outro processo.

**Solução:**
1. Encerre o processo que está usando a porta
2. Ou altere a variável `BACKEND_PORT` no arquivo `.env` para outra porta

### Erro: "ValidationError"

**Problema:** Os dados JSON não estão no formato correto.

**Solução:**
1. Execute o validador: `python validator.py`
2. Corrija os erros indicados nos arquivos JSON
3. Verifique se os arquivos estão de acordo com os schemas

### Erro: "ModuleNotFoundError"

**Problema:** Dependências não foram instaladas.

**Solução:**
```bash
pip install -r requirements.txt
```

## Comandos Úteis

```bash
# Instalar dependências
pip install -r requirements.txt

# Validar arquivos JSON
python validator.py

# Iniciar servidor (desenvolvimento)
uvicorn main:app --reload --host localhost --port 3010

# Iniciar servidor (produção - acesso apenas local)
uvicorn main:app --host localhost --port 3010 --workers 4

# Iniciar servidor (produção - acesso externo)
uvicorn main:app --host 0.0.0.0 --port 3010 --workers 4

# Ver logs detalhados
uvicorn main:app --log-level debug
```

## Próximos Passos

Após iniciar o backend com sucesso:
1. Inicie o frontend (consulte documentação do frontend)
2. Acesse a aplicação web
3. Execute os testes (consulte `testar_backend.md`)

## Suporte

Para mais informações sobre os testes, consulte o documento `testar_backend.md`.
