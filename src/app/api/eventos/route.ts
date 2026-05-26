import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { eventoSchema } from '@/schemas/evento.schema'
import { createEvento, findAllEventos } from '@/server/repositories/eventos.repository'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const eventos = await findAllEventos()
    return NextResponse.json(eventos)
  } catch (err) {
    console.error('[eventos GET]', err)
    return NextResponse.json({ error: 'Erro ao listar eventos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // Only distrito can create events
  if (session.user.tipoAcesso !== 'distrito') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const body = await req.json()
    const data = eventoSchema.parse(body)
    const evento = await createEvento(data)
    return NextResponse.json(evento, { status: 201 })
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    console.error('[eventos POST]', err)
    return NextResponse.json({ error: 'Erro ao criar evento' }, { status: 500 })
  }
}
