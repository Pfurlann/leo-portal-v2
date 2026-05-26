'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { EventoFormData, EventoLoteFormData } from '@/schemas/evento.schema'

async function fetchEventos() {
  const res = await fetch('/api/eventos')
  if (!res.ok) throw new Error('Erro ao carregar eventos')
  return res.json()
}

async function fetchEvento(id: string) {
  const res = await fetch(`/api/eventos/${id}`)
  if (!res.ok) throw new Error('Erro ao carregar evento')
  return res.json()
}

export function useEventos() {
  return useQuery({ queryKey: ['eventos'], queryFn: fetchEventos })
}

export function useEvento(id: string) {
  return useQuery({ queryKey: ['eventos', id], queryFn: () => fetchEvento(id), enabled: !!id })
}

export function useCreateEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: EventoFormData) => {
      const res = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao criar evento')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['eventos'] }),
  })
}

export function useUpdateEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventoFormData> }) => {
      const res = await fetch(`/api/eventos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao atualizar evento')
      return res.json()
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['eventos'] })
      qc.invalidateQueries({ queryKey: ['eventos', id] })
    },
  })
}

export function useDeleteEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/eventos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir evento')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['eventos'] }),
  })
}

// Lotes
export function useCreateLote(eventoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<EventoLoteFormData, 'eventoId'>) => {
      const res = await fetch(`/api/eventos/${eventoId}/lotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao criar lote')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['eventos', eventoId] }),
  })
}

export function useUpdateLote(eventoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventoLoteFormData> }) => {
      const res = await fetch(`/api/lotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao atualizar lote')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['eventos', eventoId] }),
  })
}

export function useDeleteLote(eventoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/lotes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir lote')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['eventos', eventoId] }),
  })
}

// Inscrições
export function useInscricoes(eventoId: string) {
  return useQuery({
    queryKey: ['inscricoes', eventoId],
    queryFn: async () => {
      const res = await fetch(`/api/eventos/${eventoId}/inscricoes`)
      if (!res.ok) throw new Error('Erro ao carregar inscrições')
      return res.json()
    },
    enabled: !!eventoId,
  })
}
