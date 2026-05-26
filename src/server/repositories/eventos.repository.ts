import { db } from '@/lib/db'
import { EventoFormData, EventoLoteFormData } from '@/schemas/evento.schema'

export async function findAllEventos() {
  return db.evento.findMany({
    orderBy: [{ dataEvento: 'desc' }, { createdAt: 'desc' }],
    include: {
      lotes: { orderBy: { ordem: 'asc' } },
      _count: { select: { inscricoes: true } },
    },
  })
}

export async function findEventoById(id: string) {
  return db.evento.findUnique({
    where: { id },
    include: {
      lotes: { orderBy: { ordem: 'asc' } },
      inscricoes: {
        orderBy: { createdAt: 'desc' },
        include: { lote: true },
      },
      modalidades: { include: { modalidade: true } },
    },
  })
}

export async function createEvento(data: EventoFormData) {
  return db.evento.create({
    data: {
      ...data,
      dataEvento: data.dataEvento ? new Date(data.dataEvento) : undefined,
      dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
      dataFim: data.dataFim ? new Date(data.dataFim) : undefined,
      clubeSedeNome: data.clubeSedeNome ?? '',
    },
  })
}

export async function updateEvento(id: string, data: Partial<EventoFormData>) {
  return db.evento.update({
    where: { id },
    data: {
      ...data,
      dataEvento: data.dataEvento ? new Date(data.dataEvento) : undefined,
      dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
      dataFim: data.dataFim ? new Date(data.dataFim) : undefined,
      updatedAt: new Date(),
    },
  })
}

export async function deleteEvento(id: string) {
  return db.evento.delete({ where: { id } })
}

// Lotes
export async function findLotesByEvento(eventoId: string) {
  return db.eventoLote.findMany({
    where: { eventoId },
    orderBy: { ordem: 'asc' },
  })
}

export async function createLote(data: EventoLoteFormData) {
  return db.eventoLote.create({
    data: {
      ...data,
      dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
      dataFim: data.dataFim ? new Date(data.dataFim) : undefined,
    },
  })
}

export async function updateLote(id: string, data: Partial<EventoLoteFormData>) {
  return db.eventoLote.update({
    where: { id },
    data: {
      ...data,
      dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
      dataFim: data.dataFim ? new Date(data.dataFim) : undefined,
      updatedAt: new Date(),
    },
  })
}

export async function deleteLote(id: string) {
  return db.eventoLote.delete({ where: { id } })
}

// Inscrições
export async function findInscricoesByEvento(eventoId: string) {
  return db.eventoInscricao.findMany({
    where: { eventoId },
    orderBy: { createdAt: 'desc' },
    include: { lote: true },
  })
}

export async function findInscricoesByClube(eventoId: string, clubeId: string) {
  return db.eventoInscricao.findMany({
    where: { eventoId, clubeId },
    orderBy: { createdAt: 'desc' },
    include: { lote: true },
  })
}
