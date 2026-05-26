import { z } from 'zod'

export const nominataSchema = z.object({
  cargo: z.string().min(1, 'Cargo obrigatório'),
  nome: z.string().min(1, 'Nome obrigatório'),
  anoLeonistico: z.string().optional(),
  urlFoto: z.string().optional(),
  formacao: z.string().optional(),
  profissao: z.string().optional(),
  pessoaRtmaId: z.string().uuid().optional().or(z.literal('')),
})

export type NominataFormData = z.infer<typeof nominataSchema>
