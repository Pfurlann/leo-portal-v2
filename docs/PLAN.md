# Implementation Plan — LEO Portal V2

> Gerado: 2026-05-26
> SDD: ./SDD.md
> Working dir: /Users/pedrofurlan/Desktop/Projetos GAS/LEO Portal V2

---

## Context

Migração do LEO Portal V1.6 (Google Apps Script) para Next.js 15 + TypeScript + Prisma + Supabase existente.
- Banco: Supabase `bqkttaflhtsdkamgscnf` (não mudar estrutura)
- Interface: pixel-perfect com V1.6
- Legado continua operando durante migração

---

## Phase A — Infrastructure

### Task A1: Next.js Project Initialization

**Goal:** Create Next.js 15 project with full tooling configured.

**Steps:**
1. `npx create-next-app@latest leo-portal-v2 --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` in `/Users/pedrofurlan/Desktop/Projetos GAS/LEO Portal V2`
2. Install dependencies:
   - `@prisma/client prisma`
   - `next-auth@beta @auth/prisma-adapter`
   - `@tanstack/react-query @tanstack/react-query-devtools`
   - `zod react-hook-form @hookform/resolvers`
   - `bcryptjs @types/bcryptjs`
   - `@supabase/supabase-js`
   - `clsx tailwind-merge class-variance-authority`
3. Install shadcn/ui: `npx shadcn@latest init`
4. Add shadcn components: `button card input label form select dialog sheet table badge tabs skeleton toast sonner`
5. Configure `next.config.ts` with image domains (imgur.com, supabase storage)
6. Configure `tailwind.config.ts` with LEO Portal color palette
7. Create `.env.local` from `.env.example`
8. Create `.env.example` with all required vars

**Files to create:**
- `package.json` (via create-next-app, then add deps)
- `next.config.ts`
- `tailwind.config.ts`
- `components.json`
- `.env.example`
- `src/lib/utils.ts` (cn() helper)

**Success criteria:**
- `npm run build` succeeds with zero errors
- `npm run dev` starts on port 3000

---

### Task A2: Code Quality Tooling

**Goal:** ESLint, Prettier, Husky, lint-staged, conventional commits.

**Steps:**
1. Configure Prettier: `npm install --save-dev prettier prettier-plugin-tailwindcss`
2. Create `.prettierrc` and `.prettierignore`
3. Update `.eslintrc` with TypeScript rules + import order
4. Install Husky: `npm install --save-dev husky lint-staged commitlint @commitlint/config-conventional`
5. `npx husky init`
6. Create `.husky/pre-commit` — runs lint-staged
7. Create `.husky/commit-msg` — runs commitlint
8. Configure `lint-staged` in package.json
9. Create `commitlint.config.js`

**Files to create:**
- `.prettierrc`
- `.prettierignore`
- `.eslintrc.json` (updated)
- `.husky/pre-commit`
- `.husky/commit-msg`
- `commitlint.config.js`
- Update `package.json` with lint-staged config

**Success criteria:**
- `npm run lint` passes
- `npm run format:check` passes
- Commit with bad message fails
- Commit with good message passes

---

### Task A3: Prisma + Supabase Connection

**Goal:** Prisma schema matching existing Supabase tables, connection working.

**Steps:**
1. `npx prisma init --datasource-provider postgresql`
2. Set `DATABASE_URL` in `.env.local` pointing to Supabase postgres
3. `npx prisma db pull` — introspect existing schema
4. Review and fix generated schema:
   - Add `@map` for PascalCase columns in `amigos_conselheiros`
   - Add `@map("localRealizacao")` for camelCase column in `campanhas`
   - Add explicit relations where FK exists
   - Fix model names to PascalCase (Prisma convention)
5. `npx prisma generate` — generate client
6. Create `src/lib/db.ts` — Prisma singleton

**Files to create:**
- `prisma/schema.prisma` (full schema, all 22 tables)
- `src/lib/db.ts`

