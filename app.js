export function money(cents){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100)}
export function localToday(date=new Date()){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')}
export function invoiceStatus(invoice,today=localToday()){if(invoice.paid)return 'paid';return invoice.due<today?'overdue':'outstanding'}
export function totals(invoices,today){return invoices.reduce((a,i)=>{if(!i.paid){a.outstanding+=i.cents;if(invoiceStatus(i,today)==='overdue')a.overdue+=i.cents}else a.paid+=i.cents;return a},{outstanding:0,overdue:0,paid:0})}
export function parseInvoices(text){const rows=text.replace(/\r/g,'').trim().split('\n');if(rows.length<2)throw Error('Missing invoice rows');const headers=rows.shift().split(',').map(x=>x.trim().toLowerCase());for(const field of ['id','customer','email','amount','due'])if(!headers.includes(field))throw Error('Missing '+field);const seen=new Set();return rows.filter(Boolean).map(row=>{const cells=row.split(',');if(cells.length!==headers.length)throw Error('Invalid CSV row');const o=Object.fromEntries(headers.map((h,i)=>[h,cells[i].trim()]));if(!o.id||seen.has(o.id))throw Error('Invalid or duplicate invoice ID');seen.add(o.id);const amount=Number(o.amount);if(!Number.isFinite(amount)||amount<0||amount>1e9)throw Error('Invalid amount');if(!/^\d{4}-\d{2}-\d{2}$/.test(o.due)||Number.isNaN(Date.parse(o.due)))throw Error('Invalid due date');if(!/^\S+@\S+\.\S+$/.test(o.email))throw Error('Invalid email');return {id:o.id,customer:o.customer,email:o.email,cents:Math.round(amount*100),due:o.due,paid:o.paid==='true'}})}
export function draft(i,today=localToday()){
  if(i.paid)throw Error('Cannot draft a reminder for an invoice recorded as paid');
  const status=invoiceStatus(i,today);
  const timing=status==='overdue'?'was due on '+i.due:i.due===today?'is due today':'is due on '+i.due;
  const next=status==='overdue'
    ? "Our records still show it as outstanding. If you have already paid, please let us know so we can update our records. Otherwise, could you share an expected payment date?"
    : "If you have already arranged payment, thank you. Please let us know if you have any questions about this invoice.";
  return 'Subject: Friendly reminder — invoice '+i.id+'\n\nHello '+i.customer+',\n\nA quick note that invoice '+i.id+' for '+money(i.cents)+' '+timing+'. '+next+'\n\nThank you.';
}
