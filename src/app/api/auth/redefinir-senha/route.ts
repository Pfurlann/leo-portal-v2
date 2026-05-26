import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, senha } = await req.json()
    if (!token || !senha) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    if (String(senha).length < 6) return NextResponse.json({ error: 'Senha muito curta' }, { status: 400 })

    const usuario = await db.usuarioAcesso.findFirst({
      where: {
        resetToken: String(token),
        resetTokenExpires: { gt: new Date() },
        ativo: true,
      },
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 })
    }

    const senhaHash = await bcrypt.hash(String(senha), 12)

    await db.usuarioAcesso.update({
      where: { id: usuario.id },
      data: {
        senha: senhaHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[redefinir-senha]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
