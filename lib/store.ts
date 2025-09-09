
'use client';
import { create } from 'zustand';

export type AccountId = 'omar' | 'shahad';
type TransferTarget = 'abdulaziz' | 'omar' | 'shahad';
export type TxType = 'deposit' | 'expense' | 'transfer-out' | 'transfer-in';

export interface Transaction {
  id: string;
  accountId: AccountId;
  type: TxType;
  amount: number;
  note?: string;
  counterparty?: TransferTarget;
  createdAt: string; // ISO date
}

export interface Account {
  id: AccountId;
  name: string;
  pin: string; // simple PIN for demo
  balance: number;
}

interface StoreState {
  accounts: Record<AccountId, Account>;
  transactions: Transaction[];
  init: () => void;
  deposit: (accountId: AccountId, amount: number, note?: string) => Promise<void>;
  expense: (accountId: AccountId, amount: number, note?: string) => Promise<void>;
  transfer: (fromId: AccountId, to: TransferTarget, amount: number) => Promise<void>;
  _notify: (payload: any) => Promise<void>;
}

const STORAGE_KEY = 'gsw-data-v1';

function load() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function save(data: any) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const useStore = create<StoreState>((set, get) => ({
  accounts: {
    omar: { id: 'omar', name: 'عمر', pin: '1234', balance: 0 },
    shahad: { id: 'shahad', name: 'شهد', pin: '5678', balance: 0 },
  },
  transactions: [],
  init: () => {
    const data = load();
    if (data) {
      set({ accounts: data.accounts, transactions: data.transactions });
    } else {
      save({ accounts: get().accounts, transactions: [] });
    }
  },
  deposit: async (accountId, amount, note) => {
    const { accounts, transactions } = get();
    const acc = { ...accounts[accountId] };
    acc.balance += amount;
    const tx: Transaction = {
      id: crypto.randomUUID(),
      accountId,
      type: 'deposit',
      amount,
      note,
      createdAt: new Date().toISOString(),
    };
    const next = { accounts: { ...accounts, [accountId]: acc }, transactions: [tx, ...transactions] };
    set(next); save(next);
    await get()._notify({ type: 'deposit', account: acc.name, amount });
  },
  expense: async (accountId, amount, note) => {
    const { accounts, transactions } = get();
    const acc = { ...accounts[accountId] };
    acc.balance -= amount;
    const tx: Transaction = {
      id: crypto.randomUUID(),
      accountId,
      type: 'expense',
      amount,
      note,
      createdAt: new Date().toISOString(),
    };
    const next = { accounts: { ...accounts, [accountId]: acc }, transactions: [tx, ...transactions] };
    set(next); save(next);
    await get()._notify({ type: 'expense', account: acc.name, amount });
  },
  transfer: async (fromId, to, amount) => {
    const { accounts, transactions } = get();
    const from = { ...accounts[fromId] };
    from.balance -= amount;

    let newAccounts = { ...accounts, [fromId]: from };
    if (to === 'omar' || to === 'shahad') {
      const toAcc = { ...accounts[to] };
      toAcc.balance += amount;
      newAccounts[to] = toAcc;
    }
    const outTx: Transaction = {
      id: crypto.randomUUID(),
      accountId: fromId,
      type: 'transfer-out',
      amount,
      counterparty: to,
      createdAt: new Date().toISOString(),
    };
    const inTx: Transaction | null = (to === 'omar' || to === 'shahad') ? {
      id: crypto.randomUUID(),
      accountId: to,
      type: 'transfer-in',
      amount,
      counterparty: fromId,
      createdAt: new Date().toISOString(),
    } : null;

    const nextTxs = inTx ? [outTx, inTx, ...transactions] : [outTx, ...transactions];
    const next = { accounts: newAccounts, transactions: nextTxs };
    set(next); save(next);
    await get()._notify({ type: 'transfer', account: from.name, amount, to });
  },
  _notify: async (payload) => {
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch { /* ignore */ }
  }
}));
