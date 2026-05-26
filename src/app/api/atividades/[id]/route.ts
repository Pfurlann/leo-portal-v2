import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { atividadeSchema } from '@/schemas/atividade.schema'
import { findAtividadeById, updateAtividade, deleteAtividade } from '@/server/repositories/atividades.repository'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const atividade = await findAtividadeById(id)
    if (!atividade) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(atividade)
  } catch (err) {
    console.error('[atividades/:id GET]', err)
    return NextResponse.json({ error: 'Erro ao buscar atividade' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const data = atividadeSchema.partial().parse(body)
    const atividade = await updateAtividade(id, data)
    return NextResponse.json(atividade)
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[atividades/:id PATCH]', err)
    return NextResponse.json({ error: 'Erro ao atualizar atividade' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await deleteAtividade(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[atividades/:id DELETE]', err)
    return NextResponse.json({ error: 'Erro ao excluir atividade' }, { status: 500 })
  }
}
