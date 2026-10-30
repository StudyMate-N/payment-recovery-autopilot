import test from 'node:test';import assert from 'node:assert/strict';import {totals,invoiceStatus,parseInvoices,draft,money,localToday} from '../app.js';
const one={id:'INV-1',customer:'Acme',email:'accounts@example.com',cents:12500,due:'2026-01-01',paid:false};
test('overdue classification',()=>assert.equal(invoiceStatus(one,'2026-10-01'),'overdue'));
test('paid never overdue',()=>assert.equal(invoiceStatus({...one,paid:true},'2026-10-01'),'paid'));
test('balances do not count paid as overdue',()=>assert.deepEqual(totals([one,{...one,id:'INV-2',paid:true}],'2026-10-01'),{outstanding:12500,overdue:12500,paid:12500}));
test('import rejects duplicate invoice IDs',()=>assert.throws(()=>parseInvoices('id,customer,email,amount,due\nX,Acme,a@b.com,12,2026-01-01\nX,Acme,a@b.com,12,2026-01-01')));
test('import rejects malformed amount',()=>assert.throws(()=>parseInvoices('id,customer,email,amount,due\nX,Acme,a@b.com,no,2026-01-01')));
test('draft never sends',()=>assert.match(draft(one),/Friendly reminder/));
test('currency uses cents',()=>assert.equal(money(12500),'$125.00'));

test('local calendar date is used rather than UTC calendar rollover',()=>{
  const previous=process.env.TZ;
  try{
    process.env.TZ='Africa/Nairobi';
    const instant=new Date('2026-10-29T21:15:00.000Z');
    assert.equal(instant.toISOString().slice(0,10),'2026-10-29');
    assert.equal(localToday(instant),'2026-10-30');
  }finally{
    if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous;
  }
});
test('future invoice reminder does not falsely say overdue',()=>{
  const message=draft({...one,due:'2026-11-12'},'2026-10-30');
  assert.match(message,/is due on 2026-11-12/);
  assert.doesNotMatch(message,/was due|still show it as outstanding|expected payment date/);
});
test('due-today reminder is accurate',()=>{
  const message=draft({...one,due:'2026-10-30'},'2026-10-30');
  assert.match(message,/is due today/);
  assert.doesNotMatch(message,/was due|expected payment date/);
});
test('overdue reminder describes an unverified outstanding record, not settlement',()=>{
  const message=draft({...one,due:'2026-10-01'},'2026-10-30');
  assert.match(message,/was due on 2026-10-01/);
  assert.match(message,/Our records still show it as outstanding/);
  assert.match(message,/If you have already paid/);
});
test('paid invoice cannot produce a payment reminder',()=>{
  assert.throws(()=>draft({...one,paid:true},'2026-10-30'),/recorded as paid/);
});
