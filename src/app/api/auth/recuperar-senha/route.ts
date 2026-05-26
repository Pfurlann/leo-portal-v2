import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

    const usuario = await db.usuarioAcesso.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    })

    // Always return success to prevent email enumeration
    if (!usuario || !usuario.ativo) {
      return NextResponse.json({ ok: true })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db.usuarioAcesso.update({
      where: { id: usuario.id },
      data: { resetToken: token, resetTokenExpires: expires },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/redefinir-senha?token=${token}`

    // Log for now — email sending configured when SMTP is set up
    console.warn('[recuperar-senha] Reset URL for', email, ':', resetUrl)

    // Send email if SMTP configured
    if (process.env.SMTP_HOST && process.env.SMTP_HOST !== '') {
      try {
        const nodemailer = await import('nodemailer')
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 587),
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        })
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: email,
          subject: 'LEO Portal — Recuperação de Senha',
          html: `
            <p>Olá,</p>
            <p>Você solicitou a recuperação de senha do LEO Portal.</p>
            <p><a href="${resetUrl}">Clique aqui para redefinir sua senha</a></p>
            <p>Este link expira em 1 hora.</p>
            <p>Se você não solicitou isso, ignore este email.</p>
          `,
        })
      } catch (emailErr) {
        console.error('[recuperar-senha] Email send failed:', emailErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[recuperar-senha]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
