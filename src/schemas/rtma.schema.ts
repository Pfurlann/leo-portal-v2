import { z } from 'zod'

export const pessoaRtmaSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  status: z.string().optional(),
  tipo: z.string().optional(),
  numeroAssociado: z.string().optional(),
  cargo: z.string().optional(),
  formacao: z.string().optional(),
  profissao: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  logradouro: z.string().optional(),
  cidade: z.string().optional(),
  cep: z.string().optional(),
  dataNascimento: z.string().optional(),
  associadoDesde: z.string().optional(),
  dataDesligamento: z.string().optional(),
  dataPosseLions: z.string().optional(),
  dataInicioPreLeo: z.string().optional(),
  acaoTrimestre: z.string().optional(),
  foraneo: z.boolean().optional(),
  restricaoAlimentar: z.string().optional(),
})

export const amigoConselheiroSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  tipo: z.string().optional(),
  lionsClube: z.string().optional(),
  dataNascimento: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  cep: z.string().optional(),
})

export type PessoaRtmaFormData = z.infer<typeof pessoaRtmaSchema>
export type AmigoConselheiroFormData = z.infer<typeof amigoConselheiroSchema>
