import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { eventoLoteSchema } from '@/schemas/evento.schema'
import { createLote, findLotesByEvento } from '@/server/repositories/eventos.repository'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    return NextResponse.json(await findLotesByEvento(id))
  } catch (err) {
    console.error('[lotes GET]', err)
    return NextResponse.json({ error: 'Erro ao listar lotes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.tipoAcesso !== 'distrito') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  try {
    const body = await req.json()
    const data = eventoLoteSchema.parse({ ...body, eventoId: id })
    return NextResponse.json(await createLote(data), { status: 201 })
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[lotes POST]', err)
    return NextResponse.json({ error: 'Erro ao criar lote' }, { status: 500 })
  }
}
