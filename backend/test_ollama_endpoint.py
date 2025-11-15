"""
Script para testar o endpoint de consulta ao Ollama.
"""
import requests

BACKEND_URL = "http://localhost:3010"
OLLAMA_URL = "http://localhost:11434"

def test_ollama_chat():
    """Testa o endpoint /api/chat"""

    print("="*70)
    print("TESTE DO ENDPOINT DE CONSULTA AO OLLAMA")
    print("="*70)

    # Verificar se o Ollama esta disponivel
    print("\nEtapa 1: Verificando disponibilidade do Ollama...")
    try:
        ollama_response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if ollama_response.status_code == 200:
            models = [m['name'] for m in ollama_response.json().get('models', [])]
            print(f"[OK] Ollama disponivel com {len(models)} modelos")
            print(f"Modelos disponiveis: {', '.join(models[:5])}")
        else:
            print(f"[AVISO] Ollama retornou status {ollama_response.status_code}")
    except requests.exceptions.ConnectionError:
        print("[ERRO] Nao foi possivel conectar ao Ollama em localhost:11434")
        print("Certifique-se de que o Ollama esta rodando")
        return
    except Exception as e:
        print(f"[ERRO] Erro ao verificar Ollama: {e}")
        return

    # Testar endpoint do backend
    print("\nEtapa 2: Testando endpoint /api/chat do backend...")

    # Usar o primeiro modelo disponivel ou um padrao
    test_model = models[0] if models else "gemma-3-1b-it-Q5_K_M:latest"
    print(f"Usando modelo: {test_model}")

    payload = {
        "model": test_model,
        "messages": [
            {"role": "user", "content": "Ola, como voce esta?"}
        ],
        "stream": False
    }

    try:
        response = requests.post(
            f"{BACKEND_URL}/api/chat",
            json=payload,
            timeout=60
        )

        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            message_content = data.get("message", {}).get("content", "")

            print("\n" + "="*70)
            print("RESULTADO DA CONSULTA")
            print("="*70)
            print(f"Modelo: {payload['model']}")
            print(f"Mensagem enviada: {payload['messages'][0]['content']}")
            print(f"Resposta do LLM:")
            print("-" * 70)
            # Remove emojis and special characters that can't be printed in Windows console
            try:
                print(message_content.encode('ascii', 'ignore').decode('ascii'))
            except:
                print("[Resposta contem caracteres especiais que nao podem ser exibidos]")
            print("-" * 70)

            if message_content:
                print("\n[OK] Consulta ao Ollama bem-sucedida!")
            else:
                print("\n[AVISO] Resposta vazia do Ollama")

        elif response.status_code == 404:
            print("[ERRO] Modelo nao encontrado")
            print(f"Detalhes: {response.json().get('detail')}")
        elif response.status_code == 503:
            print("[ERRO] Servico Ollama nao disponivel")
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
    test_ollama_chat()
