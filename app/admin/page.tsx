'use client'
import { useEffect, useState } from 'react'

export default function AdminPage(){
  const [pinOk, setPinOk] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [txs, setTxs] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])

  async function askPin(){
    const pin = prompt('PIN الآدمن (9000 افتراضيًا)')
    const r = await fetch('/api/auth/check', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ role:'admin', pin }) })
    const j = await r.json()
    if (!j.ok){ alert('PIN غير صحيح'); return }
    setPinOk(true)
  }

  async function load(){
    const r = await fetch('/api/state', { cache:'no-store' })
    const j = await r.json()
    setAccounts(j.accounts||[])
    setTxs(j.txs||[])
    setGoals(j.goals||[])
  }
  useEffect(()=>{ load() }, [])

  if (!pinOk) return <div className="card" style={{padding:16}}>
    <div style={{marginBottom:8}}>هذه الصفحة للآدمن فقط.</div>
    <button className="btn" onClick={askPin}>إدخال PIN</button>
  </div>

  async function approve(id:string){ await fetch('/api/admin/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); await load(); }
  async function reject(id:string){ await fetch('/api/admin/reject',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); await load(); }
  async function execute(){
    const kind = prompt('نوع العملية: deposit | expense | transfer') as any
    const from = prompt('من حساب: omar | shahad') as any
    const to = kind==='transfer'? (prompt('إلى: abdulaziz | omar | shahad') as any) : undefined
    const amount = Number(prompt('المبلغ'))||0
    const note = prompt('ملاحظة (اختياري)')||undefined
    const r = await fetch('/api/admin/execute',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,from,to,amount,note})})
    if (!r.ok){ const j = await r.json(); alert(j.error || 'خطأ'); }
    await load()
  }

  const pending = txs.filter(t=>t.status==='pending')
  const approved = txs.filter(t=>t.status==='approved')
  const rejected = txs.filter(t=>t.status==='rejected')

  return (
    <div>
      <section className="card" style={{padding:16}}>
        <div className="row" style={{justifyContent:'space-between', flexWrap:'wrap', gap:12}}>
          <div>
            <div className="muted">لوحة الآدمن</div>
            <div style={{fontWeight:800,fontSize:18}}>نظرة عامة</div>
            <div className="tiny muted">بانتظار: {pending.length} — موافق: {approved.length} — مرفوض: {rejected.length}</div>
          </div>
          <div className="row" style={{gap:8}}>
            <button className="btn" onClick={execute}>تنفيذ عملية مباشرة</button>
            <a className="btn ghost" href="/">الرئيسية</a>
          </div>
        </div>
      </section>

      <section className="card" style={{padding:16, marginTop:12}}>
        <div className="tabs">
          <div className="tab">بانتظار</div>
          <div className="tab">موافق</div>
          <div className="tab">مرفوض</div>
        </div>
        <div className="list">
          {txs.map((t:any)=>(
            <div key={t.id} className="item">
              <div>
                <div style={{fontWeight:700}}>{t.account_id} — {t.type} <span className="badge">{t.status}</span></div>
                <div className="tiny muted">{new Date(t.created_at).toLocaleString('ar-SA')}</div>
              </div>
              <div className="row" style={{gap:8}}>
                <div className={`money ${(t.type==='expense'||t.type==='transfer-out')?'danger':'success'}`} style={{fontWeight:800}}>
                  {(t.type==='expense'||t.type==='transfer-out')?'-':'+'}{(t.amount||0).toLocaleString('ar-SA')} ر.س
                </div>
                {t.status==='pending' ? (<>
                  <button className="btn" onClick={()=>approve(t.id)}>موافقة</button>
                  <button className="btn ghost" onClick={()=>reject(t.id)}>رفض</button>
                </>) : <span className="badge">{t.status}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{padding:16, marginTop:12}}>
        <h3 className="section-title">أهداف الادخار</h3>
        <div className="list">
          {['omar','shahad'].map((id)=>{
            const g = goals.find((x:any)=>x.account_id===id)
            if (!g) return <div key={id} className="item">لا يوجد هدف لـ {id}</div>
            return (
              <div key={id} className="item">
                <div>
                  <div style={{fontWeight:700}}>{id}</div>
                  <div className="tiny muted">{g.title} — {(g.amount||0).toLocaleString('ar-SA')} ر.س</div>
                </div>
                <div className="row" style={{gap:8}}>
                  <button className="btn" onClick={async()=>{await fetch('/api/goals',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({accountId:id, approve:true})}); await load();}}>موافقة</button>
                  <button className="btn ghost" onClick={async()=>{await fetch('/api/goals',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({accountId:id, approve:false})}); await load();}}>رفض</button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
