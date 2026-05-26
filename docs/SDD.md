# Software Design Document — LEO Portal V2

> Versão: 1.0 | Data: 2026-05-26 | Distrito: LEO LD-8

---

## 1. Visão Geral

### 1.1 Objetivo do Sistema

Migrar o LEO Portal V1.6 (Google Apps Script) para uma stack moderna baseada em Next.js, mantendo **exatamente a mesma interface** e **zero perda de dados**, com o sistema legado operando em paralelo durante toda a transição.

### 1.2 Escopo

| Módulo | Status | Prioridade |
|--------|--------|------------|
| Autenticação | Migrar (Sheets → Supabase `usuarios_acessos`) | P0 |
| Dashboard | Migrar | P0 |
| Campanhas | Migrar | P0 |
| Atividades | Migrar | P0 |
| Nominata/Diretoria | Migrar | P1 |
| Eventos (inscrições, lotes, credenciamento) | Migrar | P1 |
| RTMA (membros) | Migrar | P1 |
| Visão Gerencial (dashboards distritais) | Migrar | P2 |
| Scanner de Refeições | Migrar | P2 |
| Camisas Enumeradas | Migrar | P2 |
| Formulário Público de Eventos | Migrar | P2 |
| Recuperação/Redefinição de Senha | Migrar | P0 |

### 1.3 Estratégia de Migração

**Big-Bang paralelo**: o sistema legado (GAS) permanece ativo e funcional. O V2 é construído em nova URL (Vercel). A troca de URL para os usuários ocorre somente quando 100% das features estiverem funcionais e testadas.

### 1.4 Premissas

- Banco de dados Supabase (`bqkttaflhtsdkamgscnf`) **não muda** — nenhuma migration destrutiva
- Supabase anon key + service role key são secrets (nunca no frontend)
- Interface visual deve ser pixel-perfect com o V1.6
- 30 clubes, 3 regiões (A, B, D), SC, Brasil
- Ano Leonístico (AL): jul-jun (ex: 2025-2026)

### 1.5 Restrições

- Zero downtime para o sistema legado
- Dados de `usuarios_acessos` substituem credenciais da planilha
- Não usar RLS no Supabase (manter padrão atual via service role)
- Deploy exclusivo na Vercel

---

## 2. Arquitetura

### 2.1 Arquitetura Atual (GAS)

```
Browser (HTML monolítico ~1.6MB)
  ↓ google.script.run.* (bridge síncrona)
Google Apps Script (V8) — escopo global compartilhado
  ├── code.js (749KB — core, campanhas, atividades, eventos)
  ├── portal_supabase.js (145KB — CRUD Supabase)
  ├── rtma_*.js (273KB — módulo RTMA)
  └── sistema_permissoes_cargos.js
  ↓ UrlFetchApp.fetch() (HTTP)
Supabase REST API → PostgreSQL
  + Google Sheets (auth legado)
  + Google Drive (fotos)
  + Gmail (emails)
```

**Problemas:** monolito HTML, sem tipos, sem testes, Service Role Key exposta no código, auth via Sheets, cache manual frágil, sem CI/CD, naming inconsistente.

### 2.2 Arquitetura Futura (Next.js V2)

```
Browser (Next.js SSR/CSR, componentes React)
  ↓ TanStack Query → fetch()
Next.js API Routes (App Router, Server Actions)
  ├── /api/auth/** (NextAuth.js)
  ├── /api/clubes/**
  ├── /api/campanhas/**
  ├── /api/atividades/**
  ├── /api/eventos/**
  ├── /api/rtma/**
  ├── /api/nominata/**
  └── /api/admin/**
  ↓ Prisma Client (type-safe)
Supabase PostgreSQL (mesmo banco — bqkttaflhtsdkamgscnf)
  + Supabase Storage (fotos — já existente)
  + Resend/Nodemailer (emails)
  + Vercel (deploy + logs)
```

### 2.3 Estrutura de Diretórios

