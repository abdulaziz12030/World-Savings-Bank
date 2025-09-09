import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(){
  const { data: accounts } = await supabaseAdmin.from('accounts').select('*').order('id', { ascending:true })
  const { data: txs } = await supabaseAdmin.from('transactions').select('*').order('created_at', { ascending:false }).limit(50)
  const { data: goals } = await supabaseAdmin.from('goals').select('*')
  return NextResponse.json({ accounts, txs, goals })
}
