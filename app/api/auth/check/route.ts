import { NextResponse } from 'next/server'

export async function POST(req: Request){
  const { role, pin } = await req.json()
  const expected = role==='admin' ? process.env.PIN_ADMIN
    : role==='omar' ? process.env.PIN_OMAR
    : role==='shahad' ? process.env.PIN_SHAHAD
    : ''

  if (!expected) return NextResponse.json({ ok:false, error:'PINs not configured' }, { status:400 })
  const ok = String(pin) === String(expected)
  return NextResponse.json({ ok })
}
