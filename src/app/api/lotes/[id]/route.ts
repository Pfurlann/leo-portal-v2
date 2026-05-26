import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { eventoLoteSchema } from '@/schemas/evento.schema'
import { updateLote, deleteLote } from '@/server/repositories/eventos.repository'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.tipoAcesso !== 'distrito') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  try {
    const body = await req.json()
    const data = eventoLoteSchema.partial().parse(body)
    return NextResponse.json(await updateLote(id, data))
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[lotes/:id PATCH]', err)
    return NextResponse.json({ error: 'Erro ao atualizar lote' }, { status: 500 })
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
    await deleteLote(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[lotes/:id DELETE]', err)
    return NextResponse.json({ error: 'Erro ao excluir lote' }, { status: 500 })
  }
}
