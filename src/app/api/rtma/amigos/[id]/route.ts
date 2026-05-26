import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { amigoConselheiroSchema } from '@/schemas/rtma.schema'
import { findAmigoById, updateAmigo, deleteAmigo } from '@/server/repositories/rtma.repository'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const amigo = await findAmigoById(id)
    if (!amigo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(amigo)
  } catch (err) {
    console.error('[rtma/amigos/:id GET]', err)
    return NextResponse.json({ error: 'Erro ao buscar amigo/conselheiro' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const data = amigoConselheiroSchema.partial().parse(body)
    return NextResponse.json(await updateAmigo(id, data))
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[rtma/amigos/:id PATCH]', err)
    return NextResponse.json({ error: 'Erro ao atualizar amigo/conselheiro' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await deleteAmigo(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[rtma/amigos/:id DELETE]', err)
    return NextResponse.json({ error: 'Erro ao excluir amigo/conselheiro' }, { status: 500 })
  }
}
