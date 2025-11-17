"""
Modelos Pydantic 2 para validação dos arquivos JSON da aplicação de estudo de idiomas.
"""
from datetime import datetime
from typing import List, Optional, Any
from enum import Enum
from uuid import UUID
from pydantic import BaseModel, Field, RootModel


# ========== Conhecimento de Idiomas ==========

class IdiomaEnum(str, Enum):
    alemao = "alemao"
    ingles = "ingles"


class TipoConhecimentoEnum(str, Enum):
    frase = "frase"
    palavra = "palavra"


class ConhecimentoIdioma(BaseModel):
    """Modelo para um registro de conhecimento de idioma."""
    conhecimento_id: UUID = Field(..., description="Identificador único universal (UUID) para o registro")
    data_hora: datetime = Field(..., description="Data e hora da criação/modificação no formato ISO 8601")
    idioma: IdiomaEnum = Field(..., description="O idioma ao qual o conhecimento se refere")
    tipo_conhecimento: TipoConhecimentoEnum = Field(..., description="O tipo de conhecimento")
    texto_original: str = Field(..., min_length=1, description="O texto no idioma original")
    transcricao_ipa: Optional[str] = Field(None, description="Transcrição fonética opcional usando o IPA")
    traducao: str = Field(..., min_length=1, description="A tradução do texto original")
    divisao_silabica: Optional[str] = Field(None, description="A divisão silábica opcional do texto original")


class BaseConhecimentoIdiomas(RootModel[List[ConhecimentoIdioma]]):
    """Modelo para a base de conhecimento de idiomas (array de registros)."""
    pass


# ========== Prompts ==========

class PromptItem(BaseModel):
    """Modelo para um item de prompt."""
    prompt_id: str = Field(..., description="Um identificador único para cada prompt")
    descricao: str = Field(..., description="Uma explicação detalhada da finalidade e do funcionamento do prompt")
    template: str = Field(..., description="O texto base do prompt, incluindo os marcadores para substituição")
    parametros: List[str] = Field(..., description="Lista de nomes de parâmetros esperados pelo template")
    resposta_estruturada: bool = Field(..., description="Indica se a resposta esperada deve ser um JSON estruturado")
    estrutura_esperada: Optional[dict] = Field(None, description="Define a estrutura do JSON de resposta quando resposta_estruturada é verdadeiro")
    ultima_edicao: datetime = Field(..., description="A data e hora da última modificação deste prompt específico")


class BasePrompts(BaseModel):
    """Modelo para a base de prompts."""
    descricao: str = Field(..., description="Uma breve descrição do propósito geral do conjunto de prompts")
    data_atualizacao: datetime = Field(..., description="A data e hora da última atualização do arquivo de prompts")
    marcador_de_paramentros: str = Field(..., description="A string usada para delimitar os parâmetros dentro do template")
    prompts: List[PromptItem] = Field(..., description="Uma lista contendo as definições detalhadas de cada prompt")


# ========== Histórico de Prática ==========

class TipoPraticaEnum(str, Enum):
    traducao = "traducao"
    audicao = "audicao"
    pronuncia = "pronuncia"
    dialogo = "dialogo"
    pronuncia_de_numeros = "pronuncia_de_numeros"


class CampoEnum(str, Enum):
    texto_original = "texto_original"
    divisao_silabica = "divisao_silabica"
    transcricao_ipa = "transcricao_ipa"
    traducao = "traducao"


class VelocidadeEnum(str, Enum):
    velocidade_normal = "1.0"
    velocidade_media = "0.75"
    velocidade_lenta = "0.5"


class CorretoEnum(str, Enum):
    sim = "Sim"
    parcial = "Parcial"
    nao = "Não"


class ResultadoTraducao(BaseModel):
    """Resultado para exercício de tradução."""
    campo_fornecido: CampoEnum
    campos_preenchidos: List[CampoEnum] = Field(..., min_length=1, max_length=3)
    valores_preenchidos: List[str] = Field(..., min_length=1, max_length=3)
    campos_resultados: List[bool] = Field(..., min_length=1, max_length=3)


class ResultadoAudicao(BaseModel):
    """Resultado para exercício de audição."""
    texto_original: str
    transcricao_usuario: str
    correto: bool
    velocidade_utilizada: VelocidadeEnum


class ResultadoPronuncia(BaseModel):
    """Resultado para exercício de pronúncia."""
    texto_original: str
    transcricao_stt: str
    correto: CorretoEnum
    comentario: str


class ResultadoDialogo(BaseModel):
    """Resultado para exercício de diálogo."""
    correto: CorretoEnum


class ResultadoPronunciaNumeros(BaseModel):
    """Resultado para exercício de pronúncia de números."""
    numero_referencia: str
    texto_usuario: Optional[str] = None
    texto_correto: Optional[bool] = None
    texto_comentario: Optional[str] = None
    audio_transcricao: Optional[str] = None
    audio_correto: Optional[bool] = None
    audio_comentario: Optional[str] = None


class Exercicio(BaseModel):
    """Modelo para um exercício de prática."""
    data_hora: datetime = Field(..., description="Data e hora em que o exercício foi realizado")
    exercicio_id: UUID = Field(..., description="Identificador único para o registro do exercício")
    conhecimento_id: str = Field(..., description="Identificador para o conhecimento sendo praticado (UUID ou string)")
    idioma: IdiomaEnum = Field(..., description="O idioma que está sendo praticado")
    tipo_pratica: TipoPraticaEnum = Field(..., description="O tipo de exercício de prática realizado")
    resultado_exercicio: Any = Field(..., description="Resultados detalhados do exercício")


class BaseHistoricoPratica(BaseModel):
    """Modelo para o histórico de prática de exercícios."""
    exercicios: List[Exercicio] = Field(..., description="Uma lista de exercícios realizados")


# ========== Frases do Diálogo ==========

class BaseFrasesDialogo(BaseModel):
    """Modelo para as frases do diálogo."""
    model_config = {"extra": "forbid"}

    saudacao: str = Field(..., description="A frase de saudação")
    despedida: str = Field(..., description="A frase de despedida")
    intermediarias: List[str] = Field(..., min_length=1, description="Lista de frases intermediárias")
