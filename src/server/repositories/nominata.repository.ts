import { db } from '@/lib/db'
import { NominataFormData } from '@/schemas/nominata.schema'

export async function findNominataByClube(clubeNome: string, anoLeonistico?: string) {
  return db.nominataDirigente.findMany({
    where: {
      clube: clubeNome,
      ...(anoLeonistico ? { anoLeonistico } : {}),
    },
    orderBy: { cargo: 'asc' },
  })
}

export async function findAllNominata(anoLeonistico?: string) {
  return db.nominataDirigente.findMany({
    where: anoLeonistico ? { anoLeonistico } : {},
    orderBy: [{ clube: 'asc' }, { cargo: 'asc' }],
  })
}

export async function findNominataById(id: string) {
  return db.nominataDirigente.findUnique({ where: { id } })
}

export async function createNominata(data: NominataFormData, clubeNome: string) {
  return db.nominataDirigente.create({
    data: {
      ...data,
      clube: clubeNome,
      pessoaRtmaId: data.pessoaRtmaId || undefined,
      dataCadastro: new Date(),
    },
  })
}

export async function updateNominata(id: string, data: Partial<NominataFormData>) {
  return db.nominataDirigente.update({
    where: { id },
    data: {
      ...data,
      pessoaRtmaId: data.pessoaRtmaId || undefined,
      dataEdicao: new Date(),
      updatedAt: new Date(),
    },
  })
}

export async function deleteNominata(id: string) {
  return db.nominataDirigente.delete({ where: { id } })
}
