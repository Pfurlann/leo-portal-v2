import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { pessoaRtmaSchema } from '@/schemas/rtma.schema'
import { createPessoa, findPessoasByClube, findAllPessoas } from '@/server/repositories/rtma.repository'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const pessoas = session.user.tipoAcesso === 'distrito'
      ? await findAllPessoas()
      : await findPessoasByClube(session.user.clubeId)
    return NextResponse.json(pessoas)
  } catch (err) {
    console.error('[rtma/pessoas GET]', err)
    return NextResponse.json({ error: 'Erro ao listar membros' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const data = pessoaRtmaSchema.parse(body)
    const pessoa = await createPessoa(data, session.user.clubeId, session.user.clubeNome)
    return NextResponse.json(pessoa, { status: 201 })
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[rtma/pessoas POST]', err)
    return NextResponse.json({ error: 'Erro ao criar membro' }, { status: 500 })
  }
}
