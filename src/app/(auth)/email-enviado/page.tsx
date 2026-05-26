import Link from 'next/link'

export default function EmailEnviadoPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: 40, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>Email Enviado!</h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6c757d' }}>
          Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
        </p>
        <Link href="/login" style={{ display: 'inline-block', padding: '10px 24px', background: '#0d6efd', color: '#fff', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}>
          Voltar ao Login
        </Link>
      </div>
    </div>
  )
}
