"""
Servidor FastAPI para a aplicação de estudo de idiomas.
"""
import os
from pathlib import Path
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from dotenv import load_dotenv

from models import (
    ConhecimentoIdioma,
    BasePrompts,
    BaseHistoricoPratica,
    BaseFrasesDialogo
)
from validator import ValidadorJSON

# Carregar variáveis de ambiente
load_dotenv()

# Criar aplicação FastAPI
app = FastAPI(
    title="API de Estudo de Idiomas",
    description="API para carregar e validar dados da aplicação de estudo de idiomas",
    version="1.0.0"
)

# Configurar CORS para permitir acesso do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origens permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar validador
validador = ValidadorJSON(base_path="../public")


@app.get("/")
async def root():
    """Endpoint raiz da API."""
    return {
        "mensagem": "API de Estudo de Idiomas",
        "versao": "1.0.0",
        "endpoints": [
            "/api/base_de_conhecimento",
            "/api/prompts",
            "/api/historico_de_pratica",
            "/api/frases_do_dialogo"
        ]
    }


@app.get("/api/base_de_conhecimento", response_model=List[ConhecimentoIdioma])
async def obter_base_conhecimento():
    """
    Endpoint para ler e validar a base de conhecimento de idiomas.

    Returns:
        Lista de registros de conhecimento validados

    Raises:
        HTTPException: Se houver erro na validação ou leitura do arquivo
    """
    try:
        conhecimentos = validador.validar_conhecimento_idiomas()
        return conhecimentos
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Arquivo não encontrado: {str(e)}")
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=f"Erro de validação: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.get("/api/prompts", response_model=BasePrompts)
async def obter_prompts():
    """
    Endpoint para ler e validar a base de prompts.

    Returns:
        Objeto BasePrompts validado

    Raises:
        HTTPException: Se houver erro na validação ou leitura do arquivo
    """
    try:
        prompts = validador.validar_prompts()
        return prompts
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Arquivo não encontrado: {str(e)}")
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=f"Erro de validação: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.get("/api/historico_de_pratica", response_model=BaseHistoricoPratica)
async def obter_historico_pratica():
    """
    Endpoint para ler e validar o histórico de prática.

    Returns:
        Objeto BaseHistoricoPratica validado

    Raises:
        HTTPException: Se houver erro na validação ou leitura do arquivo
    """
    try:
        historico = validador.validar_historico_pratica()
        return historico
    except FileNotFoundError as e:
        # Retornar histórico vazio se arquivo não existir (é opcional)
        return BaseHistoricoPratica(exercicios=[])
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=f"Erro de validação: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.get("/api/frases_do_dialogo", response_model=BaseFrasesDialogo)
async def obter_frases_dialogo():
    """
    Endpoint para ler e validar as frases do diálogo.

    Returns:
        Objeto BaseFrasesDialogo validado

    Raises:
        HTTPException: Se houver erro na validação ou leitura do arquivo
    """
    try:
        frases = validador.validar_frases_dialogo()
        return frases
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Arquivo não encontrado: {str(e)}")
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=f"Erro de validação: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    # Obter porta da variável de ambiente
    port = int(os.getenv("BACKEND_PORT", 3010))

    print(f"Iniciando servidor na porta {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
