"""
Script para testar o endpoint de geração de áudio.
"""
import requests

BACKEND_URL = "http://localhost:3010"

def test_generate_audio():
    """Testa o endpoint /api/generate-audio"""

    print("Testando endpoint /api/generate-audio...")

    # Dados de teste
    payload = {
        "text": "Guten Tag",
        "voice": "Kore",
        "speed": 1.0
    }

    try:
        response = requests.post(
            f"{BACKEND_URL}/api/generate-audio",
            json=payload,
            timeout=35
        )

        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print("[OK] Audio gerado com sucesso!")
            print(f"  - mimeType: {data.get('mimeType')}")
            print(f"  - Tamanho do audio (base64): {len(data.get('audio', ''))} caracteres")
            print(f"  - Metadata: {data.get('metadata')}")
        elif response.status_code == 503:
            print("[ERRO] Servico TTS nao disponivel")
            print(f"  Detalhes: {response.json().get('detail')}")
        else:
            print(f"[ERRO] Erro: {response.status_code}")
            print(f"  Resposta: {response.text}")

    except requests.exceptions.ConnectionError:
        print("[ERRO] Nao foi possivel conectar ao backend.")
        print("  Certifique-se de que o servidor backend esta rodando em localhost:3010")
    except requests.exceptions.Timeout:
        print("[ERRO] Timeout na requisicao")
    except Exception as e:
        print(f"[ERRO] Erro ao testar: {str(e)}")

if __name__ == "__main__":
    test_generate_audio()
