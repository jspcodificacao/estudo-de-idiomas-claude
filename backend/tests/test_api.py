"""
Testes para os endpoints da API FastAPI.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from pydantic import ValidationError
from main import app
from models import ConhecimentoIdioma, BasePrompts, BaseHistoricoPratica, BaseFrasesDialogo


@pytest.fixture
def client():
    """Fixture que fornece um cliente de teste para a API."""
    return TestClient(app)


class TestRootEndpoint:
    """Testes para o endpoint raiz."""

    def test_root_endpoint(self, client):
        """Testa o endpoint raiz da API."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["mensagem"] == "API de Estudo de Idiomas"
        assert "endpoints" in data
        assert len(data["endpoints"]) == 4


class TestBaseConhecimentoEndpoint:
    """Testes para o endpoint /api/base_de_conhecimento."""

    def test_get_base_conhecimento_sucesso(self, client, conhecimento_lista_valida):
        """Testa busca bem-sucedida da base de conhecimento."""
        # Mock do validador
        with patch('main.validador.validar_conhecimento_idiomas') as mock_validar:
            conhecimentos = [ConhecimentoIdioma(**k) for k in conhecimento_lista_valida]
            mock_validar.return_value = conhecimentos

            response = client.get("/api/base_de_conhecimento")
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["texto_original"] == "Hallo"
            assert data[0]["idioma"] == "alemao"

    def test_get_base_conhecimento_arquivo_nao_encontrado(self, client):
        """Testa erro 404 quando arquivo não é encontrado."""
        with patch('main.validador.validar_conhecimento_idiomas') as mock_validar:
            mock_validar.side_effect = FileNotFoundError("Arquivo não encontrado")

            response = client.get("/api/base_de_conhecimento")
            assert response.status_code == 404
            assert "não encontrado" in response.json()["detail"].lower()

    def test_get_base_conhecimento_erro_validacao(self, client):
        """Testa erro 422 quando validação falha."""
        with patch('main.validador.validar_conhecimento_idiomas') as mock_validar:
            mock_validar.side_effect = ValidationError.from_exception_data(
                "ConhecimentoIdioma",
                [{"type": "missing", "loc": ("texto_original",), "msg": "Field required", "input": {}}]
            )

            response = client.get("/api/base_de_conhecimento")
            assert response.status_code == 422
            assert "validação" in response.json()["detail"].lower()

    def test_get_base_conhecimento_erro_interno(self, client):
        """Testa erro 500 para erros internos."""
        with patch('main.validador.validar_conhecimento_idiomas') as mock_validar:
            mock_validar.side_effect = Exception("Erro interno")

            response = client.get("/api/base_de_conhecimento")
            assert response.status_code == 500
            assert "interno" in response.json()["detail"].lower()


class TestPromptsEndpoint:
    """Testes para o endpoint /api/prompts."""

    def test_get_prompts_sucesso(self, client, base_prompts_valida):
        """Testa busca bem-sucedida dos prompts."""
        with patch('main.validador.validar_prompts') as mock_validar:
            prompts = BasePrompts(**base_prompts_valida)
            mock_validar.return_value = prompts

            response = client.get("/api/prompts")
            assert response.status_code == 200
            data = response.json()
            assert data["descricao"] == base_prompts_valida["descricao"]
            assert len(data["prompts"]) == 1

    def test_get_prompts_arquivo_nao_encontrado(self, client):
        """Testa erro 404 quando arquivo não é encontrado."""
        with patch('main.validador.validar_prompts') as mock_validar:
            mock_validar.side_effect = FileNotFoundError("Arquivo não encontrado")

            response = client.get("/api/prompts")
            assert response.status_code == 404

    def test_get_prompts_erro_validacao(self, client):
        """Testa erro 422 quando validação falha."""
        with patch('main.validador.validar_prompts') as mock_validar:
            mock_validar.side_effect = ValidationError.from_exception_data(
                "BasePrompts",
                [{"type": "missing", "loc": ("prompts",), "msg": "Field required", "input": {}}]
            )

            response = client.get("/api/prompts")
            assert response.status_code == 422


class TestHistoricoPraticaEndpoint:
    """Testes para o endpoint /api/historico_de_pratica."""

    def test_get_historico_sucesso(self, client, historico_pratica_valido):
        """Testa busca bem-sucedida do histórico."""
        with patch('main.validador.validar_historico_pratica') as mock_validar:
            historico = BaseHistoricoPratica(**historico_pratica_valido)
            mock_validar.return_value = historico

            response = client.get("/api/historico_de_pratica")
            assert response.status_code == 200
            data = response.json()
            assert len(data["exercicios"]) == 1

    def test_get_historico_arquivo_nao_encontrado_retorna_vazio(self, client):
        """Testa que retorna histórico vazio quando arquivo não existe."""
        with patch('main.validador.validar_historico_pratica') as mock_validar:
            mock_validar.side_effect = FileNotFoundError("Arquivo não encontrado")

            response = client.get("/api/historico_de_pratica")
            assert response.status_code == 200
            data = response.json()
            assert data["exercicios"] == []

    def test_get_historico_erro_validacao(self, client):
        """Testa erro 422 quando validação falha."""
        with patch('main.validador.validar_historico_pratica') as mock_validar:
            mock_validar.side_effect = ValidationError.from_exception_data(
                "BaseHistoricoPratica",
                [{"type": "missing", "loc": ("exercicios",), "msg": "Field required", "input": {}}]
            )

            response = client.get("/api/historico_de_pratica")
            assert response.status_code == 422


class TestFrasesDialogoEndpoint:
    """Testes para o endpoint /api/frases_do_dialogo."""

    def test_get_frases_dialogo_sucesso(self, client, frases_dialogo_validas):
        """Testa busca bem-sucedida das frases de diálogo."""
        with patch('main.validador.validar_frases_dialogo') as mock_validar:
            frases = BaseFrasesDialogo(**frases_dialogo_validas)
            mock_validar.return_value = frases

            response = client.get("/api/frases_do_dialogo")
            assert response.status_code == 200
            data = response.json()
            assert data["saudacao"] == frases_dialogo_validas["saudacao"]
            assert len(data["intermediarias"]) == 3

    def test_get_frases_dialogo_arquivo_nao_encontrado(self, client):
        """Testa erro 404 quando arquivo não é encontrado."""
        with patch('main.validador.validar_frases_dialogo') as mock_validar:
            mock_validar.side_effect = FileNotFoundError("Arquivo não encontrado")

            response = client.get("/api/frases_do_dialogo")
            assert response.status_code == 404

    def test_get_frases_dialogo_erro_validacao(self, client):
        """Testa erro 422 quando validação falha."""
        with patch('main.validador.validar_frases_dialogo') as mock_validar:
            mock_validar.side_effect = ValidationError.from_exception_data(
                "BaseFrasesDialogo",
                [{"type": "missing", "loc": ("saudacao",), "msg": "Field required", "input": {}}]
            )

            response = client.get("/api/frases_do_dialogo")
            assert response.status_code == 422
