"""
Servidor FastAPI para a aplicação de estudo de idiomas.
"""
import os
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, File, UploadFile
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

# Configuração do serviço Ollama
OLLAMA_SERVICE_PORT = int(os.getenv("SERVICO_OLLAMA", 11434))
OLLAMA_SERVICE_URL = f"http://localhost:{OLLAMA_SERVICE_PORT}"
OLLAMA_MODEL = os.getenv("MODELO_OLLAMA", "gemma3:1b")


# Modelos de dados para TTS
class GenerateAudioRequest(BaseModel):
    text: str
    voice: Optional[str] = "Kore"
    speed: Optional[float] = Field(default=1.0, ge=0.5, le=2.0)


# Modelos de dados para Ollama
class OllamaMessage(BaseModel):
    role: str
    content: str


class OllamaChatRequest(BaseModel):
    model: Optional[str] = None  # Se None, usa OLLAMA_MODEL do .env
    messages: List[OllamaMessage]
    stream: bool = False


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
                "/api/historico_de_pratica - Inserir novo exercício",
                "/api/generate-audio - Gerar áudio a partir de texto (TTS)",
                "/api/transcrever-audio - Transcrever áudio em texto (STT)",
                "/api/chat - Consultar LLM via Ollama"
            ],
            "PUT": [
                "/api/prompts - Atualizar e salvar prompts"
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


@app.put("/api/prompts", response_model=BasePrompts)
async def atualizar_prompts(prompts: BasePrompts):
    """
    Endpoint para atualizar e salvar os prompts.

    Args:
        prompts: Objeto BasePrompts com os prompts atualizados

    Returns:
        Objeto BasePrompts salvo

    Raises:
        HTTPException: Com status 422 se houver erro de validação
        HTTPException: Com status 500 para outros erros
    """
    try:
        prompts_salvos = validador.salvar_prompts(prompts)
        return prompts_salvos
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=f"Erro de validação: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar prompts: {str(e)}")


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


@app.post("/api/transcrever-audio")
async def transcrever_audio(file: UploadFile = File(...)):
    """
    Endpoint para transcrever áudio em texto (STT).

    Faz proxy para o serviço TTS/STT local.

    Args:
        file: Arquivo de áudio para transcrição

    Returns:
        JSON com texto transcrito, idioma detectado e segmentos

    Raises:
        HTTPException: Se houver erro na transcrição ou serviço indisponível
    """
    try:
        # Ler arquivo de áudio
        audio_bytes = await file.read()

        # Fazer requisição para o serviço STT usando multipart form data
        async with httpx.AsyncClient(timeout=120.0) as client:
            files = {
                "file": (file.filename or "audio.wav", audio_bytes, file.content_type or "audio/wav")
            }

            response = await client.post(
                f"{TTS_SERVICE_URL}/api/transcribe-audio",
                files=files
            )

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 503:
                raise HTTPException(
                    status_code=503,
                    detail="Serviço STT não disponível. Certifique-se de que o serviço está rodando."
                )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Erro ao transcrever áudio: {response.text}"
                )

    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail=f"Não foi possível conectar ao serviço STT em {TTS_SERVICE_URL}. Verifique se o serviço está rodando."
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Timeout ao transcrever áudio. O serviço STT demorou muito para responder."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno ao transcrever áudio: {str(e)}"
        )


@app.post("/api/chat")
async def chat_with_ollama(request: OllamaChatRequest):
    """
    Endpoint para consultar LLM via Ollama.

    Faz proxy para o serviço Ollama local.

    Args:
        request: Requisição contendo modelo, mensagens e opção de streaming

    Returns:
        JSON com resposta do LLM

    Raises:
        HTTPException: Se houver erro na consulta ou serviço indisponível
    """
    try:
        # Usar modelo da variável de ambiente se não especificado
        model_to_use = request.model if request.model else OLLAMA_MODEL

        print(f"🤖 Usando modelo Ollama: {model_to_use}")

        # Fazer requisição para o serviço Ollama
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OLLAMA_SERVICE_URL}/api/chat",
                json={
                    "model": model_to_use,
                    "messages": [msg.model_dump() for msg in request.messages],
                    "stream": request.stream
                }
            )

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                raise HTTPException(
                    status_code=404,
                    detail=f"Modelo '{request.model}' não encontrado no Ollama. Verifique se o modelo está instalado."
                )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Erro ao consultar Ollama: {response.text}"
                )

    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail=f"Não foi possível conectar ao serviço Ollama em {OLLAMA_SERVICE_URL}. Verifique se o Ollama está rodando."
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Timeout ao consultar Ollama. O serviço demorou muito para responder."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno ao consultar Ollama: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    # Obter porta da variável de ambiente
    port = int(os.getenv("BACKEND_PORT", 3010))

    print(f"Iniciando servidor em http://localhost:{port}")
    uvicorn.run(app, host="localhost", port=port)
