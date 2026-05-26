'use client'
import { useState } from 'react'
import { useAtividades, useDeleteAtividade } from '@/hooks/useAtividades'
import { FormAtividadeModal } from '@/components/atividades/FormAtividadeModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

export function AtividadesClient() {
  const { data: atividades, isLoading, error } = useAtividades()
  const deleteAtividade = useDeleteAtividade()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAtividade, setEditingAtividade] = useState<any>(null)

  function handleEdit(atividade: any) {
    setEditingAtividade(atividade)
    setModalOpen(true)
  }

  function handleNew() {
    setEditingAtividade(null)
    setModalOpen(true)
  }

  async function handleDelete(id: string, titulo: string) {
    if (!confirm(`Excluir atividade "${titulo}"?`)) return
    try {
      await deleteAtividade.mutateAsync(id)
    } catch {
      alert('Erro ao excluir atividade.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Atividades</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6c757d' }}>
            Registro de atividades do clube
          </p>
        </div>
        <Button onClick={handleNew}>+ Nova Atividade</Button>
      </div>

      {/* Content */}
      {isLoading && <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>Carregando atividades...</div>}
      {error && <div style={{ padding: 20, background: '#f8d7da', borderRadius: 6, color: '#842029' }}>Erro ao carregar atividades. Verifique a conexão com o banco.</div>}

      {atividades && atividades.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#6c757d', background: '#fff', borderRadius: 8 }}>
          Nenhuma atividade registrada. Clique em &quot;+ Nova Atividade&quot; para começar.
        </div>
      )}

      {atividades && atividades.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e9ecef', background: '#f8f9fa' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Título</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Tipo</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Data</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#495057' }}>Associados</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>AL</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#495057' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {atividades.map((a: any, i: number) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f1f3f4', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#212529', maxWidth: 280 }}>
                    <div style={{ fontWeight: 500 }}>{a.titulo}</div>
                    {a.localAtividade && <div style={{ fontSize: 12, color: '#6c757d' }}>{a.localAtividade}</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {a.tipoAtividade && <Badge variant="outline" style={{ fontSize: 11 }}>{a.tipoAtividade}</Badge>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#495057' }}>{formatDate(a.dataInicio)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#495057', textAlign: 'right' }}>
                    {a.qtdAssociadosPresentes ?? 0}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#6c757d' }}>{a.al ?? '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(a)}>Editar</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(a.id, a.titulo)}>Excluir</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormAtividadeModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingAtividade(null) }}
        atividade={editingAtividade}
      />
    </div>
  )
}
