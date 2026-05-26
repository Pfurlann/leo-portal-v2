import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { pessoaRtmaSchema } from '@/schemas/rtma.schema'
import { findPessoaById, updatePessoa, deletePessoa } from '@/server/repositories/rtma.repository'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const pessoa = await findPessoaById(id)
    if (!pessoa) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(pessoa)
  } catch (err) {
    console.error('[rtma/pessoas/:id GET]', err)
    return NextResponse.json({ error: 'Erro ao buscar membro' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const data = pessoaRtmaSchema.partial().parse(body)
    return NextResponse.json(await updatePessoa(id, data))
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[rtma/pessoas/:id PATCH]', err)
    return NextResponse.json({ error: 'Erro ao atualizar membro' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await deletePessoa(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[rtma/pessoas/:id DELETE]', err)
    return NextResponse.json({ error: 'Erro ao excluir membro' }, { status: 500 })
  }
}
