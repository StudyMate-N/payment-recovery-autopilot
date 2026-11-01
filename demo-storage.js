// Browser-only demonstration storage. This is NOT suitable for real financial data.
// Read failures are deliberately read-only: never overwrite data we cannot inspect.
const MAX_CENTS=100_000_000_000;
function validDate(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const date=new Date(value+'T00:00:00Z');
  return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export function validateDemoInvoices(invoices){
  if(!Array.isArray(invoices))throw Error('Saved invoice data is not an array');
  const ids=new Set();
  for(const i of invoices){
    if(!i||typeof i!=='object'||Array.isArray(i))throw Error('Invalid saved invoice');
    if(typeof i.id!=='string'||!i.id.trim()||i.id.length>60||ids.has(i.id))throw Error('Invalid or duplicate saved invoice ID');
    ids.add(i.id);
    if(typeof i.customer!=='string'||!i.customer.trim()||i.customer.length>120)throw Error('Invalid saved customer');
    if(typeof i.email!=='string'||i.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.email))throw Error('Invalid saved email');
    if(!Number.isSafeInteger(i.cents)||i.cents<0||i.cents>MAX_CENTS)throw Error('Invalid saved amount');
    if(!validDate(i.due))throw Error('Invalid saved due date');
    if(typeof i.paid!=='boolean')throw Error('Invalid saved payment status');
  }
  return invoices;
}
export function loadDemoInvoices(getStorage,key,seed){
  try{
    const storage=getStorage();
    const snapshot=storage.getItem(key);
    if(snapshot===null)return {invoices:validateDemoInvoices(seed),snapshot,blocked:false};
    return {invoices:validateDemoInvoices(JSON.parse(snapshot)),snapshot,blocked:false};
  }catch{
    // No fallback write: an invalid, inaccessible or corrupted record is preserved.
    return {invoices:[],snapshot:null,blocked:true};
  }
}
export function writeDemoInvoices(getStorage,key,expectedSnapshot,next){
  validateDemoInvoices(next);
  const storage=getStorage();
  if(storage.getItem(key)!==expectedSnapshot)throw Error('Saved data changed in another tab. Reload before editing.');
  const snapshot=JSON.stringify(next);
  storage.setItem(key,snapshot); // throws on quota/privacy errors; caller must not commit in-memory changes.
  return snapshot;
}
