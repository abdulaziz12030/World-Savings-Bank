
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(()=> ({}));
  const provider = process.env.NOTIFY_PROVIDER;

  if (!provider) {
    return NextResponse.json({ ok: true, note: 'No provider configured' });
  }

  if (provider === 'resend') {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY ?? '');
    const from = process.env.NOTIFY_EMAIL_FROM ?? '';
    const to = process.env.NOTIFY_EMAIL_TO ?? '';

    const subject = `عملية جديدة - ${body.type} - ${body.account}`;
    const text = `نوع العملية: ${body.type}\nالحساب: ${body.account}\nالمبلغ: ${body.amount} ريال\n${body.to ? 'الجهة: ' + body.to : ''}\n${new Date().toLocaleString('ar-SA')}`;
    try {
      if (!from || !to) throw new Error('Missing email vars');
      await resend.emails.send({ from, to, subject, text });
      return NextResponse.json({ ok: true });
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: e?.message ?? 'resend error' }, { status: 500 });
    }
  }

  if (provider === 'twilio') {
    const sid = process.env.TWILIO_ACCOUNT_SID ?? '';
    const token = process.env.TWILIO_AUTH_TOKEN ?? '';
    const from = process.env.TWILIO_WHATSAPP_FROM ?? '';
    const to = process.env.TWILIO_WHATSAPP_TO ?? '';
    try {
      const twilio = (await import('twilio')).default;
      const client = twilio(sid, token);
      const bodyText = `عملية جديدة: ${body.type} | الحساب: ${body.account} | المبلغ: ${body.amount} ريال ${body.to ? '| الجهة: '+body.to : ''} | ${new Date().toLocaleString('ar-SA')}`;
      await client.messages.create({ from, to, body: bodyText });
      return NextResponse.json({ ok: true });
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: e?.message ?? 'twilio error' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: false, error: 'Unknown provider' }, { status: 400 });
}
