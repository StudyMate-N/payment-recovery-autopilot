import test from 'node:test';import assert from 'node:assert/strict';import {totals,invoiceStatus,parseInvoices,draft,money,summarizeInvoiceImport} from '../app.js';
const one={id:'INV-1',customer:'Acme',email:'accounts@example.com',cents:12500,due:'2026-01-01',paid:false};
test('overdue classification',()=>assert.equal(invoiceStatus(one,'2026-10-01'),'overdue'));
test('paid never overdue',()=>assert.equal(invoiceStatus({...one,paid:true},'2026-10-01'),'paid'));
test('balances do not count paid as overdue',()=>assert.deepEqual(totals([one,{...one,id:'INV-2',paid:true}],'2026-10-01'),{outstanding:12500,overdue:12500,paid:12500}));
test('import rejects duplicate invoice IDs',()=>assert.throws(()=>parseInvoices('id,customer,email,amount,due\nX,Acme,a@b.com,12,2026-01-01\nX,Acme,a@b.com,12,2026-01-01')));
test('import rejects malformed amount',()=>assert.throws(()=>parseInvoices('id,customer,email,amount,due\nX,Acme,a@b.com,no,2026-01-01')));
test('draft never sends',()=>assert.match(draft(one),/Friendly reminder/));
test('currency uses cents',()=>assert.equal(money(12500),'$125.00'));

test('CSV handles escaped quotes and commas',()=>{const inv=parseInvoices('id,customer,email,amount,due,paid\n"INV,7","North ""Star"", LLC",a@b.com,120.25,2026-10-01,false');assert.equal(inv[0].customer,'North "Star", LLC');assert.equal(inv[0].id,'INV,7');assert.equal(inv[0].cents,12025)});
test('CSV handles multiline quoted fields',()=>{const inv=parseInvoices('id,customer,email,amount,due\nA,"North\nStudio",a@b.com,10,2026-10-01');assert.equal(inv[0].customer,'North\nStudio')});
test('rejects impossible calendar date',()=>assert.throws(()=>parseInvoices('id,customer,email,amount,due\nA,Acme,a@b.com,10,2026-02-30')));
test('rejects extra monetary precision',()=>assert.throws(()=>parseInvoices('id,customer,email,amount,due\nA,Acme,a@b.com,10.999,2026-10-01')));
test('rejects duplicate header',()=>assert.throws(()=>parseInvoices('id,id,customer,email,amount,due\nA,B,Acme,a@b.com,10,2026-10-01')));
test('roundtrip quoted CSV row',()=>{const inv=parseInvoices('id,customer,email,amount,due,paid\n"X""1","N, Co",a@b.com,30.05,2026-10-01,true');assert.equal(inv[0].paid,true);assert.equal(inv[0].id,'X"1')});

test('import summary identifies unverified paid flags without changing invoices',()=>{
  const invoices=parseInvoices('id,customer,email,amount,due,paid\nA,Example,a@b.com,120.50,2026-11-01,true\nB,Example,b@b.com,10.00,2026-11-02,false');
  const before=structuredClone(invoices);
  assert.deepEqual(summarizeInvoiceImport(invoices),{count:2,paidCount:1,paidCents:12050});
  assert.deepEqual(invoices,before);
});
test('unpaid-only import needs no paid-flag confirmation',()=>{
  const invoices=parseInvoices('id,customer,email,amount,due\nA,Example,a@b.com,1.00,2026-11-01');
  assert.deepEqual(summarizeInvoiceImport(invoices),{count:1,paidCount:0,paidCents:0});
});

test('rejects oversized CSV before parsing',()=>{
  assert.throws(()=>parseInvoices('x'.repeat(1000001)),/1 MB/);
  assert.throws(()=>parseInvoices(null),/1 MB/);
});
test('rejects more than 5,000 invoice rows',()=>{
  const header='id,customer,email,amount,due';
  const rows=Array.from({length:5001},(_,n)=>`I-${n},Example,a@b.com,1.00,2026-11-01`);
  assert.throws(()=>parseInvoices([header,...rows].join('\n')),/5,000/);
});
test('allows exactly 5,000 valid invoice rows',()=>{
  const header='id,customer,email,amount,due';
  const rows=Array.from({length:5000},(_,n)=>`I-${n},Example,a@b.com,1.00,2026-11-01`);
  const parsed=parseInvoices([header,...rows].join('\n'));
  assert.equal(parsed.length,5000);
  assert.equal(parsed[4999].id,'I-4999');
});

test('rejects CSV whose UTF-8 bytes exceed the limit',()=>{
  assert.throws(()=>parseInvoices('é'.repeat(500001)),/1 MB/);
});

test('CSV rejects text appended after a closing quote instead of silently merging it',()=>{
  const header='id,customer,email,amount,due';
  assert.throws(()=>parseInvoices(header+'\nA,"Acme"Injected,a@b.com,10,2026-11-01'),/after closing CSV quote/);
  assert.throws(()=>parseInvoices(header+'\nA,"Acme" "Other",a@b.com,10,2026-11-01'),/after closing CSV quote/);
});
test('CSV rejects a stray quote inside an unquoted field',()=>{
  assert.throws(()=>parseInvoices('id,customer,email,amount,due\nA,Ac"me,a@b.com,10,2026-11-01'),/Invalid CSV quotation/);
});
test('CSV accepts adjacent quoted fields and correctly resets quote state across rows',()=>{
  const invoices=parseInvoices('id,customer,email,amount,due\n"A","Acme",a@b.com,10,2026-11-01\nB,"Next, Ltd",b@b.com,20,2026-11-02');
  assert.equal(invoices.length,2);
  assert.equal(invoices[0].customer,'Acme');
  assert.equal(invoices[1].customer,'Next, Ltd');
});

test('rejects bidirectional controls that disguise invoice IDs',()=>{
  for(const codePoint of [0x061c,0x200e,0x200f,0x202a,0x202e,0x2066,0x2069]){
    const id='INV-'+String.fromCodePoint(codePoint)+'123';
    assert.throws(()=>parseInvoices('id,customer,email,amount,due\n'+id+',Acme,a@b.com,10,2026-11-01'),/Invalid or duplicate invoice ID/);
  }
});
test('allows legitimate Unicode invoice IDs',()=>{
  const invoices=parseInvoices('id,customer,email,amount,due\nINV-é-東京,Acme,a@b.com,10,2026-11-01');
  assert.equal(invoices[0].id,'INV-é-東京');
});
