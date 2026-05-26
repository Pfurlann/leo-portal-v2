import { auth } from './config'
import { redirect } from 'next/navigation'

export async function requireSession() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return session.user
}

export async function getOptionalSession() {
  return await auth()
}
