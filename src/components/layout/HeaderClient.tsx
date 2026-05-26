'use client'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const TABS = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { key: 'campanhas', label: 'Campanhas', path: '/campanhas' },
  { key: 'atividades', label: 'Atividades', path: '/atividades' },
  { key: 'eventos', label: 'Eventos', path: '/eventos' },
  {
    key: 'rtma',
    label: 'Secretaria',
    path: '/rtma',
    cargos: ['Presidente', 'Secretário(a)'],
    tiposAcesso: ['distrito'],
  },
  {
    key: 'nominata',
    label: 'Nominata',
    path: '/nominata',
    cargos: ['Presidente'],
    tiposAcesso: ['distrito'],
  },
  { key: 'gerencial', label: 'Visão Gerencial', path: '/gerencial', tiposAcesso: ['distrito'] },
]

interface User {
  id: string
  email: string
  clubeId: string
  clubeNome: string
  tipoAcesso: string
  cargo: string | null
  alAtual: string
}

type Tab = (typeof TABS)[number]

function isTabVisible(tab: Tab, user: User): boolean {
  if (tab.tiposAcesso && !tab.tiposAcesso.includes(user.tipoAcesso)) {
    if (user.tipoAcesso !== 'distrito') {
      if (tab.cargos && user.cargo && tab.cargos.includes(user.cargo)) {
        return true
      }
      return false
    }
  }
  if (tab.cargos && !tab.cargos.includes('*')) {
    if (!user.cargo || !tab.cargos.includes(user.cargo)) {
      if (user.tipoAcesso === 'distrito') return true
      return false
    }
  }
  return true
}

export function HeaderClient({ user }: { user: User }) {
  const pathname = usePathname()
  const visibleTabs = TABS.filter((tab) => isTabVisible(tab, user))

  return (
    <header
      style={{
        background: '#fff',
        borderBottom: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        position: 'relative',
        zIndex: 200,
      }}
    >
      {/* Header Top */}
      <div
        style={{
          padding: '15px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e9ecef',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#212529', lineHeight: 1 }}>
            🦁 LEO Portal
          </span>
          <span style={{ fontSize: 13, color: '#6c757d', marginTop: 2 }}>
            {user.clubeNome} · AL {user.alAtual}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: '#495057' }}>{user.email}</span>
          {user.cargo && (
            <span
              style={{
                fontSize: 12,
                background: '#e9ecef',
                padding: '2px 8px',
                borderRadius: 4,
                color: '#495057',
              }}
            >
              {user.cargo}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
            Sair
          </Button>
        </div>
      </div>

      {/* Nav Tabs */}
      <nav style={{ padding: '0 30px', display: 'flex', gap: 0, overflowX: 'auto' }}>
        {visibleTabs.map((tab) => {
          const isActive = pathname.startsWith(tab.path)
          return (
            <Link
              key={tab.key}
              href={tab.path}
              style={{
                display: 'inline-block',
                padding: '12px 18px',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#0d6efd' : '#495057',
                borderBottom: isActive ? '2px solid #0d6efd' : '2px solid transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
