// app.js
const { auth, db, ADMIN_EMAIL, IMG, PINS } = window.App;

let ACCOUNTS = { omar:{name:'عمر',balance:0,goal:{}}, shahad:{name:'شهد',balance:0,goal:{}} };
let TX = [];
let REQ_TX = {};
let user = null;

const root = document.getElementById('view-root');
const year = document.getElementById('year');
year.textContent = new Date().getFullYear();

document.getElementById('nav-home').onclick = ()=>location.hash='#home';
document.getElementById('nav-admin').onclick = ()=>location.hash='#admin';
document.getElementById('nav-signout').onclick = ()=>auth.signOut();
window.addEventListener('hashchange', route);

const fmt = n=>Number(n||0).toLocaleString('ar-SA');
const fmtDate = ms=> new Date(ms).toLocaleString('ar-SA');

auth.onAuthStateChanged(async u=>{
  user = u;
  document.getElementById('nav-signout').style.display = u? 'inline-flex':'none';
  document.getElementById('sync-badge').textContent = u? 'متصل':'غير متصل';
  if(!u){ await auth.signInAnonymously(); return; }

  db.ref('accounts').on('value', s=>{ ACCOUNTS = s.val() || ACCOUNTS; route(); });
  db.ref('transactions').on('value', s=>{
    const arr=[]; s.forEach(c=>arr.push({id:c.key,...c.val()}));
    TX = arr.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    route();
  });
  db.ref('requests/transactions').on('value', s=>{ REQ_TX = s.val() || {}; route(); });
});

function route(){
  const h = location.hash.replace('#','') || 'home';
  if(h.startsWith('account=')){
    const id = h.split('=')[1];
    openWithPin(id, ()=> renderAccount(id));
  }else if(h==='admin'){
    openWithPin('admin', ()=> renderAdmin());
  }else{
    renderHome();
  }
}

/* PIN Modal */
const ovl = document.getElementById('pin-overlay');
const pinIn = document.getElementById('pin-input');
const pinErr = document.getElementById('pin-err');
const pinDesc = document.getElementById('pin-desc');
document.getElementById('pin-cancel').onclick = ()=>{ovl.style.display='none';};
document.getElementById('pin-ok').onclick = confirmPin;

let pinTarget='', onPinOk=()=>{};
const pinFail={omar:0,shahad:0,admin:0}, lockUntil={omar:0,shahad:0,admin:0};

function openWithPin(target, ok){
  pinTarget = target; onPinOk = ok;
  const now=Date.now();
  if(lockUntil[target] && now<lockUntil[target]){ alert('محاولات كثيرة خاطئة. حاول لاحقًا.'); return; }
  pinDesc.textContent = target==='admin'? 'لوحة عبدالعزيز' : `حساب ${target==='omar'?'عمر':'شهد'}`;
  pinIn.value=''; pinErr.style.display='none'; ovl.style.display='grid'; setTimeout(()=>pinIn.focus(),40);
}
function confirmPin(){
  const v = pinIn.value.trim();
  if(v === PINS[pinTarget]){ pinFail[pinTarget]=0; ovl.style.display='none'; onPinOk(); }
  else{
    pinFail[pinTarget]=(pinFail[pinTarget]||0)+1;
    if(pinFail[pinTarget]>=3){ lockUntil[pinTarget]=Date.now()+60000; pinErr.textContent='تم الإغلاق 60 ثانية.'; }
    else pinErr.textContent='خطأ في الرقم السري.';
    pinErr.style.display='block';
  }
}

