import { db } from '@/lib/db'
import { PessoaRtmaFormData, AmigoConselheiroFormData } from '@/schemas/rtma.schema'

// Pessoas RTMA
export async function findPessoasByClube(clubeId: string) {
  return db.pessoaRtma.findMany({
    where: { clubeId },
    orderBy: [{ status: 'asc' }, { nome: 'asc' }],
  })
}

export async function findAllPessoas() {
  return db.pessoaRtma.findMany({
    orderBy: [{ clubeNome: 'asc' }, { nome: 'asc' }],
  })
}

export async function findPessoaById(id: string) {
  return db.pessoaRtma.findUnique({ where: { id } })
}

function parseDateField(s: string | undefined): Date | undefined {
  if (!s) return undefined
  const d = new Date(s)
  return isNaN(d.getTime()) ? undefined : d
}

export async function createPessoa(data: PessoaRtmaFormData, clubeId: string, clubeNome: string) {
  return db.pessoaRtma.create({
    data: {
      ...data,
      clubeId,
      clubeNome,
      email: data.email || undefined,
      dataNascimento: parseDateField(data.dataNascimento),
      associadoDesde: parseDateField(data.associadoDesde),
      dataDesligamento: parseDateField(data.dataDesligamento),
      dataPosseLions: parseDateField(data.dataPosseLions),
      dataInicioPreLeo: parseDateField(data.dataInicioPreLeo),
    },
  })
}

export async function updatePessoa(id: string, data: Partial<PessoaRtmaFormData>) {
  return db.pessoaRtma.update({
    where: { id },
    data: {
      ...data,
      email: data.email || undefined,
      dataNascimento: parseDateField(data.dataNascimento),
      associadoDesde: parseDateField(data.associadoDesde),
      dataDesligamento: parseDateField(data.dataDesligamento),
      dataPosseLions: parseDateField(data.dataPosseLions),
      dataInicioPreLeo: parseDateField(data.dataInicioPreLeo),
      updatedAt: new Date(),
    },
  })
}

export async function deletePessoa(id: string) {
  return db.pessoaRtma.delete({ where: { id } })
}

// Amigos Conselheiros
export async function findAmigosByClube(clubeId: string) {
  return db.amigoConselheiro.findMany({
    where: { clubeId },
    orderBy: { nome: 'asc' },
  })
}

export async function findAllAmigos() {
  return db.amigoConselheiro.findMany({
    orderBy: [{ clubeNome: 'asc' }, { nome: 'asc' }],
  })
}

export async function findAmigoById(id: string) {
  return db.amigoConselheiro.findUnique({ where: { id } })
}

export async function createAmigo(data: AmigoConselheiroFormData, clubeId: string, clubeNome: string) {
  return db.amigoConselheiro.create({
    data: {
      ...data,
      clubeId,
      clubeNome,
      email: data.email || undefined,
    },
  })
}

export async function updateAmigo(id: string, data: Partial<AmigoConselheiroFormData>) {
  return db.amigoConselheiro.update({
    where: { id },
    data: {
      ...data,
      email: data.email || undefined,
      updatedAt: new Date(),
    },
  })
}

export async function deleteAmigo(id: string) {
  return db.amigoConselheiro.delete({ where: { id } })
}
