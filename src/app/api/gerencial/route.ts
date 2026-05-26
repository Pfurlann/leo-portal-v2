import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getGerencialData } from '@/server/repositories/gerencial.repository'
import { calcularAlAtual } from '@/lib/auth/utils'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tipoAcesso } = session.user
  if (tipoAcesso !== 'distrito' && tipoAcesso !== 'regiao') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const al = req.nextUrl.searchParams.get('al') ?? calcularAlAtual()

  try {
    const data = await getGerencialData(al)
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/gerencial error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