**Success criteria:**
- `npx prisma generate` succeeds
- `npx prisma validate` passes
- `import { db } from '@/lib/db'` works without TS errors
- Query `db.clubes.findMany({ take: 1 })` returns data

---

### Task A4: NextAuth Authentication

**Goal:** Login working with `usuarios_acessos` table, JWT session with cargo.

**Steps:**
1. Install: `npm install next-auth@5` (v5 beta for App Router)
2. Create `src/lib/auth/config.ts` — NextAuth config with Credentials provider
3. `AuthService.validateCredentials()`:
   - Query `usuarios_acessos` by email
   - bcrypt.compare (with plaintext fallback during migration)
4. `AuthService.getUserPermissions()`:
   - Calculate `alAtual` (jul-jun formula)
   - Query `nominata_dirigentes` for cargo
5. Create `src/app/api/auth/[...nextauth]/route.ts`
6. Create `src/types/next-auth.d.ts` — extend session type
7. Create `src/middleware.ts` — protect `/dashboard/**`, `/campanhas/**`, etc.
8. Create `src/lib/auth/get-session.ts` — helper for server components

**JWT payload:**
```typescript
interface SessionUser {
  id: string
  email: string
  clubeId: string
  clubeNome: string
  tipoAcesso: 'distrito' | 'regiao' | 'clube' | 'evento'
  cargo: string | null
  alAtual: string
}
```

**Files to create:**
- `src/lib/auth/config.ts`
- `src/lib/auth/get-session.ts`
- `src/server/services/auth.service.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/types/next-auth.d.ts`
- `src/middleware.ts`

**Success criteria:**
- POST `/api/auth/signin` with valid credentials returns JWT
- POST `/api/auth/signin` with bad credentials returns 401
- Accessing `/dashboard` without session redirects to `/login`
- Session contains `clubeId`, `clubeNome`, `cargo`

---

### Task A5: GitHub + CI/CD + Vercel Setup

**Goal:** Git repo initialized, CI pipeline, Vercel deployment configured.

**Steps:**
1. `git init` in project directory
2. Create `.gitignore` (Next.js standard + .env.local)
3. Initial commit
4. Create GitHub repo `leo-portal-v2` (via `gh repo create`)
5. Push to GitHub
6. Create `.github/workflows/ci.yml`:
   - lint + typecheck + build on push/PR
7. Connect Vercel to GitHub repo (instructions for user — requires browser)
8. Create `vercel.json` if needed

**Files to create:**
- `.gitignore`
- `.github/workflows/ci.yml`

**Note:** Vercel connection requires user to authorize via browser — provide instructions.

**Success criteria:**
- `git log` shows initial commit
- GitHub repo exists with code pushed
- CI runs on push (green)

---

## Phase B — Core Features

### Task B1: Base Layout + Navigation

**Goal:** Header, navigation tabs, authenticated layout — fiel ao V1.6.