function goalPct(a){ const g=a.goal||{}; if(!g.amount||!g.approved) return 0; return Math.min(100,Math.max(0,Math.round((a.balance/g.amount)*100))); }
function renderHome(){
  const pendingCount = Object.values(REQ_TX).filter(r=>r && r.status==='pending').length;
  root.innerHTML = `
    <section class="card hero">
      <div style="font-weight:700">مرحبًا!</div>
      <div class="tiny" style="color:#e5e7eb">اختر الحساب لإرسال الطلبات أو ادخل لوحة الآدمن للموافقة.</div>
      ${pendingCount? `<div class="badge" style="margin-top:6px;background:#fff;color:#111827">طلبات قيد الموافقة: ${pendingCount}</div>`:''}
    </section>

    <section class="grid grid-2" style="margin-top:12px">
      ${['omar','shahad'].map(id=>{
        const a=ACCOUNTS[id]||{name:id,balance:0,goal:{}}, img=id==='omar'?IMG.omar:IMG.shahad;
        const g=a.goal||{}, p=goalPct(a);
        return `
          <div class="card" style="padding:16px">
            <div class="row" style="gap:12px">
              <img class="avatar" src="${img}" alt="${a.name}"/>
              <div style="flex:1">
                <div class="muted tiny">رصيد الحساب</div>
                <div class="money" style="font-weight:800;font-size:22px">${fmt(a.balance)} ر.س</div>
                <div class="tiny" style="margin-top:4px;color:#1e3a8a">حساب ${a.name} الإدخاري</div>
                ${g.amount?`
                  <div class="tiny muted" style="margin-top:6px">الهدف: ${g.title?g.title+' - ':''}${fmt(g.amount)} ر.س ${g.approved?'<span class="badge">مُعتمد</span>':'<span class="badge" style="background:#fee2e2;color:#991b1b">بانتظار موافقة</span>'}</div>
                  ${g.approved?`<div class="progress" style="margin-top:6px"><div style="width:${p}%"></div></div><div class="tiny muted">${p}%</div>`:''}
                `:''}
              </div>
              <button class="btn" onclick="location.hash='account=${id}'">فتح</button>
            </div>
          </div>`;
      }).join('')}
    </section>

    <section style="margin-top:12px">
      <h3 style="margin:0 0 8px 0">أحدث العمليات</h3>
      ${renderTxList(null, 6)}
    </section>
  `;
}

async function sendTxRequest(payload){
  if(!payload.amount || payload.amount<=0) return alert('أدخل مبلغ صحيح');
  await db.ref('requests/transactions').push({
    ...payload, createdAt: Date.now(), createdBy: auth.currentUser?.uid||null, status:'pending'
  });
  alert('تم إرسال الطلب للآدمن.');
}

function renderAccount(id){
  const a=ACCOUNTS[id]||{name:id,balance:0,goal:{}}, img=id==='omar'?IMG.omar:IMG.shahad;
  const g=a.goal||{}, p=goalPct(a);
  root.innerHTML=`
    <section class="card" style="padding:16px">
      <div class="row" style="justify-content:space-between">
        <div class="row" style="gap:12px">
          <img class="avatar-lg" src="${img}" alt="${a.name}"/>
          <div>
            <div class="muted tiny">رصيد ${a.name}</div>
            <div class="money" style="font-weight:800;font-size:26px">${fmt(a.balance)} ر.س</div>
          </div>
        </div>
        <button class="btn ghost" onclick="location.hash='#home'">الرئيسية</button>
      </div>
    </section>

    <section class="grid grid-2" style="margin-top:12px">
      <div class="card" style="padding:16px">
        <div class="tabs">
          <div class="tab active" id="t-dep">إيداع</div>
          <div class="tab" id="t-exp">مصروف</div>
          <div class="tab" id="t-trf">تحويل</div>
        </div>
        <div id="f-dep">
          <input class="input" id="dep-amount" type="number" placeholder="المبلغ بالريال"/>
          <input class="input" id="dep-note"   type="text"   placeholder="ملاحظة (اختياري)" style="margin-top:8px"/>
          <button class="btn" style="margin-top:10px" onclick="sendTxRequest({accountId:'${id}',type:'deposit',amount:Number(document.getElementById('dep-amount').value||0),note:document.getElementById('dep-note').value})">إرسال طلب</button>
        </div>
        <div id="f-exp" style="display:none">
          <input class="input" id="exp-amount" type="number" placeholder="المبلغ بالريال"/>
          <input class="input" id="exp-note"   type="text"   placeholder="ملاحظة (اختياري)" style="margin-top:8px"/>
          <button class="btn" style="margin-top:10px" onclick="sendTxRequest({accountId:'${id}',type:'expense',amount:Number(document.getElementById('exp-amount').value||0),note:document.getElementById('exp-note').value})">إرسال طلب</button>
        </div>
        <div id="f-trf" style="display:none">
          <input class="input" id="trf-amount" type="number" placeholder="المبلغ بالريال"/>
          <select class="input" id="trf-to" style="margin-top:8px">
            <option value="abdulaziz">حساب عبدالعزيز</option>
            <option value="omar">حساب عمر</option>
            <option value="shahad">حساب شهد</option>
          </select>
          <button class="btn" style="margin-top:10px" onclick="sendTxRequest({accountId:'${id}',type:'transfer',to:document.getElementById('trf-to').value,amount:Number(document.getElementById('trf-amount').value||0)})">إرسال طلب</button>
        </div>

        <hr style="margin:14px 0;border:none;border-top:1px solid var(--border)"/>
        <div>
          <div class="tiny muted" style="margin-bottom:6px">هدف الادخار</div>
          <input class="input" id="goal-title" type="text" placeholder="عنوان الهدف" value="${g.title||''}"/>
          <input class="input" id="goal-amount" type="number" placeholder="مبلغ الهدف" value="${g.amount||''}" style="margin-top:8px"/>
          <button class="btn" style="margin-top:10px" onclick="sendGoal('${id}')">إرسال الهدف للموافقة</button>
          ${g.approved? `<div class="progress" style="margin-top:8px"><div style="width:${p}%"></div></div><div class="tiny muted">${p}%</div>` : (g.amount? '<div class="tiny muted" style="margin-top:6px">بانتظار موافقة</div>':'')}
        </div>
      </div>

      <div class="card" style="padding:16px">
        <div class="row" style="justify-content:space-between;margin-bottom:8px">
          <h3 style="margin:0">سجل العمليات</h3>
          <span class="badge">الحساب: ${a.name}</span>
        </div>
        ${renderTxList(id)}
      </div>
    </section>
  `;
  const tdep=document.getElementById('t-dep'), texp=document.getElementById('t-exp'), ttrf=document.getElementById('t-trf');
  const fdep=document.getElementById('f-dep'), fexp=document.getElementById('f-exp'), ftrf=document.getElementById('f-trf');
  tdep.onclick=()=>{tdep.classList.add('active');texp.classList.remove('active');ttrf.classList.remove('active');fdep.style.display='block';fexp.style.display='none';ftrf.style.display='none';};
  texp.onclick=()=>{texp.classList.add('active');tdep.classList.remove('active');ttrf.classList.remove('active');fexp.style.display='block';fdep.style.display='none';ftrf.style.display='none';};
  ttrf.onclick=()=>{ttrf.classList.add('active');tdep.classList.remove('active');texp.classList.remove('active');ftrf.style.display='block';fdep.style.display='none';};
}