```
leo-portal-v2/
├── src/
│   ├── app/                         # App Router (Next.js 14+)
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── recuperar-senha/
│   │   │   └── redefinir-senha/
│   │   ├── (portal)/                # Rotas autenticadas
│   │   │   ├── dashboard/
│   │   │   ├── campanhas/
│   │   │   ├── atividades/
│   │   │   ├── eventos/
│   │   │   ├── rtma/
│   │   │   ├── nominata/
│   │   │   └── gerencial/
│   │   ├── eventos/[id]/inscricao/  # Público (sem auth)
│   │   ├── scanner/                  # Scanner refeições
│   │   ├── camisas/                  # Camisas enumeradas
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       ├── clubes/
│   │       ├── campanhas/
│   │       ├── atividades/
│   │       ├── eventos/
│   │       ├── rtma/
│   │       └── nominata/
│   ├── components/
│   │   ├── ui/                      # shadcn/ui base
│   │   ├── layout/                  # Header, Sidebar, Footer
│   │   ├── campanhas/               # Forms e cards de campanhas
│   │   ├── atividades/
│   │   ├── eventos/
│   │   ├── rtma/
│   │   ├── nominata/
│   │   └── shared/                  # Datepicker, Upload, Charts
│   ├── lib/
│   │   ├── auth/                    # NextAuth config, helpers
│   │   ├── db/                      # Prisma client singleton
│   │   ├── supabase/                # Supabase admin client
│   │   └── utils/                   # cn(), formatDate(), etc.
│   ├── server/
│   │   ├── repositories/            # Repository pattern
│   │   │   ├── clubes.repository.ts
│   │   │   ├── campanhas.repository.ts
│   │   │   ├── atividades.repository.ts
│   │   │   ├── eventos.repository.ts
│   │   │   ├── rtma.repository.ts
│   │   │   └── nominata.repository.ts
│   │   └── services/                # Service layer
│   │       ├── campanhas.service.ts
│   │       ├── atividades.service.ts
│   │       ├── eventos.service.ts
│   │       ├── rtma.service.ts
│   │       └── auth.service.ts
│   ├── schemas/                     # Zod schemas (DTOs)
│   │   ├── campanha.schema.ts
│   │   ├── atividade.schema.ts
│   │   ├── evento.schema.ts
│   │   └── rtma.schema.ts
│   ├── types/                       # TypeScript types globais
│   │   ├── next-auth.d.ts
│   │   └── index.ts
│   └── hooks/                       # React hooks (TanStack Query)
│       ├── useCampanhas.ts
│       ├── useAtividades.ts
│       └── useEventos.ts
├── prisma/
│   └── schema.prisma
├── public/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── components.json                  # shadcn/ui config
└── package.json
```

### 2.4 Módulos e Responsabilidades

| Camada | Responsabilidade |
|--------|-----------------|
| **Route Handler** (API) | HTTP in/out, validação Zod, auth check, chama Service |
| **Service** | Regras de negócio, orchestração, transformações |
| **Repository** | CRUD puro no banco, via Prisma |
| **Schema** | DTOs Zod — validação e tipos |
| **Component** | UI React — apenas presentação |
| **Hook** | TanStack Query — cache, estado assíncrono |

---

## 3. Banco de Dados

### 3.1 Estrutura Atual (já no Supabase)

22 tabelas principais — ver documentação em `LEO PORTAL - Contexto/04 - Banco de Dados/Tabelas Principais.md`

Tabelas-chave:
- `clubes` — 30 clubes, pivô central
- `usuarios_acessos` — credenciais de login (substitui planilha Sheets)
- `pessoas_rtma` — membros dos clubes
- `amigos_conselheiros` — amigos LEO e conselheiros
- `nominata_dirigentes` — diretoria por AL
- `campanhas` / `atividades` — registros principais
- `eventos` / `eventos_lotes` / `eventos_inscricoes` — sistema de eventos
- `configuracoes` — trimestres por AL
- `solicitacoes_alteracao` — workflow de aprovação

### 3.2 Estratégia de Reaproveitamento

**Zero migration destrutiva.** Conexão direta ao banco existente via Prisma. Só additive: se precisar de nova coluna, criar migration via `prisma migrate dev`.

### 3.3 Inconsistências Conhecidas (tratadas no código)

