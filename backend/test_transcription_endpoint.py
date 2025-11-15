"""
Script para testar o endpoint de transcricao de audio.
"""
import requests
import base64
import tempfile
import os

BACKEND_URL = "http://localhost:3010"
TTS_SERVICE_URL = "http://localhost:3015"

def test_transcribe_audio():
    """Testa o endpoint /api/transcrever-audio"""

    print("="*70)
    print("TESTE DO ENDPOINT DE TRANSCRICAO DE AUDIO")
    print("="*70)

    # Etapa 1: Gerar audio de teste usando o servico TTS
    print("\nEtapa 1: Gerando audio de teste...")
    test_text = "Guten Morgen"

    try:
        tts_response = requests.post(
            f"{TTS_SERVICE_URL}/api/generate-audio",
            json={"text": test_text, "speed": 1.0},
            timeout=30
        )

        if tts_response.status_code != 200:
            print(f"[ERRO] Falha ao gerar audio de teste: {tts_response.status_code}")
            print("Certifique-se de que o servico TTS/STT esta rodando na porta 3015")
            return

        audio_data = tts_response.json()
        audio_base64 = audio_data.get("audio", "")
        audio_bytes = base64.b64decode(audio_base64)
        print(f"[OK] Audio gerado: {len(audio_bytes)} bytes")

    except requests.exceptions.ConnectionError:
        print("[ERRO] Nao foi possivel conectar ao servico TTS em localhost:3015")
        print("Execute o servico TTS/STT antes de testar este endpoint")
        return
    except Exception as e:
        print(f"[ERRO] Erro ao gerar audio de teste: {e}")
        return

    # Etapa 2: Transcrever o audio usando o endpoint do backend
    print("\nEtapa 2: Transcrevendo audio via backend...")

    try:
        # Criar arquivo temporario com o audio
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name

        # Enviar para o endpoint de transcricao
        with open(temp_path, "rb") as audio_file:
            files = {"file": ("audio.wav", audio_file, "audio/wav")}
            response = requests.post(
                f"{BACKEND_URL}/api/transcrever-audio",
                files=files,
                timeout=120
            )

        # Remover arquivo temporario
        os.unlink(temp_path)

        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            transcribed_text = data.get("text", "").strip()
            language = data.get("language", "N/A")
            segments = data.get("segments", [])

            print("\n" + "="*70)
            print("RESULTADO DA TRANSCRICAO")
            print("="*70)
            print(f"Texto original:  {test_text}")
            print(f"Texto transcrito: {transcribed_text}")
            print(f"Idioma detectado: {language}")
            print(f"Numero de segmentos: {len(segments)}")

            # Verificar equivalencia basica
            if test_text.lower() in transcribed_text.lower() or transcribed_text.lower() in test_text.lower():
                print("\n[OK] Transcricao bem-sucedida! Textos sao equivalentes.")
            else:
                print("\n[AVISO] Transcricao concluida, mas textos podem nao ser equivalentes.")
                print("Isso pode ocorrer devido a variacoes na pronuncia ou modelo STT.")

        elif response.status_code == 503:
            print("[ERRO] Servico STT nao disponivel")
            print(f"Detalhes: {response.json().get('detail')}")
        else:
            print(f"[ERRO] Erro: {response.status_code}")
            print(f"Resposta: {response.text}")

    except requests.exceptions.ConnectionError:
        print("[ERRO] Nao foi possivel conectar ao backend.")
        print("Certifique-se de que o servidor backend esta rodando em localhost:3010")
    except requests.exceptions.Timeout:
        print("[ERRO] Timeout na requisicao")
    except Exception as e:
        print(f"[ERRO] Erro ao testar: {e}")

if __name__ == "__main__":
    test_transcribe_audio()
