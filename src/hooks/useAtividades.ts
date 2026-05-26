'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AtividadeFormData } from '@/schemas/atividade.schema'

async function fetchAtividades() {
  const res = await fetch('/api/atividades')
  if (!res.ok) throw new Error('Erro ao carregar atividades')
  return res.json()
}

export function useAtividades() {
  return useQuery({ queryKey: ['atividades'], queryFn: fetchAtividades })
}

export function useCreateAtividade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: AtividadeFormData) => {
      const res = await fetch('/api/atividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao criar atividade')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['atividades'] }),
  })
}

export function useUpdateAtividade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AtividadeFormData> }) => {
      const res = await fetch(`/api/atividades/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao atualizar atividade')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['atividades'] }),
  })
}

export function useDeleteAtividade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/atividades/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir atividade')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['atividades'] }),
  })
}
