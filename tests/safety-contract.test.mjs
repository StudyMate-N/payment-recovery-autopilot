import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const core=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const source=html+'\n'+core;

test('demo warning explicitly forbids real customer or financial records',()=>{
  assert.match(html,/Demonstration only\. Data is stored in this browser\. Do not enter real customer or financial records\./);
});
test('manual paid amounts cannot be represented as bank verified',()=>{
  assert.match(html,/Manually marked, not bank verified/);
  assert.match(html,/This does not verify bank settlement/);
});
test('follow-up requires human copy rather than a Send button',()=>{
  assert.match(html,/Review and edit this message before copying/);
  assert.match(html,/id="copy"/);
  assert.doesNotMatch(html,/<button[^>]*>\s*Send(?:\s|<)/i);
});
test('no outbound messaging or payment execution API in static MVP',()=>{
  assert.doesNotMatch(source,/\b(?:fetch|sendBeacon|XMLHttpRequest|WebSocket|EventSource)\s*\(/);
  assert.doesNotMatch(source,/\b(?:emailjs|sendgrid|resend|stripe|paypal)\s*\./i);
});
test('demo uses browser-local persistence rather than pretending to have server storage',()=>{
  assert.match(html,/localStorage\.setItem\(/);
  assert.match(html,/Local prototype · No messages sent/);
});
test('payment totals are labelled as recorded, not recovered',()=>{
  assert.match(html,/>Recorded as paid</);
  assert.doesNotMatch(html,/>\s*(?:Recovered revenue|Verified payments|Settled balance)\s*</i);
});
