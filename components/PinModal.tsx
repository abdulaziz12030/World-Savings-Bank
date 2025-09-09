
'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';

export default function PinModal({
  name, onVerify
}: { name: string; onVerify: (ok: boolean) => void }) {
  const [pin, setPin] = useState('');
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setOpen(true); }, [name]);

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed inset-0 grid place-items-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-soft">
            <Dialog.Title className="text-lg font-bold mb-1">أدخل الرقم السري</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-4">
              للتحقق من حساب {name}
            </Dialog.Description>
            <input
              placeholder="أربع خانات"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-wblue-500"
              type="password"
              inputMode="numeric"
              maxLength={4}
            />
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  if (pin.length !== 4) { setError('الرجاء إدخال 4 خانات'); return; }
                  onVerify(pin === window.sessionStorage.getItem('activePIN'));
                  if (pin === window.sessionStorage.getItem('activePIN')) {
                    setOpen(false);
                  } else {
                    setError('الرقم السري غير صحيح');
                  }
                }}
                className="flex-1 bg-wblue-700 text-white rounded-xl py-3 font-semibold"
              >تأكيد</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
