'use client';
import { useState } from 'react';
import { useStore, AccountId } from '../lib/store';
import { PlusCircle, MinusCircle, ArrowLeftRight } from 'lucide-react';

export default function TransactionForm({ accountId }: { accountId: AccountId }) {
  const deposit = useStore((s) => s.deposit);
  const expense = useStore((s) => s.expense);
  const transfer = useStore((s) => s.transfer);

  const [tab, setTab] = useState<'dep' | 'exp' | 'trf'>('dep');
  const [amount, setAmount] = useState<number>(0);
  const [to, setTo] = useState<'abdulaziz' | 'omar' | 'shahad'>('abdulaziz');
  const [note, setNote] = useState('');

  const submit = async () => {
    if (!amount || amount <= 0) return;
    if (tab === 'dep') await deposit(accountId, amount, note);
    if (tab === 'exp') await expense(accountId, amount, note);
    if (tab === 'trf') await transfer(accountId, to, amount);
    setAmount(0);
    setNote('');
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('dep')}
          className={`px-3 py-2 rounded-xl text-sm font-semibold ${tab === 'dep' ? 'bg-wblue-100 text-wblue-800' : 'bg-gray-100'}`}
        >
          <span className="inline-flex items-center gap-1">
            <PlusCircle size={16} /> إيداع
          </span>
        </button>
        <button
          onClick={() => setTab('exp')}
          className={`px-3 py-2 rounded-xl text-sm font-semibold ${tab === 'exp' ? 'bg-wblue-100 text-wblue-800' : 'bg-gray-100'}`}
        >
          <span className="inline-flex items-center gap-1">
            <MinusCircle size={16} /> مصروف
          </span>
        </button>
        <button
          onClick={() => setTab('trf')}
          className={`px-3 py-2 rounded-xl text-sm font-semibold ${tab === 'trf' ? 'bg-wblue-100 text-wblue-800' : 'bg-gray-100'}`}
        >
          <span className="inline-flex items-center gap-1">
            <ArrowLeftRight size={16} /> تحويل
          </span>
        </button>
      </div>

      <div className="grid gap-3">
        {tab !== 'trf' && (
          <input
            className="border rounded-xl px-4 py-3"
            placeholder="المبلغ بالريال"
            type="number"
            value={amount === 0 ? '' : amount}
            onChange={(e) => {
              const v = parseFloat(e.target.value || '0');
              setAmount(Number.isNaN(v) ? 0 : v);
            }}
          />
        )}

        {tab === 'trf' && (
          <div className="grid gap-3">
            <input
              className="border rounded-xl px-4 py-3"
              placeholder="المبلغ بالريال"
              type="number"
              value={amount === 0 ? '' : amount}
              onChange={(e) => {
                const v = parseFloat(e.target.value || '0');
                setAmount(Number.isNaN(v) ? 0 : v);
              }}
            />
            <select
              className="border rounded-xl px-4 py-3"
              value={to}
              onChange={(e) => setTo(e.target.value as 'abdulaziz' | 'omar' | 'shahad')}
            >
              <option value="abdulaziz">حساب عبدالعزيز</option>
              <option value="omar">حساب عمر</option>
              <option value="shahad">حساب شهد</option>
            </select>
          </div>
        )}

        {(tab === 'dep' || tab === 'exp') && (
          <input
            className="border rounded-xl px-4 py-3"
            placeholder="ملاحظة (اختياري)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        )}

        <button onClick={submit} className="bg-wblue-700 text-white rounded-xl py-3 font-semibold">
          تنفيذ
        </button>
      </div>
    </div>
  );
}
