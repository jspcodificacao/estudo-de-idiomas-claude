"""
Configurações e fixtures compartilhadas para os testes.
"""
import json
import pytest
from pathlib import Path
from datetime import datetime
from uuid import uuid4


@pytest.fixture
def conhecimento_valido():
    """Fixture com dados válidos de conhecimento de idioma."""
    return {
        "conhecimento_id": str(uuid4()),
        "data_hora": datetime.now().isoformat(),
        "idioma": "alemao",
        "tipo_conhecimento": "palavra",
        "texto_original": "Hallo",
        "transcricao_ipa": "haˈloː",
        "traducao": "Olá",
        "divisao_silabica": "Hal-lo"
    }


@pytest.fixture
def conhecimento_lista_valida(conhecimento_valido):
    """Fixture com uma lista válida de conhecimentos."""
    conhecimento2 = conhecimento_valido.copy()
    conhecimento2["conhecimento_id"] = str(uuid4())
    conhecimento2["texto_original"] = "Guten Tag"
    conhecimento2["traducao"] = "Bom dia"
    return [conhecimento_valido, conhecimento2]


@pytest.fixture
def prompt_valido():
    """Fixture com dados válidos de um prompt."""
    return {
        "prompt_id": "traducao_001",
        "descricao": "Prompt para exercício de tradução",
        "template": "Traduza a seguinte palavra: {{palavra}}",
        "parametros": ["palavra"],
        "resposta_estruturada": True,
        "estrutura_esperada": {"traducao": "string"},
        "ultima_edicao": datetime.now().isoformat()
    }


@pytest.fixture
def base_prompts_valida(prompt_valido):
    """Fixture com base de prompts válida."""
    return {
        "descricao": "Base de prompts para exercícios",
        "data_atualizacao": datetime.now().isoformat(),
        "marcador_de_paramentros": "{{}}",
        "prompts": [prompt_valido]
    }


@pytest.fixture
def exercicio_traducao_valido():
    """Fixture com exercício de tradução válido."""
    return {
        "data_hora": datetime.now().isoformat(),
        "exercicio_id": str(uuid4()),
        "conhecimento_id": str(uuid4()),
        "idioma": "alemao",
        "tipo_pratica": "traducao",
        "resultado_exercicio": {
            "campo_fornecido": "texto_original",
            "campos_preenchidos": ["traducao"],
            "valores_preenchidos": ["Olá"],
            "campos_resultados": [True]
        }
    }


@pytest.fixture
def exercicio_audicao_valido():
    """Fixture com exercício de audição válido."""
    return {
        "data_hora": datetime.now().isoformat(),
        "exercicio_id": str(uuid4()),
        "conhecimento_id": str(uuid4()),
        "idioma": "ingles",
        "tipo_pratica": "audicao",
        "resultado_exercicio": {
            "texto_original": "Hello",
            "transcricao_usuario": "Hello",
            "correto": True,
            "velocidade_utilizada": "1.0"
        }
    }


@pytest.fixture
def exercicio_valido(exercicio_traducao_valido):
    """Fixture com exercício válido (alias para exercicio_traducao_valido)."""
    return exercicio_traducao_valido


@pytest.fixture
def historico_pratica_valido(exercicio_traducao_valido):
    """Fixture com histórico de prática válido."""
    return {
        "exercicios": [exercicio_traducao_valido]
    }


@pytest.fixture
def frases_dialogo_validas():
    """Fixture com frases de diálogo válidas."""
    return {
        "saudacao": "Olá! Vamos começar?",
        "despedida": "Até a próxima!",
        "intermediarias": [
            "Muito bem!",
            "Continue assim!",
            "Excelente!"
        ]
    }


@pytest.fixture
def temp_json_files(tmp_path, conhecimento_lista_valida, base_prompts_valida,
                    historico_pratica_valido, frases_dialogo_validas):
    """Fixture que cria arquivos JSON temporários para testes."""
    # Criar pasta public temporária
    public_dir = tmp_path / "public"
    public_dir.mkdir()

    # Criar arquivo de conhecimento
    conhecimento_file = public_dir / "[BASE] Conhecimento de idiomas.json"
    with open(conhecimento_file, 'w', encoding='utf-8') as f:
        json.dump(conhecimento_lista_valida, f, ensure_ascii=False, indent=2)

    # Criar arquivo de prompts
    prompts_file = public_dir / "[BASE] Prompts.json"
    with open(prompts_file, 'w', encoding='utf-8') as f:
        json.dump(base_prompts_valida, f, ensure_ascii=False, indent=2)

    # Criar arquivo de histórico
    historico_file = public_dir / "[BASE] Histórico de Prática.json"
    with open(historico_file, 'w', encoding='utf-8') as f:
        json.dump(historico_pratica_valido, f, ensure_ascii=False, indent=2)

    # Criar arquivo de frases
    frases_file = public_dir / "[BASE] Frases do Diálogo.json"
    with open(frases_file, 'w', encoding='utf-8') as f:
        json.dump(frases_dialogo_validas, f, ensure_ascii=False, indent=2)

    return public_dir
