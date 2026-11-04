import test from 'node:test';import assert from 'node:assert/strict';import {totals,invoiceStatus,parseInvoices,draft,money,recordManualPayment} from '../app.js';
const one={id:'INV-1',customer:'Acme',email:'accounts@example.com',cents:12500,due:'2026-01-01',paid:false};
test('overdue classification',()=>assert.equal(invoiceStatus(one,'2026-10-01'),'overdue'));
test('paid never overdue',()=>assert.equal(invoiceStatus({...one,paid:true},'2026-10-01'),'paid'));
test('balances do not count paid as overdue',()=>assert.deepEqual(totals([one,{...one,id:'INV-2',paid:true}],'2026-10-01'),{outstanding:12500,overdue:12500,paid:12500}));
test('import rejects duplicate invoice IDs',()=>assert.throws(()=>parseInvoices('id,customer,email,amount,due\nX,Acme,a@b.com,12,2026-01-01\nX,Acme,a@b.com,12,2026-01-01')));
test('import rejects malformed amount',()=>assert.throws(()=>parseInvoices('id,customer,email,amount,due\nX,Acme,a@b.com,no,2026-01-01')));
test('draft never sends',()=>assert.match(draft(one),/Friendly reminder/));
test('currency uses cents',()=>assert.equal(money(12500),'$125.00'));

test('manual paid entry is reversible without mutating the source invoice',()=>{
  const paid=recordManualPayment(one,true);
  assert.equal(paid.paid,true);
  assert.equal(one.paid,false);
  const reopened=recordManualPayment(paid,false);
  assert.equal(reopened.paid,false);
  assert.equal(reopened.id,one.id);
});
test('manual payment transition rejects invalid and redundant status changes',()=>{
  assert.throws(()=>recordManualPayment(one,'paid'),/Invalid manual payment state/);
  assert.throws(()=>recordManualPayment(one,false),/already has/);
  assert.throws(()=>recordManualPayment({...one,paid:true},true),/already has/);
  assert.throws(()=>recordManualPayment(null,true),/Invalid invoice/);
});
