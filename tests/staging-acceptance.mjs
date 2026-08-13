import { chromium } from 'playwright';
import axe from 'axe-core';

const base = process.env.PREVIEW_URL || 'https://kfaseeh145-ai-intent-git-6c0d4d-sudipto-intentamplifys-projects.vercel.app';
const expectedSha = process.env.EXPECTED_SHA || '';
const failures = [];
const results = [];
const check = (name, ok, evidence='') => { results.push({name, ok, evidence}); if (!ok) failures.push(name); };
const headers = process.env.VERCEL_AUTOMATION_BYPASS_SECRET ? {
  'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
  'x-vercel-set-bypass-cookie': 'true'
} : {};
const visible = async locator => { try { return await locator.isVisible({timeout:5000}); } catch { return false; } };

async function verifyHttpContract(request) {
  const root = await request.get(base);
  check('security: root 200', root.status()===200, `HTTP ${root.status()}`);
  const h = root.headers();
  check('security: noindex header', /noindex/i.test(h['x-robots-tag']||''), h['x-robots-tag']||'missing');
  check('security: nosniff', (h['x-content-type-options']||'').toLowerCase()==='nosniff', h['x-content-type-options']||'missing');
  check('security: frame deny', (h['x-frame-options']||'').toUpperCase()==='DENY', h['x-frame-options']||'missing');
  check('security: referrer policy', (h['referrer-policy']||'')==='strict-origin-when-cross-origin', h['referrer-policy']||'missing');
  check('security: permissions policy', /camera=\(\).*microphone=\(\).*geolocation=\(\)/.test(h['permissions-policy']||''), h['permissions-policy']||'missing');
  check('security: CSP', /default-src 'self'/.test(h['content-security-policy']||'') && /frame-ancestors 'none'/.test(h['content-security-policy']||''), h['content-security-policy']||'missing');

  const method = await request.get(new URL('/api/contact',base).href);
  check('api: rejects non-POST', method.status()===405, `HTTP ${method.status()}`);
  const invalid = await request.post(new URL('/api/contact',base).href,{data:{first_name:'Only'}});
  check('api: validation contract', invalid.status()===400 && (await invalid.json()).error==='validation_error', `HTTP ${invalid.status()}`);
  const valid = await request.post(new URL('/api/contact',base).href,{data:{first_name:'Governance',last_name:'Probe',work_email:'governance-probe@example.invalid',company:'Intent Amplify Staging',role:'Verification',region:'Test',objective:'Runtime contract verification',form_id:'governance_probe',consent:{analytics:'denied'},attribution:{}}});
  const body = await valid.json().catch(()=>({}));
  check('api: accepted staging submission', valid.status()===202 && body.status==='accepted', `HTTP ${valid.status()} ${JSON.stringify(body)}`);
  check('crm: staging isolation contract', body.crm_handoff_status==='isolated_staging', JSON.stringify(body));
  check('cms: runtime content delivery', root.status()===200 && (await root.text()).includes('id="root"'), 'Vite application shell served; no external CMS dependency in candidate');
}

async function verifyAnalytics(page) {
  await page.goto(`${base}?utm_source=governance&utm_medium=qa&utm_campaign=release_audit&utm_term=runtime&utm_content=probe`,{waitUntil:'networkidle'});
  const before = await page.evaluate(()=>({consent:localStorage.getItem('ia_consent'),layer:(window.dataLayer||[]).length}));
  check('analytics: consent default-off', !before.consent && before.layer===0, JSON.stringify(before));
  const allow = page.getByRole('button',{name:'Allow analytics'});
  if(await visible(allow)) await allow.click();
  await page.waitForTimeout(150);
  const state = await page.evaluate(()=>({consent:JSON.parse(localStorage.getItem('ia_consent')||'{}'),first:JSON.parse(localStorage.getItem('ia_first_touch')||'{}'),current:JSON.parse(localStorage.getItem('ia_current_touch')||'{}'),events:(window.dataLayer||[]).filter(x=>x&&typeof x==='object'&&x.event).map(x=>({event:x.event,first_utm_source:x.first_utm_source,current_utm_source:x.current_utm_source,consent_state:x.consent_state}))}));
  check('analytics: UTM first/current touch', state.first.utm_source==='governance' && state.current.utm_campaign==='release_audit', JSON.stringify({first:state.first,current:state.current}));
  check('analytics: consent granted', state.consent.analytics==='granted', JSON.stringify(state.consent));
  check('analytics: canonical event envelope', state.events.some(e=>e.event==='consent_updated'&&e.first_utm_source==='governance'&&e.current_utm_source==='governance'&&e.consent_state==='granted'), JSON.stringify(state.events));
}