| Problema | Tabela | Tratamento V2 |
|----------|--------|---------------|
| PascalCase em colunas | `amigos_conselheiros` | Mapeado no Prisma schema via `@map` |
| camelCase numa coluna | `campanhas.localRealizacao` | Mapeado no Prisma |
| `clube_nome` desnormalizado | Quase todas | Mantido — não alterar |
| `nominata_dirigentes` sem FK | — | Query por varchar `clube` |

### 3.4 Backup e Rollback

- Supabase tem Point-in-Time Recovery habilitado
- Antes de qualquer migration: `supabase db dump > backup_YYYY-MM-DD.sql`
- Nenhum dado é apagado durante a migração
- O sistema legado continua operando no mesmo banco

---

## 4. Backend

### 4.1 Autenticação

**Atual:** Planilha Google Sheets (`Acessos Clubes`) + cargo em `nominata_dirigentes`
**V2:** NextAuth.js com Credentials Provider → `usuarios_acessos` (Supabase)

```typescript
// Fluxo de login
1. POST /api/auth/signin (NextAuth Credentials)
2. AuthService.validateCredentials(email, senha)
   → Query em usuarios_acessos (email + senha hash)
3. AuthService.getPermissions(userId)
   → Query em nominata_dirigentes (cargo no AL atual)
4. JWT com { userId, clubeId, clubeNome, tipoAcesso, cargo }
5. Middleware verifica JWT em rotas protegidas
```

### 4.2 API Routes (padrão)

```typescript
// Exemplo: GET /api/campanhas
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { searchParams } = new URL(request.url)
  const params = CampanhaQuerySchema.parse(Object.fromEntries(searchParams))
  
  const result = await campanhasService.list(params, session.user)
  return Response.json(result)
}
```

### 4.3 Repository Pattern

```typescript
// server/repositories/campanhas.repository.ts
export class CampanhasRepository {
  constructor(private db: PrismaClient) {}
  
  async findByClube(clubeId: string): Promise<Campanha[]> { ... }
  async findAll(filters: CampanhaFilters): Promise<Campanha[]> { ... }
  async upsert(data: UpsertCampanhaDto): Promise<Campanha> { ... }
  async delete(id: string): Promise<void> { ... }
}
```

### 4.4 Service Layer

```typescript
// server/services/campanhas.service.ts
export class CampanhasService {
  constructor(private repo: CampanhasRepository) {}
  
  async list(params: CampanhaQueryDto, user: SessionUser): Promise<CampanhaDto[]> {
    this.validateAccess(user, 'campanhas:read')
    const campanhas = await this.repo.findByClube(user.clubeId)
    return campanhas.map(toCampanhaDto)
  }
}
```

### 4.5 Middlewares

- `withAuth` — verificar sessão JWT
- `withPermission(cargo)` — verificar cargo mínimo
- `withRateLimit` — rate limiting por IP
- `withValidation(schema)` — validar body/params Zod

### 4.6 Segurança

- Service Role Key **apenas** em variáveis de servidor (nunca no client)
- Anon Key para operações client-side seguras (se necessário)
- Senhas armazenadas com bcrypt (migrar plaintext → hash na primeira troca)
- Rate limiting nas rotas de auth
- CORS configurado para domínio Vercel

---

## 5. Frontend

### 5.1 Estrutura de Páginas

| Rota | Componente | Auth | Equivalente GAS |
|------|-----------|------|-----------------|
| `/login` | `LoginPage` | Público | Tela de login do index.html |
| `/recuperar-senha` | `RecuperarSenhaPage` | Público | `recuperar_senha.html` |
| `/redefinir-senha` | `RedefinirSenhaPage` | Público | `redefinir_senha.html` |
| `/dashboard` | `DashboardPage` | Clube | Dashboard do index.html |
| `/campanhas` | `CampanhasPage` | Clube | Seção campanhas |
| `/atividades` | `AtividadesPage` | Clube | Seção atividades |
| `/eventos` | `EventosPage` | Clube | Seção eventos |
| `/rtma` | `RtmaPage` | Presidente/Secretário | `rtma.html` |
| `/nominata` | `NominataPage` | Presidente | Seção nominata |
| `/gerencial` | `GerencialPage` | Distrito | Visão gerencial |
| `/eventos/[id]/inscricao` | `InscricaoPage` | Público | `form_evento_convidados.html` |
| `/scanner` | `ScannerPage` | Evento | `scanner_refeicoes.html` |
| `/camisas` | `CamisasPage` | Evento | `camisas_enumeradas.html` |

