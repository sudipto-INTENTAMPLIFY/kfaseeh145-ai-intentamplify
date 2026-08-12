const UTM=['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
const LIFECYCLE=['Anonymous','Engaged','Known Identity','Intent Signal','Lead','Qualified Lead','MQL','SQL','Opportunity'];
const read=(k,f={})=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
const id=()=>globalThis.crypto?.randomUUID?.()||`evt_${Date.now()}_${Math.random().toString(36).slice(2