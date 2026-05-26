import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { calcularAlAtual } from '@/lib/auth/utils'
import { GerencialClient } from './GerencialClient'

export default async function GerencialPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { tipoAcesso } = session.user
  if (tipoAcesso !== 'distrito' && tipoAcesso !== 'regiao') {
    redirect('/dashboard')
  }

  const alAtual = session.user.alAtual ?? calcularAlAtual()

  return <GerencialClient alAtual={alAtual} tipoAcesso={tipoAcesso} />
}
