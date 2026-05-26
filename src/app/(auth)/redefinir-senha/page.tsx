'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function RedefinirSenhaForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== confirmar) { setError('As senhas não coincidem.'); return }
    if (senha.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, senha }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erro') }
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  if (!token) return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#842029' }}>Link inválido ou expirado.</p>
      <Link href="/recuperar-senha" style={{ color: '#0d6efd' }}>Solicitar novo link</Link>
    </div>
  )

  if (success) return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 48 }}>✅</div>
      <p style={{ fontWeight: 700 }}>Senha redefinida com sucesso!</p>
      <p style={{ color: '#6c757d', fontSize: 14 }}>Redirecionando para o login...</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>Nova Senha</h2>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Nova Senha</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Confirmar Senha</label>
        <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
      </div>
      {error && <div style={{ background: '#f8d7da', border: '1px solid #f5c2c7', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#842029' }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ width: '100%', padding: 11, background: loading ? '#6c757d' : '#0d6efd', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Salvando...' : 'Redefinir Senha'}
      </button>
    </form>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: 40, maxWidth: 400, width: '100%' }}>
        <Suspense fallback={<div>Carregando...</div>}>
          <RedefinirSenhaForm />
        </Suspense>
      </div>
    </div>
  )
}
