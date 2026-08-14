import React,{useMemo,useState}from'react';
import{createPortal}from'react-dom';
import{useLocation,useNavigate}from'react-router-dom';
import{track}from'./analytics';

/*
  RESOURCE EXPERIENCE — scoped upgrade only.
  Inventory below is restricted to Intent Amplify-owned routes verified in internal GA4.
  Dates/authors/thumbnails are intentionally omitted where they were not authoritatively verified.
  Ordering uses recent internal engagement as an editorial input; raw analytics are not exposed publicly.
*/
const RESOURCE_TYPES=[
  {label:'Blogs',path:'https://intentamplify.com/blog/',description:'Practical GTM, buyer, demand and revenue-team guidance for teams turning market activity into better decisions.',cta:'Browse Blogs'},
  {label:'Corporate Presentation 2026',path:'https://intentamplify.com/mediakit/',description:'The current Intent Amplify corporate presentation and commercial overview for evaluation-stage buyers and partners.',cta:'View Corporate Presentation'},
  {label:'Ebooks',path:'https://intentamplify.com/ebooks/',description:'Long-form guides designed to help GTM teams understand a problem, evaluate an operating approach and prepare the next internal decision.',cta:'Browse Ebooks'},
  {label:'Case Studies',path:'https://intentamplify.com/case-study/',description:'Validated case-study content only. Customer outcomes or logos must remain unpublished unless evidence and permission are approved.',cta:'Browse Case Studies'},
  {label:'Newsletters',path:'https://intentamplify.com/newsletters/',description:'Recurring editorial intelligence for teams tracking buyer, market and GTM operating changes.',cta:'Browse Newsletters'},
  {label:'Whitepapers',path:'https://intentamplify.com/whitepapers/',description:'Structured point-of-view and decision frameworks for enterprise teams evaluating market, technology and GTM change.',cta:'Browse Whitepapers'},
  {label:'Expert Insights',path:'https://intentamplify.com/expert-insights/',description:'Focused practitioner perspectives that translate complex market signals into questions GTM teams can act on.',cta:'Browse Expert Insights'},
  {label:'Expert Analysis',path:'https://intentamplify.com/expert-analysises/',description:'Deeper analytical perspectives for executive and functional buyers assessing operating-model, market and technology implications.',cta:'Browse Expert Analysis'},
  {label:'Research Reports',path:'https://intentamplify.com/reports/',description:'Research-led reports for market understanding, benchmarking and executive decision support.',cta:'Browse Research Reports'}
];

