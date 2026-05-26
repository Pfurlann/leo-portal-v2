import { z } from 'zod'

export const atividadeSchema = z.object({
  titulo: z.string().min(1, 'Título obrigatório'),
  tipoAtividade: z.string().optional(),
  al: z.string().optional(),
  trimestre: z.string().optional(),
  dataInicio: z.string().optional(),
  horaInicio: z.string().optional(),
  dataFim: z.string().optional(),
  horaFim: z.string().optional(),
  localAtividade: z.string().optional(),
  associadosPresentes: z.string().optional(),
  qtdAssociadosPresentes: z.coerce.number().int().min(0).optional(),
  preLeosPresentes: z.string().optional(),
  qtdPreLeosPresentes: z.coerce.number().int().min(0).optional(),
  leoLeaoPresentes: z.string().optional(),
  qtdLeoLeaoPresentes: z.coerce.number().int().min(0).optional(),
  amigosConselheirosPresentes: z.string().optional(),
  qtdAmigosConselheirosPresentes: z.coerce.number().int().min(0).optional(),
  outrosLions: z.coerce.number().int().min(0).optional(),
  descricaoAtividade: z.string().optional(),
  fotoOficialUrl: z.string().optional(),
  duracaoTotalMinutos: z.coerce.number().int().min(0).optional(),
})

export type AtividadeFormData = z.infer<typeof atividadeSchema>
