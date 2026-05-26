'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RecuperarSenhaPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao enviar email')
      }
      router.push('/email-enviado')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: 40, maxWidth: 400, width: '100%' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>Recuperar Senha</h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6c757d' }}>
          Informe seu email para receber o link de redefinição.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          {error && <div style={{ background: '#f8d7da', border: '1px solid #f5c2c7', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#842029' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', background: loading ? '#6c757d' : '#0d6efd', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/login" style={{ fontSize: 13, color: '#0d6efd', textDecoration: 'none' }}>← Voltar ao login</Link>
        </div>
      </div>
    </div>
  )
}
