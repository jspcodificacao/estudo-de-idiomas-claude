# Testar o Backend da Aplicação de Estudo de Idiomas

Este documento fornece instruções detalhadas para executar os testes automatizados do backend.

## Pré-requisitos

- Python 3.8 ou superior
- Dependências instaladas (veja `iniciar_backend.md`)
- Acesso ao diretório `backend/` do projeto

## Estrutura de Testes

```
backend/tests/
├── __init__.py           # Inicialização do pacote
├── conftest.py          # Fixtures compartilhadas
├── test_models.py       # Testes dos modelos Pydantic (17 testes)
├── test_validator.py    # Testes do validador JSON (9 testes)
├── test_api.py          # Testes dos endpoints API (16 testes)
├── .gitignore          # Arquivos ignorados pelo Git
└── README.md           # Documentação dos testes
```

**Total: 42 testes automatizados**

## Passo 1: Instalar Dependências de Teste

Navegue até a pasta `backend` e certifique-se de que as dependências de teste estão instaladas:

```bash
cd backend
pip install -r requirements.txt
```

As seguintes bibliotecas de teste serão instaladas:
- `pytest>=7.4.0` - Framework de testes
- `pytest-cov>=4.1.0` - Cobertura de código
- `httpx>=0.25.0` - Cliente HTTP para testes de API

## Passo 2: Executar Todos os Testes

### Comando Básico

```bash
pytest
```

Este comando irá:
- Descobrir todos os testes automaticamente
- Executar os 42 testes
- Mostrar um relatório de cobertura
- Gerar relatório HTML em `htmlcov/`

### Exemplo de Saída

```
======================== test session starts =========================
platform win32 -- Python 3.11.0, pytest-7.4.0, pluggy-1.0.0
rootdir: F:\jucieudes\aplicacoes\estudo-de-idiomas-4\backend
configfile: pytest.ini
plugins: cov-4.1.0
collected 42 items

tests/test_models.py .................                        [ 40%]
tests/test_validator.py .........                             [ 61%]
tests/test_api.py ................                            [100%]

---------- coverage: platform win32, python 3.11.0 -----------
Name              Stmts   Miss  Cover   Missing
-----------------------------------------------
main.py              85      5    94%   45-49
models.py           120      8    93%
validator.py         78      3    96%
-----------------------------------------------
TOTAL               283     16    94%

======================== 42 passed in 2.34s ==========================
```

## Passo 3: Executar Testes Específicos

### Por Arquivo

```bash
# Apenas testes de modelos
pytest tests/test_models.py

# Apenas testes do validador
pytest tests/test_validator.py

# Apenas testes da API
pytest tests/test_api.py
```

### Por Classe de Teste

```bash
# Testes de ConhecimentoIdioma
pytest tests/test_models.py::TestConhecimentoIdioma

# Testes de endpoints de prompts
pytest tests/test_api.py::TestPromptsEndpoint

# Testes do validador JSON
pytest tests/test_validator.py::TestValidadorJSON
```

### Por Teste Individual

```bash
# Teste específico de conhecimento válido
pytest tests/test_models.py::TestConhecimentoIdioma::test_conhecimento_valido

# Teste específico de endpoint de sucesso
pytest tests/test_api.py::TestBaseConhecimentoEndpoint::test_get_base_conhecimento_sucesso
```

### Por Palavra-chave

```bash
# Executar todos os testes que contêm "valido" no nome
pytest -k "valido"

# Executar todos os testes que contêm "erro" no nome
pytest -k "erro"

# Executar testes de validação
pytest -k "validacao"
```

## Passo 4: Opções Avançadas de Teste

### Modo Verboso

Mostra mais detalhes sobre cada teste:

```bash
pytest -v
```

### Mostrar Print Statements

Útil para debug:

```bash
pytest -s
```

### Parar no Primeiro Erro

Útil quando você quer corrigir um problema por vez:

```bash
pytest -x
```

### Executar Testes em Paralelo

Mais rápido para grandes suítes de testes:

```bash
pip install pytest-xdist
pytest -n auto
```

