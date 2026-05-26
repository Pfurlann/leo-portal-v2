'use client'
import { useState } from 'react'
import { useNominata, useDeleteNominata } from '@/hooks/useNominata'
import { FormNominataModal } from '@/components/nominata/FormNominataModal'
import { Button } from '@/components/ui/button'

const CARGO_ORDER: Record<string, number> = {
  'Presidente': 1,
  'Vice-Presidente': 2,
  'II Vice-Presidente': 3,
  'Secretária': 4, 'Secretário': 4, 'II Secretária': 4, 'II Secretário': 4,
  'Tesoureira': 5, 'Tesoureiro': 5, 'II Tesoureira': 5, 'II Tesoureiro': 5,
}

function cargoOrder(cargo: string): number {
  return CARGO_ORDER[cargo] ?? 6
}

interface Props {
  alAtual: string
}

export function NominataClient({ alAtual }: Props) {
  const [al, setAl] = useState(alAtual)
  const { data: nominata, isLoading, error } = useNominata(al)
  const deleteNominata = useDeleteNominata()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const sorted = [...(nominata ?? [])].sort((a: any, b: any) => {
    const diff = cargoOrder(a.cargo) - cargoOrder(b.cargo)
    return diff !== 0 ? diff : a.cargo.localeCompare(b.cargo)
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Nominata / Diretoria</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6c757d' }}>Diretoria do clube no ano leonístico</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setModalOpen(true) }}>+ Novo Membro</Button>
      </div>

      {/* AL filter */}
      <div style={{ marginBottom: 16 }}>
        <select
          value={al}
          onChange={e => setAl(e.target.value)}
          style={{ border: '1px solid #dee2e6', borderRadius: 6, padding: '8px 12px', fontSize: 14 }}
        >
          <option value="2024-2025">AL 2024-2025</option>
          <option value="2025-2026">AL 2025-2026</option>
          <option value="2026-2027">AL 2026-2027</option>
        </select>
      </div>

      {isLoading && <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>Carregando nominata...</div>}
      {error && <div style={{ padding: 16, background: '#f8d7da', borderRadius: 6, color: '#842029' }}>Erro ao carregar nominata.</div>}

      {!isLoading && sorted.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#6c757d', background: '#fff', borderRadius: 8 }}>
          Nenhum membro cadastrado para o AL {al}.
        </div>
      )}

      {sorted.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {sorted.map((item: any) => (
            <div key={item.id} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {/* Avatar */}
              {item.urlFoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.urlFoto} alt={item.nome} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 12 }}>
                  🦁
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: 15 }}>{item.nome}</div>
              <div style={{ fontSize: 12, color: '#0d6efd', fontWeight: 600, marginTop: 4 }}>{item.cargo}</div>
              {item.profissao && <div style={{ fontSize: 12, color: '#6c757d', marginTop: 2 }}>{item.profissao}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Button variant="outline" size="sm" onClick={() => { setEditingItem(item); setModalOpen(true) }}>Editar</Button>
                <Button variant="destructive" size="sm" onClick={async () => {
                  if (!confirm(`Excluir "${item.nome}" (${item.cargo})?`)) return
                  try { await deleteNominata.mutateAsync(item.id) } catch { alert('Erro ao excluir.') }
                }}>Excluir</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormNominataModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        item={editingItem}
        alAtual={al}
      />
    </div>
  )
}
