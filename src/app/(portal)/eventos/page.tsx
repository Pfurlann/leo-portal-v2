import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { EventosClient } from './EventosClient'

export const metadata = { title: 'Eventos | LEO Portal' }

export default async function EventosPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return <EventosClient isDistrito={session.user.tipoAcesso === 'distrito'} />
}
