'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PessoaRtmaFormData, AmigoConselheiroFormData } from '@/schemas/rtma.schema'

// Pessoas RTMA
async function fetchPessoas() {
  const res = await fetch('/api/rtma/pessoas')
  if (!res.ok) throw new Error('Erro ao carregar membros')
  return res.json()
}

export function usePessoas() {
  return useQuery({ queryKey: ['rtma', 'pessoas'], queryFn: fetchPessoas })
}

export function useCreatePessoa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: PessoaRtmaFormData) => {
      const res = await fetch('/api/rtma/pessoas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao criar membro')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rtma', 'pessoas'] }),
  })
}

export function useUpdatePessoa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PessoaRtmaFormData> }) => {
      const res = await fetch(`/api/rtma/pessoas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao atualizar membro')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rtma', 'pessoas'] }),
  })
}

export function useDeletePessoa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/rtma/pessoas/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir membro')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rtma', 'pessoas'] }),
  })
}

// Amigos/Conselheiros
async function fetchAmigos() {
  const res = await fetch('/api/rtma/amigos')
  if (!res.ok) throw new Error('Erro ao carregar amigos/conselheiros')
  return res.json()
}

export function useAmigos() {
  return useQuery({ queryKey: ['rtma', 'amigos'], queryFn: fetchAmigos })
}

export function useCreateAmigo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: AmigoConselheiroFormData) => {
      const res = await fetch('/api/rtma/amigos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao criar amigo/conselheiro')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rtma', 'amigos'] }),
  })
}

export function useUpdateAmigo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AmigoConselheiroFormData> }) => {
      const res = await fetch(`/api/rtma/amigos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao atualizar amigo/conselheiro')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rtma', 'amigos'] }),
  })
}

export function useDeleteAmigo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/rtma/amigos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir amigo/conselheiro')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rtma', 'amigos'] }),
  })
}
