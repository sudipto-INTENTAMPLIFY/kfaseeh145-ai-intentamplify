const WINDOW=60_000,LIMIT=5,buckets=new Map();
const json=(res,status,body)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');return res.end(JSON.stringify(body))};
const clean=v=>typeof v==='string'?v.trim().slice(0,500):'';
export default async function handler(req,res){
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{ok:false,error:'method_not_allowed'})}
 const ip=(req.headers['x-forwarded-for']||'unknown').split(',')[0];const t=Date.now();const b=buckets.get(ip)||[];const recent=b.filter(x=>t-x<WINDOW);if(recent.length>=LIMIT)return json(res,429,{ok:false,error:'rate_limited'});recent.push(t);buckets.set(ip,recent);
 const body=req.body||{};if(body.website)return json(res,200,{ok:true,status:'accepted'});
 const first_name=clean(body.first_name),last_name=clean(body.last_name),work_email=clean(body.work_email).toLowerCase(),company=clean(body.company),role=clean(body.role),region=clean(body.region),objective=clean(body.objective);
 if(!first_name||!last_name||!company||!role||!region||!objective||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(work_email))return json(res,400,{ok:false,error:'validation_error'});
 const record={first_name,last_name,work_email,company,role,region,objective,form_id:clean(body.form_id)||'contact',consent:body.consent||{},attribution:body.attribution||{},submitted_at:new Date().toISOString(),routing_class:'specialist_review',source_system:'intentamplify_staging',crm_handoff_status:'isolated_staging'};
 // Production/CRM writes are deliberately prohibited from this staging endpoint.
 console.info(JSON.stringify({event:'staging_form_received',form_id:record.form_id,submitted_at:record.submitted_at,crm_handoff_status:record.crm_handoff_status}));
 return json(res,202,{ok:true,status:'accepted',routing_class:record.routing_class,crm_handoff_status:record.crm_handoff_status});
}
