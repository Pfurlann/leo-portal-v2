import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { Header } from '@/components/layout/Header'
import { QueryProvider } from '@/components/providers/QueryProvider'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <QueryProvider>
      <div
        style={{
          minHeight: '100vh',
          background: '#f8f9fa',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
        }}
      >
        <Header />
        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 30px' }}>{children}</main>
      </div>
    </QueryProvider>
  )
}