const VERIFIED_RESOURCES=[
  {
    id:'ia-ebook-hub',type:'Ebook Library',title:'B2B Lead Generation eBooks',description:'Intent Amplify’s established ebook library for long-form GTM and buyer education.',topic:'GTM Education',industry:'B2B Technology',persona:'Marketing & Revenue',date:null,author:null,source:'Intent Amplify',url:'https://intentamplify.com/ebooks/',cta:'Browse Ebooks',objective:'Learn'
  },
  {
    id:'ia-report-hub',type:'Research Library',title:'B2B Demand Intelligence Reports',description:'Intent Amplify’s report library for research-led demand, market and operating insights.',topic:'Demand Intelligence',industry:'B2B Technology',persona:'CMO & GTM Leadership',date:null,author:null,source:'Intent Amplify',url:'https://intentamplify.com/reports/',cta:'Browse Reports',objective:'Understand'
  },
  {
    id:'ia-whitepaper-hub',type:'Whitepaper Library',title:'Demand Intelligence Whitepapers',description:'Whitepapers that help enterprise teams examine market, buyer and operating questions in greater depth.',topic:'Buyer Intelligence',industry:'B2B Technology',persona:'Marketing & Strategy',date:null,author:null,source:'Intent Amplify',url:'https://intentamplify.com/whitepapers/',cta:'Browse Whitepapers',objective:'Understand'
  },
  {
    id:'sap-supply-chain-webinar',type:'Webinar',title:'SAP AI Inside the Supply Chain: From Silo to Orchestration',description:'An existing Intent Amplify webinar destination focused on AI and supply-chain orchestration. Current live/on-demand status is not asserted without an approved event record.',topic:'AI & Operations',industry:'Supply Chain',persona:'Operations & Technology',date:null,author:null,source:'Intent Amplify',url:'https://intentamplify.com/landing-page/webinar/sap-ai-inside-the-supply-chain-from-silo-to-orchestration/',cta:'View Webinar',objective:'Understand'
  },
  {
    id:'dark-social',type:'Blog',title:'Dark Social: 84% of Sharing Happens Where Analytics Cannot Track It',description:'An existing Intent Amplify article examining dark-social measurement and the limits of standard attribution visibility.',topic:'Measurement',industry:'B2B Technology',persona:'Marketing & RevOps',date:null,author:null,source:'Intent Amplify',url:'https://intentamplify.com/blog/dark-social/',cta:'Read Article',objective:'Learn'
  },
  {
    id:'dmu',type:'Blog',title:'Decision Making Unit (DMU) in B2B: Roles, Strategy & Examples',description:'An existing Intent Amplify guide to B2B decision-making units and the roles that shape complex purchases.',topic:'Buying Groups',industry:'B2B Technology',persona:'ABM & Sales',date:null,author:null,source:'Intent Amplify',url:'https://intentamplify.com/blog/b2b-decision-making-unit-dmu/',cta:'Read Guide',objective:'Understand'
  },
  {
    id:'buyer-process',type:'Blog',title:'B2B Buying Process: 6 Stages, Key Stakeholders & Strategies for 2026',description:'An existing Intent Amplify guide to buying-stage progression and stakeholder context in complex B2B decisions.',topic:'Buyer Journey',industry:'B2B Technology',persona:'Marketing & Sales',date:null,author:null,source:'Intent Amplify',url:'https://intentamplify.com/blog/b2b-buying-decision-process/',cta:'Read Guide',objective:'Understand'
  },
  {
    id:'signal-based-marketing',type:'Solution Guide',title:'Signal-Based B2B Marketing',description:'An existing Intent Amplify solution page connecting intent and buyer signals to demand-generation decisions.',topic:'Intent Data',industry:'B2B Technology',persona:'Demand Generation',date:null,author:null,source:'Intent Amplify',url:'https://intentamplify.com/solutions/signal-based-b2b-marketing/',cta:'Explore Signal-Based Marketing',objective:'Inspect Evidence'
  },
  {
    id:'gtm-strategy',type:'GTM Guide',title:'Demand Intelligence & Pipeline Activation',description:'An existing Intent Amplify GTM destination connecting demand intelligence to coordinated activation.',topic:'Pipeline Activation',industry:'B2B Technology',persona:'CMO & Revenue Leadership',date:null,author:null,source:'Intent Amplify',url:'https://intentamplify.com/gtm-strategy-demand-intelligence-pipeline-activation/',cta:'Explore GTM Strategy',objective:'Explore Capability'
  },
  {
    id:'logistics-report',type:'Research Report',title:'Logistics Resilience 2026: Visibility and Risk Management',description:'An existing Intent Amplify research destination focused on logistics resilience, visibility and risk-management priorities.',topic:'Market Intelligence',industry:'Supply Chain',persona:'Operations Leadership',date:null,author:null,source:'Intent Amplify',url:'https://intentamplify.com/report/logistics-resilience-2026-visibility-risk-management/',cta:'Read Report',objective:'Understand'
  },
  {
    id:'physical-security-report',type:'Research Report',title:'Cloud, AI Video, and Access Governance Trends in Enterprise Physical Security',description:'An existing Intent Amplify research destination examining cloud, AI video and governance themes in enterprise physical security.',topic:'Security & Governance',industry:'Cybersecurity',persona:'Security Leadership',date:null,author:null,source:'Intent Amplify',url:'https://intentamplify.com/report/enterprise-physical-security-trends/',cta:'Read Report',objective:'Understand'
  },
  {
    id:'tam-tal',type:'Blog',title:'TAM vs TAL in B2B: Definitions, Formulas & How to Build a TAL',description:'An existing Intent Amplify guide to total addressable market versus target-account-list design.',topic:'ABM',industry:'B2B Technology',persona:'ABM & Strategy',date:null,author:null,source:'Intent Amplify',url:'https://intentamplify.com/blog/tam-vs-tal-in-b2b-whats-the-difference/',cta:'Read Guide',objective:'Define'
  }
];