### 5.2 Componentes Compartilhados

- `Header` — logo LEO, clube, nome usuário, logout, navegação por abas
- `PageLoader` — spinner global
- `DataTable` — tabela com sort, filter, paginação
- `FormCampanha` / `FormAtividade` — formulários completos
- `RichTextEditor` — Quill.js (manter compatibilidade HTML das campanhas)
- `FileUpload` — upload de fotos/comprovantes → Supabase Storage
- `Chart` — Chart.js via react-chartjs-2
- `QRCode` — qrcodejs (passaportes de eventos)
- `DatePicker` — date inputs com suporte a AL
- `Modal` — overlays de confirmação e formulários
- `Badge` / `Tag` — tipo de atividade, eixo de campanha

### 5.3 Estado Global

- **TanStack Query** — cache e sincronização de dados do servidor
- **Zustand** (se necessário) — estado UI local (modais, tabs ativas)
- **next-intl** não necessário (PT-BR apenas)

### 5.4 Estratégia SSR/CSR

| Página | Estratégia | Justificativa |
|--------|-----------|---------------|
| Login | CSR | Formulário puro |
| Dashboard | SSR | SEO + dados iniciais |
| Campanhas | CSR + TanStack | CRUD interativo frequente |
| RTMA | CSR + TanStack | Tabelas grandes, filtros client |
| Formulário público | SSR | SEO + performance |
| Scanner | CSR | Tempo real, sem SEO |
| Gerencial | SSR | Dados pesados → prefetch |

### 5.5 Interface — Fidelidade Visual

A interface V2 deve ser **pixel-perfect** com o V1.6:
- Mesma paleta de cores
- Mesma tipografia (-apple-system, Segoe UI)
- Mesmo header com tabs de navegação
- Mesmas seções e layouts de card
- Mesmas tabelas de campanhas/atividades
- Mesmos formulários e campos
- Mesmos modais
- Quill.js para rich text (campanhas)
- Chart.js para gráficos

Tailwind + shadcn/ui serão usados como base, com overrides CSS para manter fidelidade visual.

---

## 6. DevOps

### 6.1 GitHub

- Repo: `leo-portal-v2` (novo, privado)
- Branch model: `main` (prod) + `develop` + `feature/*`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- PR obrigatório para main (CI deve passar)

### 6.2 CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  ci:
    - lint (ESLint + Prettier check)
    - typecheck (tsc --noEmit)
    - test (Vitest/Jest)
    - build (next build)
```

Vercel auto-deploy:
- `main` → produção
- PRs → preview deployments

### 6.3 Ambientes

| Ambiente | URL | Branch | Banco |
|----------|-----|--------|-------|
| Local | localhost:3000 | qualquer | Supabase (mesmo) |
| Preview | *.vercel.app | feature/* + PRs | Supabase (mesmo) |
| Produção | leo-portal.vercel.app | main | Supabase (mesmo) |

### 6.4 Variáveis de Ambiente

```bash
# Supabase
SUPABASE_URL=https://bqkttaflhtsdkamgscnf.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # APENAS server-side

# Database (Prisma)
DATABASE_URL=postgresql://...@db.bqkttaflhtsdkamgscnf.supabase.co:5432/postgres

# NextAuth
NEXTAUTH_URL=https://leo-portal.vercel.app
NEXTAUTH_SECRET=...

# Email
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
```

### 6.5 Observabilidade

- **Vercel Analytics** — web vitals + performance
- **Vercel Logs** — runtime logs
- **Sentry** (opcional v2) — error tracking
- Logs estruturados via `console.log({ level, message, data })` no server

---

## 7. Estratégia de Migração

### 7.1 Fases de Migração

```
Fase A: Infrastructure (semana 1)
  → Next.js setup, Prisma, auth básico, CI/CD

Fase B: Core Features P0 (semanas 2-3)
  → Login, campanhas, atividades, dashboard

