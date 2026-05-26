import { auth } from '@/lib/auth/config'
import { HeaderClient } from './HeaderClient'

export async function Header() {
  const session = await auth()
  if (!session?.user) return null
  return <HeaderClient user={session.user} />
}
