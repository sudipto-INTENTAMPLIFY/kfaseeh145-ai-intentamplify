const UTM=['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
const LIFECYCLE=['Anonymous','Engaged','Known Identity','Intent Signal','Lead','Qualified Lead','MQL','SQL','Opportunity'];
const read=(k,f={})=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
const id=()=>globalThis.crypto?.randomUUID?.()||`evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export const consent=()=>{try{return localStorage.getItem('ia_consent')||'unset'}catch{return'unset'}};
export const attribution=()=>read('ia_attribution',{});

export function persistAttribution(){
  const params=new URLSearchParams(globalThis.location?.search||'');
  const current=attribution();
  let changed=false;
  for(const key of UTM){const value=params.get(key);if(value){current[key]=value;changed=true}}
  if(changed){current.captured_at=new Date().toISOString();current.landing_path=globalThis.location?.pathname||'/';write('ia_attribution',current)}
  return current;
}

function ensureAnalytics(){
  if(consent()!=='granted'||typeof document==='undefined')return;
  globalThis.dataLayer=globalThis.dataLayer||[];
  const gtm=import.meta.env.VITE_GTM_ID;
  const ga4=import.meta.env.VITE_GA4_ID;
  if(gtm&&!document.querySelector(`script[data-ia-gtm="${gtm}"]`)){
    const s=document.createElement('script');s.async=true;s.dataset.iaGtm=gtm;s.src=`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtm)}`;document.head.appendChild(s);
  }
  if(ga4&&!document.querySelector(`script[data-ia-ga4="${ga4}"]`)){
    const s=document.createElement('script');s.async=true;s.dataset.iaGa4=ga4;s.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`;document.head.appendChild(s);
    globalThis.gtag=globalThis.gtag||function(){globalThis.dataLayer.push(arguments)};
    globalThis.gtag('js',new Date());globalThis.gtag('config',ga4,{send_page_view:false});
  }
}

export function setConsent(state){
  if(!['granted','denied'].includes(state))return false;
  try{localStorage.setItem('ia_consent',state)}catch{}
  if(state==='granted'){ensureAnalytics();track('consent_granted',{consent_state:'granted'})}
  return true;
}

export function track(event,params={}){
  if(consent()!=='granted')return false;
  if(event==='lifecycle_transition'&&params.from&&params.to){
    const from=LIFECYCLE.indexOf(params.from),to=LIFECYCLE.indexOf(params.to);
    if(from<0||to<0||to<=from)return false;
  }
  ensureAnalytics();
  globalThis.dataLayer=globalThis.dataLayer||[];
  globalThis.dataLayer.push({event,event_id:id(),...params});
  return true;
}
