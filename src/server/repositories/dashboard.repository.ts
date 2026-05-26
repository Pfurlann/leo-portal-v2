import { db } from '@/lib/db'

export async function getDashboardStats(clubeId: string, clubeNome: string, alAtual: string) {
  const [campanhasCount, atividadesCount, membrosCount, ultimasCampanhas, ultimasAtividades] =
    await Promise.all([
      db.campanha.count({
        where: { clubeId, al: alAtual },
      }),
      db.atividade.count({
        where: { clubeId, al: alAtual },
      }),
      db.pessoaRtma.count({
        where: { clubeId, status: 'Ativo' },
      }),
      db.campanha.findMany({
        where: { clubeId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          titulo: true,
          dataInicio: true,
          eixoD8: true,
          pessoasImpactadas: true,
          createdAt: true,
        },
      }),
      db.atividade.findMany({
        where: { clubeId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          titulo: true,
          tipoAtividade: true,
          dataInicio: true,
          qtdAssociadosPresentes: true,
          createdAt: true,
        },
      }),
    ])

  return {
    campanhasCount,
    atividadesCount,
    membrosCount,
    ultimasCampanhas,
    ultimasAtividades,
  }
}
