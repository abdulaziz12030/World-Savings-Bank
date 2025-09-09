'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const IMG = {
  omar:  'https://i.postimg.cc/LsmbdN0Z/image.jpg',
  shahad:'https://i.postimg.cc/d1xHyvQ8/image.jpg',
}

export default function AccountPage({ params }:{ params:{ id:'omar'|'shahad' } }){
  const id = params.id
  const [pinOk, setPinOk] = useState(false)
  const [acc, setAcc] = useState<any>(null)
  const [txs, setTxs] = useState<any[]>([])
  const [goal, setGoal] = useState<any>(null)

  async function askPin(){
    const pin = prompt('أدخل الرقم السري (4 خانات)')
    const r = await fetch('/api/auth/check', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ role: id, pin }) })
    const j = await r.json()
    if (!j.ok){ alert('PIN غير صحيح'); return }
    setPinOk(true)
  }

  async function load(){
    const r = await fetch('/api/state', { cache:'no-store' })
    const j = await r.json()
    const a = (j.accounts||[]).find((x:any)=>x.id===id)
    const g = (j.goals||[]).find((x:any)=>x.account_id===id) || null
    setAcc(a); setTxs(j.txs?.filter((t:any)=>t.account_id===id) || []); setGoal(g)
  }

  useEffect(()=>{ load() }, [])

  async function post(url:string, body:any){
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    const j = await r.json()
    if (!r.ok || !j.ok){ alert(j.error||'خطأ'); return false }
    await load(); return true
  }

  async function onDeposit(){
    const amount = Number(prompt('المبلغ بالريال'))
    const note = prompt('ملاحظة (اختياري)')||undefined
    if (!amount || amount<=0) return alert('أدخل مبلغ صحيح')
    await post('/api/transactions', { accountId:id, type:'deposit', amount, note })
    alert('تم إرسال طلب الإيداع للآدمن.')
  }
  async function onExpense(){
    const amount = Number(prompt('المبلغ بالريال'))
    const note = prompt('ملاحظة (اختياري)')||undefined
    if (!amount || amount<=0) return alert('أدخل مبلغ صحيح')
    await post('/api/transactions', { accountId:id, type:'expense', amount, note })
    alert('تم إرسال طلب الصرف للآدمن.')
  }
  async function onTransfer(){
    const amount = Number(prompt('المبلغ بالريال'))
    const to = prompt('جهة التحويل: abdulaziz | omar | shahad') as any
    if (!amount || amount<=0) return alert('أدخل مبلغ صحيح')
    await post('/api/transactions', { accountId:id, type:'transfer', amount, to })
    alert('تم إرسال طلب التحويل للآدمن.')
  }
  async function onSendGoal(){
    const title = prompt('عنوان الهدف (مثال: دراجة)')||''
    const amount = Number(prompt('مبلغ الهدف بالريال')||'0')
    if (!amount || amount<=0) return alert('أدخل مبلغ صحيح')
    await post('/api/goals', { accountId:id, title, amount })
    alert('تم إرسال الهدف للآدمن للموافقة.')
  }

  if (!acc) return <div className="card" style={{padding:16}}>جارِ التحميل…</div>
  if (!pinOk) return <div className="card" style={{padding:16}}>
    <div style={{marginBottom:8}}>يستلزم إدخال PIN لعرض حساب {acc.name}.</div>
    <button className="btn" onClick={askPin}>إدخال PIN</button>
  </div>

  const img = id==='omar'? IMG.omar : IMG.shahad

  return (
    <div>
      <section className="card" style={{padding:16}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <div className="row" style={{gap:12}}>
            <img src={img} alt={acc.name} className="avatar-lg"/>
            <div>
              <div className="muted">رصيد {acc.name}</div>
              <div className="money" style={{fontWeight:800,fontSize:26}}>{(acc.balance||0).toLocaleString('ar-SA')} ر.س</div>
            </div>
          </div>
          <a className="btn ghost" href="/">الرئيسية</a>
        </div>
      </section>

      <section className="grid grid-2" style={{marginTop:12}}>
        <div className="card" style={{padding:16}}>
          <div className="tabs">
            <div className="tab" onClick={onDeposit}>طلب إيداع</div>
            <div className="tab" onClick={onExpense}>طلب صرف</div>
            <div className="tab" onClick={onTransfer}>طلب تحويل</div>
          </div>
          <div className="tiny muted">سيتم إرسال الطلب للآدمن للموافقة.</div>
          <hr style={{margin:'12px 0', border:'none', borderTop:'1px solid var(--border)'}}/>
          <div className="tiny muted">هدف الادخار</div>
          <div className="row" style={{gap:8, marginTop:6}}>
            <button className="btn" onClick={onSendGoal}>إرسال/تحديث الهدف</button>
            <span className="badge">{goal?.approved? 'مُعتمد' : (goal?.amount ? 'بانتظار موافقة' : 'لا يوجد هدف')}</span>
          </div>
        </div>

        <div className="card" style={{padding:16}}>
          <div className="row" style={{justifyContent:'space-between', marginBottom:8}}>
            <h3 className="section-title">سجل العمليات</h3>
            <span className="badge">الحساب: {acc.name}</span>
          </div>
          <div className="list">
            {txs.length? txs.map((t:any)=>(
              <div key={t.id} className="item">
                <div>
                  <div style={{fontWeight:700}}>
                    {t.type==='deposit'?'إيداع': t.type==='expense'?'مصروف': t.type==='transfer-in'?`تحويل - إضافة (${t.counterparty})`: t.type==='transfer-out'?`تحويل - خصم (${t.counterparty})`: t.type}
                    {' '}
                    <span className="badge">{t.status==='pending'?'بانتظار': t.status==='approved'?'موافق عليه':'مرفوض'}</span>
                  </div>
                  <div className="muted tiny">{new Date(t.created_at).toLocaleString('ar-SA')}</div>
                  {t.note? <div className="tiny" style={{marginTop:3}}>ملاحظة: {t.note}</div> : null}
                </div>
                <div className={`money ${(t.type==='expense'||t.type==='transfer-out')?'danger':'success'}`} style={{fontWeight:800}}>
                  {(t.type==='expense'||t.type==='transfer-out')?'-':'+'}{t.amount.toLocaleString('ar-SA')} ر.س
                </div>
              </div>
            )): <div className="card empty" style={{padding:14}}>لا توجد عمليات</div>}
          </div>
        </div>
      </section>
    </div>
  )
}
