import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { NominataClient } from './NominataClient'
import { calcularAlAtual } from '@/lib/auth/utils'

export const metadata = { title: 'Nominata | LEO Portal' }

export default async function NominataPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return <NominataClient alAtual={session.user.alAtual ?? calcularAlAtual()} />
}
