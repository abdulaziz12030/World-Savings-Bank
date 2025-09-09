'use client'
import { useEffect, useState } from 'react'

type Account = { id:'omar'|'shahad', name:string, balance:number, avatar_url?:string, goal?:{ title:string|null, amount:number|null, approved:boolean|null } }
type Tx = { id:string, account_id:'omar'|'shahad', type:string, amount:number, note:string|null, status:'pending'|'approved'|'rejected', counterparty?:string|null, created_at:string, pair_id?:string|null }
type Goal = { account_id:'omar'|'shahad', title:string|null, amount:number|null, approved:boolean|null }

const IMG = {
  omar:  'https://i.postimg.cc/LsmbdN0Z/image.jpg',
  shahad:'https://i.postimg.cc/d1xHyvQ8/image.jpg',
}

export default function Page(){
  const [accounts, setAccounts] = useState<Account[]>([])
  const [latest, setLatest] = useState<Tx[]>([])
  const [goals, setGoals] = useState<Goal[]>([])

  async function load(){
    const r = await fetch('/api/state', { cache:'no-store' })
    const j = await r.json()
    const accs: Account[] = (j.accounts||[]).map((a:any)=>({...a, goal: (j.goals||[]).find((g:any)=>g.account_id===a.id)}))
    setAccounts(accs)
    setGoals(j.goals||[])
    setLatest(j.txs||[])
  }
  useEffect(()=>{ load() }, [])

  function goalProgress(a: Account){
    const g = (a as any).goal
    const amt = g?.amount||0, bal = a.balance||0
    if (!g || !g.amount || !g.approved) return 0
    return Math.max(0, Math.min(100, Math.round((bal/amt)*100)))
  }

  return (
    <div>
      <section className="card" style={{padding:18, background:'linear-gradient(90deg,var(--wblue-800),var(--wblue-700))', color:'#fff'}}>
        <div style={{fontWeight:700,fontSize:18,marginBottom:4}}>أهلًا!</div>
        <div className="muted" style={{color:'#e5e7eb'}}>اختر الحساب لإرسال الطلبات، أو ادخل لوحة الآدمن للموافقة وإجراء العمليات الإدارية.</div>
      </section>

      <section className="grid grid-2" style={{marginTop:12}}>
        {['omar','shahad'].map((id)=>{
          const a = accounts.find(x=>x.id===id)!
          if (!a) return <div key={id} className="card" style={{padding:16}}>...</div>
          const g = (a as any).goal
          const progress = goalProgress(a)
          const img = id==='omar'? IMG.omar : IMG.shahad
          return (
            <div className="card" key={id} style={{padding:16}}>
              <div className="row" style={{gap:14}}>
                <img src={img} alt={a.name} className="avatar"/>
                <div style={{flex:1 as any}}>
                  <div className="muted">رصيد الحساب</div>
                  <div className="money" style={{fontWeight:800,fontSize:22}}>{(a.balance||0).toLocaleString('ar-SA')} ر.س</div>
                  <div style={{marginTop:4,color:'var(--wblue-800)',fontWeight:700}}>حساب {a.name} الإدخاري</div>
                  {g?.amount ? (
                    <>
                      <div className="tiny muted" style={{marginTop:6}}>الهدف: {g?.title? g.title+' - ':''}{(g?.amount||0).toLocaleString('ar-SA')} ر.س {g?.approved? <span className="badge">مُعتمد</span> : <span className="badge" style={{background:'#fee2e2',color:'#991b1b'}}>بانتظار موافقة</span>}</div>
                      {g?.approved ? (<>
                        <div className="progress" style={{marginTop:6}}><div style={{width:progress+'%'}}></div></div>
                        <div className="tiny muted" style={{marginTop:2}}>{progress}%</div>
                      </>): null}
                    </>
                  ): null}
                </div>
                <a className="btn" href={`/account/${id}`}>فتح</a>
              </div>
            </div>
          )
        })}
      </section>

      <section style={{marginTop:12}}>
        <h3 className="section-title">أحدث العمليات</h3>
        <div className="list">
          {latest.length? latest.slice(0,5).map(t=>{
            const sign = (t.type==='expense' || t.type==='transfer-out')? '-' : '+'
            const cls = (t.type==='expense' || t.type==='transfer-out')? 'danger':'success'
            return (
              <div key={t.id} className="item">
                <div>
                  <div style={{fontWeight:700}}>
                    {t.type==='deposit'?'إيداع': t.type==='expense'?'مصروف': t.type==='transfer-in'?`تحويل - إضافة (${t.counterparty})`: t.type==='transfer-out'?`تحويل - خصم (${t.counterparty})`: t.type}
                    {' '}
                    <span className="badge">{t.status==='pending'?'بانتظار': t.status==='approved'?'موافق عليه':'مرفوض'}</span>
                  </div>
                  <div className="muted tiny">{new Date(t.created_at).toLocaleString('ar-SA')}</div>
                </div>
                <div className={`money ${cls}`} style={{fontWeight:800}}>{sign}{t.amount.toLocaleString('ar-SA')} ر.س</div>
              </div>
            )
          }): <div className="card empty" style={{padding:14}}>لا توجد عمليات بعد</div>}
        </div>
      </section>
    </div>
  )
}
