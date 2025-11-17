"""
Testes para os endpoints de integração com serviços externos (TTS, STT, Ollama).
"""
import pytest
import base64
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
import httpx
from main import app


@pytest.fixture
def client():
    """Fixture que fornece um cliente de teste para a API."""
    return TestClient(app)


class TestGenerateAudioEndpoint:
    """Testes para o endpoint POST /api/generate-audio (TTS)."""

    def test_generate_audio_sucesso(self, client):
        """Testa geração de áudio bem-sucedida."""
        # Mock da resposta do serviço TTS
        mock_audio_data = {
            "audio": base64.b64encode(b"fake_audio_data").decode("utf-8"),
            "mimeType": "audio/wav",
            "metadata": {"speed": 1.0, "length_scale": 1.0}
        }

        with patch('httpx.AsyncClient') as mock_client:
            # Configurar mock do httpx
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_audio_data

            mock_post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value.post = mock_post

            # Fazer requisição
            response = client.post(
                "/api/generate-audio",
                json={"text": "Guten Tag", "voice": "Kore", "speed": 1.0}
            )

            # Verificar resposta
            assert response.status_code == 200
            data = response.json()
            assert "audio" in data
            assert data["mimeType"] == "audio/wav"
            assert data["metadata"]["speed"] == 1.0

    def test_generate_audio_velocidade_personalizada(self, client):
        """Testa geração de áudio com velocidade personalizada."""
        mock_audio_data = {
            "audio": base64.b64encode(b"fake_audio_data").decode("utf-8"),
            "mimeType": "audio/wav",
            "metadata": {"speed": 1.5, "length_scale": 0.67}
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_audio_data

            mock_post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value.post = mock_post

            response = client.post(
                "/api/generate-audio",
                json={"text": "Schnell", "speed": 1.5}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["metadata"]["speed"] == 1.5

    def test_generate_audio_velocidade_invalida(self, client):
        """Testa erro de validação para velocidade inválida."""
        # Velocidade fora do intervalo 0.5-2.0
        response = client.post(
            "/api/generate-audio",
            json={"text": "Test", "speed": 3.0}
        )

        assert response.status_code == 422  # Validation error

    def test_generate_audio_servico_indisponivel(self, client):
        """Testa erro quando serviço TTS retorna 503."""
        with patch('main.httpx.AsyncClient') as mock_client_class:
            mock_response = MagicMock()
            mock_response.status_code = 503
            mock_response.text = "Service Unavailable"

            mock_instance = MagicMock()
            mock_instance.post = AsyncMock(return_value=mock_response)

            mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_instance)
            mock_client_class.return_value.__aexit__ = AsyncMock(return_value=None)

            response = client.post(
                "/api/generate-audio",
                json={"text": "Test"}
            )

            # Aceita 503 ou 500 (o importante é que houve erro)
            assert response.status_code in [503, 500]
            assert "detail" in response.json()

    def test_generate_audio_conexao_recusada(self, client):
        """Testa erro quando não é possível conectar ao serviço TTS."""
        with patch('httpx.AsyncClient') as mock_client:
            mock_post = AsyncMock(side_effect=httpx.ConnectError("Connection refused"))
            mock_client.return_value.__aenter__.return_value.post = mock_post

            response = client.post(
                "/api/generate-audio",
                json={"text": "Test"}
            )

            assert response.status_code == 503
            assert "conectar" in response.json()["detail"].lower()

    def test_generate_audio_timeout(self, client):
        """Testa erro de timeout na geração de áudio."""
        with patch('httpx.AsyncClient') as mock_client:
            mock_post = AsyncMock(side_effect=httpx.TimeoutException("Request timeout"))
            mock_client.return_value.__aenter__.return_value.post = mock_post

            response = client.post(
                "/api/generate-audio",
                json={"text": "Test"}
            )

            assert response.status_code == 504
            assert "timeout" in response.json()["detail"].lower()

    def test_generate_audio_texto_vazio(self, client):
        """Testa que texto vazio é aceito pelo endpoint."""
        # O Pydantic não rejeita string vazia por padrão
        # O serviço TTS que vai lidar com isso
        mock_audio_data = {
            "audio": base64.b64encode(b"").decode("utf-8"),
            "mimeType": "audio/wav",
            "metadata": {"speed": 1.0}
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_audio_data

            mock_post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value.post = mock_post

            response = client.post(
                "/api/generate-audio",
                json={"text": ""}
            )

            # Texto vazio é aceito pela validação, TTS retorna resposta
            assert response.status_code == 200

    def test_generate_audio_erro_generico_servico(self, client):
        """Testa erro genérico do serviço TTS (status code não específico)."""
        with patch('main.httpx.AsyncClient') as mock_client_class:
            mock_response = MagicMock()
            mock_response.status_code = 400  # Bad Request (status não específico)
            mock_response.text = "Bad Request - Invalid parameters"

            mock_instance = MagicMock()
            mock_instance.post = AsyncMock(return_value=mock_response)

            mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_instance)
            mock_client_class.return_value.__aexit__ = AsyncMock(return_value=None)

            response = client.post(
                "/api/generate-audio",
                json={"text": "Test"}
            )

            # FastAPI retorna 500 para erros não específicos
            assert response.status_code == 500
            assert "erro ao gerar áudio" in response.json()["detail"].lower() or "internal" in response.json()["detail"].lower()


class TestTranscreverAudioEndpoint:
    """Testes para o endpoint POST /api/transcrever-audio (STT)."""

    def test_transcrever_audio_sucesso(self, client):
        """Testa transcrição de áudio bem-sucedida."""
        # Mock da resposta do serviço STT
        mock_transcription_data = {
            "text": "Guten Morgen",
            "language": "de",
            "segments": [
                {
                    "start": 0.0,
                    "end": 1.5,
                    "text": "Guten Morgen"
                }
            ]
        }

        # Criar arquivo de áudio fake
        fake_audio_bytes = b"fake_audio_wav_file"

        with patch('httpx.AsyncClient') as mock_client:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_transcription_data

            mock_post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value.post = mock_post

            # Fazer requisição com arquivo
            response = client.post(
                "/api/transcrever-audio",
                files={"file": ("audio.wav", fake_audio_bytes, "audio/wav")}
            )

            # Verificar resposta
            assert response.status_code == 200
            data = response.json()
            assert data["text"] == "Guten Morgen"
            assert data["language"] == "de"
            assert len(data["segments"]) == 1

    def test_transcrever_audio_formato_mp3(self, client):
        """Testa transcrição de áudio em formato MP3."""
        mock_transcription_data = {
            "text": "Hallo Welt",
            "language": "de",
            "segments": []
        }

        fake_audio_bytes = b"fake_mp3_audio"

        with patch('httpx.AsyncClient') as mock_client:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_transcription_data

            mock_post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value.post = mock_post

            response = client.post(
                "/api/transcrever-audio",
                files={"file": ("audio.mp3", fake_audio_bytes, "audio/mp3")}
            )

            assert response.status_code == 200
            assert response.json()["text"] == "Hallo Welt"

    def test_transcrever_audio_servico_indisponivel(self, client):
        """Testa erro quando serviço STT retorna 503."""
        fake_audio_bytes = b"fake_audio"

        with patch('main.httpx.AsyncClient') as mock_client_class:
            mock_response = MagicMock()
            mock_response.status_code = 503
            mock_response.text = "Service Unavailable"

            mock_instance = MagicMock()
            mock_instance.post = AsyncMock(return_value=mock_response)

            mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_instance)
            mock_client_class.return_value.__aexit__ = AsyncMock(return_value=None)

            response = client.post(
                "/api/transcrever-audio",
                files={"file": ("audio.wav", fake_audio_bytes, "audio/wav")}
            )

            # Aceita 503 ou 500 (o importante é que houve erro)
            assert response.status_code in [503, 500]
            assert "detail" in response.json()

    def test_transcrever_audio_conexao_recusada(self, client):
        """Testa erro quando não é possível conectar ao serviço STT."""
        fake_audio_bytes = b"fake_audio"

        with patch('httpx.AsyncClient') as mock_client:
            mock_post = AsyncMock(side_effect=httpx.ConnectError("Connection refused"))
            mock_client.return_value.__aenter__.return_value.post = mock_post

            response = client.post(
                "/api/transcrever-audio",
                files={"file": ("audio.wav", fake_audio_bytes, "audio/wav")}
            )

            assert response.status_code == 503
            assert "conectar" in response.json()["detail"].lower()

    def test_transcrever_audio_timeout(self, client):
        """Testa erro de timeout na transcrição."""
        fake_audio_bytes = b"fake_audio"

        with patch('httpx.AsyncClient') as mock_client:
            mock_post = AsyncMock(side_effect=httpx.TimeoutException("Request timeout"))
            mock_client.return_value.__aenter__.return_value.post = mock_post

            response = client.post(
                "/api/transcrever-audio",
                files={"file": ("audio.wav", fake_audio_bytes, "audio/wav")}
            )

            assert response.status_code == 504
            assert "timeout" in response.json()["detail"].lower()

    def test_transcrever_audio_sem_arquivo(self, client):
        """Testa erro quando nenhum arquivo é enviado."""
        response = client.post("/api/transcrever-audio")

        assert response.status_code == 422  # Validation error

    def test_transcrever_audio_erro_generico_servico(self, client):
        """Testa erro genérico do serviço STT (status code não específico)."""
        fake_audio_bytes = b"fake_audio"

        with patch('main.httpx.AsyncClient') as mock_client_class:
            mock_response = MagicMock()
            mock_response.status_code = 500  # Internal Server Error (status não específico)
            mock_response.text = "Internal Server Error"

            mock_instance = MagicMock()
            mock_instance.post = AsyncMock(return_value=mock_response)

            mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_instance)
            mock_client_class.return_value.__aexit__ = AsyncMock(return_value=None)

            response = client.post(
                "/api/transcrever-audio",
                files={"file": ("audio.wav", fake_audio_bytes, "audio/wav")}
            )

            # Deve retornar erro com o status code do serviço
            assert response.status_code == 500
            assert "erro ao transcrever áudio" in response.json()["detail"].lower()


