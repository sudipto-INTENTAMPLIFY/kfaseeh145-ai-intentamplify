import { chromium } from 'playwright';

const base = process.env.PREVIEW_URL || 'https://kfaseeh145-ai-intent-git-6c0d4d-sudipto-intentamplifys-projects.vercel.app';
const failures = [];
const results = [];
const check = (name, ok, evidence='') => { results.push({name, ok, evidence}); if (!ok) failures.push(name); };

async function visible(locator){ try { return await locator.isVisible({timeout:5000}); } catch { return false; } }

async function runViewport(label, width, height) {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width,height}});
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', m => { if (m.type()==='error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.message));

  const res = await page.goto(base, {waitUntil:'networkidle', timeout:30000});
  const bodyText = (await page.locator('body').innerText().catch(()=>'' )).slice(0,1200);
  check(`${label}: page load`, res?.status()===200, `HTTP ${res?.status()}`);
  check(`${label}: H1`, await visible(page.getByRole('heading',{level:1}).first()), await page.getByRole('heading',{level:1}).first().innerText().catch(()=>bodyText));

  const primary = page.getByRole('button',{name:'Build Your GTM Stack'}).first();
  const secondary = page.getByRole('button',{name:'Book Strategy Session'}).first();
  const primaryVisible = await visible(primary);
  const secondaryVisible = await visible(secondary);
  check(`${label}: primary CTA`, primaryVisible, primaryVisible?'Build Your GTM Stack visible':`body=${bodyText}`);
  check(`${label}: secondary CTA`, secondaryVisible, secondaryVisible?'Book Strategy Session visible':`body=${bodyText}`);

  if(primaryVisible){
    await primary.click();
    await page.waitForLoadState('networkidle');
    check(`${label}: primary CTA route`, new URL(page.url()).pathname==='/pricing/build-your-stack/', page.url());
    check(`${label}: pricing comprehension`, await visible(page.getByRole('heading',{name:/Build the GTM Stack/i}).first()), 'Pricing/build stack heading visible');
    check(`${label}: canonical stacks`, await visible(page.getByText('Discover',{exact:true}).first()) && await visible(page.getByText('Activate',{exact:true}).first()) && await visible(page.getByText('Accelerate',{exact:true}).first()) && await visible(page.getByText('Enterprise',{exact:true}).first()), 'Discover / Activate / Accelerate / Enterprise visible');
  }

  await page.goto(new URL('/book-demo/',base).href,{waitUntil:'networkidle'});
  check(`${label}: strategy form`, await visible(page.getByRole('heading',{name:/Map Your Buyer Evidence|See How Buyer Evidence/i}).first()), 'Strategy route rendered');
  const requiredInputs = await page.locator('form input[required]').count();
  check(`${label}: form validation`, requiredInputs>=6, `${requiredInputs} required inputs`);
  const submit = page.locator('form button').last();
  if(await visible(submit)) await submit.click();
  const invalid = await page.locator('input:invalid').count();
  check(`${label}: required validation fires`, invalid>0, `${invalid} invalid required fields`);

  await page.goto(new URL('/definitely-not-a-real-route/',base).href,{waitUntil:'networkidle'});
  const notFoundText = await page.locator('body').innerText().catch(()=> '');
  check(`${label}: 404 handling`, /Page not found|404/i.test(notFoundText), notFoundText.slice(0,500));

  const overflow = await page.evaluate(()=>document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  check(`${label}: responsive overflow`, !overflow, `scrollWidth=${await page.evaluate(()=>document.documentElement.scrollWidth)}, clientWidth=${await page.evaluate(()=>document.documentElement.clientWidth)}`);

  await page.keyboard.press('Tab');
  const activeTag = await page.evaluate(()=>document.activeElement?.tagName || '');
  check(`${label}: keyboard focus`, ['A','BUTTON','INPUT'].includes(activeTag), `active=${activeTag}`);
  check(`${label}: console errors`, consoleErrors.length===0, consoleErrors.join(' | '));
  check(`${label}: runtime errors`, pageErrors.length===0, pageErrors.join(' | '));
  await browser.close();
}

await runViewport('desktop',1440,1000);
await runViewport('mobile',390,844);
console.log(JSON.stringify({preview:base,results,failures},null,2));
if (failures.length) process.exit(1);