**Visual reference (from index.html V1.6):**
- White header with bottom border + box-shadow
- Header-top: logo (LEO Portal text), clube name + user name, logout button
- Navigation: tabs (Dashboard, Campanhas, Atividades, Eventos, Secretaria, Nominata, etc.)
- Tabs visíveis conforme `tipoAcesso` e `cargo`
- Font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- Background: #f8f9fa
- Header bg: #fff
- Border: #e9ecef
- Primary color: LEO yellow (#FFCC00 or similar) — verificar no index.html

**Steps:**
1. Create `src/components/layout/Header.tsx`
2. Create `src/components/layout/NavTabs.tsx` (permission-aware)
3. Create `src/app/(portal)/layout.tsx` — authenticated wrapper
4. Create `src/app/(portal)/layout-client.tsx` — client wrapper with TanStack Query Provider
5. Create `src/components/providers/QueryProvider.tsx`
6. Create `src/components/providers/SessionProvider.tsx`

**Tabs mapping:**
| Tab | Cargo mínimo |
|-----|-------------|
| Dashboard | Todos |
| Campanhas | Todos ou Dir. Campanhas |
| Atividades | Todos |
| Eventos | Todos |
| Secretaria (RTMA) | Presidente, Secretário |
| Nominata | Presidente |
| Visão Gerencial | Distrito |

**Files to create:**
- `src/components/layout/Header.tsx`
- `src/components/layout/NavTabs.tsx`
- `src/app/(portal)/layout.tsx`
- `src/components/providers/QueryProvider.tsx`
- `src/components/providers/SessionProvider.tsx`

---

### Task B2: Login Page

**Goal:** Tela de login pixel-perfect com V1.6.

**Visual reference:** Card centralizado, logo LEO, campos email/senha, botão entrar, link recuperar senha.

**Steps:**
1. Create `src/app/(auth)/login/page.tsx`
2. Create `src/app/(auth)/login/LoginForm.tsx` — client component
3. Use `signIn()` from next-auth/react
4. Handle errors (credenciais inválidas, conta inativa)
5. Redirect to `/dashboard` on success
6. Create `src/app/(auth)/layout.tsx`

---

### Task B3: Dashboard Page

**Goal:** Dashboard do clube com resumo de campanhas, atividades, eventos do AL atual.

**Steps:**
1. Create `src/app/(portal)/dashboard/page.tsx` (SSR)
2. Create `src/server/repositories/clubes.repository.ts`
3. Create `src/server/repositories/campanhas.repository.ts` (básico)
4. Create `src/server/repositories/atividades.repository.ts` (básico)
5. Create `src/server/services/dashboard.service.ts`
6. Create `src/app/api/dashboard/route.ts`
7. Create `src/components/dashboard/StatsCards.tsx`
8. Create `src/components/dashboard/RecentCampanhas.tsx`
9. Create `src/components/dashboard/RecentAtividades.tsx`

**Data to show:**
- Nº campanhas no AL atual
- Nº atividades no AL atual
- Nº membros ativos
- Última campanha registrada
- Último evento

---

### Task B4: Campanhas Module

**Goal:** Listagem, criação, edição, exclusão de campanhas — funcionalidade completa.

**Steps:**

**Backend:**
1. Complete `src/server/repositories/campanhas.repository.ts`
   - `findByClube(clubeId, filters)`
   - `findAll(filters)` — para distrito
   - `upsert(data)`
   - `delete(id)`
   - `patchFotoOficial(id, url)`
   - `patchOutrasFotos(id, csvUrls)`
   - `patchVideo(id, url)`
2. Create `src/server/services/campanhas.service.ts`
3. Create `src/schemas/campanha.schema.ts` (Zod)
4. Create API routes:
   - `GET /api/campanhas` — listar
   - `POST /api/campanhas` — criar
   - `PATCH /api/campanhas/[id]` — editar
   - `DELETE /api/campanhas/[id]` — excluir
   - `PATCH /api/campanhas/[id]/foto` — upload foto
   - `PATCH /api/campanhas/[id]/video` — update video url

**Frontend:**
5. Create `src/app/(portal)/campanhas/page.tsx`
6. Create `src/hooks/useCampanhas.ts` (TanStack Query)
7. Create `src/components/campanhas/CampanhasTable.tsx`
8. Create `src/components/campanhas/CampanhaCard.tsx`
9. Create `src/components/campanhas/FormCampanha.tsx` — formulário completo
10. Create `src/components/campanhas/FormCampanhaModal.tsx`
11. Create `src/components/shared/RichTextEditor.tsx` (Quill.js wrapper)
12. Create `src/components/shared/FileUpload.tsx` (Supabase Storage)

**Campanha form fields (from V1.6):**
- titulo, objetivo, eixo (eixo_d8/eixo_dm)
- data_inicio, data_fim
- coordenador, comissao
- associados_presentes, qtd, pre_leo_presentes, qtd, amigos_conselheiros, qtd
- pessoas_impactadas, custo_campanha
- horas_por_pessoa, horas_totais
- descricao_campanha (rich text), descricao_html
- foto_oficial_url, video_url, outras_fotos_url
- tem_parceria, entidade_parceira, tipo_parceria, descricao_parceria
- divulgacao, pontos_melhorar, feedback
- trimestre, al

---

### Task B5: Atividades Module

**Goal:** Listagem, criação, edição, exclusão de atividades.

**Similar structure to B4 but for atividades.**

**Backend:**
1. Complete `src/server/repositories/atividades.repository.ts`
2. Create `src/server/services/atividades.service.ts`
3. Create `src/schemas/atividade.schema.ts`
4. Create API routes: GET/POST/PATCH/DELETE `/api/atividades/**`

**Frontend:**
5. Create `src/app/(portal)/atividades/page.tsx`
6. Create `src/hooks/useAtividades.ts`
7. Create `src/components/atividades/AtividadesTable.tsx`
8. Create `src/components/atividades/FormAtividade.tsx`

**Atividade form fields:**
- titulo, tipo_atividade
- data_inicio, hora_inicio, data_fim, hora_fim
- local_atividade
- associados_presentes, qtd, pre_leos_presentes, qtd, leo_leao_presentes, qtd, amigos_conselheiros, qtd, outros_lions
- duracao_total_minutos
- descricao_atividade
- foto_oficial_url
- trimestre, al

---

### Task B6: Password Recovery Flow

**Goal:** Recuperação e redefinição de senha via email.

**Steps:**
1. Create `src/app/(auth)/recuperar-senha/page.tsx`
2. Create `src/app/(auth)/redefinir-senha/page.tsx`
3. Create `src/app/(auth)/email-enviado/page.tsx`
4. Create `src/app/api/auth/recuperar-senha/route.ts`
   - Generate reset token (JWT ou UUID)
   - Store token in `usuarios_acessos` (nova coluna `reset_token`, `reset_token_expires`) OR use in-memory/Redis
   - Send email via Nodemailer/Resend
5. Create `src/app/api/auth/redefinir-senha/route.ts`
   - Validate token
   - bcrypt hash new password
   - Update `usuarios_acessos.senha`
6. Create `src/lib/email/send-email.ts`

---

## Phase C — Events + RTMA

### Task C1: Eventos Module (Core)

**Goal:** Listagem e gerenciamento de eventos, lotes de pagamento.

**Backend:**
1. Create `src/server/repositories/eventos.repository.ts`
   - CRUD eventos
   - CRUD lotes (`eventos_lotes`)
2. Create `src/server/services/eventos.service.ts`
3. Create `src/schemas/evento.schema.ts`
4. API routes: `/api/eventos/**`, `/api/eventos/[id]/lotes/**`

**Frontend:**
5. Create `src/app/(portal)/eventos/page.tsx`
6. Create `src/components/eventos/EventoCard.tsx`
7. Create `src/components/eventos/FormEvento.tsx`
8. Create `src/components/eventos/LotesManager.tsx`

---

### Task C2: Eventos Inscrições + Comprovantes

**Goal:** Inscrições, envio de comprovante, gestão de envios por clube.

**Backend:**
1. Add to eventos repository: inscricoes CRUD, envios CRUD, comprovantes CRUD
2. Service: validar lote disponível, calcular vagas restantes
3. API routes: `/api/eventos/[id]/inscricoes/**`, `/api/eventos/[id]/envios/**`

**Frontend:**
4. Create `src/app/(portal)/eventos/[id]/page.tsx` — detalhes do evento
5. Create `src/components/eventos/InscricoesTable.tsx`
6. Create `src/components/eventos/FormInscricao.tsx`
7. Create `src/components/eventos/EnvioComprovante.tsx`

---

### Task C3: Eventos Passaportes + Credenciamento

**Goal:** Geração de passaportes QR Code, credenciamento de inscritos.

**Backend:**
1. Modalidades CRUD (`modalidades`, `eventos_modalidades`, `modalidades_bloqueio`)
2. Credenciamento CRUD (`eventos_credenciamento_modalidade`)
3. Passaporte: query de inscrição + refeições

**Frontend:**
4. Create `src/app/(portal)/eventos/[id]/credenciamento/page.tsx`
5. Create `src/components/eventos/PassaporteCard.tsx` (QR Code)
6. Create `src/app/scanner/page.tsx` — scanner de refeições

---

### Task C4: RTMA Module

**Goal:** Gestão completa de membros (pessoas_rtma) e amigos/conselheiros.

**Backend:**
1. Create `src/server/repositories/rtma.repository.ts`
   - CRUD `pessoas_rtma`
   - CRUD `amigos_conselheiros`
   - Busca com filtros (tipo, formacao, cargo)
   - Transferência entre clubes
2. Create `src/server/services/rtma.service.ts`
3. Create `src/schemas/rtma.schema.ts`
4. API routes: `/api/rtma/pessoas/**`, `/api/rtma/amigos/**`

**Frontend:**
5. Create `src/app/(portal)/rtma/page.tsx`
6. Create `src/components/rtma/PessoasTable.tsx`
7. Create `src/components/rtma/FormPessoa.tsx`
8. Create `src/components/rtma/AmigosTable.tsx`
9. Create `src/components/rtma/FormAmigo.tsx`
10. Create `src/components/rtma/RelatoriosRTMA.tsx`

---

### Task C5: Nominata Module

**Goal:** Cadastro e gestão da diretoria por AL.

**Backend:**
1. Create `src/server/repositories/nominata.repository.ts`
2. Create `src/server/services/nominata.service.ts`
3. API routes: `/api/nominata/**`

**Frontend:**
4. Create `src/app/(portal)/nominata/page.tsx`
5. Create `src/components/nominata/NominataGrid.tsx`
6. Create `src/components/nominata/FormDirigente.tsx`

---

## Phase D — Secondary Pages

### Task D1: Formulário Público de Evento (form_evento_convidados.html)

**Goal:** Página pública de inscrição em evento — sem autenticação.

1. Create `src/app/eventos/[id]/inscricao/page.tsx` (SSR, public)
2. Create `src/components/eventos/FormInscricaoPublico.tsx`
3. Handle file upload (comprovante) → Supabase Storage

---

### Task D2: Scanner de Refeições

**Goal:** Credenciamento por scan/busca + registro de refeição.

1. Create `src/app/scanner/page.tsx`
2. Create `src/components/scanner/BuscaInscrito.tsx`
3. Create `src/components/scanner/RegistroRefeicao.tsx`
4. API: `PATCH /api/eventos/inscricoes/[id]/refeicao`

---

### Task D3: Camisas Enumeradas

**Goal:** Atribuição de camisas numeradas para eventos.

1. Create `src/app/camisas/page.tsx`
2. Create `src/components/camisas/CamisasManager.tsx`

---

### Task D4: Visão Gerencial

**Goal:** Dashboards distritais com métricas agregadas.

1. Create `src/app/(portal)/gerencial/page.tsx` (SSR)
2. Create `src/server/services/gerencial.service.ts` — aggregate queries
3. Create `src/components/gerencial/` — charts Chart.js via react-chartjs-2
4. API routes: `/api/gerencial/**`

---

## Phase E — Tests + Launch

### Task E1: Critical E2E Tests

1. Install Playwright: `npm install --save-dev @playwright/test`
2. Tests:
   - Login flow (valid + invalid credentials)
   - Create campanha
   - Create atividade
   - Inscrição pública em evento

### Task E2: Unit Tests for Services

1. Install Vitest
2. Test `auth.service.ts` (permission logic, AL calculation)
3. Test `campanhas.service.ts` (normalization, validation)

### Task E3: Final Deployment

1. Configure Vercel environment variables
2. Push to main → auto deploy
3. Smoke test production URL
4. Document cutover procedure
