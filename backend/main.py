"""
Servidor FastAPI para a aplicação de estudo de idiomas.
"""
import os
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError, BaseModel, Field
from dotenv import load_dotenv
import httpx

from models import (
    ConhecimentoIdioma,
    BasePrompts,
    BaseHistoricoPratica,
    BaseFrasesDialogo,
    Exercicio
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

# Configuração do serviço TTS/STT
TTS_SERVICE_PORT = int(os.getenv("SERVICO_TTS_E_STT", 3015))
TTS_SERVICE_URL = f"http://localhost:{TTS_SERVICE_PORT}"


# Modelos de dados para TTS
class GenerateAudioRequest(BaseModel):
    text: str
    voice: Optional[str] = "Kore"
    speed: Optional[float] = Field(default=1.0, ge=0.5, le=2.0)


@app.get("/")
async def root():
    """Endpoint raiz da API."""
    return {
        "mensagem": "API de Estudo de Idiomas",
        "versao": "1.0.0",
        "endpoints": {
            "GET": [
                "/api/base_de_conhecimento",
                "/api/prompts",
                "/api/historico_de_pratica",
                "/api/frases_do_dialogo"
            ],
            "POST": [
                "/api/historico_de_pratica - Inserir novo exercício"
            ]
        }
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


@app.post("/api/historico_de_pratica", response_model=BaseHistoricoPratica, status_code=201)
async def inserir_exercicio(exercicio: Exercicio):
    """
    Endpoint para inserir um novo exercício no histórico de prática.

    Args:
        exercicio: Dados do exercício a ser inserido

    Returns:
        Objeto BaseHistoricoPratica atualizado

    Raises:
        HTTPException: Se houver erro na validação ou salvamento do exercício
    """
    try:
        historico_atualizado = validador.adicionar_exercicio(exercicio)
        return historico_atualizado
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=f"Erro de validação: {str(e)}")
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar exercício: {str(e)}")
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


@app.post("/api/generate-audio")
async def generate_audio(request: GenerateAudioRequest):
    """
    Endpoint para gerar áudio a partir de texto (TTS).

    Faz proxy para o serviço TTS/STT local.

    Args:
        request: Requisição contendo texto, voz opcional e velocidade

    Returns:
        JSON com áudio em base64, mimeType e metadata

    Raises:
        HTTPException: Se houver erro na geração do áudio ou serviço indisponível
    """
    try:
        # Fazer requisição para o serviço TTS
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{TTS_SERVICE_URL}/api/generate-audio",
                json={
                    "text": request.text,
                    "voice": request.voice,
                    "speed": request.speed
                }
            )

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 503:
                raise HTTPException(
                    status_code=503,
                    detail="Serviço TTS não disponível. Certifique-se de que o serviço está rodando."
                )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Erro ao gerar áudio: {response.text}"
                )

    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail=f"Não foi possível conectar ao serviço TTS em {TTS_SERVICE_URL}. Verifique se o serviço está rodando."
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Timeout ao gerar áudio. O serviço TTS demorou muito para responder."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno ao gerar áudio: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    # Obter porta da variável de ambiente
    port = int(os.getenv("BACKEND_PORT", 3010))

    print(f"Iniciando servidor em http://localhost:{port}")
    uvicorn.run(app, host="localhost", port=port)
