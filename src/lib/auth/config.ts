import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { calcularAlAtual } from './utils'

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null

        const email = String(credentials.email).toLowerCase().trim()
        const senha = String(credentials.senha)

        const supabase = getSupabaseAdmin()

        const { data: usuario, error } = await supabase
          .from('usuarios_acessos')
          .select('*, clubes(nome)')
          .eq('email', email)
          .single()

        if (error || !usuario || !usuario.ativo) return null

        // Password check: bcrypt hash or plaintext (migration period)
        let passwordValid = false
        if (usuario.senha) {
          const isHash = usuario.senha.startsWith('$2')
          passwordValid = isHash
            ? await bcrypt.compare(senha, usuario.senha)
            : usuario.senha === senha
        }

        if (!passwordValid) return null

        const alAtual = calcularAlAtual()
        let cargo: string | null = null

        try {
          const { data: nominata } = await supabase
            .from('nominata_dirigentes')
            .select('cargo')
            .eq('clube', usuario.clube_nome)
            .eq('ano_leonistico', alAtual)
            .limit(1)
            .single()
          cargo = nominata?.cargo ?? null
        } catch {
          // non-fatal
        }

        return {
          id: usuario.id,
          email: usuario.email,
          clubeId: usuario.clube_id ?? '',
          clubeNome: usuario.clube_nome,
          tipoAcesso: (usuario.tipo_acesso ?? 'clube') as 'distrito' | 'regiao' | 'clube' | 'evento',
          cargo,
          alAtual,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.clubeId = (user as any).clubeId
        token.clubeNome = (user as any).clubeNome
        token.tipoAcesso = (user as any).tipoAcesso
        token.cargo = (user as any).cargo
        token.alAtual = (user as any).alAtual
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.clubeId = token.clubeId as string
      session.user.clubeNome = token.clubeNome as string
      session.user.tipoAcesso = token.tipoAcesso as 'distrito' | 'regiao' | 'clube' | 'evento'
      session.user.cargo = token.cargo as string | null
      session.user.alAtual = token.alAtual as string
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
})
