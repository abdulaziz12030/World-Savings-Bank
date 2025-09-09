<div
  className={
    `font-extrabold tabular-nums ${
      ['expense','transfer-out'].includes(t.type) ? 'text-red-600' : 'text-green-700'
    }`
  }
>
  {['expense','transfer-out'].includes(t.type) ? '-' : '+'}{t.amount.toLocaleString('ar-SA')} ر.س
</div>
