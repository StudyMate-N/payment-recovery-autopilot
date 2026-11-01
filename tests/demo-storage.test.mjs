import test from 'node:test';
import assert from 'node:assert/strict';
import {loadDemoInvoices,writeDemoInvoices,validateDemoInvoices} from '../demo-storage.js';

const sample={id:'INV-01',customer:'Example LLC',email:'demo@example.com',cents:12025,due:'2026-11-12',paid:false};
function fakeStorage(initial=null){
  let value=initial;
  return {
    getItem(){return value},
    setItem(_key,next){value=next},
    get value(){return value}
  };
}
const key='current-local-demo-v02';

test('first visit uses seed without writing to browser storage',()=>{
  const store=fakeStorage(),state=loadDemoInvoices(()=>store,key,[sample]);
  assert.deepEqual(state.invoices,[sample]);
  assert.equal(state.snapshot,null);
  assert.equal(store.value,null);
  assert.equal(state.blocked,false);
});
test('valid saved invoices load including an intentionally empty workspace',()=>{
  const store=fakeStorage('[]');
  assert.deepEqual(loadDemoInvoices(()=>store,key,[sample]).invoices,[]);
  assert.equal(loadDemoInvoices(()=>store,key,[sample]).blocked,false);
});
test('malformed JSON is preserved and editing is blocked',()=>{
  const store=fakeStorage('{incomplete');
  const state=loadDemoInvoices(()=>store,key,[sample]);
  assert.equal(state.blocked,true);
  assert.deepEqual(state.invoices,[]);
  assert.equal(store.value,'{incomplete');
});
test('invalid and duplicate saved invoices are not trusted',()=>{
  for(const invalid of [
    null,{},[{...sample,paid:'true'}],[{...sample,cents:-10}],
    [{...sample,due:'2026-02-30'}],[sample,{...sample}],
    [{...sample,id:''}],[{...sample,email:'not-an-email'}]
  ]){
    const store=fakeStorage(JSON.stringify(invalid));
    assert.equal(loadDemoInvoices(()=>store,key,[sample]).blocked,true);
    assert.equal(store.value,JSON.stringify(invalid));
  }
});
test('unavailable storage never falls back to a writable seed',()=>{
  const state=loadDemoInvoices(()=>{throw Error('SecurityError')},key,[sample]);
  assert.equal(state.blocked,true);
  assert.deepEqual(state.invoices,[]);
});
test('successful write roundtrips and returns the new snapshot',()=>{
  const store=fakeStorage();
  const snapshot=writeDemoInvoices(()=>store,key,null,[sample]);
  assert.equal(snapshot,store.value);
  assert.deepEqual(loadDemoInvoices(()=>store,key,[]).invoices,[sample]);
});
test('storage quota failure preserves previous data and propagates error',()=>{
  const store={getItem(){return '[]'},setItem(){throw Error('QuotaExceededError')}};
  assert.throws(()=>writeDemoInvoices(()=>store,key,'[]',[sample]),/QuotaExceededError/);
  assert.equal(store.getItem(),'[]');
});
test('stale tab cannot silently overwrite a newer invoice snapshot',()=>{
  const store=fakeStorage('[]');
  store.setItem(key,JSON.stringify([sample]));
  assert.throws(()=>writeDemoInvoices(()=>store,key,'[]',[]),/another tab/);
  assert.deepEqual(JSON.parse(store.value),[sample]);
});
test('invalid proposed invoice is rejected before touching storage',()=>{
  let touched=false;
  assert.throws(()=>writeDemoInvoices(()=>{touched=true;return fakeStorage()},key,null,[{...sample,cents:NaN}]),/amount/);
  assert.equal(touched,false);
});
test('valid saved invoice schema accepts quoted and multiline customer text',()=>{
  assert.equal(validateDemoInvoices([{...sample,customer:'North "Star", LLC\nStudio'}]).length,1);
});
