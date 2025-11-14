# Testes do Backend

Este diretório contém os testes automatizados para o backend da aplicação de estudo de idiomas.

## Estrutura de Testes

- **test_models.py** - Testes dos modelos Pydantic
  - Validação de dados corretos
  - Validação de dados incorretos
  - Testes de campos obrigatórios e opcionais
  - Testes de enums e tipos

- **test_validator.py** - Testes do ValidadorJSON
  - Validação de arquivos JSON
  - Tratamento de erros (arquivo não encontrado, JSON inválido, etc.)
  - Validação de todos os arquivos

- **test_api.py** - Testes dos endpoints da API
  - Testes de sucesso (200)
  - Testes de erro (404, 422, 500)
  - Testes de cada endpoint

- **conftest.py** - Fixtures compartilhadas
  - Dados de teste válidos
  - Criação de arquivos JSON temporários

## Executar os Testes

### Instalar dependências

```bash
pip install -r requirements.txt
```

### Executar todos os testes

```bash
pytest
```

### Executar testes com cobertura

```bash
pytest --cov=. --cov-report=html
```

O relatório HTML será gerado em `htmlcov/index.html`.

### Executar testes específicos

```bash
# Executar apenas testes de modelos
pytest tests/test_models.py

# Executar apenas testes da API
pytest tests/test_api.py

# Executar apenas testes do validador
pytest tests/test_validator.py

# Executar um teste específico
pytest tests/test_models.py::TestConhecimentoIdioma::test_conhecimento_valido
```

### Executar testes com mais detalhes

```bash
# Modo verboso
pytest -v

# Mostrar print statements
pytest -s

# Parar no primeiro erro
pytest -x

# Mostrar apenas sumário
pytest --tb=no
```

## Cobertura de Testes

Os testes cobrem:

- ✓ Validação de todos os modelos Pydantic
- ✓ Casos de sucesso e falha
- ✓ Todos os endpoints da API
- ✓ Tratamento de erros
- ✓ Campos obrigatórios e opcionais
- ✓ Validação de tipos e enums
- ✓ Arquivos não encontrados
- ✓ JSON inválido
- ✓ Dados inválidos

## Fixtures Disponíveis

As seguintes fixtures estão disponíveis em `conftest.py`:

- `conhecimento_valido` - Um registro válido de conhecimento
- `conhecimento_lista_valida` - Lista de conhecimentos válidos
- `prompt_valido` - Um prompt válido
- `base_prompts_valida` - Base de prompts válida
- `exercicio_traducao_valido` - Exercício de tradução válido
- `exercicio_audicao_valido` - Exercício de audição válido
- `historico_pratica_valido` - Histórico de prática válido
- `frases_dialogo_validas` - Frases de diálogo válidas
- `temp_json_files` - Arquivos JSON temporários para testes
