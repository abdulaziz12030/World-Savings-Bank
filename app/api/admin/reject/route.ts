import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request){
  const { id } = await req.json()
  const { data: tx } = await supabaseAdmin.from('transactions').select('*').eq('id', id).single()
  if (!tx) return NextResponse.json({ok:false,error:'not-found'},{status:404})
  await supabaseAdmin.from('transactions').update({ status:'rejected' }).eq('id', id)
  if (tx.pair_id){
    const { data: pair } = await supabaseAdmin.from('transactions').select('*').eq('id', tx.pair_id).single()
    if (pair && pair.status==='pending'){
      await supabaseAdmin.from('transactions').update({ status:'rejected' }).eq('id', pair.id)
    }
  }
  return NextResponse.json({ ok:true })
}
