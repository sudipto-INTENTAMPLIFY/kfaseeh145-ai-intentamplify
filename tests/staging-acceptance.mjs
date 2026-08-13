import { chromium } from 'playwright';

const base = process.env.PREVIEW_URL || 'https://kfaseeh145-ai-intentamplify-ozn4pps0x.vercel.app';
const failures = [];
const results = [];
const check = (name, ok, evidence='') => { results.push({name, ok, evidence}); if (!ok) failures.push(name); };

async function runViewport(label, width, height) {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width,height}});
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', m => { if (m.type()==='error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.message));

  const res = await page.goto(base, {waitUntil:'networkidle', timeout:30000});
  check(`${label}: page load`, res?.status()===200, `HTTP ${res?.status()}`);
  check(`${label}: H1`, await page.getByRole('heading',{level:1}).isVisible(), await page.getByRole('heading',{level:1}).innerText().catch(()=>''));
  check(`${label}: primary CTA`, await page.getByRole('button',{name:'Build Your GTM Stack'}).first().isVisible(), 'Build Your GTM Stack visible');
  check(`${label}: secondary CTA`, await page.getByRole('button',{name:'Book Strategy Session'}).first().isVisible(), 'Book Strategy Session visible');

  await page.getByRole('button',{name:'Build Your GTM Stack'}).first().click();
  await page.waitForLoadState('networkidle');
  check(`${label}: primary CTA route`, new URL(page.url()).pathname==='/pricing/build-your-stack/', page.url());
  check(`${label}: pricing comprehension`, await page.getByRole('heading',{name:/Build the GTM Stack/i}).isVisible(), 'Pricing/build stack heading visible');
  check(`${label}: canonical stacks`, await page.getByText('Discover',{exact:true}).first().isVisible() && await page.getByText('Activate',{exact:true}).first().isVisible() && await page.getByText('Accelerate',{exact:true}).first().isVisible() && await page.getByText('Enterprise',{exact:true}).first().isVisible(), 'Discover / Activate / Accelerate / Enterprise visible');

  await page.goto(new URL('/book-demo/',base).href,{waitUntil:'networkidle'});
  check(`${label}: strategy form`, await page.getByRole('heading',{name:/Map Your Buyer Evidence|See How Buyer Evidence/i}).isVisible().catch(()=>false), 'Strategy route rendered');
  const requiredInputs = await page.locator('form input[required]').count();
  check(`${label}: form validation`, requiredInputs>=6, `${requiredInputs} required inputs`);
  await page.locator('form button[type="submit"], form button').last().click();
  const invalid = await page.locator('input:invalid').count();
  check(`${label}: required validation fires`, invalid>0, `${invalid} invalid required fields`);

  await page.goto(new URL('/definitely-not-a-real-route/',base).href,{waitUntil:'networkidle'});
  const notFoundText = await page.locator('body').innerText();
  check(`${label}: 404 handling`, /Page not found|404/i.test(notFoundText), 'Unknown route has recovery state');

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
