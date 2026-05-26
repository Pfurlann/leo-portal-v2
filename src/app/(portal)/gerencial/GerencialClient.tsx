'use client'

import { useState } from 'react'
import { useGerencial } from '@/hooks/useGerencial'
import type { ClubeStat, RegiaoStat } from '@/server/repositories/gerencial.repository'

const AL_OPTIONS = ['2024-2025', '2025-2026', '2026-2027']

const REGIAO_COLORS: Record<string, string> = {
  A: '#4f46e5',
  B: '#0891b2',
  D: '#059669',
}

function KpiCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: '#9ca3af' }}>{sub}</span>}
    </div>
  )
}

function RegiaoSection({ regiao, tipoAcesso }: { regiao: RegiaoStat; tipoAcesso: string }) {
  const [expanded, setExpanded] = useState(true)
  const cor = REGIAO_COLORS[regiao.regiao] ?? '#374151'

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${cor}30`,
      borderLeft: `4px solid ${cor}`,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            background: cor,
            color: '#fff',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            padding: '4px 12px',
          }}>
            Região {regiao.regiao}
          </span>
          <span style={{ fontSize: 14, color: '#6b7280' }}>
            {regiao.clubes.length} club{regiao.clubes.length !== 1 ? 'es' : 'e'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#374151' }}>
            <strong>{regiao.totalMembros}</strong> membros
          </span>
          <span style={{ fontSize: 13, color: '#374151' }}>
            <strong>{regiao.totalAtividades}</strong> atividades
          </span>
          <span style={{ fontSize: 13, color: '#374151' }}>
            <strong>{regiao.totalCampanhas}</strong> campanhas
          </span>
          <span style={{ fontSize: 18, color: '#9ca3af' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                <th style={thStyle}>Clube</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Membros Ativos</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Atividades</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Campanhas</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {regiao.clubes.map((clube, i) => (
                <ClubeRow key={clube.id} clube={clube} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function scoreCor(score: number) {
  if (score >= 8) return '#059669'
  if (score >= 5) return '#d97706'
  return '#dc2626'
}

function ClubeRow({ clube, index }: { clube: ClubeStat; index: number }) {
  const score = Math.min(10, clube.membrosAtivos + clube.atividades * 0.5 + clube.campanhas * 0.5)
  const scoreVal = Math.round(score * 10) / 10

  return (
    <tr style={{ background: index % 2 === 0 ? '#fff' : '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
      <td style={tdStyle}>{clube.nome}</td>
      <td style={{ ...tdStyle, textAlign: 'right' }}>{clube.membrosAtivos}</td>
      <td style={{ ...tdStyle, textAlign: 'right' }}>{clube.atividades}</td>
      <td style={{ ...tdStyle, textAlign: 'right' }}>{clube.campanhas}</td>
      <td style={{ ...tdStyle, textAlign: 'right' }}>
        <span style={{
          background: `${scoreCor(scoreVal)}20`,
          color: scoreCor(scoreVal),
          borderRadius: 6,
          padding: '2px 8px',
          fontSize: 12,
          fontWeight: 600,
        }}>
          {scoreVal}
        </span>
      </td>
    </tr>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textAlign: 'left',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const tdStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: 14,
  color: '#374151',
}

interface Props {
  alAtual: string
  tipoAcesso: string
}

export function GerencialClient({ alAtual, tipoAcesso }: Props) {
  const [selectedAl, setSelectedAl] = useState(alAtual)
  const { data, isLoading, error } = useGerencial(selectedAl)

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Visão Gerencial</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>
            Dados consolidados do Distrito LEO LD-8
          </p>
        </div>
        <select
          value={selectedAl}
          onChange={(e) => setSelectedAl(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            fontSize: 14,
            color: '#374151',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          {AL_OPTIONS.map((al) => (
            <option key={al} value={al}>{al}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280', fontSize: 14 }}>
          Carregando dados...
        </div>
      )}

      {error && (
        <div style={{ padding: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 14 }}>
          Erro ao carregar dados gerenciais.
        </div>
      )}

      {data && (
        <>
          {/* KPIs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}>
            <KpiCard label="Clubes Ativos" value={data.totalClubes} sub="no distrito" />
            <KpiCard label="Membros Ativos" value={data.totalMembros} sub="RTMA" />
            <KpiCard label="Atividades" value={data.totalAtividades} sub={`AL ${data.al}`} />
            <KpiCard label="Campanhas" value={data.totalCampanhas} sub={`AL ${data.al}`} />
            <KpiCard label="Eventos" value={data.totalEventos} sub={`AL ${data.al}`} />
          </div>

          {/* Resumo por região */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 24,
            }}>
              {data.regioes.map((r) => (
                <div key={r.regiao} style={{
                  background: '#fff',
                  border: `1px solid ${REGIAO_COLORS[r.regiao] ?? '#e5e7eb'}40`,
                  borderTop: `3px solid ${REGIAO_COLORS[r.regiao] ?? '#e5e7eb'}`,
                  borderRadius: 10,
                  padding: '16px 20px',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: REGIAO_COLORS[r.regiao], marginBottom: 12 }}>
                    REGIÃO {r.regiao} — {r.clubes.length} clubes
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Membros</span>
                      <strong>{r.totalMembros}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Atividades</span>
                      <strong>{r.totalAtividades}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Campanhas</span>
                      <strong>{r.totalCampanhas}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalhamento por região */}
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 16 }}>
            Detalhamento por Região
          </h2>
          {data.regioes.map((regiao) => (
            <RegiaoSection key={regiao.regiao} regiao={regiao} tipoAcesso={tipoAcesso} />
          ))}

          {data.clubesSemRegistro.length > 0 && (
            <RegiaoSection
              regiao={{
                regiao: '?',
                clubes: data.clubesSemRegistro,
                totalMembros: data.clubesSemRegistro.reduce((s, c) => s + c.membrosAtivos, 0),
                totalAtividades: data.clubesSemRegistro.reduce((s, c) => s + c.atividades, 0),
                totalCampanhas: data.clubesSemRegistro.reduce((s, c) => s + c.campanhas, 0),
              }}
              tipoAcesso={tipoAcesso}
            />
          )}
        </>
      )}
    </div>
  )
}
