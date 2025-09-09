
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore, AccountId } from '../../../lib/store';
import TransactionForm from '../../../components/TransactionForm';
import TransactionList from '../../../components/TransactionList';
import PinModal from '../../../components/PinModal';

export default function AccountPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) as AccountId;
  const init = useStore(s => s.init);
  const accounts = useStore(s => s.accounts);
  const [unlocked, setUnlocked] = useState(false);

  const account = useMemo(() => accounts[id], [accounts, id]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!account) return;
    // Stash the correct PIN for modal check (session only)
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('activePIN', account.pin);
    }
  }, [account]);

  if (!account) return (
    <div className="p-6">
      <div className="text-red-600">الحساب غير موجود</div>
      <button onClick={()=>router.push('/')} className="mt-4 underline text-wblue-700">عودة للرئيسية</button>
    </div>
  );

  return (
    <div className="grid gap-6">
      {!unlocked && <PinModal name={account.name} onVerify={(ok)=>setUnlocked(ok)} />}
      <section className="bg-white rounded-3xl p-6 shadow-soft border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">رصيد {account.name}</div>
            <div className="text-3xl font-extrabold tabular-nums">{account.balance.toLocaleString('ar-SA')} ر.س</div>
          </div>
          <button onClick={()=>router.push('/')} className="text-wblue-700 underline">الرئيسية</button>
        </div>
      </section>

      {unlocked ? (
        <div className="grid md:grid-cols-2 gap-6">
          <TransactionForm accountId={id} />
          <section className="bg-white rounded-2xl p-5 shadow-soft border">
            <h3 className="font-bold mb-3">سجل العمليات</h3>
            <TransactionList accountId={id} />
          </section>
        </div>
      ) : (
        <div className="text-gray-600">أدخل الرقم السري لعرض وإجراء العمليات</div>
      )}
    </div>
  );
}