async function sendGoal(id){
  const title=document.getElementById('goal-title').value.trim();
  const amount=Number(document.getElementById('goal-amount').value||0);
  if(!amount||amount<=0) return alert('أدخل مبلغ صحيح');
  await db.ref('requests/goals/'+id).push({title,amount,createdAt:Date.now(),createdBy:user?.uid||null,status:'pending'});
  alert('تم إرسال الهدف للآدمن.');
}

function txLabel(t){
  if(t.type==='deposit') return {label:'إيداع',sign:'+',cls:'success'};
  if(t.type==='expense') return {label:'مصروف',sign:'-',cls:'danger'};
  if(t.type==='transfer' && t.direction==='out') return {label:`تحويل - خصم (${nameOf(t.to)})`,sign:'-',cls:'danger'};
  if(t.type==='transfer' && t.direction==='in')  return {label:`تحويل - إضافة (${nameOf(t.from)})`,sign:'+',cls:'success'};
  return {label:t.type,sign:'',cls:''};
}
function nameOf(x){ return x==='omar'?'عمر':x==='shahad'?'شهد':x==='abdulaziz'?'عبدالعزيز':x; }
function escapeHtml(s){return s?.replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function renderTxList(accountId, limit){
  let list = TX.slice();
  if(accountId) list = list.filter(t=> t.accountId===accountId);
  if(limit) list = list.slice(0,limit);
  if(list.length===0) return `<div class="card" style="padding:14px">لا توجد عمليات</div>`;
  return `<div class="list">${
    list.map(t=>{
      const {label,sign,cls} = txLabel(t);
      return `<div class="item">
        <div>
          <div style="font-weight:700">${label}</div>
          <div class="tiny muted">${fmtDate(t.createdAt)}</div>
          ${t.note? `<div class="tiny" style="margin-top:3px">ملاحظة: ${escapeHtml(t.note)}</div>`:''}
        </div>
        <div class="money ${cls}" style="font-weight:800">${sign}${fmt(t.amount)} ر.س</div>
      </div>`;
    }).join('')
  }</div>`;
}

/* لوحة الآدمن */
async function adminSignIn(email, password){
  const cred = await auth.signInWithEmailAndPassword(email, password);
  if(cred.user.email !== ADMIN_EMAIL){ alert('هذا الحساب ليس آدمن'); await auth.signOut(); }
}
async function approveReq(id){
  if(!user || user.email!==ADMIN_EMAIL) return alert('صلاحيات غير كافية');
  const snap = await db.ref('requests/transactions/'+id).get(); if(!snap.exists()) return;
  const r = snap.val();
  const fromRef = db.ref('accounts/'+r.accountId+'/balance');

  if(r.type==='deposit'){
    await fromRef.transaction(x=>(x||0)+r.amount);
    await db.ref('transactions/'+id).set({...r, status:'approved'});
  }else if(r.type==='expense'){
    const ok = await fromRef.transaction(x=>{ x=x||0; if(x<r.amount) return; return x-r.amount; });
    if(!ok.committed) return alert('الرصيد لا يكفي');
    await db.ref('transactions/'+id).set({...r, status:'approved'});
  }else if(r.type==='transfer'){
    const ok = await fromRef.transaction(x=>{ x=x||0; if(x<r.amount) return; return x-r.amount; });
    if(!ok.committed) return alert('الرصيد لا يكفي');
    if(r.to==='omar' || r.to==='shahad'){
      await db.ref('accounts/'+r.to+'/balance').transaction(x=>(x||0)+r.amount);
      await db.ref('transactions/'+id+'_out').set({...r, direction:'out', status:'approved'});
      await db.ref('transactions/'+id+'_in').set({ ...r, accountId:r.to, from:r.accountId, direction:'in', status:'approved' });
    }else{
      await db.ref('transactions/'+id).set({...r, direction:'out', status:'approved'});
    }
  }
  await db.ref('requests/transactions/'+id+'/status').set('approved');
}
async function rejectReq(id){
  if(!user || user.email!==ADMIN_EMAIL) return alert('صلاحيات غير كافية');
  await db.ref('requests/transactions/'+id+'/status').set('rejected');
  const r = (await db.ref('requests/transactions/'+id).get()).val();
  await db.ref('transactions/'+id).set({...r, status:'rejected'});
}
async function approveGoal(id, reqKey){
  if(!user || user.email!==ADMIN_EMAIL) return alert('صلاحيات غير كافية');
  const r = (await db.ref('requests/goals/'+id+'/'+reqKey).get()).val(); if(!r) return;
  await db.ref('accounts/'+id+'/goal').set({title:r.title,amount:r.amount,approved:true});
  await db.ref('requests/goals/'+id+'/'+reqKey+'/status').set('approved');
}
async function rejectGoal(id, reqKey){
  if(!user || user.email!==ADMIN_EMAIL) return alert('صلاحيات غير كافية');
  await db.ref('requests/goals/'+id+'/'+reqKey+'/status').set('rejected');
}

function renderAdmin(){
  const isAdmin = user && user.email===ADMIN_EMAIL;
  const pending = Object.entries(REQ_TX).filter(([k,v])=>v && v.status==='pending');
  root.innerHTML = `
    <section class="card" style="padding:16px">
      <div class="row" style="justify-content:space-between">
        <div class="row" style="gap:12px">
          <img class="avatar-lg" src="${IMG.admin}" alt="عبدالعزيز"/>
          <div>
            <div class="muted tiny">لوحة الآدمن</div>
            <div style="font-weight:800">نظرة عامة</div>
            <div class="tiny muted">طلبات قيد الموافقة: ${pending.length}</div>
          </div>
        </div>
        <button class="btn ghost" onclick="location.hash='#home'">الرئيسية</button>
      </div>
      ${!isAdmin ? `
        <div class="card" style="padding:16px;margin-top:12px">
          <div class="tiny muted" style="margin-bottom:6px">تسجيل دخول الآدمن</div>
          <input class="input" id="ad-email" type="email" placeholder="بريد الآدمن" value="${ADMIN_EMAIL}"/>
          <input class="input" id="ad-pass"  type="password" placeholder="كلمة المرور" style="margin-top:8px"/>
          <button class="btn" style="margin-top:10px" onclick="adminSignIn(document.getElementById('ad-email').value, document.getElementById('ad-pass').value)">دخول</button>
          <div class="tiny muted" style="margin-top:6px">بعد الدخول الصحيح، يمكن الموافقة/الرفض وتعديل الأرصدة.</div>
        </div>` : `
        <section class="grid grid-3" style="margin-top:12px">
          ${['omar','shahad'].map(id=>{
            const a=ACCOUNTS[id], img=id==='omar'?IMG.omar:IMG.shahad, p=goalPct(a);
            return `<div class="card" style="padding:16px">
              <div class="row" style="gap:12px">
                <img class="avatar" src="${img}" alt="${a.name}"/>
                <div>
                  <div class="muted tiny">رصيد ${a.name}</div>
                  <div class="money" style="font-weight:800;font-size:22px">${fmt(a.balance)} ر.س</div>
                  ${a.goal?.amount? `<div class="tiny muted" style="margin-top:6px">
                    الهدف: ${a.goal.title? a.goal.title+' - ':''}${fmt(a.goal.amount)} ر.س ${a.goal.approved? '<span class="badge">مُعتمد</span>':'<span class="badge" style="background:#fee2e2;color:#991b1b">بانتظار موافقة</span>'}
                  </div>${a.goal.approved? `<div class="progress" style="margin-top:6px"><div style="width:${p}%"></div></div>`:''}`:''}
                </div>
              </div>
              <div class="row" style="gap:8px;margin-top:10px">
                <button class="btn" onclick="location.hash='account=${id}'">فتح الحساب</button>
              </div>
            </div>`;}).join('')}
          <div class="card" style="padding:16px">
            <div class="muted tiny">أدوات</div>
            <div class="row" style="gap:8px;margin-top:8px">
              <button class="btn warn" onclick="if(confirm('تأكيد تصفير السجلات؟')) db.ref('transactions').remove()">تصفير السجلات</button>
              <button class="btn danger" onclick="if(confirm('تأكيد تصفير الأرصدة؟')) { db.ref('accounts/omar/balance').set(0); db.ref('accounts/shahad/balance').set(0);}">تصفير الأرصدة</button>
            </div>
          </div>
        </section>

        <section class="card" style="padding:16px;margin-top:12px">
          <h3 style="margin:0 0 8px 0">طلبات عمليات — بانتظار</h3>
          ${pending.length? `<div class="list">${
            pending.map(([id,r])=>`
              <div class="item">
                <div>
                  <div style="font-weight:700">${r.type==='deposit'?'إيداع':r.type==='expense'?'مصروف':'تحويل'} — ${r.accountId==='omar'?'عمر':'شهد'} ${r.to? '→ '+(r.to==='omar'?'عمر':r.to==='shahad'?'شهد':'عبدالعزيز'):''}</div>
                  <div class="tiny muted">${fmtDate(r.createdAt)}</div>
                  ${r.note? `<div class="tiny" style="margin-top:3px">ملاحظة: ${escapeHtml(r.note)}</div>`:''}
                </div>
                <div class="row" style="gap:8px">
                  <div class="money" style="font-weight:800">${fmt(r.amount)} ر.س</div>
                  <button class="btn" onclick="approveReq('${id}')">موافقة</button>
                  <button class="btn danger" onclick="rejectReq('${id}')">رفض</button>
                </div>
              </div>`).join('')
          }</div>` : `<div class="card" style="padding:12px">لا توجد طلبات حالية</div>`}
        </section>

        <section class="card" style="padding:16px;margin-top:12px">
          <h3 style="margin:0 0 8px 0">طلبات أهداف الادخار</h3>
          <div id="goal-reqs"></div>
        </section>
        `}
    </section>
  `;

  if(isAdmin){
    Promise.all(['omar','shahad'].map(id=> db.ref('requests/goals/'+id).get().then(s=>({id, val:s.val()||{}})))).then(all=>{
      const items=[];
      all.forEach(({id,val})=>{
        Object.entries(val).forEach(([k,g])=>{
          if(g.status==='approved') return;
          items.push({acc:id, key:k, ...g});
        });
      });
      document.getElementById('goal-reqs').innerHTML = items.length? `<div class="list">${
        items.map(g=>`
          <div class="item">
            <div>
              <div style="font-weight:700">${g.acc==='omar'?'عمر':'شهد'} — ${g.title||'هدف'}</div>
              <div class="tiny muted">${fmt(g.amount)} ر.س — ${fmtDate(g.createdAt||Date.now())}</div>
            </div>
            <div class="row" style="gap:6px">
              <button class="btn" onclick="approveGoal('${g.acc}','${g.key}')">موافقة</button>
              <button class="btn danger" onclick="rejectGoal('${g.acc}','${g.key}')">رفض</button>
            </div>
          </div>`).join('')
      }</div>` : `<div class="card" style="padding:12px">لا توجد طلبات</div>`;
    });
  }
}
