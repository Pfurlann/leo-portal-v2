'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { NominataFormData } from '@/schemas/nominata.schema'

async function fetchNominata(al?: string) {
  const url = al ? `/api/nominata?al=${al}` : '/api/nominata'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erro ao carregar nominata')
  return res.json()
}

export function useNominata(al?: string) {
  return useQuery({ queryKey: ['nominata', al], queryFn: () => fetchNominata(al) })
}

export function useCreateNominata(al?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: NominataFormData) => {
      const res = await fetch('/api/nominata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao criar membro da nominata')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nominata'] }),
  })
}

export function useUpdateNominata(al?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NominataFormData> }) => {
      const res = await fetch(`/api/nominata/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao atualizar nominata')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nominata'] }),
  })
}

export function useDeleteNominata() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/nominata/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir nominata')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nominata'] }),
  })
}
