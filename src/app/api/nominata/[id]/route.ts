import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { nominataSchema } from '@/schemas/nominata.schema'
import { findNominataById, updateNominata, deleteNominata } from '@/server/repositories/nominata.repository'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const data = nominataSchema.partial().parse(body)
    return NextResponse.json(await updateNominata(id, data))
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[nominata/:id PATCH]', err)
    return NextResponse.json({ error: 'Erro ao atualizar nominata' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await deleteNominata(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[nominata/:id DELETE]', err)
    return NextResponse.json({ error: 'Erro ao excluir nominata' }, { status: 500 })
  }
}
