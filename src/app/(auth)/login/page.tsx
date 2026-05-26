import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { LoginForm } from './LoginForm'

export default async function LoginPage() {
  try {
    const session = await auth()
    if (session?.user?.email) redirect('/dashboard')
  } catch {
    // auth failure on login page is non-fatal — just show login form
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: '20px',
    }}>
      <LoginForm />
    </div>
  )
}
