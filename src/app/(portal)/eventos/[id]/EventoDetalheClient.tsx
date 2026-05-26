'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEvento, useInscricoes, useCreateLote, useUpdateLote, useDeleteLote } from '@/hooks/useEventos'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function formatCurrency(v: number | null | undefined) {
  if (v == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))
}

interface LoteFormState {
  nomeLote: string
  valor: string
  quantidadeTotal: string
  dataInicio: string
  dataFim: string
}

const emptyLote: LoteFormState = { nomeLote: '', valor: '', quantidadeTotal: '', dataInicio: '', dataFim: '' }

interface Props {
  id: string
  isDistrito: boolean
}

export function EventoDetalheClient({ id, isDistrito }: Props) {
  const router = useRouter()
  const { data: evento, isLoading } = useEvento(id)
  const { data: inscricoes } = useInscricoes(id)
  const createLote = useCreateLote(id)
  const updateLote = useUpdateLote(id)
  const deleteLote = useDeleteLote(id)

  const [showLoteForm, setShowLoteForm] = useState(false)
  const [loteForm, setLoteForm] = useState<LoteFormState>(emptyLote)
  const [editingLoteId, setEditingLoteId] = useState<string | null>(null)

  const [tab, setTab] = useState<'info' | 'lotes' | 'inscricoes'>('info')

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>Carregando evento...</div>
  if (!evento) return <div style={{ padding: 40, textAlign: 'center', color: '#842029' }}>Evento não encontrado.</div>

  async function handleSaveLote() {
    try {
      const data = {
        nomeLote: loteForm.nomeLote,
        valor: loteForm.valor ? Number(loteForm.valor) : undefined,
        quantidadeTotal: loteForm.quantidadeTotal ? Number(loteForm.quantidadeTotal) : undefined,
        dataInicio: loteForm.dataInicio || undefined,
        dataFim: loteForm.dataFim || undefined,
      }
      if (editingLoteId) {
        await updateLote.mutateAsync({ id: editingLoteId, data })
      } else {
        await createLote.mutateAsync(data)
      }
      setShowLoteForm(false)
      setLoteForm(emptyLote)
      setEditingLoteId(null)
    } catch {
      alert('Erro ao salvar lote.')
    }
  }

  function handleEditLote(lote: any) {
    setLoteForm({
      nomeLote: lote.nomeLote ?? '',
      valor: lote.valor != null ? String(lote.valor) : '',
      quantidadeTotal: lote.quantidadeTotal != null ? String(lote.quantidadeTotal) : '',
      dataInicio: lote.dataInicio ? lote.dataInicio.split('T')[0] : '',
      dataFim: lote.dataFim ? lote.dataFim.split('T')[0] : '',
    })
    setEditingLoteId(lote.id)
    setShowLoteForm(true)
  }

  async function handleDeleteLote(id: string) {
    if (!confirm('Excluir lote?')) return
    try { await deleteLote.mutateAsync(id) } catch { alert('Erro ao excluir lote.') }
  }

  const inputCls = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500'
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

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.push('/eventos')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#051C2C', fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        ← Voltar para eventos
      </button>

      {/* Event header */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 24 }}>
        {evento.fotoUrl && (
          <div style={{ height: 200, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={evento.fotoUrl} alt={evento.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ padding: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{evento.nome}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6c757d' }}>{evento.clubeSedeNome}</p>
          {evento.dataInicio && (
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#495057' }}>
              📅 {formatDate(evento.dataInicio)}{evento.dataFim ? ` – ${formatDate(evento.dataFim)}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e9ecef', marginBottom: 24 }}>
        <button style={tabStyle(tab === 'info')} onClick={() => setTab('info')}>Informações</button>
        <button style={tabStyle(tab === 'lotes')} onClick={() => setTab('lotes')}>
          Lotes ({evento.lotes?.length ?? 0})
        </button>
        <button style={tabStyle(tab === 'inscricoes')} onClick={() => setTab('inscricoes')}>
          Inscrições ({inscricoes?.length ?? 0})
        </button>
      </div>

      {/* Info tab */}
      {tab === 'info' && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          {evento.descricao && <p style={{ fontSize: 14, color: '#495057', marginBottom: 20 }}>{evento.descricao}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {evento.pixKey && <div><span style={{ fontSize: 12, color: '#6c757d', display: 'block' }}>Chave PIX</span><span style={{ fontSize: 14 }}>{evento.pixKey}</span></div>}
            {evento.beneficiario && <div><span style={{ fontSize: 12, color: '#6c757d', display: 'block' }}>Beneficiário</span><span style={{ fontSize: 14 }}>{evento.beneficiario}</span></div>}
            {evento.banco && <div><span style={{ fontSize: 12, color: '#6c757d', display: 'block' }}>Banco</span><span style={{ fontSize: 14 }}>{evento.banco}</span></div>}
            {evento.agencia && <div><span style={{ fontSize: 12, color: '#6c757d', display: 'block' }}>Agência</span><span style={{ fontSize: 14 }}>{evento.agencia}</span></div>}
            {evento.contaCorrente && <div><span style={{ fontSize: 12, color: '#6c757d', display: 'block' }}>Conta</span><span style={{ fontSize: 14 }}>{evento.contaCorrente}</span></div>}
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {evento.aceitarTrocas && <Badge variant="outline">Aceita trocas</Badge>}
            {evento.formularioConvidadosHabilitado && <Badge variant="outline">Form. convidados ativo</Badge>}
            {evento.eventoTeraPassaportes && <Badge variant="outline">Com passaportes</Badge>}
          </div>
        </div>
      )}

      {/* Lotes tab */}
      {tab === 'lotes' && (
        <div>
          {isDistrito && (
            <div style={{ marginBottom: 16 }}>
              {!showLoteForm ? (
                <Button onClick={() => { setShowLoteForm(true); setEditingLoteId(null); setLoteForm(emptyLote) }}>
                  + Novo Lote
                </Button>
              ) : (
                <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 16 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>{editingLoteId ? 'Editar Lote' : 'Novo Lote'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                      <input value={loteForm.nomeLote} onChange={e => setLoteForm(f => ({ ...f, nomeLote: e.target.value }))} className={inputCls} placeholder="ex: 1º Lote" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                      <input type="number" min={0} step={0.01} value={loteForm.valor} onChange={e => setLoteForm(f => ({ ...f, valor: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Total</label>
                      <input type="number" min={0} value={loteForm.quantidadeTotal} onChange={e => setLoteForm(f => ({ ...f, quantidadeTotal: e.target.value }))} className={inputCls} />
                    </div>
                    <div></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                      <input type="date" value={loteForm.dataInicio} onChange={e => setLoteForm(f => ({ ...f, dataInicio: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                      <input type="date" value={loteForm.dataFim} onChange={e => setLoteForm(f => ({ ...f, dataFim: e.target.value }))} className={inputCls} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <Button onClick={handleSaveLote}>Salvar</Button>
                    <Button variant="outline" onClick={() => { setShowLoteForm(false); setLoteForm(emptyLote); setEditingLoteId(null) }}>Cancelar</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {evento.lotes?.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#6c757d', background: '#fff', borderRadius: 8 }}>
              Nenhum lote cadastrado.
            </div>
          )}

          {evento.lotes?.map((lote: any) => (
            <div key={lote.id} style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{lote.nomeLote}</div>
                <div style={{ fontSize: 13, color: '#6c757d', marginTop: 4 }}>
                  {formatCurrency(lote.valor)} &nbsp;·&nbsp;
                  {lote.quantidadeUsada ?? 0}/{lote.quantidadeTotal ?? '∞'} usados
                  {lote.dataInicio && <>&nbsp;·&nbsp; {formatDate(lote.dataInicio)} – {formatDate(lote.dataFim)}</>}
                </div>
              </div>
              {isDistrito && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="outline" size="sm" onClick={() => handleEditLote(lote)}>Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteLote(lote.id)}>Excluir</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Inscrições tab */}
      {tab === 'inscricoes' && (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {(!inscricoes || inscricoes.length === 0) ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>Nenhuma inscrição realizada.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e9ecef', background: '#f8f9fa' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Nome</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Clube</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Lote</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#495057' }}>Valor</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#495057' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {inscricoes.map((i: any, idx: number) => (
                  <tr key={i.id} style={{ borderBottom: '1px solid #f1f3f4', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      <div style={{ fontWeight: 500 }}>{i.pessoaNome}</div>
                      {i.pessoaTipo && <div style={{ fontSize: 12, color: '#6c757d' }}>{i.pessoaTipo}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#495057' }}>{i.clubeNome}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#6c757d' }}>{i.loteNome ?? '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'right' }}>{formatCurrency(i.valorLote)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={i.status === 'realizada' ? 'default' : 'outline'} style={{ fontSize: 11 }}>
                        {i.status ?? 'realizada'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
