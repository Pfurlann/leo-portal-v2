import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { campanhaSchema } from '@/schemas/campanha.schema'
import { findCampanhaById, updateCampanha, deleteCampanha } from '@/server/repositories/campanhas.repository'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const campanha = await findCampanhaById(id)
    if (!campanha) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 })
    return NextResponse.json(campanha)
  } catch (err) {
    console.error('[campanhas/:id GET]', err)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const data = campanhaSchema.partial().parse(body)
    const campanha = await updateCampanha(id, data)
    return NextResponse.json(campanha)
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[campanhas/:id PATCH]', err)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await deleteCampanha(id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[campanhas/:id DELETE]', err)
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 })
  }
}
