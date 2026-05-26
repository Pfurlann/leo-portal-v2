import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { calcularAlAtual } from './utils'

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

        // Find user in usuarios_acessos
        const usuario = await db.usuarioAcesso.findUnique({
          where: { email },
          include: { clube: true },
        })

        if (!usuario || !usuario.ativo) return null

        // Password check: support bcrypt hash and plaintext (migration period)
        let passwordValid = false
        if (usuario.senha) {
          const isHash = usuario.senha.startsWith('$2')
          if (isHash) {
            passwordValid = await bcrypt.compare(senha, usuario.senha)
          } else {
            // Plaintext comparison (legacy — will be hashed on next login)
            passwordValid = usuario.senha === senha
          }
        }

        if (!passwordValid) return null

        // Get cargo from nominata_dirigentes
        const alAtual = calcularAlAtual()
        let cargo: string | null = null

        try {
          const nominata = await db.nominataDirigente.findFirst({
            where: {
              clube: usuario.clubeNome,
              anoLeonistico: alAtual,
            },
            select: { cargo: true },
          })
          cargo = nominata?.cargo ?? null
        } catch {
          // nominata lookup failure is non-fatal
        }

        return {
          id: usuario.id,
          email: usuario.email,
          clubeId: usuario.clubeId ?? '',
          clubeNome: usuario.clubeNome,
          tipoAcesso: (usuario.tipoAcesso ?? 'clube') as 'distrito' | 'regiao' | 'clube' | 'evento',
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
