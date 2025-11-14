// Tipos baseados nos modelos do backend

export enum IdiomaEnum {
  Ingles = "Inglês",
  Frances = "Francês",
  Alemao = "Alemão",
  Espanhol = "Espanhol"
}

export enum TipoPraticaEnum {
  Traducao = "traducao",
  Audicao = "audicao",
  Pronuncia = "pronuncia",
  Dialogo = "dialogo",
  PronunciaDeNumeros = "pronuncia_de_numeros"
}

export enum CampoEnum {
  TextoOriginal = "texto_original",
  DivisaoSilabica = "divisao_silabica",
  TranscricaoIpa = "transcricao_ipa",
  Traducao = "traducao"
}

export enum VelocidadeEnum {
  Normal = "1.0",
  Media = "0.75",
  Lenta = "0.5"
}

export enum CorretoEnum {
  Sim = "Sim",
  Parcial = "Parcial",
  Nao = "Não"
}

export interface ResultadoTraducao {
  campo_fornecido: CampoEnum
  campos_preenchidos: CampoEnum[]
  valores_preenchidos: string[]
  campos_resultados: boolean[]
}

export interface ResultadoAudicao {
  texto_original: string
  transcricao_usuario: string
  correto: boolean
  velocidade_utilizada: VelocidadeEnum
}

export interface ResultadoPronuncia {
  texto_original: string
  transcricao_stt: string
  correto: CorretoEnum
  comentario: string
}

export interface ResultadoDialogo {
  correto: CorretoEnum
}

export interface ResultadoPronunciaNumeros {
  numero_referencia: string
  audio_usuario_url: string
  transcricao_correta: string
  acertou: boolean
}

export type ResultadoExercicio =
  | ResultadoTraducao
  | ResultadoAudicao
  | ResultadoPronuncia
  | ResultadoDialogo
  | ResultadoPronunciaNumeros

export interface Exercicio {
  data_hora: string
  exercicio_id: string
  conhecimento_id: string
  idioma: IdiomaEnum
  tipo_pratica: TipoPraticaEnum
  resultado_exercicio: ResultadoExercicio
}

export interface BaseHistoricoPratica {
  exercicios: Exercicio[]
}
