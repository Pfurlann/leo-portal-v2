import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getDashboardStats } from '@/server/repositories/dashboard.repository'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clubeId, clubeNome, alAtual } = session.user

  try {
    const stats = await getDashboardStats(clubeId, clubeNome, alAtual)
    return NextResponse.json(stats)
  } catch (err) {
    console.error('[dashboard]', err)
    return NextResponse.json({ error: 'Erro ao carregar dashboard' }, { status: 500 })
  }
}
