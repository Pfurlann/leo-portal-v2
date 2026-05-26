import { db } from '@/lib/db'
import { CampanhaFormData } from '@/schemas/campanha.schema'

export async function findCampanhasByClube(clubeId: string) {
  return db.campanha.findMany({
    where: { clubeId },
    orderBy: [{ dataInicio: 'desc' }, { createdAt: 'desc' }],
  })
}

export async function findCampanhaById(id: string) {
  return db.campanha.findUnique({ where: { id } })
}

export async function findAllCampanhas() {
  return db.campanha.findMany({
    orderBy: [{ dataInicio: 'desc' }, { createdAt: 'desc' }],
  })
}

export async function createCampanha(
  data: CampanhaFormData,
  clubeId: string,
  clubeNome: string,
  alAtual: string
) {
  return db.campanha.create({
    data: {
      ...data,
      clubeId,
      clubeNome,
      al: data.al ?? alAtual,
      dataRegistro: new Date(),
      custoCampanha: data.custoCampanha != null ? data.custoCampanha : undefined,
      horasTrabalhadasPorPessoa: data.horasTrabalhadasPorPessoa != null ? data.horasTrabalhadasPorPessoa : undefined,
      horasTotaisTrabalhadas: data.horasTotaisTrabalhadas != null ? data.horasTotaisTrabalhadas : undefined,
    },
  })
}

export async function updateCampanha(id: string, data: Partial<CampanhaFormData>) {
  return db.campanha.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  })
}

export async function deleteCampanha(id: string) {
  return db.campanha.delete({ where: { id } })
}

export async function patchCampanhaFoto(id: string, fotoUrl: string) {
  return db.campanha.update({ where: { id }, data: { fotoOficialUrl: fotoUrl } })
}

export async function patchCampanhaVideo(id: string, videoUrl: string) {
  return db.campanha.update({ where: { id }, data: { videoUrl } })
}
