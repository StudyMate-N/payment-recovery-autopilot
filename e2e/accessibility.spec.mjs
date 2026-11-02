import {test,expect} from '@playwright/test';

// These browser acceptance cases run once PR #3's Playwright workflow is merged.
// They intentionally avoid real customer data or outbound messages.
test('mobile workspace navigation remains visible at 375px',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.goto('/');
  const nav=page.getByRole('navigation',{name:'Workspace'});
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link',{name:'Invoices'})).toBeVisible();
  await expect(nav.getByRole('link',{name:'How it works'})).toBeVisible();
  await expect(page.getByText('Scroll horizontally to see all invoice details and actions.')).toBeVisible();
  const scroll=page.getByRole('region',{name:'Invoice table'});
  await expect(scroll).toBeVisible();
  expect(await scroll.evaluate(el=>el.scrollWidth>el.clientWidth)).toBeTruthy();
});

test('keyboard skip link targets main content',async({page})=>{
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip=page.getByRole('link',{name:'Skip to main content'});
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('invoice editor and reminder dialogs have accessible names',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'+ New invoice'}).click();
  await expect(page.getByRole('dialog',{name:'Add an invoice'})).toBeVisible();
  await page.getByRole('dialog',{name:'Add an invoice'}).getByRole('button',{name:'Cancel'}).click();
  await page.getByRole('button',{name:/Draft reminder for invoice INV-001/}).click();
  await expect(page.getByRole('dialog',{name:'Friendly payment reminder'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Copy draft'})).toBeVisible();
});

test('repeated manual paid actions identify the correct invoice',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('button',{name:/Mark invoice INV-001 as paid \(unverified\)/})).toBeVisible();
  await expect(page.getByRole('button',{name:/Mark invoice INV-002 as paid \(unverified\)/})).toBeVisible();
});