### Mostrar Apenas Resumo

Esconde detalhes de falhas:

```bash
pytest --tb=no
```

### Modo Silencioso

Mostra apenas pontos:

```bash
pytest -q
```

## Passo 5: Relatórios de Cobertura

### Cobertura no Terminal

```bash
pytest --cov=. --cov-report=term-missing
```

Mostra quais linhas não estão cobertas pelos testes.

### Cobertura HTML (Recomendado)

```bash
pytest --cov=. --cov-report=html
```

Gera um relatório HTML detalhado em `htmlcov/index.html`. Abra este arquivo no navegador para visualizar:
- Cobertura por arquivo
- Linhas cobertas/não cobertas
- Navegação interativa pelo código

### Cobertura XML

Útil para integração com ferramentas CI/CD:

```bash
pytest --cov=. --cov-report=xml
```

### Especificar Cobertura Mínima

Falha se a cobertura for menor que o especificado:

```bash
pytest --cov=. --cov-fail-under=90
```

## Passo 6: Detalhes dos Testes

### test_models.py - Testes dos Modelos Pydantic (17 testes)

Valida a estrutura de dados e regras de negócio:

**TestConhecimentoIdioma (7 testes):**
- ✓ Criação de conhecimento válido
- ✓ Conhecimento sem campos opcionais
- ✓ Erro quando falta campo obrigatório
- ✓ Erro com idioma inválido
- ✓ Erro com tipo de conhecimento inválido
- ✓ Erro com UUID inválido
- ✓ Erro com data inválida

**TestBasePrompts (4 testes):**
- ✓ Base de prompts válida
- ✓ Erro sem campo obrigatório
- ✓ Prompt item válido
- ✓ Prompt sem estrutura esperada

**TestExercicio (3 testes):**
- ✓ Exercício de tradução válido
- ✓ Exercício de audição válido
- ✓ Erro com tipo de prática inválido

**TestBaseHistoricoPratica (2 testes):**
- ✓ Histórico válido
- ✓ Histórico vazio

**TestBaseFrasesDialogo (4 testes):**
- ✓ Frases de diálogo válidas
- ✓ Erro com lista vazia de intermediárias
- ✓ Erro sem campo obrigatório
- ✓ Erro com campo extra

### test_validator.py - Testes do ValidadorJSON (9 testes)

Valida a leitura e validação de arquivos JSON:

- ✓ Validação bem-sucedida de conhecimento de idiomas
- ✓ Validação bem-sucedida de prompts
- ✓ Validação bem-sucedida de histórico
- ✓ Validação bem-sucedida de frases de diálogo
- ✓ Erro quando arquivo não existe
- ✓ Erro com JSON inválido
- ✓ Erro com dados inválidos
- ✓ Validação de todos os arquivos com sucesso
- ✓ Validação com histórico ausente (opcional)
- ✓ Validação com erros

### test_api.py - Testes dos Endpoints da API (16 testes)

Valida todos os endpoints HTTP:

**TestRootEndpoint (1 teste):**
- ✓ Endpoint raiz retorna informações da API

**TestBaseConhecimentoEndpoint (4 testes):**
- ✓ GET retorna base de conhecimento (200)
- ✓ GET retorna 404 quando arquivo não existe
- ✓ GET retorna 422 quando validação falha
- ✓ GET retorna 500 para erro interno

**TestPromptsEndpoint (3 testes):**
- ✓ GET retorna prompts (200)
- ✓ GET retorna 404 quando arquivo não existe
- ✓ GET retorna 422 quando validação falha

**TestHistoricoPraticaEndpoint (3 testes):**
- ✓ GET retorna histórico (200)
- ✓ GET retorna histórico vazio quando arquivo não existe
- ✓ GET retorna 422 quando validação falha

**TestFrasesDialogoEndpoint (3 testes):**
- ✓ GET retorna frases de diálogo (200)
- ✓ GET retorna 404 quando arquivo não existe
- ✓ GET retorna 422 quando validação falha

## Passo 7: Interpretar Resultados

