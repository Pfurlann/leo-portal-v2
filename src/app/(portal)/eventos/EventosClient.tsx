'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEventos, useDeleteEvento } from '@/hooks/useEventos'
import { FormEventoModal } from '@/components/eventos/FormEventoModal'
import { Button } from '@/components/ui/button'

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function statusEvento(evento: any): { label: string; color: string } {
  const now = new Date()
  const fim = evento.dataFim ? new Date(evento.dataFim) : null
  const inicio = evento.dataInicio ? new Date(evento.dataInicio) : null
  if (fim && fim < now) return { label: 'Encerrado', color: '#6c757d' }
  if (inicio && inicio > now) return { label: 'Em breve', color: '#0d6efd' }
  return { label: 'Em andamento', color: '#198754' }
}

interface Props {
  isDistrito: boolean
}

export function EventosClient({ isDistrito }: Props) {
  const router = useRouter()
  const { data: eventos, isLoading, error } = useEventos()
  const deleteEvento = useDeleteEvento()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvento, setEditingEvento] = useState<any>(null)

  function handleNew() {
    setEditingEvento(null)
    setModalOpen(true)
  }

  function handleEdit(e: any) {
    setEditingEvento(e)
    setModalOpen(true)
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Excluir evento "${nome}"?`)) return
    try {
      await deleteEvento.mutateAsync(id)
    } catch {
      alert('Erro ao excluir evento.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Eventos</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6c757d' }}>
            Os eventos do Distrito LEO LD-8
          </p>
        </div>
        {isDistrito && <Button onClick={handleNew}>+ Novo Evento</Button>}
      </div>

      {isLoading && <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>Carregando eventos...</div>}
      {error && <div style={{ padding: 20, background: '#f8d7da', borderRadius: 6, color: '#842029' }}>Erro ao carregar eventos.</div>}

      {eventos && eventos.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#6c757d', background: '#fff', borderRadius: 8 }}>
          Nenhum evento cadastrado.
        </div>
      )}

      {/* Gallery grid */}
      {eventos && eventos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {eventos.map((ev: any) => {
            const status = statusEvento(ev)
            return (
              <div
                key={ev.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onClick={() => router.push(`/eventos/${ev.id}`)}
              >
                {/* Foto */}
                {ev.fotoUrl ? (
                  <div style={{ height: 140, overflow: 'hidden', background: '#e9ecef' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ev.fotoUrl} alt={ev.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ height: 140, background: 'linear-gradient(135deg, #051C2C 0%, #0d6efd 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 40 }}>🦁</span>
                  </div>
                )}

                <div style={{ padding: '16px' }}>
                  {/* Status badge */}
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: status.color, borderRadius: 4, padding: '2px 8px' }}>
                    {status.label}
                  </span>

                  <h3 style={{ margin: '8px 0 4px', fontSize: 16, fontWeight: 700, color: '#212529' }}>{ev.nome}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#6c757d' }}>{ev.clubeSedeNome}</p>

                  <div style={{ marginTop: 12, fontSize: 13, color: '#495057' }}>
                    {ev.dataInicio && <div>📅 {formatDate(ev.dataInicio)}{ev.dataFim && ev.dataFim !== ev.dataInicio ? ` – ${formatDate(ev.dataFim)}` : ''}</div>}
                    <div style={{ marginTop: 4 }}>
                      👥 {ev._count?.inscricoes ?? 0} inscrito{(ev._count?.inscricoes ?? 0) !== 1 ? 's' : ''}
                      &nbsp;·&nbsp; {ev.lotes?.length ?? 0} lote{(ev.lotes?.length ?? 0) !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {isDistrito && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(ev)}>Editar</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(ev.id, ev.nome)}>Excluir</Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isDistrito && (
        <FormEventoModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingEvento(null) }}
          evento={editingEvento}
        />
      )}
    </div>
  )
}
