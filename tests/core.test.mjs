import test from 'node:test';import assert from 'node:assert/strict';import {totals,invoiceStatus,parseInvoices,draft,money} from '../app.js';
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