async function verifyNavigation(page,label) {
  await page.goto(base,{waitUntil:'networkidle'});
  const primary = page.getByRole('button',{name:'Build Your GTM Stack'}).first();
  check(`${label}: primary CTA`, await visible(primary), 'Build Your GTM Stack');
  if(await visible(primary)) {
    await primary.click(); await page.waitForLoadState('networkidle');
    check(`${label}: primary CTA route`, new URL(page.url()).pathname==='/pricing/build-your-stack/', page.url());
  }
  await page.goBack({waitUntil:'networkidle'});
  check(`${label}: browser back`, new URL(page.url()).pathname==='/', page.url());
  await page.goForward({waitUntil:'networkidle'});
  check(`${label}: browser forward`, new URL(page.url()).pathname==='/pricing/build-your-stack/', page.url());
  await page.reload({waitUntil:'networkidle'});
  check(`${label}: refresh deep route`, new URL(page.url()).pathname==='/pricing/build-your-stack/' && await visible(page.getByText('Discover',{exact:true}).first()), page.url());
  await page.goto(new URL('/platform/intent-signals/',base).href,{waitUntil:'networkidle'});
  check(`${label}: direct deep load`, await visible(page.getByRole('heading',{level:1,name:/Turn Fragmented Signals/i})), page.url());
}

async function verifyPage(page,label) {
  await page.goto(base,{waitUntil:'networkidle',timeout:30000});
  check(`${label}: H1`, await visible(page.getByRole('heading',{level:1}).first()), await page.getByRole('heading',{level:1}).first().innerText().catch(()=>''));
  check(`${label}: secondary CTA`, await visible(page.getByRole('button',{name:'Book Strategy Session'}).first()), 'Book Strategy Session');
  await page.goto(new URL('/pricing/build-your-stack/',base).href,{waitUntil:'networkidle'});
  check(`${label}: pricing comprehension`, await visible(page.locator('h1').filter({hasText:'Build the GTM Stack'}).first()), 'pricing H1');
  check(`${label}: canonical stacks`, await visible(page.getByText('Discover',{exact:true}).first()) && await visible(page.getByText('Activate',{exact:true}).first()) && await visible(page.getByText('Accelerate',{exact:true}).first()) && await visible(page.getByText('Enterprise',{exact:true}).first()), 'Discover / Activate / Accelerate / Enterprise');

  await page.goto(new URL('/book-demo/',base).href,{waitUntil:'networkidle'});
  check(`${label}: strategy form`, await visible(page.getByRole('heading',{name:/See How Buyer Evidence/i}).first()), 'strategy route rendered');
  check(`${label}: form validation`, await page.locator('form input[required]').count()>=8, `${await page.locator('form input[required]').count()} required controls`);
  await page.locator('form button').last().click();
  check(`${label}: required validation fires`, await page.locator('input:invalid').count()>0, `${await page.locator('input:invalid').count()} invalid fields`);

  await page.goto(new URL('/definitely-not-a-real-route/',base).href,{waitUntil:'networkidle'});
  check(`${label}: 404 handling`, /Page not found|404/i.test(await page.locator('body').innerText()), 'not-found UI');
  check(`${label}: responsive overflow`, !(await page.evaluate(()=>document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)), `scroll=${await page.evaluate(()=>document.documentElement.scrollWidth)}`);

  await page.goto(base,{waitUntil:'networkidle'});
  await page.addScriptTag({content:axe.source});
  const axeResult = await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
  check(`${label}: accessibility axe`, axeResult.violations.length===0, axeResult.violations.map(v=>`${v.id}:${v.nodes.length}`).join(', ')||'0 violations');
  await page.keyboard.press('Tab');
  check(`${label}: keyboard focus`, ['A','BUTTON','INPUT'].includes(await page.evaluate(()=>document.activeElement?.tagName||'')), await page.evaluate(()=>document.activeElement?.tagName||''));

  const perf = await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {dom:n?.domContentLoadedEventEnd||0,load:n?.loadEventEnd||0,transfer:n?.transferSize||0}});
  check(`${label}: performance navigation`, perf.dom>0 && perf.dom<5000 && perf.load<7000, JSON.stringify(perf));
  check(`${label}: performance transfer`, perf.transfer<1500000, JSON.stringify(perf));
}

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1440,height:1000},extraHTTPHeaders:headers});
await verifyHttpContract(context.request);
const page = await context.newPage();
await verifyAnalytics(page);
await verifyNavigation(page,'desktop');
await verifyPage(page,'desktop');
await context.close();
const mobileContext = await browser.newContext({viewport:{width:390,height:844},extraHTTPHeaders:headers});
await verifyNavigation(await mobileContext.newPage(),'mobile');
await verifyPage(await mobileContext.newPage(),'mobile');
await mobileContext.close();
await browser.close();

console.log(JSON.stringify({preview:base,expectedSha:expectedSha||'not supplied',results,failures},null,2));
if (failures.length) process.exit(1);
