import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request){
  const { id } = await req.json()
  // fetch tx
  const { data: tx, error: e1 } = await supabaseAdmin.from('transactions').select('*').eq('id', id).single()
  if (e1 || !tx) return NextResponse.json({ok:false,error:'not-found'},{status:404})

  // fetch account balance
  const { data: acc } = await supabaseAdmin.from('accounts').select('*').eq('id', tx.account_id).single()

  // apply balance change
  if (tx.type==='expense' || tx.type==='transfer-out'){
    if ((acc?.balance||0) < tx.amount) return NextResponse.json({ok:false,error:'insufficient'},{status:400})
    await supabaseAdmin.from('accounts').update({ balance: (acc?.balance||0) - tx.amount }).eq('id', tx.account_id)
  } else if (tx.type==='deposit' || tx.type==='transfer-in'){
    await supabaseAdmin.from('accounts').update({ balance: (acc?.balance||0) + tx.amount }).eq('id', tx.account_id)
  }

  await supabaseAdmin.from('transactions').update({ status:'approved' }).eq('id', id)

  // if pair exists, approve it and apply its effect too
  if (tx.pair_id){
    const { data: pair } = await supabaseAdmin.from('transactions').select('*').eq('id', tx.pair_id).single()
    if (pair && pair.status==='pending'){
      const { data: acc2 } = await supabaseAdmin.from('accounts').select('*').eq('id', pair.account_id).single()
      if (pair.type==='transfer-in'){
        await supabaseAdmin.from('accounts').update({ balance: (acc2?.balance||0) + pair.amount }).eq('id', pair.account_id)
      } else if (pair.type==='transfer-out'){
        if ((acc2?.balance||0) >= pair.amount){
          await supabaseAdmin.from('accounts').update({ balance: (acc2?.balance||0) - pair.amount }).eq('id', pair.account_id)
        }
      }
      await supabaseAdmin.from('transactions').update({ status:'approved' }).eq('id', pair.id)
    }
  }

  return NextResponse.json({ ok:true })
}