const TOPIC_ORDER=['Buying Groups','Intent Data','ABM','Demand Intelligence','Pipeline Activation','Measurement','Buyer Journey','Market Intelligence','Security & Governance','AI & Operations'];
const INDUSTRY_ORDER=['B2B Technology','Supply Chain','Cybersecurity'];
const PERSONA_ORDER=['CMO & GTM Leadership','Marketing & Revenue','Marketing & Strategy','Demand Generation','ABM & Sales','ABM & Strategy','Marketing & Sales','Marketing & RevOps','Operations Leadership','Operations & Technology','Security Leadership'];

const uniq=(items,key,order=[])=>{
  const values=[...new Set(items.map(x=>x[key]).filter(Boolean))];
  return [...order.filter(x=>values.includes(x)),...values.filter(x=>!order.includes(x))];
};
const openTrack=item=>track('resource_open',{resource_id:item.id,resource_type:item.type,resource_topic:item.topic,resource_source:item.source,resource_objective:item.objective,placement:'resources'});

function ResourceCard({item,featured=false}){
  return <article className={featured?'resourceCard resourceFeaturedCard':'resourceCard'}>
    <div className="resourceCardTop"><span className="resourceBadge">{item.type}</span>{item.date?<time>{item.date}</time>:<span className="resourceUnverified">Publish date not verified</span>}</div>
    <h3>{item.title}</h3>
    <p>{item.description}</p>
    <dl className="resourceMeta">
      <div><dt>Topic</dt><dd>{item.topic}</dd></div>
      <div><dt>Industry</dt><dd>{item.industry}</dd></div>
      <div><dt>Role / Team</dt><dd>{item.persona}</dd></div>
      <div><dt>GTM objective</dt><dd>{item.objective}</dd></div>
      <div><dt>Author / Source</dt><dd>{item.author||item.source}</dd></div>
    </dl>
    <a className="resourceLink" href={item.url} target="_blank" rel="noreferrer" onClick={()=>openTrack(item)}>{item.cta} →</a>
  </article>
}

function FilterChips({label,values,active,onChange}){
  return <div className="resourceFilterGroup"><span>{label}</span><div className="resourceChips"><button className={active==='All'?'active':''} onClick={()=>onChange('All')}>All</button>{values.map(v=><button key={v} className={active===v?'active':''} onClick={()=>onChange(v)}>{v}</button>)}</div></div>
}

