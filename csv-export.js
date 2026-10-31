// CSV quoting alone does not prevent spreadsheet programs from evaluating
// formula-like values. Treat exported invoice text as untrusted data.
const SPREADSHEET_FORMULA=/^[\s\uFEFF\u200B-\u200F\u2060\x00-\x1F\x7F]*[=+\-@]/u;

export function csvCell(value){
  let text=String(value);
  // The apostrophe is deliberately included in the CSV data, so it remains
  // a literal even when opened in spreadsheet applications that ignore quotes.
  if(SPREADSHEET_FORMULA.test(text))text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
}

export function exportInvoices(invoices){
  const header='id,customer,email,amount,due,paid';
  const lines=invoices.map(i=>[
    i.id,i.customer,i.email,(i.cents/100).toFixed(2),i.due,i.paid?'true':'false'
  ].map(csvCell).join(','));
  return [header,...lines].join('\r\n');
}
