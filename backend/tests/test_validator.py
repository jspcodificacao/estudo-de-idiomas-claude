"""
Testes para o ValidadorJSON.
"""
import pytest
import json
from pathlib import Path
from pydantic import ValidationError
from validator import ValidadorJSON


class TestValidadorJSON:
    """Testes para a classe ValidadorJSON."""

    def test_validar_conhecimento_idiomas_sucesso(self, temp_json_files):
        """Testa validação bem-sucedida de conhecimento de idiomas."""
        validador = ValidadorJSON(base_path=str(temp_json_files))
        conhecimentos = validador.validar_conhecimento_idiomas()
        assert len(conhecimentos) == 2
        assert conhecimentos[0].texto_original == "Hallo"

    def test_validar_prompts_sucesso(self, temp_json_files):
        """Testa validação bem-sucedida de prompts."""
        validador = ValidadorJSON(base_path=str(temp_json_files))
        prompts = validador.validar_prompts()
        assert len(prompts.prompts) == 1
        assert prompts.marcador_de_paramentros == "{{}}"

    def test_validar_historico_pratica_sucesso(self, temp_json_files):
        """Testa validação bem-sucedida de histórico de prática."""
        validador = ValidadorJSON(base_path=str(temp_json_files))
        historico = validador.validar_historico_pratica()
        assert len(historico.exercicios) == 1

    def test_validar_frases_dialogo_sucesso(self, temp_json_files):
        """Testa validação bem-sucedida de frases de diálogo."""
        validador = ValidadorJSON(base_path=str(temp_json_files))
        frases = validador.validar_frases_dialogo()
        assert frases.saudacao == "Olá! Vamos começar?"
        assert len(frases.intermediarias) == 3

    def test_validar_arquivo_nao_encontrado(self, tmp_path):
        """Testa erro quando arquivo não existe."""
        validador = ValidadorJSON(base_path=str(tmp_path))
        with pytest.raises(FileNotFoundError):
            validador.validar_conhecimento_idiomas()

    def test_validar_json_invalido(self, tmp_path):
        """Testa erro quando JSON é inválido."""
        # Criar arquivo com JSON inválido
        arquivo = tmp_path / "[BASE] Conhecimento de idiomas.json"
        with open(arquivo, 'w') as f:
            f.write("{ invalid json }")

        validador = ValidadorJSON(base_path=str(tmp_path))
        with pytest.raises(json.JSONDecodeError):
            validador.validar_conhecimento_idiomas()

    def test_validar_dados_invalidos(self, tmp_path):
        """Testa erro quando dados não passam na validação Pydantic."""
        # Criar arquivo com dados inválidos (faltando campos obrigatórios)
        arquivo = tmp_path / "[BASE] Conhecimento de idiomas.json"
        dados_invalidos = [{
            "conhecimento_id": "não-é-uuid",
            "texto_original": "Hello"
            # Faltam campos obrigatórios
        }]
        with open(arquivo, 'w') as f:
            json.dump(dados_invalidos, f)

        validador = ValidadorJSON(base_path=str(tmp_path))
        with pytest.raises(ValidationError):
            validador.validar_conhecimento_idiomas()

    def test_validar_todos_sucesso(self, temp_json_files):
        """Testa validação de todos os arquivos com sucesso."""
        validador = ValidadorJSON(base_path=str(temp_json_files))
        resultados = validador.validar_todos()

        assert resultados["conhecimento_idiomas"]["status"] == "[OK] Valido"
        assert resultados["prompts"]["status"] == "[OK] Valido"
        assert resultados["historico_pratica"]["status"] == "[OK] Valido"
        assert resultados["frases_dialogo"]["status"] == "[OK] Valido"

    def test_validar_todos_com_historico_ausente(self, temp_json_files):
        """Testa validação quando histórico não existe (é opcional)."""
        # Remover arquivo de histórico
        historico_file = temp_json_files / "[BASE] Histórico de Prática.json"
        historico_file.unlink()

        validador = ValidadorJSON(base_path=str(temp_json_files))
        resultados = validador.validar_todos()

        assert "AVISO" in resultados["historico_pratica"]["status"]
        assert "opcional" in resultados["historico_pratica"]["status"]

    def test_validar_todos_com_erros(self, tmp_path):
        """Testa validação quando há erros nos arquivos."""
        # Criar apenas um arquivo inválido
        arquivo = tmp_path / "[BASE] Conhecimento de idiomas.json"
        with open(arquivo, 'w') as f:
            f.write("invalid")

        validador = ValidadorJSON(base_path=str(tmp_path))
        resultados = validador.validar_todos()

        assert resultados["conhecimento_idiomas"]["status"] == "[ERRO] Invalido"
        assert "erro" in resultados["conhecimento_idiomas"]
