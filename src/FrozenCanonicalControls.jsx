import React,{useEffect,useState}from'react';
import{useLocation}from'react-router-dom';
import'./frozen-canonical.css';

const KEY='ia_consent';
const readConsent=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||{analytics:'unset',marketing:'unset',personalization:'unset',policy_version:'staging-v1'}}catch{return{analytics:'unset',marketing:'unset',personalization:'unset',policy_version:'staging-v1'}}};
const writeConsent=next=>{const value={...readConsent(),...next,updated_at:new Date().toISOString()};try{localStorage.setItem(KEY,JSON.stringify(value))}catch{};window.dispatchEvent(new CustomEvent('ia:consent-updated',{detail:value}));return value};

export default function FrozenCanonicalControls(){
 const location=useLocation();
 const initial=readConsent();
 const[firstChoice,setFirstChoice]=useState(initial.analytics==='unset');
 const[open,setOpen]=useState(false);
 const[analytics,setAnalytics]=useState(initial.analytics==='granted');
 const[functional,setFunctional]=useState(initial.personalization==='granted');
 const[advertising,setAdvertising]=useState(initial.marketing==='granted');
 const[nearFooter,setNearFooter]=useState(false);
 const save=(a=analytics,f=functional,m=advertising)=>{writeConsent({analytics:a?'granted':'denied',personalization:f?'granted':'denied',marketing:m?'granted':'denied'});setAnalytics(a);setFunctional(f);setAdvertising(m);setFirstChoice(false);setOpen(false)};
 useEffect(()=>{
  const enforce=()=>{
   document.querySelectorAll('.stacks article strong').forEach(el=>{
    const t=el.textContent.trim();
    if(t==='$2,500 / month'||t==='$2,500/month')el.textContent='Starting at $2,500/month';
    if(t==='$5,000 / month'||t==='$5,000/month')el.textContent='Starting at $5,000/month';
   });
   document.querySelectorAll('form').forEach(form=>{
    if(form.querySelector('[data-marketing-consent]'))return;
    const submit=form.querySelector('button[type="submit"],button.primary');
    if(!submit)return;
    const label=document.createElement('label');label.className='consent frozenMarketingConsent';label.dataset.marketingConsent='true';
    const box=document.createElement('input');box.type='checkbox';box.name='marketing_consent';box.value='granted';
    label.append(box,document.createTextNode(' I would like to receive relevant Intent Amplify marketing communications. This is optional and separate from this service request.'));
    submit.parentNode.insertBefore(label,submit);
   });
  };
  enforce();const mo=new MutationObserver(enforce);mo.observe(document.body,{subtree:true,childList:true});return()=>mo.disconnect();
 },[location.pathname]);
 useEffect(()=>{const footer=document.querySelector('footer');if(!footer)return;const io=new IntersectionObserver(([entry])=>setNearFooter(entry.isIntersecting),{rootMargin:'0px 0px 120px 0px'});io.observe(footer);return()=>io.disconnect()},[location.pathname]);
 return <>
  <a className={`frozenDemoCta ${(nearFooter||firstChoice||open)?'yielded':''}`} href="/book-demo/" aria-label="Intent Amplify — Book a Demo"><span className="frozenMark" aria-hidden="true">IA</span><span className="frozenBrand">INTENT AMPLIFY</span><strong>Book a Demo</strong></a>
  {firstChoice&&<aside className="frozenConsentBanner" aria-label="Cookie preferences"><div><strong>Cookie preferences</strong><p>Strictly Necessary cookies are always active. Choose whether to allow Analytics, Functional, and Advertising / Targeting technologies.</p></div><div className="frozenConsentActions"><button onClick={()=>save(false,false,false)}>Reject Non-Essential</button><button onClick={()=>setOpen(true)}>Manage Preferences</button><button className="primary" onClick={()=>save(true,true,true)}>Accept All</button></div></aside>}
  {open&&<div className="frozenConsentBackdrop" role="presentation"><section className="frozenConsentPanel" role="dialog" aria-modal="true" aria-labelledby="cookie-title"><h2 id="cookie-title">Cookie Preferences</h2><label><input type="checkbox" checked disabled/> Strictly Necessary</label><label><input type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)}/> Analytics</label><label><input type="checkbox" checked={functional} onChange={e=>setFunctional(e.target.checked)}/> Functional</label><label><input type="checkbox" checked={advertising} onChange={e=>setAdvertising(e.target.checked)}/> Advertising / Targeting</label><div className="frozenConsentActions"><button onClick={()=>save(false,false,false)}>Reject Non-Essential</button><button className="primary" onClick={()=>save()}>Save Preferences</button><button onClick={()=>save(true,true,true)}>Accept All</button></div></section></div>}
  {!firstChoice&&!open&&<button className="frozenCookiePreferences" onClick={()=>setOpen(true)}>Cookie Preferences</button>}
 </>;
}
