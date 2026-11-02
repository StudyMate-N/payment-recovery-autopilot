import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
assert.ok(css,'Expected inline styles');

function rule(selector){
  const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const match=css.match(new RegExp('(?:^|\\})'+escaped+'\\{([^}]*)\\}'));
  assert.ok(match,'Missing CSS rule '+selector);
  return match[1];
}
function cssColor(selector){
  const match=rule(selector).match(/(?:^|;)color:(#[0-9a-f]{6})/i);
  assert.ok(match,'Missing color for '+selector);
  return match[1];
}
function luminance(hex){
  const channels=[1,3,5].map(n=>parseInt(hex.slice(n,n+2),16)/255);
  const linear=channels.map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);
  return 0.2126*linear[0]+0.7152*linear[1]+0.0722*linear[2];
}
function contrast(foreground,background){
  const [lighter,darker]=[luminance(foreground),luminance(background)].sort((a,b)=>b-a);
  return (lighter+0.05)/(darker+0.05);
}

test('skip navigation points to focusable main landmark',()=>{
  assert.match(html,/<a class="skip-link" href="#main">Skip to main content<\/a>/);
  assert.match(html,/<main class="main" id="main" tabindex="-1">/);
  assert.match(css,/\.skip-link:focus\{top:12px\}/);
});

test('mobile workspace navigation remains available rather than hidden',()=>{
  const mobile=css.slice(css.indexOf('@media(max-width:850px)'));
  assert.match(mobile,/\.side \.nav\{display:flex;/);
  assert.doesNotMatch(mobile,/\.side \.nav,\.side-bottom,\.tag\{display:none\}/);
  assert.match(mobile,/\.side \.nav a\{padding:10px 12px;margin:0\}/);
});

test('scrollable invoice table is keyboard-focusable with labelled columns',()=>{
  assert.match(html,/class="table-wrap" tabindex="0" role="region" aria-label="Invoice table" aria-describedby="tableHint"/);
  assert.match(html,/<caption class="sr-only">Invoices, amounts, due dates, statuses and available actions<\/caption>/);
  assert.equal((html.match(/<th scope="col">/g)||[]).length,5);
  assert.match(html,/id="tableHint"/);
});

test('native dialogs have accessible headings',()=>{
  assert.match(html,/<dialog class="modal" id="editor" aria-labelledby="editorTitle">/);
  assert.match(html,/<h3 id="editorTitle">Add an invoice<\/h3>/);
  assert.match(html,/<dialog class="modal" id="draft" aria-labelledby="draftTitle">/);
  assert.match(html,/<h3 id="draftTitle">Friendly payment reminder<\/h3>/);
});

test('repeated invoice actions identify their invoice to assistive technology',()=>{
  assert.match(html,/follow\.setAttribute\('aria-label','Draft reminder for invoice '/);
  assert.match(html,/paid\.setAttribute\('aria-label','Mark invoice '/);
  assert.match(html,/as paid \(unverified\)/);
});

test('copy feedback is announced and reset for the next draft',()=>{
  assert.match(html,/id="copyStatus" class="sr-only" role="status" aria-live="polite"/);
  assert.match(html,/\$\('copyStatus'\)\.textContent='Draft copied to clipboard'/);
  assert.match(html,/\$\('copy'\)\.textContent='Copy draft';\$\('copyStatus'\)\.textContent=''/);
});

test('small editorial and tabular text meets WCAG AA 4.5:1 against surfaces',()=>{
  const samples=[
    ['.eyebrow','#f6f8f5'],['p','#f6f8f5'],
    ['.metric span','#ffffff'],['.metric small','#ffffff'],
    ['th','#ffffff'],['td small','#ffffff']
  ];
  for(const [selector,background] of samples){
    const ratio=contrast(cssColor(selector),background);
    assert.ok(ratio>=4.5,selector+' contrast '+ratio.toFixed(2)+':1 below 4.5:1');
  }
});
