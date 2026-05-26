'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CampanhaFormData } from '@/schemas/campanha.schema'

async function fetchCampanhas() {
  const res = await fetch('/api/campanhas')
  if (!res.ok) throw new Error('Erro ao carregar campanhas')
  return res.json()
}

export function useCampanhas() {
  return useQuery({ queryKey: ['campanhas'], queryFn: fetchCampanhas })
}

export function useCreateCampanha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CampanhaFormData) => {
      const res = await fetch('/api/campanhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao criar campanha')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campanhas'] }),
  })
}

export function useUpdateCampanha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CampanhaFormData> }) => {
      const res = await fetch(`/api/campanhas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao atualizar campanha')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campanhas'] }),
  })
}

export function useDeleteCampanha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/campanhas/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir campanha')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campanhas'] }),
  })
}
