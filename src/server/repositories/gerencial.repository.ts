import { db } from '@/lib/db'

export type ClubeStat = {
  id: string
  nome: string
  regiao: string | null
  membrosAtivos: number
  atividades: number
  campanhas: number
}

export type RegiaoStat = {
  regiao: string
  clubes: ClubeStat[]
  totalMembros: number
  totalAtividades: number
  totalCampanhas: number
}

export type GerencialData = {
  al: string
  totalClubes: number
  totalMembros: number
  totalAtividades: number
  totalCampanhas: number
  totalEventos: number
  regioes: RegiaoStat[]
  clubesSemRegistro: ClubeStat[]
}

export async function getGerencialData(al: string): Promise<GerencialData> {
  const [clubes, membrosGroup, atividadesGroup, campanhasGroup, totalEventos] = await Promise.all([
    db.clube.findMany({
      select: { id: true, nome: true, regiao: true, status: true },
      where: { status: 'Ativo' },
      orderBy: [{ regiao: 'asc' }, { nome: 'asc' }],
    }),
    db.pessoaRtma.groupBy({
      by: ['clubeId'],
      where: { status: 'Ativo' },
      _count: { id: true },
    }),
    db.atividade.groupBy({
      by: ['clubeId'],
      where: { al },
      _count: { id: true },
    }),
    db.campanha.groupBy({
      by: ['clubeId'],
      where: { al },
      _count: { id: true },
    }),
    db.evento.count(),
  ])

  const membrosMap = new Map(membrosGroup.map((r) => [r.clubeId ?? '', r._count.id]))
  const atividadesMap = new Map(atividadesGroup.map((r) => [r.clubeId ?? '', r._count.id]))
  const campanhasMap = new Map(campanhasGroup.map((r) => [r.clubeId ?? '', r._count.id]))

  const clubeStats: ClubeStat[] = clubes.map((c) => ({
    id: c.id,
    nome: c.nome,
    regiao: c.regiao,
    membrosAtivos: membrosMap.get(c.id) ?? 0,
    atividades: atividadesMap.get(c.id) ?? 0,
    campanhas: campanhasMap.get(c.id) ?? 0,
  }))

  const REGIOES = ['A', 'B', 'D']
  const regioes: RegiaoStat[] = REGIOES.map((regiao) => {
    const clubesRegiao = clubeStats.filter((c) => c.regiao === regiao)
    return {
      regiao,
      clubes: clubesRegiao,
      totalMembros: clubesRegiao.reduce((s, c) => s + c.membrosAtivos, 0),
      totalAtividades: clubesRegiao.reduce((s, c) => s + c.atividades, 0),
      totalCampanhas: clubesRegiao.reduce((s, c) => s + c.campanhas, 0),
    }
  })

  const clubesSemRegistro = clubeStats.filter((c) => !REGIOES.includes(c.regiao ?? ''))

  return {
    al,
    totalClubes: clubes.length,
    totalMembros: clubeStats.reduce((s, c) => s + c.membrosAtivos, 0),
    totalAtividades: clubeStats.reduce((s, c) => s + c.atividades, 0),
    totalCampanhas: clubeStats.reduce((s, c) => s + c.campanhas, 0),
    totalEventos,
    regioes,
    clubesSemRegistro,
  }
}
