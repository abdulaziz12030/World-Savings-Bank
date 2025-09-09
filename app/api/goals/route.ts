import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request){
  const { accountId, title, amount } = await req.json()
  if (!amount || amount<=0) return NextResponse.json({ok:false,error:'invalid-amount'},{status:400})
  await supabaseAdmin.from('goals').upsert({ account_id: accountId, title: title||'', amount, approved: false })
  return NextResponse.json({ ok:true })
}

export async function PATCH(req: Request){
  const { accountId, approve } = await req.json()
  await supabaseAdmin.from('goals').update({ approved: !!approve }).eq('account_id', accountId)
  return NextResponse.json({ ok:true })
}
