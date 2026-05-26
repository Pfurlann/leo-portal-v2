import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { eventoSchema } from '@/schemas/evento.schema'
import { findEventoById, updateEvento, deleteEvento } from '@/server/repositories/eventos.repository'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const evento = await findEventoById(id)
    if (!evento) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(evento)
  } catch (err) {
    console.error('[eventos/:id GET]', err)
    return NextResponse.json({ error: 'Erro ao buscar evento' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.tipoAcesso !== 'distrito') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  try {
    const body = await req.json()
    const data = eventoSchema.partial().parse(body)
    const evento = await updateEvento(id, data)
    return NextResponse.json(evento)
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[eventos/:id PATCH]', err)
    return NextResponse.json({ error: 'Erro ao atualizar evento' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.tipoAcesso !== 'distrito') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  try {
    await deleteEvento(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[eventos/:id DELETE]', err)
    return NextResponse.json({ error: 'Erro ao excluir evento' }, { status: 500 })
  }
}
