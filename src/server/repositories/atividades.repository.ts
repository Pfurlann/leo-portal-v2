import { db } from '@/lib/db'
import { AtividadeFormData } from '@/schemas/atividade.schema'

export async function findAtividadesByClube(clubeId: string) {
  return db.atividade.findMany({
    where: { clubeId },
    orderBy: [{ dataInicio: 'desc' }, { createdAt: 'desc' }],
  })
}

export async function findAllAtividades() {
  return db.atividade.findMany({
    orderBy: [{ dataInicio: 'desc' }, { createdAt: 'desc' }],
  })
}

export async function findAtividadeById(id: string) {
  return db.atividade.findUnique({ where: { id } })
}

export async function createAtividade(
  data: AtividadeFormData,
  clubeId: string,
  clubeNome: string,
  alAtual: string
) {
  return db.atividade.create({
    data: {
      ...data,
      clubeId,
      clubeNome,
      al: data.al ?? alAtual,
      dataRegistro: new Date(),
      dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
      dataFim: data.dataFim ? new Date(data.dataFim) : undefined,
    },
  })
}

export async function updateAtividade(id: string, data: Partial<AtividadeFormData>) {
  return db.atividade.update({
    where: { id },
    data: {
      ...data,
      dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
      dataFim: data.dataFim ? new Date(data.dataFim) : undefined,
      updatedAt: new Date(),
    },
  })
}

export async function deleteAtividade(id: string) {
  return db.atividade.delete({ where: { id } })
}