function ResourceExperience(){
  const loc=useLocation();
  const navigate=useNavigate();
  const[topic,setTopic]=useState('All');
  const[industry,setIndustry]=useState('All');
  const[persona,setPersona]=useState('All');
  const[objective,setObjective]=useState('All');
  const filtered=useMemo(()=>VERIFIED_RESOURCES.filter(x=>(topic==='All'||x.topic===topic)&&(industry==='All'||x.industry===industry)&&(persona==='All'||x.persona===persona)&&(objective==='All'||x.objective===objective)),[topic,industry,persona,objective]);
  if(loc.pathname.replace(/\/+$/,'')!=='/resources')return null;
  const target=typeof document!=='undefined'?document.querySelector('main'):null;
  if(!target)return null;

  const featured=VERIFIED_RESOURCES.find(x=>x.id==='dmu');
  const research=VERIFIED_RESOURCES.filter(x=>['Research Library','Whitepaper Library','Research Report'].includes(x.type)).slice(0,4);
  const event=VERIFIED_RESOURCES.find(x=>x.type==='Webinar');
  const related=VERIFIED_RESOURCES.filter(x=>['Blog','Solution Guide','GTM Guide'].includes(x.type)).slice(0,6);

  const reset=()=>{setTopic('All');setIndustry('All');setPersona('All');setObjective('All')};

  return createPortal(<div className="resourceExperience" aria-label="Intent Amplify resource discovery">

    <section className="resourceSection resourceIntro">
      <p className="eyebrow">RESOURCES / RESEARCH / EVENTS</p>
      <div className="resourceFeature">
        <div>
          <h2>Intelligence for the GTM decision in front of you.</h2>
          <p>Learn the market. Understand the buying context. Inspect the evidence. Explore the relevant Intent Amplify capability. Start a GTM conversation when the problem is defined.</p>
          <div className="resourceJourney" aria-label="Resource conversion journey"><span>Learn</span><b>→</b><span>Understand</span><b>→</b><span>Inspect Evidence</span><b>→</b><span>Explore Capability</span><b>→</b><span>Start a GTM Conversation</span></div>
        </div>
        <ResourceCard item={featured} featured/>
      </div>
    </section>

    <section className="resourceSection resourceAlt">
      <div className="resourceSectionHead"><div><p className="eyebrow">BROWSE BY TYPE</p><h2>One editorial front door. Clear paths to the content you need.</h2></div><p>These destinations map to existing Intent Amplify resource routes. Missing author, publish-date or thumbnail metadata is not fabricated.</p></div>
      <div className="resourceTypeGrid">{RESOURCE_TYPES.map(type=><a key={type.label} className="resourceTypeCard" href={type.path} target="_blank" rel="noreferrer"><span>{type.label}</span><p>{type.description}</p><strong>{type.cta} →</strong></a>)}</div>
    </section>

    <section className="resourceSection">
      <div className="resourceSectionHead"><div><p className="eyebrow">LATEST / HIGH-VALUE RESEARCH</p><h2>Research paths already active across Intent Amplify.</h2></div><p>Editorial ordering is informed by recent first-party site engagement, while raw analytics remain internal.</p></div>
      <div className="resourceGrid">{research.map(x=><ResourceCard key={x.id} item={x}/>)}</div>
    </section>

    <section className="resourceSection resourceAlt">
      <div className="resourceSectionHead"><div><p className="eyebrow">EVENTS / WEBINARS</p><h2>Use verified event destinations without inventing calendar status.</h2></div><p>Upcoming status, dates, speakers and registration deadlines require an approved event record before publication.</p></div>
      <div className="resourceEventGrid">
        <ResourceCard item={event} featured/>
        <div className="resourceEmpty" role="status"><strong>UPCOMING EVENTS — CONTENT DEPENDENCY</strong><p>No authoritative upcoming Intent Amplify-owned event record with approved date/time, speakers and registration destination was verified for this staging update. Existing webinar content remains discoverable without being mislabelled as upcoming.</p><a className="resourceLink" href="https://intentamplify.com/webinars-panels/" target="_blank" rel="noreferrer">Browse Webinars & Panels →</a></div>
      </div>
    </section>

    <section className="resourceSection">
      <div className="resourceSectionHead"><div><p className="eyebrow">TRENDING GTM TOPICS</p><h2>Move from broad topic interest to the account decision it should inform.</h2></div><p>Topic order uses first-party Intent Amplify engagement as an editorial input; no external market-ranking claim is made.</p></div>
      <div className="topicCloud">{uniq(VERIFIED_RESOURCES,'topic',TOPIC_ORDER).map(v=><button key={v} onClick={()=>setTopic(v)}>{v}</button>)}</div>
    </section>

    <section className="resourceSection resourceAlt">
      <div className="resourceDiscovery">
        <div><p className="eyebrow">BY INDUSTRY</p><h2>Start with market context.</h2><p>Surface resources by the operating environment the buyer is evaluating.</p><div className="topicCloud">{uniq(VERIFIED_RESOURCES,'industry',INDUSTRY_ORDER).map(v=><button key={v} onClick={()=>setIndustry(v)}>{v}</button>)}</div></div>
        <div><p className="eyebrow">BY ROLE / TEAM</p><h2>Start with the decision owner.</h2><p>Match content depth to the team responsible for the next GTM decision.</p><div className="topicCloud">{uniq(VERIFIED_RESOURCES,'persona',PERSONA_ORDER).map(v=><button key={v} onClick={()=>setPersona(v)}>{v}</button>)}</div></div>
      </div>
    </section>

    <section className="resourceSection">
      <div className="resourceSectionHead"><div><p className="eyebrow">ABM CONTENT STACK</p><h2>Content should move the account forward without pretending engagement is qualification.</h2></div><p>Resource behaviour is evidence for prioritization. It is not, by itself, MQL, SQL, opportunity, pipeline or revenue proof.</p></div>
      <div className="resourceABMStack">
        <article><span>DEFINE</span><h3>Market + TAL</h3><p>Use TAM/TAL, market and persona content to sharpen the account universe.</p><button className="textbtn" onClick={()=>setObjective('Define')}>View Define content →</button></article>
        <article><span>OBSERVE</span><h3>Engagement</h3><p>Use resource consumption as one observed signal, preserving source, recency and consent context.</p><button className="textbtn" onClick={()=>setObjective('Learn')}>View Learn content →</button></article>
        <article><span>EXPLAIN</span><h3>Buying context</h3><p>Connect topic interest with account and buying-group context before prioritization.</p><button className="textbtn" onClick={()=>setObjective('Understand')}>View Understand content →</button></article>
        <article><span>ACTIVATE</span><h3>Capability path</h3><p>Route qualified interest toward the relevant platform, program or GTM conversation.</p><button className="textbtn" onClick={()=>setObjective('Explore Capability')}>View Capability content →</button></article>
        <article><span>PROVE</span><h3>Sales acceptance</h3><p>Demo requests may create a handoff candidate. SQL status requires agreed CRM criteria and sales validation; content engagement never auto-creates SQL.</p><button className="textbtn" onClick={()=>navigate('/book-demo/')}>Book a Demo →</button></article>
      </div>
    </section>

    <section className="resourceSection resourceAlt">
      <div className="resourceSectionHead"><div><p className="eyebrow">DISCOVER VERIFIED CONTENT</p><h2>Filter by topic, industry, role or GTM objective.</h2></div><button className="textbtn" onClick={reset}>Reset filters</button></div>
      <div className="resourceFilterPanel">
        <FilterChips label="Topic" values={uniq(VERIFIED_RESOURCES,'topic',TOPIC_ORDER)} active={topic} onChange={setTopic}/>
        <FilterChips label="Industry" values={uniq(VERIFIED_RESOURCES,'industry',INDUSTRY_ORDER)} active={industry} onChange={setIndustry}/>
        <FilterChips label="Role / Team" values={uniq(VERIFIED_RESOURCES,'persona',PERSONA_ORDER)} active={persona} onChange={setPersona}/>
        <FilterChips label="GTM Objective" values={uniq(VERIFIED_RESOURCES,'objective',['Define','Learn','Understand','Inspect Evidence','Explore Capability'])} active={objective} onChange={setObjective}/>
      </div>
      {filtered.length?<div className="resourceGrid resourceGridThree">{filtered.map(x=><ResourceCard key={x.id} item={x}/>)}</div>:<div className="resourceEmpty"><strong>No verified resource matches this combination.</strong><p>Reset filters or choose a broader discovery path. No placeholder resource is created to fill an empty state.</p></div>}
    </section>

    <section className="resourceSection">
      <div className="resourceSectionHead"><div><p className="eyebrow">RELATED RESOURCES</p><h2>Continue from understanding into the next GTM decision.</h2></div><p>Related content is intentionally connected to capability exploration rather than automatic lead qualification.</p></div>
      <div className="resourceGrid resourceGridThree">{related.map(x=><ResourceCard key={x.id} item={x}/>)}</div>
      <div className="resourceConversion"><div><span className="eyebrow">BUYER INTELLIGENCE + PIPELINE ACTIVATION</span><h2>Connect what the account is learning to what your GTM team should inspect next.</h2><p>Intent Amplify connects account, buying-group, intent and engagement signals into traceable buyer evidence, then helps teams coordinate the next GTM action. Resource engagement remains an observed signal—not automatic qualification.</p></div><div className="actions"><button className="secondary" onClick={()=>navigate('/platform/')}>Explore the Platform</button><button className="primary" onClick={()=>navigate('/book-demo/')}>Book a Demo</button></div></div>
    </section>

  </div>,target);
}

export default ResourceExperience;
