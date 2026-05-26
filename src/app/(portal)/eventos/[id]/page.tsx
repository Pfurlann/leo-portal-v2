import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { EventoDetalheClient } from './EventoDetalheClient'

export const metadata = { title: 'Detalhe do Evento | LEO Portal' }

type Props = { params: Promise<{ id: string }> }

export default async function EventoDetalhePage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const { id } = await params
  return <EventoDetalheClient id={id} isDistrito={session.user.tipoAcesso === 'distrito'} />
}