Fase C: Events + RTMA (semanas 4-5)
  → Eventos completos, RTMA, nominata

Fase D: Secondary Pages (semana 6)
  → Scanner, camisas, formulário público, gerencial

Fase E: Validation + Cutover (semana 7)
  → Testes paralelos, validação com usuários beta, troca de URL
```

### 7.2 Compatibilidade Durante Migração

- GAS continua servindo o portal legado na URL original
- V2 fica em URL separada (Vercel)
- Ambos leem/escrevem no mesmo banco Supabase
- Sem conflito de dados (operações idempotentes com `id` UUID)

### 7.3 Rollback

- Qualquer problema → usuários voltam para URL legada
- Nenhum dado foi perdido (banco inalterado)
- GAS não é desativado até validação completa

---

## 8. Qualidade

### 8.1 Testes

| Tipo | Ferramenta | Cobertura |
|------|-----------|-----------|
| Unit (services/utils) | Vitest | >80% |
| Integration (repositories) | Vitest + Supabase test | happy paths |
| E2E | Playwright | fluxos críticos (login, nova campanha) |

### 8.2 Padrões

- ESLint: `next/core-web-vitals` + `typescript-eslint`
- Prettier: formato padrão
- Husky: pre-commit (lint + typecheck), commit-msg (conventional)
- Sem `any` no TypeScript (strict mode)

---

## 9. Segurança

### 9.1 Autenticação

- JWT com expiração 24h (mesma sessão do browser)
- Refresh token via NextAuth
- bcrypt para senha (migrar hashless no primeiro login)

### 9.2 Autorização por Cargo

```typescript
enum TipoAcesso {
  DISTRITO = 'distrito',   // acesso total a todos os clubes
  REGIAO   = 'regiao',     // acesso a clubes da região
  CLUBE    = 'clube',      // acesso apenas ao seu clube
  EVENTO   = 'evento',     // acesso apenas a eventos
}

enum Cargo {
  PRESIDENTE           = 'Presidente',
  SECRETARIO           = 'Secretário(a)',
  DIRETOR_CAMPANHAS    = 'Diretor(a) de Campanhas',
}
```

### 9.3 Rate Limiting

- `/api/auth/*`: 10 req/min por IP
- `/api/**`: 100 req/min por usuário

### 9.4 OWASP

- SQL Injection: Prisma parametrizado
- XSS: React escapa por padrão; `dangerouslySetInnerHTML` isolado em `descricaoHTML`
- CSRF: NextAuth built-in
- Secrets: variáveis de ambiente Vercel (não no código)

---

## 10. Roadmap

### Fase A — Infrastructure (P0)
1. Inicializar projeto Next.js + TypeScript + Tailwind + shadcn
2. Configurar ESLint + Prettier + Husky + conventional commits
3. Setup Prisma → conectar ao Supabase existente
4. Gerar tipos Prisma do banco atual
5. Implementar NextAuth com Credentials (usuarios_acessos)
6. Middleware de autenticação e proteção de rotas
7. Criar repositório GitHub + CI/CD + Vercel

### Fase B — Core (P0)
8. Layout base: Header + navegação por abas + sidebar
9. Tela de login (fidelidade visual V1.6)
10. Dashboard do clube
11. Módulo Campanhas: listagem + formulário completo + upload fotos
12. Módulo Atividades: listagem + formulário completo
13. Recuperação e redefinição de senha

### Fase C — Events + RTMA (P1)
14. Módulo Eventos: listagem + criação + lotes
15. Módulo Eventos: inscrições + envio comprovante
16. Módulo Eventos: credenciamento + passaportes
17. Módulo RTMA: listagem membros + CRUD
18. Módulo RTMA: amigos LEO + conselheiros
19. Módulo Nominata: diretoria por AL

### Fase D — Secondary (P2)
20. Visão Gerencial: dashboards distritais
21. Scanner de Refeições
22. Camisas Enumeradas
23. Formulário público de inscrição em eventos

### Fase E — Launch
24. Testes E2E críticos
25. Validação beta com usuários reais
26. Cutover: atualizar URL oficial para Vercel
