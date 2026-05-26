'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email,
      senha,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Email ou senha inválidos. Verifique suas credenciais.')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      padding: '40px',
      maxWidth: 400,
      width: '100%',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <img
          src="https://i.imgur.com/WZhg99L.png"
          alt="LEO Logo"
          style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 12 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#212529' }}>
          LEO Portal
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6c757d' }}>
          Distrito LEO LD-8
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="seu@email.com"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #dee2e6',
              borderRadius: 6,
              fontSize: 14,
              color: '#212529',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Senha */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151' }}>
            Senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #dee2e6',
              borderRadius: 6,
              fontSize: 14,
              color: '#212529',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c2c7',
            borderRadius: 6,
            padding: '10px 14px',
            marginBottom: 16,
            fontSize: 14,
            color: '#842029',
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '11px',
            background: loading ? '#6c757d' : '#0d6efd',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {/* Recuperar senha */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Link
          href="/recuperar-senha"
          style={{ fontSize: 13, color: '#0d6efd', textDecoration: 'none' }}
        >
          Esqueceu sua senha?
        </Link>
      </div>
    </div>
  )
}