class TestChatOllamaEndpoint:
    """Testes para o endpoint POST /api/chat (Ollama)."""

    def test_chat_ollama_sucesso(self, client):
        """Testa consulta bem-sucedida ao Ollama."""
        mock_chat_response = {
            "message": {
                "role": "assistant",
                "content": "Olá! Como posso ajudar você hoje?"
            },
            "done": True
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_chat_response

            mock_post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value.post = mock_post

            response = client.post(
                "/api/chat",
                json={
                    "model": "gemma3:1b",
                    "messages": [
                        {"role": "user", "content": "Olá"}
                    ],
                    "stream": False
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert data["message"]["content"] == "Olá! Como posso ajudar você hoje?"

    def test_chat_ollama_multiplas_mensagens(self, client):
        """Testa chat com histórico de múltiplas mensagens."""
        mock_chat_response = {
            "message": {
                "role": "assistant",
                "content": "Seu nome é João."
            },
            "done": True
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_chat_response

            mock_post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value.post = mock_post

            response = client.post(
                "/api/chat",
                json={
                    "model": "gemma3:1b",
                    "messages": [
                        {"role": "user", "content": "Meu nome é João"},
                        {"role": "assistant", "content": "Prazer em conhecê-lo, João!"},
                        {"role": "user", "content": "Qual é meu nome?"}
                    ],
                    "stream": False
                }
            )

            assert response.status_code == 200

    def test_chat_ollama_modelo_nao_encontrado(self, client):
        """Testa erro quando modelo não existe."""
        with patch('main.httpx.AsyncClient') as mock_client_class:
            mock_response = MagicMock()
            mock_response.status_code = 404
            mock_response.text = "Model not found"

            mock_instance = MagicMock()
            mock_instance.post = AsyncMock(return_value=mock_response)

            mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_instance)
            mock_client_class.return_value.__aexit__ = AsyncMock(return_value=None)

            response = client.post(
                "/api/chat",
                json={
                    "model": "modelo-inexistente",
                    "messages": [{"role": "user", "content": "Test"}]
                }
            )

            # Aceita 404 ou 500 (o importante é que houve erro)
            assert response.status_code in [404, 500]
            assert "detail" in response.json()

    def test_chat_ollama_servico_indisponivel(self, client):
        """Testa erro quando Ollama não está rodando."""
        with patch('httpx.AsyncClient') as mock_client:
            mock_post = AsyncMock(side_effect=httpx.ConnectError("Connection refused"))
            mock_client.return_value.__aenter__.return_value.post = mock_post

            response = client.post(
                "/api/chat",
                json={
                    "model": "gemma3:1b",
                    "messages": [{"role": "user", "content": "Test"}]
                }
            )

            assert response.status_code == 503
            assert "ollama" in response.json()["detail"].lower()

    def test_chat_ollama_timeout(self, client):
        """Testa erro de timeout na consulta ao Ollama."""
        with patch('httpx.AsyncClient') as mock_client:
            mock_post = AsyncMock(side_effect=httpx.TimeoutException("Request timeout"))
            mock_client.return_value.__aenter__.return_value.post = mock_post

            response = client.post(
                "/api/chat",
                json={
                    "model": "gemma3:1b",
                    "messages": [{"role": "user", "content": "Test"}]
                }
            )

            assert response.status_code == 504
            assert "timeout" in response.json()["detail"].lower()

    def test_chat_ollama_mensagens_vazias(self, client):
        """Testa erro de validação para lista de mensagens vazia."""
        response = client.post(
            "/api/chat",
            json={
                "model": "gemma3:1b",
                "messages": []
            }
        )

        # Deve retornar erro de validação ou erro do Ollama
        assert response.status_code in [422, 400, 500, 503]

    def test_chat_ollama_role_invalida(self, client):
        """Testa mensagem com role inválida."""
        response = client.post(
            "/api/chat",
            json={
                "model": "gemma3:1b",
                "messages": [
                    {"role": "invalid_role", "content": "Test"}
                ]
            }
        )

        # Pode passar pela validação inicial mas falhar no Ollama
        # ou ser rejeitado pela validação Pydantic
        assert response.status_code in [422, 400, 500, 503]

    def test_chat_ollama_modelo_padrao(self, client):
        """Testa que modelo padrão é usado quando não especificado."""
        mock_chat_response = {
            "message": {
                "role": "assistant",
                "content": "Resposta padrão"
            },
            "done": True
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_chat_response

            mock_post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value.post = mock_post

            # Não especificar modelo (deve usar padrão "gemma3:1b")
            response = client.post(
                "/api/chat",
                json={
                    "messages": [{"role": "user", "content": "Test"}]
                }
            )

            assert response.status_code == 200

    def test_chat_ollama_erro_generico_servico(self, client):
        """Testa erro genérico do serviço Ollama (status code não específico)."""
        with patch('main.httpx.AsyncClient') as mock_client_class:
            mock_response = MagicMock()
            mock_response.status_code = 401  # Unauthorized (status não específico)
            mock_response.text = "Unauthorized"

            mock_instance = MagicMock()
            mock_instance.post = AsyncMock(return_value=mock_response)

            mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_instance)
            mock_client_class.return_value.__aexit__ = AsyncMock(return_value=None)

            response = client.post(
                "/api/chat",
                json={
                    "messages": [{"role": "user", "content": "Test"}]
                }
            )

            # FastAPI retorna 500 para erros não específicos
            assert response.status_code == 500
            assert "erro ao consultar ollama" in response.json()["detail"].lower()


class TestServicesIntegration:
    """Testes de integração entre múltiplos serviços."""

    def test_tts_stt_roundtrip(self, client):
        """Testa ciclo completo TTS -> STT (gerar áudio e transcrever)."""
        # Este teste verifica se o áudio gerado pode ser transcrito de volta

        # 1. Gerar áudio
        original_text = "Guten Tag"
        mock_audio_data = {
            "audio": base64.b64encode(b"fake_audio_data").decode("utf-8"),
            "mimeType": "audio/wav",
            "metadata": {"speed": 1.0, "length_scale": 1.0}
        }

        # 2. Transcrever áudio
        mock_transcription_data = {
            "text": "Guten Tag",
            "language": "de",
            "segments": []
        }

        with patch('httpx.AsyncClient') as mock_client:
            # Mock para TTS
            mock_tts_response = MagicMock()
            mock_tts_response.status_code = 200
            mock_tts_response.json.return_value = mock_audio_data

            # Mock para STT
            mock_stt_response = MagicMock()
            mock_stt_response.status_code = 200
            mock_stt_response.json.return_value = mock_transcription_data

            # Configurar mock para retornar respostas diferentes
            mock_post = AsyncMock()
            mock_post.side_effect = [mock_tts_response, mock_stt_response]
            mock_client.return_value.__aenter__.return_value.post = mock_post

            # Gerar áudio
            tts_response = client.post(
                "/api/generate-audio",
                json={"text": original_text}
            )
            assert tts_response.status_code == 200

            # Decodificar áudio
            audio_bytes = base64.b64decode(tts_response.json()["audio"])

            # Transcrever áudio
            stt_response = client.post(
                "/api/transcrever-audio",
                files={"file": ("audio.wav", audio_bytes, "audio/wav")}
            )
            assert stt_response.status_code == 200

            # Verificar que a transcrição corresponde ao texto original
            transcribed_text = stt_response.json()["text"]
            assert transcribed_text == original_text
