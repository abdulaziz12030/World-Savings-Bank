
'use client';
import { useEffect } from 'react';
import AccountCard from '../components/AccountCard';
import { useStore } from '../lib/store';

export default function Home() {
  const init = useStore(s => s.init);
  const accounts = useStore(s => s.accounts);
  const txs = useStore(s => s.transactions);

  useEffect(() => { init(); }, [init]);

  return (
    <div className="grid gap-6">
      <section className="bg-gradient-to-r from-wblue-800 to-wblue-600 rounded-3xl text-white p-6 shadow-soft">
        <h2 className="text-xl font-bold mb-1">أهلًا!</h2>
        <p className="opacity-90">اختر الحساب لعرض التفاصيل والعمليات.</p>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        <AccountCard id="omar" name="عمر" balance={accounts.omar.balance} img="/omar.svg" />
        <AccountCard id="shahad" name="شهد" balance={accounts.shahad.balance} img="/shahad.svg" />
      </div>

      <section className="mt-2">
        <h3 className="font-bold mb-3">أحدث العمليات</h3>
        {/* Global recent transactions */}
        {txs.length === 0 ? (
          <div className="text-gray-500 text-sm">لا توجد عمليات بعد</div>
        ) : (
          <div className="space-y-2">
            {txs.slice(0,5).map(t => (
              <div key={t.id} className="bg-white border rounded-xl p-3 flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-bold">{t.accountId === 'omar' ? 'عمر' : 'شهد'}</div>
                  <div className="text-gray-500">{new Date(t.createdAt).toLocaleString('ar-SA')}</div>
                </div>
                <div className="text-sm">{t.type}</div>
                <div className="font-extrabold tabular-nums">{t.amount.toLocaleString('ar-SA')} ر.س</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
