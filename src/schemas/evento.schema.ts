import { z } from 'zod'

export const eventoSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  clubeSedeNome: z.string().optional(),
  clubeSedeId: z.string().optional(),
  dataEvento: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  descricao: z.string().optional(),
  pixKey: z.string().optional(),
  beneficiario: z.string().optional(),
  banco: z.string().optional(),
  contaCorrente: z.string().optional(),
  agencia: z.string().optional(),
  aceitarTrocas: z.boolean().optional(),
  fotoUrl: z.string().optional(),
  formularioConvidadosHabilitado: z.boolean().optional(),
  eventoTeraPassaportes: z.boolean().optional(),
  enviarPassaportePorEmail: z.boolean().optional(),
})

export const eventoLoteSchema = z.object({
  eventoId: z.string().uuid(),
  nomeLote: z.string().min(1, 'Nome do lote obrigatório'),
  ordem: z.coerce.number().int().min(0).optional(),
  quantidadeTotal: z.coerce.number().int().min(0).optional(),
  valor: z.coerce.number().min(0).optional(),
  ativo: z.boolean().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
})

export type EventoFormData = z.infer<typeof eventoSchema>
export type EventoLoteFormData = z.infer<typeof eventoLoteSchema>
