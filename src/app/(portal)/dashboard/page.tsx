import { auth } from '@/lib/auth/config'
import { getDashboardStats } from '@/server/repositories/dashboard.repository'

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 8,
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`,
      flex: 1,
      minWidth: 180,
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 14, color: '#6c757d', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const { clubeId, clubeNome, alAtual } = session.user

  let stats = {
    campanhasCount: 0,
    atividadesCount: 0,
    membrosCount: 0,
    ultimasCampanhas: [] as any[],
    ultimasAtividades: [] as any[],
  }
  try {
    stats = await getDashboardStats(clubeId, clubeNome, alAtual)
  } catch {
    // DB not connected yet — show zeros
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#212529' }}>
          Dashboard — {clubeNome}
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6c757d' }}>
          Ano Leonístico {alAtual}
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label={`Campanhas (AL ${alAtual})`} value={stats.campanhasCount} color="#0d6efd" />
        <StatCard label={`Atividades (AL ${alAtual})`} value={stats.atividadesCount} color="#198754" />
        <StatCard label="Membros Ativos" value={stats.membrosCount} color="#fd7e14" />
      </div>

      {/* Recent content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Campanhas */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Campanhas Recentes</h3>
          {stats.ultimasCampanhas.length === 0 ? (
            <p style={{ color: '#6c757d', fontSize: 14 }}>Nenhuma campanha registrada.</p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {stats.ultimasCampanhas.map((c: any) => (
                <li key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f3f4' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#212529' }}>{c.titulo}</div>
                  <div style={{ fontSize: 12, color: '#6c757d', marginTop: 2 }}>
                    {formatDate(c.dataInicio)} · {c.pessoasImpactadas ?? 0} impactados
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Atividades */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Atividades Recentes</h3>
          {stats.ultimasAtividades.length === 0 ? (
            <p style={{ color: '#6c757d', fontSize: 14 }}>Nenhuma atividade registrada.</p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {stats.ultimasAtividades.map((a: any) => (
                <li key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f3f4' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#212529' }}>{a.titulo}</div>
                  <div style={{ fontSize: 12, color: '#6c757d', marginTop: 2 }}>
                    {a.tipoAtividade ?? 'Atividade'} · {formatDate(a.dataInicio)} · {a.qtdAssociadosPresentes ?? 0} presentes
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
