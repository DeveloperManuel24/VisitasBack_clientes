import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name)
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    const user = process.env.GMAIL_USER
    const pass = process.env.GMAIL_APP_PASS

    const host = process.env.SMTP_HOST ?? 'smtp.gmail.com'
    const portRaw = process.env.SMTP_PORT ?? '465'
    const secureRaw = process.env.SMTP_SECURE ?? 'true'

    this.logger.log('[GmailService] init...')
    this.logger.log(`[GmailService] SMTP_HOST=${host}`)
    this.logger.log(
      `[GmailService] SMTP_PORT=${portRaw} secure=${secureRaw}`,
    )
    this.logger.log(`[GmailService] GMAIL_USER=${user}`)

    // si no hay credenciales, deshabilitamos correo
    if (!user || !pass) {
      this.logger.warn(
        '[GmailService] correo DESHABILITADO: faltan GMAIL_USER / GMAIL_APP_PASS',
      )
      this.transporter = null
      return
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(portRaw),
      secure: String(secureRaw) === 'true',
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10_000,
      socketTimeout: 10_000,
    })

    // *** IMPORTANTE ***
    // NO verify().
    // NO onModuleInit().
    // NO awaits de red aquí.
    //
    this.logger.log(
      '[GmailService] transporter creado en modo tolerante (sin verify al boot)',
    )
  }

  async sendPasswordReset(to: string, name: string, link: string) {
    const from =
      process.env.MAIL_FROM ||
      `SkyNet Visitas <${process.env.GMAIL_USER ?? 'no-reply@visitas'}>`

    const subject = 'Restablecer contraseña - SkyNet Visitas'
    const html = this.templatePasswordReset(name, link)
    const text = `Hola ${name || 'usuario'},

Recibimos una solicitud para restablecer tu contraseña.
Enlace (vigencia limitada): ${link}

Si no fuiste tú, ignora este mensaje.
`

    if (!this.transporter) {
      this.logger.warn(
        `[GmailService] sendPasswordReset SKIPPED (correo deshabilitado) to=${to}`,
      )
      return
    }

    try {
      this.logger.log(
        `[GmailService] ENVIANDO reset-pass to=${to} subject="${subject}"`,
      )

      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      })

      this.logger.log(
        `[GmailService] OK reset-pass -> ${info.messageId} to=${to}`,
      )
    } catch (err: any) {
      this.logger.error(
        `[GmailService] ERROR reset-pass to=${to}: ${err?.message}`,
      )
    }
  }

  async sendVisitaCompletada(opts: {
    to: string
    visitaId: string
    clienteNombre: string
    tecnicoNombre: string
    fechaProgramada: string
    checkIn: string
    checkOut: string
    duracionTxt: string
    notaTecnico?: string | null
  }) {
    if (!opts.to) {
      this.logger.warn(
        `sendVisitaCompletada: visita ${opts.visitaId} sin email del cliente`,
      )
      return
    }

    const from =
      process.env.MAIL_FROM ||
      `SkyNet Visitas <${process.env.GMAIL_USER ?? 'no-reply@visitas'}>`

    const subject = `Visita ${opts.visitaId} completada`
    const html = this.templateVisitaCompletada(opts)
    const text = this.templateVisitaCompletadaText(opts)

    if (!this.transporter) {
      this.logger.warn(
        `[GmailService] sendVisitaCompletada SKIPPED (correo deshabilitado) visita=${opts.visitaId} to=${opts.to}`,
      )
      return
    }

    try {
      this.logger.log(
        `[GmailService] ENVIANDO correo visita=${opts.visitaId} to=${opts.to}`,
      )

      const info = await this.transporter.sendMail({
        from,
        to: opts.to,
        subject,
        text,
        html,
      })

      this.logger.log(
        `[GmailService] OK visita completada -> ${info.messageId} to=${opts.to}`,
      )
    } catch (err: any) {
      this.logger.error(
        `[GmailService] ERROR visita completada visita=${opts.visitaId} to=${opts.to}: ${err?.message}`,
      )
    }
  }

  private templateVisitaCompletada(opts: {
    visitaId: string
    clienteNombre: string
    tecnicoNombre: string
    fechaProgramada: string
    checkIn: string
    checkOut: string
    duracionTxt: string
    notaTecnico?: string | null
  }) {
    const notaBlock = opts.notaTecnico
      ? `
        <p style="font-size:14px;color:#374151;margin:0 0 16px">
          <strong>Notas del técnico:</strong><br/>
          ${this.escape(opts.notaTecnico)}
        </p>
      `
      : ''

    return `
      <div style="background:#f6f7fb;padding:24px;font-family:Arial,sans-serif;color:#111;">
        <table width="100%" style="max-width:620px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.06)">
          <tr>
            <td style="padding:24px;text-align:center;font-weight:700;font-size:20px">
              SkyNet Visitas
            </td>
          </tr>

          <tr>
            <td style="padding:0 24px">
              <hr style="border:none;border-top:1px solid #eef2f7">
            </td>
          </tr>

          <tr>
            <td style="padding:24px">
              <p style="font-size:16px;margin:0 0 12px">
                Hola <strong>${this.escape(
                  opts.clienteNombre || 'Estimado cliente',
                )}</strong>,
              </p>

              <p style="font-size:14px;color:#374151;margin:0 0 16px">
                Te informamos que la visita técnica ha sido
                <strong>completada</strong>.
              </p>

              <ul style="font-size:14px;color:#111;margin:0 0 16px 16px;padding:0;list-style:disc">
                <li><strong>ID de visita:</strong> ${this.escape(
                  opts.visitaId,
                )}</li>
                <li><strong>Técnico asignado:</strong> ${this.escape(
                  opts.tecnicoNombre,
                )}</li>
                <li><strong>Programada para:</strong> ${this.escape(
                  opts.fechaProgramada,
                )}</li>
                <li><strong>Check-in:</strong> ${this.escape(
                  opts.checkIn,
                )}</li>
                <li><strong>Check-out:</strong> ${this.escape(
                  opts.checkOut,
                )}</li>
                <li><strong>Duración total:</strong> ${this.escape(
                  opts.duracionTxt,
                )}</li>
              </ul>

              ${notaBlock}

              <p style="font-size:12px;color:#6b7280;margin:0 0 8px">
                Si tenés alguna duda o comentario sobre el servicio realizado,
                podés responder a este correo.
              </p>

              <p style="font-size:12px;color:#6b7280;margin:0">
                Gracias por confiar en nosotros.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb;padding:16px;text-align:center;color:#6b7280;font-size:12px">
              © ${new Date().getFullYear()} SkyNet Visitas — Registro automático
            </td>
          </tr>
        </table>
      </div>
    `
  }

  private templateVisitaCompletadaText(opts: {
    visitaId: string
    clienteNombre: string
    tecnicoNombre: string
    fechaProgramada: string
    checkIn: string
    checkOut: string
    duracionTxt: string
    notaTecnico?: string | null
  }) {
    return `Hola ${opts.clienteNombre || 'Estimado cliente'},

Te informamos que la visita técnica ha sido completada.

ID de visita: ${opts.visitaId}
Técnico asignado: ${opts.tecnicoNombre}
Programada para: ${opts.fechaProgramada}
Check-in: ${opts.checkIn}
Check-out: ${opts.checkOut}
Duración total: ${opts.duracionTxt}
${
  opts.notaTecnico
    ? `Notas del técnico:\n${opts.notaTecnico}\n`
    : ''
}

Si tenés alguna duda sobre el servicio realizado, podés responder a este correo.

SkyNet Visitas — Registro automático
`
  }

  private templatePasswordReset(name: string, link: string) {
    return `
      <div style="background:#f6f7fb;padding:24px;font-family:Arial,sans-serif;color:#111;">
        <table width="100%" style="max-width:620px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.06)">
          <tr>
            <td style="padding:24px;text-align:center;font-weight:700;font-size:20px">
              SkyNet Visitas
            </td>
          </tr>

          <tr>
            <td style="padding:0 24px">
              <hr style="border:none;border-top:1px solid #eef2f7">
            </td>
          </tr>

          <tr>
            <td style="padding:24px">
              <p style="font-size:16px;margin:0 0 12px">
                Hola <strong>${this.escape(name || 'usuario')}</strong>,
              </p>

              <p style="font-size:14px;color:#374151;margin:0 0 16px">
                Usa el siguiente enlace para <strong>restablecer tu contraseña</strong> (tiempo limitado):
              </p>

              <div style="text-align:center;margin:24px 0">
                <a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#1d4ed8;color:#fff;font-weight:700;text-decoration:none">
                  Restablecer contraseña
                </a>
              </div>

              <p style="font-size:12px;color:#6b7280;margin:0 0 8px">
                Si el botón no funciona, copia este enlace:
              </p>

              <p style="word-break:break-all;font-size:12px">
                <a href="${link}" style="color:#1d4ed8;text-decoration:none">${link}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb;padding:16px;text-align:center;color:#6b7280;font-size:12px">
              © ${new Date().getFullYear()} SkyNet Visitas
            </td>
          </tr>
        </table>
      </div>
    `
  }

  private escape(s: string) {
    return s.replace(
      /[&<>"']/g,
      (m) =>
        (
          {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
          } as Record<string, string>
        )[m],
    )
  }
}
