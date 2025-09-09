
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '../lib/utils';

export default function AccountCard({
  id, name, balance, img, className
}: { id: 'omar' | 'shahad'; name: string; balance: number; img: string; className?: string }) {
  return (
    <Link href={`/account/${id}`} className={cn("group block bg-white rounded-2xl p-5 shadow-soft border border-gray-100 hover:-translate-y-0.5 transition", className)}>
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-wblue-50 p-2 ring-1 ring-wblue-100">
          <Image src={img} alt={name} width={64} height={64} className="rounded-full" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500">رصيد الحساب</div>
          <div className="text-2xl font-extrabold tabular-nums tracking-tight">{balance.toLocaleString('ar-SA')} ر.س</div>
          <div className="mt-1 text-wblue-800 font-semibold">حساب {name} الإدخاري</div>
        </div>
        <div className="text-wblue-700 text-sm opacity-70">فتح &rarr;</div>
      </div>
    </Link>
  );
}
