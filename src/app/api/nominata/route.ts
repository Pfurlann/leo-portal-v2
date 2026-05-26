import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { nominataSchema } from '@/schemas/nominata.schema'
import { createNominata, findNominataByClube, findAllNominata } from '@/server/repositories/nominata.repository'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const al = req.nextUrl.searchParams.get('al') ?? undefined
  try {
    const nominata = session.user.tipoAcesso === 'distrito'
      ? await findAllNominata(al)
      : await findNominataByClube(session.user.clubeNome, al)
    return NextResponse.json(nominata)
  } catch (err) {
    console.error('[nominata GET]', err)
    return NextResponse.json({ error: 'Erro ao listar nominata' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const data = nominataSchema.parse(body)
    const item = await createNominata(data, session.user.clubeNome)
    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[nominata POST]', err)
    return NextResponse.json({ error: 'Erro ao criar membro da nominata' }, { status: 500 })
  }
}
