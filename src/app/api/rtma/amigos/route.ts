import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { amigoConselheiroSchema } from '@/schemas/rtma.schema'
import { createAmigo, findAmigosByClube, findAllAmigos } from '@/server/repositories/rtma.repository'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const amigos = session.user.tipoAcesso === 'distrito'
      ? await findAllAmigos()
      : await findAmigosByClube(session.user.clubeId)
    return NextResponse.json(amigos)
  } catch (err) {
    console.error('[rtma/amigos GET]', err)
    return NextResponse.json({ error: 'Erro ao listar amigos/conselheiros' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const data = amigoConselheiroSchema.parse(body)
    const amigo = await createAmigo(data, session.user.clubeId, session.user.clubeNome)
    return NextResponse.json(amigo, { status: 201 })
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[rtma/amigos POST]', err)
    return NextResponse.json({ error: 'Erro ao criar amigo/conselheiro' }, { status: 500 })
  }
}
