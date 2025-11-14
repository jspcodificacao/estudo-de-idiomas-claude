"""
Validador de arquivos JSON contra modelos Pydantic 2.
"""
import json
from pathlib import Path
from typing import Union, List
from pydantic import ValidationError
from models import (
    BaseConhecimentoIdiomas,
    BasePrompts,
    BaseHistoricoPratica,
    BaseFrasesDialogo,
    ConhecimentoIdioma
)


class ValidadorJSON:
    """Classe para validar arquivos JSON contra os modelos Pydantic."""

    def __init__(self, base_path: str = "../public"):
        """
        Inicializa o validador com o caminho base para os arquivos JSON.

        Args:
            base_path: Caminho para a pasta contendo os arquivos JSON
        """
        self.base_path = Path(base_path)

    def _carregar_json(self, nome_arquivo: str) -> Union[dict, list]:
        """
        Carrega um arquivo JSON.

        Args:
            nome_arquivo: Nome do arquivo JSON a ser carregado

        Returns:
            Dados do arquivo JSON (dict ou list)

        Raises:
            FileNotFoundError: Se o arquivo não for encontrado
            json.JSONDecodeError: Se o arquivo não for um JSON válido
        """
        caminho_completo = self.base_path / nome_arquivo

        if not caminho_completo.exists():
            raise FileNotFoundError(f"Arquivo não encontrado: {caminho_completo}")

        with open(caminho_completo, 'r', encoding='utf-8') as f:
            return json.load(f)

    def validar_conhecimento_idiomas(self) -> List[ConhecimentoIdioma]:
        """
        Valida o arquivo de conhecimento de idiomas.

        Returns:
            Lista de objetos ConhecimentoIdioma validados

        Raises:
            ValidationError: Se a validação falhar
        """
        dados = self._carregar_json("[BASE] Conhecimento de idiomas.json")

        # Valida cada item individualmente
        conhecimentos = [ConhecimentoIdioma(**item) for item in dados]
        return conhecimentos

    def validar_prompts(self) -> BasePrompts:
        """
        Valida o arquivo de prompts.

        Returns:
            Objeto BasePrompts validado

        Raises:
            ValidationError: Se a validação falhar
        """
        dados = self._carregar_json("[BASE] Prompts.json")
        return BasePrompts(**dados)

    def validar_historico_pratica(self) -> BaseHistoricoPratica:
        """
        Valida o arquivo de histórico de prática.

        Returns:
            Objeto BaseHistoricoPratica validado

        Raises:
            ValidationError: Se a validação falhar
            FileNotFoundError: Se o arquivo não existir (é opcional)
        """
        dados = self._carregar_json("[BASE] Histórico de Prática.json")
        return BaseHistoricoPratica(**dados)

    def validar_frases_dialogo(self) -> BaseFrasesDialogo:
        """
        Valida o arquivo de frases do diálogo.

        Returns:
            Objeto BaseFrasesDialogo validado

        Raises:
            ValidationError: Se a validação falhar
        """
        dados = self._carregar_json("[BASE] Frases do Diálogo.json")
        return BaseFrasesDialogo(**dados)

    def validar_todos(self) -> dict:
        """
        Valida todos os arquivos JSON.

        Returns:
            Dicionário com os resultados de todas as validações
        """
        resultados = {}

        # Validar conhecimento de idiomas
        try:
            conhecimentos = self.validar_conhecimento_idiomas()
            resultados["conhecimento_idiomas"] = {
                "status": "[OK] Valido",
                "total_registros": len(conhecimentos)
            }
        except (ValidationError, FileNotFoundError, json.JSONDecodeError) as e:
            resultados["conhecimento_idiomas"] = {
                "status": "[ERRO] Invalido",
                "erro": str(e)
            }

        # Validar prompts
        try:
            prompts = self.validar_prompts()
            resultados["prompts"] = {
                "status": "[OK] Valido",
                "total_prompts": len(prompts.prompts)
            }
        except (ValidationError, FileNotFoundError, json.JSONDecodeError) as e:
            resultados["prompts"] = {
                "status": "[ERRO] Invalido",
                "erro": str(e)
            }

        # Validar histórico de prática (opcional)
        try:
            historico = self.validar_historico_pratica()
            resultados["historico_pratica"] = {
                "status": "[OK] Valido",
                "total_exercicios": len(historico.exercicios)
            }
        except FileNotFoundError:
            resultados["historico_pratica"] = {
                "status": "[AVISO] Arquivo nao encontrado (opcional)",
                "info": "Sera criado um novo historico"
            }
        except (ValidationError, json.JSONDecodeError) as e:
            resultados["historico_pratica"] = {
                "status": "[ERRO] Invalido",
                "erro": str(e)
            }

        # Validar frases do diálogo
        try:
            frases = self.validar_frases_dialogo()
            resultados["frases_dialogo"] = {
                "status": "[OK] Valido",
                "total_intermediarias": len(frases.intermediarias)
            }
        except (ValidationError, FileNotFoundError, json.JSONDecodeError) as e:
            resultados["frases_dialogo"] = {
                "status": "[ERRO] Invalido",
                "erro": str(e)
            }

        return resultados


def main():
    """Função principal para executar a validação de todos os arquivos."""
    print("=" * 60)
    print("VALIDADOR DE ARQUIVOS JSON - Estudo de Idiomas")
    print("=" * 60)
    print()

    validador = ValidadorJSON()
    resultados = validador.validar_todos()

    for nome, resultado in resultados.items():
        print(f"\n{nome.upper().replace('_', ' ')}")
        print("-" * 40)
        print(f"Status: {resultado['status']}")

        if "total_registros" in resultado:
            print(f"Total de registros: {resultado['total_registros']}")
        elif "total_prompts" in resultado:
            print(f"Total de prompts: {resultado['total_prompts']}")
        elif "total_exercicios" in resultado:
            print(f"Total de exercícios: {resultado['total_exercicios']}")
        elif "total_intermediarias" in resultado:
            print(f"Total de frases intermediárias: {resultado['total_intermediarias']}")

        if "erro" in resultado:
            print(f"Erro: {resultado['erro']}")
        elif "info" in resultado:
            print(f"Info: {resultado['info']}")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
