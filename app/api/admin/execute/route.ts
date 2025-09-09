import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request){
  const { kind, from, to, amount, note } = await req.json()
  if (!amount || amount<=0) return NextResponse.json({ok:false,error:'invalid-amount'},{status:400})

  const { data: accFrom } = await supabaseAdmin.from('accounts').select('*').eq('id', from).single()

  if (kind==='deposit'){
    await supabaseAdmin.from('accounts').update({ balance: (accFrom?.balance||0) + amount }).eq('id', from)
    await supabaseAdmin.from('transactions').insert({ account_id: from, type:'deposit', amount, note:note||null, status:'approved' })
    return NextResponse.json({ ok:true })
  }

  if (kind==='expense'){
    if ((accFrom?.balance||0) < amount) return NextResponse.json({ok:false,error:'insufficient'},{status:400})
    await supabaseAdmin.from('accounts').update({ balance: (accFrom?.balance||0) - amount }).eq('id', from)
    await supabaseAdmin.from('transactions').insert({ account_id: from, type:'expense', amount, note:note||null, status:'approved' })
    return NextResponse.json({ ok:true })
  }

  if (kind==='transfer'){
    if (!to || to===from) return NextResponse.json({ok:false,error:'invalid-to'},{status:400})
    if ((accFrom?.balance||0) < amount) return NextResponse.json({ok:false,error:'insufficient'},{status:400})

    // out
    const { data: out } = await supabaseAdmin.from('transactions').insert({ account_id: from, type:'transfer-out', amount, note:note||null, status:'approved', counterparty: to }).select().single()
    await supabaseAdmin.from('accounts').update({ balance: (accFrom?.balance||0) - amount }).eq('id', from)

    if (to==='omar' || to==='shahad'){
      const { data: accTo } = await supabaseAdmin.from('accounts').select('*').eq('id', to).single()
      const { data: inn } = await supabaseAdmin.from('transactions').insert({ account_id: to, type:'transfer-in', amount, status:'approved', counterparty: from, pair_id: out?.id }).select().single()
      await supabaseAdmin.from('transactions').update({ pair_id: inn?.id }, { returning:'minimal' }).eq('id', out?.id)
      await supabaseAdmin.from('accounts').update({ balance: (accTo?.balance||0) + amount }).eq('id', to)
    }
    return NextResponse.json({ ok:true })
  }

  return NextResponse.json({ok:false,error:'invalid-kind'},{status:400})
}
