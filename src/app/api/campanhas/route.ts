import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { campanhaSchema } from '@/schemas/campanha.schema'
import { createCampanha, findCampanhasByClube, findAllCampanhas } from '@/server/repositories/campanhas.repository'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const campanhas = session.user.tipoAcesso === 'distrito'
      ? await findAllCampanhas()
      : await findCampanhasByClube(session.user.clubeId)
    return NextResponse.json(campanhas)
  } catch (err) {
    console.error('[campanhas GET]', err)
    return NextResponse.json({ error: 'Erro ao listar campanhas' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const data = campanhaSchema.parse(body)
    const campanha = await createCampanha(data, session.user.clubeId, session.user.clubeNome, session.user.alAtual)
    return NextResponse.json(campanha, { status: 201 })
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[campanhas POST]', err)
    return NextResponse.json({ error: 'Erro ao criar campanha' }, { status: 500 })
  }
}
