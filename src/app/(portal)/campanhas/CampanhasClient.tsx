'use client'
import { useState } from 'react'
import { useCampanhas, useDeleteCampanha } from '@/hooks/useCampanhas'
import { FormCampanhaModal } from '@/components/campanhas/FormCampanhaModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

export function CampanhasClient() {
  const { data: campanhas, isLoading, error } = useCampanhas()
  const deleteCampanha = useDeleteCampanha()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCampanha, setEditingCampanha] = useState<any>(null)

  function handleEdit(campanha: any) {
    setEditingCampanha(campanha)
    setModalOpen(true)
  }

  function handleNew() {
    setEditingCampanha(null)
    setModalOpen(true)
  }

  async function handleDelete(id: string, titulo: string) {
    if (!confirm(`Excluir campanha "${titulo}"?`)) return
    try {
      await deleteCampanha.mutateAsync(id)
    } catch {
      alert('Erro ao excluir campanha.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Campanhas</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6c757d' }}>
            Registro de campanhas do clube
          </p>
        </div>
        <Button onClick={handleNew}>+ Nova Campanha</Button>
      </div>

      {/* Content */}
      {isLoading && <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>Carregando campanhas...</div>}
      {error && <div style={{ padding: 20, background: '#f8d7da', borderRadius: 6, color: '#842029' }}>Erro ao carregar campanhas. Verifique a conexão com o banco.</div>}

      {campanhas && campanhas.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#6c757d', background: '#fff', borderRadius: 8 }}>
          Nenhuma campanha registrada. Clique em &quot;+ Nova Campanha&quot; para começar.
        </div>
      )}

      {campanhas && campanhas.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e9ecef', background: '#f8f9fa' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Título</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Eixo</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Data Início</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#495057' }}>Impactados</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>AL</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#495057' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {campanhas.map((c: any, i: number) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f3f4', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#212529', maxWidth: 280 }}>
                    <div style={{ fontWeight: 500 }}>{c.titulo}</div>
                    {c.coordenador && <div style={{ fontSize: 12, color: '#6c757d' }}>{c.coordenador}</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.eixoD8 && <Badge variant="outline" style={{ fontSize: 11 }}>{c.eixoD8}</Badge>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#495057' }}>{formatDate(c.dataInicio)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#495057', textAlign: 'right' }}>
                    {c.pessoasImpactadas ?? 0}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#6c757d' }}>{c.al ?? '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(c)}>Editar</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id, c.titulo)}>Excluir</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormCampanhaModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCampanha(null) }}
        campanha={editingCampanha}
      />
    </div>
  )
}
