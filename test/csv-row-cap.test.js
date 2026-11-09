import test from 'node:test';
import assert from 'node:assert/strict';
import { parseInvoices } from '../app.js';

const header='id,customer,email,amount,due';
const record=n=>`INV-${n},Customer ${n},client${n}@example.com,1.00,2026-11-09`;

test('rejects excess invoice rows before completing CSV parse',()=>{
  const csv=[header,...Array.from({length:5001},(_,i)=>record(i))].join('\n');
  assert.throws(()=>parseInvoices(csv),/5,000 invoice limit/);
});

test('accepts exactly 5000 invoice rows',()=>{
  const csv=[header,...Array.from({length:5000},(_,i)=>record(i))].join('\n');
  assert.equal(parseInvoices(csv).length,5000);
});

test('rejects excess invoice rows when last record has no newline',()=>{
  const csv=[header,...Array.from({length:5001},(_,i)=>record(i))].join('\n');
  assert.throws(()=>parseInvoices(csv),/5,000 invoice limit/);
});
