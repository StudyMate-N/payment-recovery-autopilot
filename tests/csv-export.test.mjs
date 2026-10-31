import test from 'node:test';
import assert from 'node:assert/strict';
import {csvCell,exportInvoices} from '../csv-export.js';

test('spreadsheet formula prefixes are escaped, even with leading whitespace or invisible characters',()=>{
  for(const value of [
    '=HYPERLINK("https://example.invalid","click")',
    '+SUM(1,2)','-1+2','@SUM(1,2)',
    '  =2+2','\t=2+2','\r\n=2+2','\uFEFF=2+2','\u200B=2+2'
  ]){
    assert.equal(csvCell(value),'"\''+value.replaceAll('"','""')+'"');
  }
});

test('ordinary values are not changed and CSV quotes, commas, and line breaks remain escaped',()=>{
  assert.equal(csvCell('North "Star", LLC'),'"North ""Star"", LLC"');
  assert.equal(csvCell('Normal\nStudio'),'"Normal\nStudio"');
  assert.equal(csvCell('INV-001'),'"INV-001"');
  assert.equal(csvCell('0.00'),'"0.00"');
});

test('export serializes stable headers, cents, paid flag, and neutralized formula cells',()=>{
  const out=exportInvoices([
    {id:'=2+2',customer:'+SUM(1,2)',email:'user@example.invalid',cents:12345,due:'2026-10-31',paid:false},
    {id:'INV-002',customer:'Acme, Inc.',email:'a@example.invalid',cents:0,due:'2026-11-01',paid:true}
  ]);
  assert.equal(out,[
    'id,customer,email,amount,due,paid',
    '"\'=2+2","\'+SUM(1,2)","user@example.invalid","123.45","2026-10-31","false"',
    '"INV-002","Acme, Inc.","a@example.invalid","0.00","2026-11-01","true"'
  ].join('\r\n'));
});

test('exporting zero invoices produces only the header',()=>{
  assert.equal(exportInvoices([]),'id,customer,email,amount,due,paid');
});
