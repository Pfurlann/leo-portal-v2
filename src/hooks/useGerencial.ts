'use client'

import { useQuery } from '@tanstack/react-query'
import type { GerencialData } from '@/server/repositories/gerencial.repository'

export function useGerencial(al?: string) {
  return useQuery<GerencialData>({
    queryKey: ['gerencial', al],
    queryFn: async () => {
      const params = al ? `?al=${al}` : ''
      const res = await fetch(`/api/gerencial${params}`)
      if (!res.ok) throw new Error('Erro ao carregar dados gerenciais')
      return res.json()
    },
  })
}
