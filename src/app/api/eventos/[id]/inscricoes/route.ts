import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { findInscricoesByEvento, findInscricoesByClube } from '@/server/repositories/eventos.repository'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const inscricoes = session.user.tipoAcesso === 'distrito'
      ? await findInscricoesByEvento(id)
      : await findInscricoesByClube(id, session.user.clubeId)
    return NextResponse.json(inscricoes)
  } catch (err) {
    console.error('[inscricoes GET]', err)
    return NextResponse.json({ error: 'Erro ao listar inscrições' }, { status: 500 })
  }
}