### Teste Passou (.)

```
tests/test_models.py .................
```

Cada ponto (.) representa um teste que passou.

### Teste Falhou (F)

```
tests/test_models.py .....F...........
```

O "F" indica falha. Veja detalhes abaixo.

### Erro no Teste (E)

```
tests/test_models.py .....E...........
```

O "E" indica erro durante a execução.

### Teste Pulado (s)

```
tests/test_models.py .....s...........
```

O "s" indica teste marcado para pular.

### Exemplo de Saída de Falha

```
FAILED tests/test_models.py::TestConhecimentoIdioma::test_conhecimento_valido
========================== FAILURES ==========================
_____________ TestConhecimentoIdioma.test_conhecimento_valido _____________

    def test_conhecimento_valido(self, conhecimento_valido):
>       assert conhecimento.texto_original == "Hello"
E       AssertionError: assert 'Hallo' == 'Hello'

tests/test_models.py:23: AssertionError
```

## Passo 8: Fixtures Disponíveis

Os testes utilizam fixtures definidas em `conftest.py`:

- `conhecimento_valido` - Um registro válido de conhecimento
- `conhecimento_lista_valida` - Lista de 2 conhecimentos
- `prompt_valido` - Um prompt válido
- `base_prompts_valida` - Base completa de prompts
- `exercicio_traducao_valido` - Exercício de tradução
- `exercicio_audicao_valido` - Exercício de audição
- `historico_pratica_valido` - Histórico com exercícios
- `frases_dialogo_validas` - Frases de diálogo
- `temp_json_files` - Arquivos JSON temporários para testes
- `client` - Cliente de teste da API

## Passo 9: Adicionar Novos Testes

### Estrutura de um Teste

```python
import pytest

class TestMinhaFuncionalidade:
    """Testes para minha funcionalidade."""

    def test_caso_de_sucesso(self):
        """Testa cenário bem-sucedido."""
        # Arrange (preparar)
        dado = "valor"

        # Act (executar)
        resultado = minha_funcao(dado)

        # Assert (verificar)
        assert resultado == "esperado"

    def test_caso_de_erro(self):
        """Testa cenário de erro."""
        with pytest.raises(ValueError):
            minha_funcao("valor_invalido")
```

### Usar Fixtures

```python
def test_com_fixture(self, conhecimento_valido):
    """Testa usando fixture."""
    conhecimento = ConhecimentoIdioma(**conhecimento_valido)
    assert conhecimento.idioma == "alemao"
```

## Passo 10: Integração Contínua (CI/CD)

### GitHub Actions

Exemplo de configuração `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest --cov=. --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Solução de Problemas

### Erro: "No module named 'pytest'"

**Solução:**
```bash
pip install pytest
```

### Erro: "Import error" nos testes

**Solução:**
Execute pytest a partir da pasta `backend/`:
```bash
cd backend
pytest
```

### Testes falhando por causa de caminhos

**Solução:**
Os testes usam fixtures com arquivos temporários. Verifique se os paths estão corretos.

### Erro: "fixture not found"

**Solução:**
Verifique se `conftest.py` está no diretório correto.

## Comandos Rápidos

```bash
# Executar todos os testes
pytest

# Testes com cobertura
pytest --cov=. --cov-report=html

# Testes verbosos
pytest -v

# Parar no primeiro erro
pytest -x

# Testes específicos
pytest tests/test_models.py

# Testes por palavra-chave
pytest -k "valido"

# Ver relatório HTML
# Abrir htmlcov/index.html no navegador
```

## Métricas de Qualidade

**Objetivo de Cobertura:** ≥ 90%

**Tempo de Execução:** < 5 segundos

**Taxa de Sucesso:** 100%

## Próximos Passos

1. Execute os testes regularmente durante o desenvolvimento
2. Adicione novos testes ao implementar novas funcionalidades
3. Mantenha a cobertura de código acima de 90%
4. Integre os testes ao seu pipeline de CI/CD

## Suporte

Para mais informações sobre como iniciar o backend, consulte `iniciar_backend.md`.
