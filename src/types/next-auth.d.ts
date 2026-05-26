import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      clubeId: string
      clubeNome: string
      tipoAcesso: 'distrito' | 'regiao' | 'clube' | 'evento'
      cargo: string | null
      alAtual: string
    }
  }
}
