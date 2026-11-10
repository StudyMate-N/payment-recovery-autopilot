import test from 'node:test';
import assert from 'node:assert/strict';
import {parseInvoices} from '../app.js';
const csv=(id)=>'id,customer,email,amount,due\n"'+id+'",Acme,accounts@example.com,10.00,2026-12-01';
test('rejects NUL in invoice identifier',()=>assert.throws(()=>parseInvoices(csv('INV\\0X'.replace('\\0','\0'))),/Invalid or duplicate invoice ID/));
test('rejects newline in quoted invoice identifier',()=>assert.throws(()=>parseInvoices(csv('INV\nX')),/Invalid or duplicate invoice ID/));
test('accepts ordinary invoice identifier',()=>assert.equal(parseInvoices(csv('INV-001'))[0].id,'INV-001'));
