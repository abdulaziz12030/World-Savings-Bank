'use client';
import { useStore, AccountId } from '../lib/store';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ar-SA');
}

export default function TransactionList({ accountId }: { accountId?: AccountId }) {
  const txs = useStore(s => s.transactions);
  const filtered = accountId ? txs.filter(t => t.accountId === accountId) : txs;
  if (filtered.length === 0) return <div className="text-gray-500 text-sm">لا توجد عمليات بعد</div>;
  return (
    <div className="grid gap-2">
      {filtered.map(t => (
        <div key={t.id} className="bg-white border rounded-xl p-3 flex items-center justify-between">
          <div className="text-sm">
            <div className="font-bold">
              {t.type === 'deposit' && 'إيداع'}
              {t.type === 'expense' && 'مصروف'}
              {t.type === 'transfer-out' && `تحويل - خصم (${t.counterparty})`}
              {t.type === 'transfer-in' && `تحويل - إضافة (${t.counterparty})`}
            </div>
            <div className="text-gray-500">{formatDate(t.createdAt)}</div>
            {t.note && <div className="text-gray-600 mt-1">ملاحظة: {t.note}</div>}
          </div>
          <div
            className={
              `font-extrabold tabular-nums ${
                ['expense','transfer-out'].includes(t.type) ? 'text-red-600' : 'text-green-700'
              }`
            }
          >
            {['expense','transfer-out'].includes(t.type) ? '-' : '+'}{t.amount.toLocaleString('ar-SA')} ر.س
          </div>
        </div>
      ))}
    </div>
  );
}
