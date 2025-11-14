"""
Testes para os modelos Pydantic.
"""
import pytest
from datetime import datetime
from uuid import uuid4
from pydantic import ValidationError
from models import (
    ConhecimentoIdioma,
    BasePrompts,
    PromptItem,
    Exercicio,
    BaseHistoricoPratica,
    BaseFrasesDialogo,
    IdiomaEnum,
    TipoConhecimentoEnum,
    TipoPraticaEnum
)


class TestConhecimentoIdioma:
    """Testes para o modelo ConhecimentoIdioma."""

    def test_conhecimento_valido(self, conhecimento_valido):
        """Testa criação de conhecimento válido."""
        conhecimento = ConhecimentoIdioma(**conhecimento_valido)
        assert conhecimento.texto_original == "Hallo"
        assert conhecimento.traducao == "Olá"
        assert conhecimento.idioma == IdiomaEnum.alemao

    def test_conhecimento_sem_campos_opcionais(self, conhecimento_valido):
        """Testa conhecimento sem campos opcionais."""
        conhecimento_valido.pop("transcricao_ipa")
        conhecimento_valido.pop("divisao_silabica")
        conhecimento = ConhecimentoIdioma(**conhecimento_valido)
        assert conhecimento.transcricao_ipa is None
        assert conhecimento.divisao_silabica is None

    def test_conhecimento_sem_campo_obrigatorio(self, conhecimento_valido):
        """Testa que falta de campo obrigatório gera erro."""
        conhecimento_valido.pop("texto_original")
        with pytest.raises(ValidationError):
            ConhecimentoIdioma(**conhecimento_valido)

    def test_conhecimento_idioma_invalido(self, conhecimento_valido):
        """Testa que idioma inválido gera erro."""
        conhecimento_valido["idioma"] = "frances"
        with pytest.raises(ValidationError):
            ConhecimentoIdioma(**conhecimento_valido)

    def test_conhecimento_tipo_invalido(self, conhecimento_valido):
        """Testa que tipo de conhecimento inválido gera erro."""
        conhecimento_valido["tipo_conhecimento"] = "verbo"
        with pytest.raises(ValidationError):
            ConhecimentoIdioma(**conhecimento_valido)

    def test_conhecimento_uuid_invalido(self, conhecimento_valido):
        """Testa que UUID inválido gera erro."""
        conhecimento_valido["conhecimento_id"] = "não-é-uuid"
        with pytest.raises(ValidationError):
            ConhecimentoIdioma(**conhecimento_valido)

    def test_conhecimento_data_invalida(self, conhecimento_valido):
        """Testa que data inválida gera erro."""
        conhecimento_valido["data_hora"] = "2023-13-45"
        with pytest.raises(ValidationError):
            ConhecimentoIdioma(**conhecimento_valido)


class TestBasePrompts:
    """Testes para o modelo BasePrompts."""

    def test_base_prompts_valida(self, base_prompts_valida):
        """Testa criação de base de prompts válida."""
        base = BasePrompts(**base_prompts_valida)
        assert len(base.prompts) == 1
        assert base.prompts[0].prompt_id == "traducao_001"

    def test_base_prompts_sem_campo_obrigatorio(self, base_prompts_valida):
        """Testa que falta de campo obrigatório gera erro."""
        base_prompts_valida.pop("marcador_de_paramentros")
        with pytest.raises(ValidationError):
            BasePrompts(**base_prompts_valida)

    def test_prompt_item_valido(self, prompt_valido):
        """Testa criação de prompt item válido."""
        prompt = PromptItem(**prompt_valido)
        assert prompt.prompt_id == "traducao_001"
        assert prompt.resposta_estruturada is True

    def test_prompt_item_sem_estrutura_esperada(self, prompt_valido):
        """Testa prompt sem estrutura_esperada quando resposta_estruturada é False."""
        prompt_valido["resposta_estruturada"] = False
        prompt_valido.pop("estrutura_esperada")
        prompt = PromptItem(**prompt_valido)
        assert prompt.estrutura_esperada is None


class TestExercicio:
    """Testes para o modelo Exercicio."""

    def test_exercicio_traducao_valido(self, exercicio_traducao_valido):
        """Testa criação de exercício de tradução válido."""
        exercicio = Exercicio(**exercicio_traducao_valido)
        assert exercicio.tipo_pratica == TipoPraticaEnum.traducao
        assert exercicio.resultado_exercicio["campo_fornecido"] == "texto_original"

    def test_exercicio_audicao_valido(self, exercicio_audicao_valido):
        """Testa criação de exercício de audição válido."""
        exercicio = Exercicio(**exercicio_audicao_valido)
        assert exercicio.tipo_pratica == TipoPraticaEnum.audicao
        assert exercicio.resultado_exercicio["velocidade_utilizada"] == "1.0"

    def test_exercicio_tipo_pratica_invalido(self, exercicio_traducao_valido):
        """Testa que tipo de prática inválido gera erro."""
        exercicio_traducao_valido["tipo_pratica"] = "escrita"
        with pytest.raises(ValidationError):
            Exercicio(**exercicio_traducao_valido)


class TestBaseHistoricoPratica:
    """Testes para o modelo BaseHistoricoPratica."""

    def test_historico_valido(self, historico_pratica_valido):
        """Testa criação de histórico válido."""
        historico = BaseHistoricoPratica(**historico_pratica_valido)
        assert len(historico.exercicios) == 1

    def test_historico_vazio(self):
        """Testa criação de histórico vazio."""
        historico = BaseHistoricoPratica(exercicios=[])
        assert len(historico.exercicios) == 0


class TestBaseFrasesDialogo:
    """Testes para o modelo BaseFrasesDialogo."""

    def test_frases_dialogo_validas(self, frases_dialogo_validas):
        """Testa criação de frases de diálogo válidas."""
        frases = BaseFrasesDialogo(**frases_dialogo_validas)
        assert frases.saudacao == "Olá! Vamos começar?"
        assert len(frases.intermediarias) == 3

    def test_frases_dialogo_sem_intermediarias(self, frases_dialogo_validas):
        """Testa que lista vazia de intermediárias gera erro."""
        frases_dialogo_validas["intermediarias"] = []
        with pytest.raises(ValidationError):
            BaseFrasesDialogo(**frases_dialogo_validas)

    def test_frases_dialogo_sem_campo_obrigatorio(self, frases_dialogo_validas):
        """Testa que falta de campo obrigatório gera erro."""
        frases_dialogo_validas.pop("despedida")
        with pytest.raises(ValidationError):
            BaseFrasesDialogo(**frases_dialogo_validas)

    def test_frases_dialogo_com_campo_extra(self, frases_dialogo_validas):
        """Testa que campo extra gera erro (additionalProperties: false)."""
        frases_dialogo_validas["campo_extra"] = "valor"
        with pytest.raises(ValidationError):
            BaseFrasesDialogo(**frases_dialogo_validas)
