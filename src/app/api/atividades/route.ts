import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { atividadeSchema } from '@/schemas/atividade.schema'
import { createAtividade, findAtividadesByClube, findAllAtividades } from '@/server/repositories/atividades.repository'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const atividades = session.user.tipoAcesso === 'distrito'
      ? await findAllAtividades()
      : await findAtividadesByClube(session.user.clubeId)
    return NextResponse.json(atividades)
  } catch (err) {
    console.error('[atividades GET]', err)
    return NextResponse.json({ error: 'Erro ao listar atividades' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const data = atividadeSchema.parse(body)
    const atividade = await createAtividade(data, session.user.clubeId, session.user.clubeNome, session.user.alAtual)
    return NextResponse.json(atividade, { status: 201 })
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[atividades POST]', err)
    return NextResponse.json({ error: 'Erro ao criar atividade' }, { status: 500 })
  }
}
