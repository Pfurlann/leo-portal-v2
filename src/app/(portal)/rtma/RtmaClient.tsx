'use client'
import { useState } from 'react'
import { usePessoas, useDeletePessoa, useAmigos, useDeleteAmigo } from '@/hooks/useRtma'
import { FormPessoaModal } from '@/components/rtma/FormPessoaModal'
import { FormAmigoModal } from '@/components/rtma/FormAmigoModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('pt-BR') } catch { return d }
}

const STATUS_COLOR: Record<string, string> = {
  Ativo: '#198754',
  Inativo: '#6c757d',
  Transferido: '#0d6efd',
  Desligado: '#dc3545',
  'Pós-ativo': '#fd7e14',
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? '#6c757d'
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: color, borderRadius: 4, padding: '2px 8px' }}>
      {status}
    </span>
  )
}

export function RtmaClient() {
  const [tab, setTab] = useState<'membros' | 'amigos'>('membros')
  const [search, setSearch] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('Ativo')

  // Membros
  const { data: pessoas, isLoading: loadingP, error: errP } = usePessoas()
  const deletePessoa = useDeletePessoa()
  const [modalPessoa, setModalPessoa] = useState(false)
  const [editingPessoa, setEditingPessoa] = useState<any>(null)

  // Amigos
  const { data: amigos, isLoading: loadingA } = useAmigos()
  const deleteAmigo = useDeleteAmigo()
  const [modalAmigo, setModalAmigo] = useState(false)
  const [editingAmigo, setEditingAmigo] = useState<any>(null)

  const tabStyle = (active: boolean) => ({
    padding: '8px 20px',
    color: active ? '#0d6efd' : '#495057',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    fontSize: 14,
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid #0d6efd' : '2px solid transparent',
  } as React.CSSProperties)

  const pessoasFiltradas = (pessoas ?? []).filter((p: any) => {
    const matchSearch = !search || p.nome?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filtroStatus || filtroStatus === 'todos' || p.status === filtroStatus
    return matchSearch && matchStatus
  })

  const amigosFiltrados = (amigos ?? []).filter((a: any) =>
    !search || a.nome?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Secretaria (RTMA)</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6c757d' }}>Gestão de membros e amigos/conselheiros</p>
        </div>
        {tab === 'membros' && (
          <Button onClick={() => { setEditingPessoa(null); setModalPessoa(true) }}>+ Novo Membro</Button>
        )}
        {tab === 'amigos' && (
          <Button onClick={() => { setEditingAmigo(null); setModalAmigo(true) }}>+ Novo Amigo/Conselheiro</Button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e9ecef', marginBottom: 16 }}>
        <button style={tabStyle(tab === 'membros')} onClick={() => setTab('membros')}>
          Membros ({pessoas?.length ?? 0})
        </button>
        <button style={tabStyle(tab === 'amigos')} onClick={() => setTab('amigos')}>
          Amigos/Conselheiros ({amigos?.length ?? 0})
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome..."
          style={{ flex: 1, border: '1px solid #dee2e6', borderRadius: 6, padding: '8px 12px', fontSize: 14 }}
        />
        {tab === 'membros' && (
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            style={{ border: '1px solid #dee2e6', borderRadius: 6, padding: '8px 12px', fontSize: 14 }}
          >
            <option value="todos">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Transferido">Transferido</option>
            <option value="Desligado">Desligado</option>
            <option value="Pós-ativo">Pós-ativo</option>
          </select>
        )}
      </div>

      {/* Membros tab */}
      {tab === 'membros' && (
        <>
          {loadingP && <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>Carregando membros...</div>}
          {errP && <div style={{ padding: 16, background: '#f8d7da', borderRadius: 6, color: '#842029' }}>Erro ao carregar membros.</div>}
          {!loadingP && pessoasFiltradas.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#6c757d', background: '#fff', borderRadius: 8 }}>
              Nenhum membro encontrado.
            </div>
          )}
          {pessoasFiltradas.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e9ecef', background: '#f8f9fa' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Nome</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Tipo</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Membro desde</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Contato</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#495057' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pessoasFiltradas.map((p: any, i: number) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f3f4', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{p.nome}</div>
                        {p.cargo && <div style={{ fontSize: 12, color: '#6c757d' }}>{p.cargo}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#495057' }}>
                        {p.tipo ? <Badge variant="outline" style={{ fontSize: 11 }}>{p.tipo}</Badge> : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={p.status ?? 'Ativo'} />
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#6c757d' }}>{formatDate(p.associadoDesde)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#6c757d' }}>
                        {p.telefone && <div>{p.telefone}</div>}
                        {p.email && <div style={{ fontSize: 12 }}>{p.email}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <Button variant="outline" size="sm" onClick={() => { setEditingPessoa(p); setModalPessoa(true) }}>Editar</Button>
                          <Button variant="destructive" size="sm" onClick={async () => {
                            if (!confirm(`Excluir membro "${p.nome}"?`)) return
                            try { await deletePessoa.mutateAsync(p.id) } catch { alert('Erro ao excluir.') }
                          }}>Excluir</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Amigos tab */}
      {tab === 'amigos' && (
        <>
          {loadingA && <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>Carregando amigos/conselheiros...</div>}
          {!loadingA && amigosFiltrados.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#6c757d', background: '#fff', borderRadius: 8 }}>
              Nenhum amigo/conselheiro encontrado.
            </div>
          )}
          {amigosFiltrados.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e9ecef', background: '#f8f9fa' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Nome</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Tipo</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Lions Clube</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Contato</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#495057' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {amigosFiltrados.map((a: any, i: number) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f1f3f4', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{a.nome}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {a.tipo ? <Badge variant="outline" style={{ fontSize: 11 }}>{a.tipo}</Badge> : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#6c757d' }}>{a.lionsClube ?? '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#6c757d' }}>
                        {a.email && <div>{a.email}</div>}
                        {a.cidade && <div style={{ fontSize: 12 }}>{a.cidade}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <Button variant="outline" size="sm" onClick={() => { setEditingAmigo(a); setModalAmigo(true) }}>Editar</Button>
                          <Button variant="destructive" size="sm" onClick={async () => {
                            if (!confirm(`Excluir "${a.nome}"?`)) return
                            try { await deleteAmigo.mutateAsync(a.id) } catch { alert('Erro ao excluir.') }
                          }}>Excluir</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <FormPessoaModal
        open={modalPessoa}
        onClose={() => { setModalPessoa(false); setEditingPessoa(null) }}
        pessoa={editingPessoa}
      />
      <FormAmigoModal
        open={modalAmigo}
        onClose={() => { setModalAmigo(false); setEditingAmigo(null) }}
        amigo={editingAmigo}
      />
    </div>
  )
}
