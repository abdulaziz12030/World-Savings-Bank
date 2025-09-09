import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type Body = {
  accountId: 'omar'|'shahad',
  type: 'deposit'|'expense'|'transfer',
  amount: number,
  note?: string,
  to?: 'abdulaziz'|'omar'|'shahad'
}

export async function POST(req: Request){
  const b = await req.json() as Body
  if (!b.amount || b.amount<=0) return NextResponse.json({ok:false,error:'invalid-amount'},{status:400})

  if (b.type==='transfer'){
    if (!b.to || b.to===b.accountId) return NextResponse.json({ok:false,error:'invalid-to'},{status:400})
    // create two pending txs where applicable
    const outTx = { account_id: b.accountId, type:'transfer-out', amount:b.amount, note:b.note||null, status:'pending', counterparty:b.to }
    const { data: out, error: e1 } = await supabaseAdmin.from('transactions').insert(outTx).select().single()
    if (e1) return NextResponse.json({ok:false,error:e1.message},{status:500})

    if (b.to==='omar' || b.to==='shahad'){
      const inTx = { account_id: b.to, type:'transfer-in', amount:b.amount, note:b.note||null, status:'pending', counterparty:b.accountId, pair_id: out.id }
      const { data: inn, error: e2 } = await supabaseAdmin.from('transactions').insert(inTx).select().single()
      if (e2) return NextResponse.json({ok:false,error:e2.message},{status:500})
      // link back pair
      await supabaseAdmin.from('transactions').update({ pair_id: inn.id }).eq('id', out.id)
    }
    return NextResponse.json({ ok:true })
  }

  // deposit or expense (pending)
  const { error } = await supabaseAdmin.from('transactions').insert({
    account_id: b.accountId, type: b.type, amount: b.amount, note: b.note||null, status:'pending'
  })
  if (error) return NextResponse.json({ok:false,error:error.message},{status:500})
  return NextResponse.json({ ok:true })
}
