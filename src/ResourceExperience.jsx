import React,{useMemo,useState}from'react';
import{createPortal}from'react-dom';
import{useLocation,useNavigate}from'react-router-dom';
import{track}from'./analytics';

const VERIFIED_RESOURCES=[
  {
    id:'agentic-service-readiness',
    type:'Whitepaper',
    title:'Building the Enterprise Framework for Agentic Service: A Strategic Guide to Readiness, Governance, and Measurable Outcomes',
    description:'A strategic guide to enterprise agentic-service readiness, governance, trusted knowledge and measurable customer-experience outcomes.',
    topic:'AI Governance',
    industry:'Enterprise Technology',
    persona:'Enterprise Leadership',
    date:'Jun 30, 2026',
    author:'Yash Lad, Research Analyst',
    source:'Intent Amplify',
    url:'https://intentamplify.com/whitepaper/enterprise-framework-agentic-service-readiness/',
    cta:'Read Whitepaper'
  },
  {
    id:'rag-scale',
    type:'Report',
    title:'The Enterprise Guide to Scaling Retrieval Augmented Generation Beyond the Prototype',
    description:'A practical enterprise guide to trusted retrieval, governance, security, observability and the engineering disciplines required to move RAG beyond prototype.',
    topic:'Enterprise AI',
    industry:'Enterprise Technology',
    persona:'Technology & Engineering',
    date:null,
    author:'Omkar Waghmare, Research Analyst',
    source:'Intent Amplify',
    url:'https://intentamplify.com/report/enterprise-guide-scaling-retrieval-augmented-generation-rag/',
    cta:'Read Report'
  },
  {
    id:'content-discovery',
    type:'Report',
    title:'Enterprise Content Discovery in the Age of Generative Search: How Agentic RAG Is Transforming Digital Engagement',
    description:'Research on agentic RAG, governed retrieval and generative search as an enterprise content-discovery model.',
    topic:'Generative Search',
    industry:'Enterprise Technology',
    persona:'Digital & Technology',
    date:null,
    author:null,
    source:'Intent Amplify',
    url:'https://intentamplify.com/report/enterprise-content-discovery-agentic-rag-generative-search/',
    cta:'Read Report'
  },
  {
    id:'webinar-practices',
    type:'Insight',
    title:'Best Practices for Creating High-Impact B2B Webinars and Virtual Events',
    description:'An editorial guide to audience planning, content design, speaker format, promotion, interaction, follow-up and event measurement.',
    topic:'Events & Webinars',
    industry:'B2B Technology',
    persona:'Marketing & Product',
    date:null,
    author:'Florence Harrison, B2B Content Strategist',
    source:'Intent Amplify',
    url:'https://intentamplify.com/blog/best-practices-for-creating-high-impact-b2b-webinars-and-virtual-events/',
    cta:'Read Insight'
  },
  {
    id:'intent-data-saas',
    type:'Insight',
    title:'Intent Data in Action: Case Studies on Accelerating the SaaS Sales Cycle',
    description:'An editorial examination of intent-data workflows for SaaS marketing and sales teams. Performance examples inside the source are not reproduced as public proof here.',
    topic:'Intent Data',
    industry:'SaaS',
    persona:'Marketing & Sales',
    date:null,
    author:'Ricardo Hollowell, B2B Growth Strategist',
    source:'Intent Amplify',
    url:'https://intentamplify.com/blog/intent-data-saas-case-studies/',
    cta:'Read Insight'
  }
];

const uniq=(items,key)=>[...new Set(items.map(x=>x[key]).filter(Boolean))];
const openTrack=item=>track('resource_open',{resource_id:item.id,resource_type:item.type,resource_topic:item.topic,resource_source:item.source,placement:'resources'});

function ResourceCard({item,featured=false}){
  return <article className={featured?'resourceCard resourceFeaturedCard':'resourceCard'}>
    <div className="resourceCardTop"><span className="resourceBadge">{item.type}</span>{item.date?<time>{item.date}</time>:<span className="resourceUnverified">Date not verified</span>}</div>
    <h3>{item.title}</h3>
    <p>{item.description}</p>
    <dl className="resourceMeta">
      <div><dt>Topic</dt><dd>{item.topic}</dd></div>
      <div><dt>Industry</dt><dd>{item.industry}</dd></div>
      <div><dt>Role / Team</dt><dd>{item.persona}</dd></div>
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
  const filtered=useMemo(()=>VERIFIED_RESOURCES.filter(x=>(topic==='All'||x.topic===topic)&&(industry==='All'||x.industry===industry)&&(persona==='All'||x.persona===persona)),[topic,industry,persona]);
  if(loc.pathname.replace(/\/+$/,'')!=='/resources')return null;
  const target=typeof document!=='undefined'?document.querySelector('main'):null;
  if(!target)return null;
  const featured=VERIFIED_RESOURCES[0];
  const reports=VERIFIED_RESOURCES.filter(x=>x.type==='Report');
  const related=VERIFIED_RESOURCES.filter(x=>x.id!=='agentic-service-readiness'&&x.type!=='Report');
  return createPortal(<div className="resourceExperience" aria-label="Intent Amplify resource discovery">
    <section className="resourceSection resourceIntro">
      <p className="eyebrow">FEATURED INTELLIGENCE</p>
      <div className="resourceFeature"><div><h2>Evidence-led research for the next GTM decision.</h2><p>Move from learning to understanding, inspect the evidence and methodology behind a topic, then explore the relevant Intent Amplify capability or start a GTM conversation.</p></div><ResourceCard item={featured} featured/></div>
    </section>

    <section className="resourceSection resourceAlt">
      <div className="resourceSectionHead"><div><p className="eyebrow">LATEST RESEARCH</p><h2>Research and reports available from verified public sources.</h2></div><p>Items without an authoritative publish date remain visibly marked rather than assigned a fabricated date.</p></div>
      <div className="resourceGrid">{reports.map(x=><ResourceCard key={x.id} item={x}/>)}</div>
    </section>

    <section className="resourceSection">
      <div className="resourceSectionHead"><div><p className="eyebrow">UPCOMING EVENTS / WEBINARS</p><h2>Events should be discoverable only when the event record is approved.</h2></div></div>
      <div className="resourceEmpty" role="status"><strong>CONTENT DEPENDENCY</strong><p>No approved upcoming Intent Amplify-owned event or webinar inventory was verified in the authoritative sources available for this staging update. Publish an event card only after title, date/time, speaker/source, registration destination and CTA are approved.</p><button className="secondary" onClick={()=>navigate('/solutions/events-webinars/')}>Explore Event Programs</button></div>
    </section>

    <section className="resourceSection resourceAlt">
      <div className="resourceSectionHead"><div><p className="eyebrow">TRENDING GTM TOPICS</p><h2>Explore the themes represented in the verified resource set.</h2></div><p>This is a discovery taxonomy, not a claim of external market ranking.</p></div>
      <div className="topicCloud">{uniq(VERIFIED_RESOURCES,'topic').map(v=><button key={v} onClick={()=>setTopic(v)}>{v}</button>)}</div>
    </section>

    <section className="resourceSection">
      <div className="resourceDiscovery">
        <div><p className="eyebrow">BY INDUSTRY</p><h2>Start with market context.</h2><div className="topicCloud">{uniq(VERIFIED_RESOURCES,'industry').map(v=><button key={v} onClick={()=>setIndustry(v)}>{v}</button>)}</div></div>
        <div><p className="eyebrow">BY ROLE / TEAM</p><h2>Start with the decision owner.</h2><div className="topicCloud">{uniq(VERIFIED_RESOURCES,'persona').map(v=><button key={v} onClick={()=>setPersona(v)}>{v}</button>)}</div></div>
      </div>
    </section>

    <section className="resourceSection resourceAlt">
      <div className="resourceSectionHead"><div><p className="eyebrow">FEATURED GUIDE / REPORT</p><h2>From AI prototype to governed operating model.</h2></div></div>
      <ResourceCard item={VERIFIED_RESOURCES[1]} featured/>
    </section>

    <section className="resourceSection">
      <div className="resourceSectionHead"><div><p className="eyebrow">DISCOVER VERIFIED CONTENT</p><h2>Filter by topic, industry or role.</h2></div><button className="textbtn" onClick={()=>{setTopic('All');setIndustry('All');setPersona('All')}}>Reset filters</button></div>
      <div className="resourceFilterPanel">
        <FilterChips label="Topic" values={uniq(VERIFIED_RESOURCES,'topic')} active={topic} onChange={setTopic}/>
        <FilterChips label="Industry" values={uniq(VERIFIED_RESOURCES,'industry')} active={industry} onChange={setIndustry}/>
        <FilterChips label="Role / Team" values={uniq(VERIFIED_RESOURCES,'persona')} active={persona} onChange={setPersona}/>
      </div>
      {filtered.length?<div className="resourceGrid resourceGridThree">{filtered.map(x=><ResourceCard key={x.id} item={x}/>)}</div>:<div className="resourceEmpty"><strong>No verified resource matches this combination.</strong><p>Reset filters or choose a broader discovery path.</p></div>}
    </section>

    <section className="resourceSection resourceAlt">
      <div className="resourceSectionHead"><div><p className="eyebrow">RELATED RESOURCES</p><h2>Continue from evidence into execution.</h2></div><p>Learn → Understand → Inspect Evidence → Explore Capability → Start a GTM Conversation.</p></div>
      <div className="resourceGrid">{related.map(x=><ResourceCard key={x.id} item={x}/>)}</div>
      <div className="resourceConversion"><div><span className="eyebrow">BUYER INTELLIGENCE + PIPELINE ACTIVATION</span><h2>Connect what you learned to the GTM motion it should inform.</h2><p>Explore how Intent Amplify connects buyer evidence to governed activation without turning content engagement into automatic qualification.</p></div><div className="actions"><button className="secondary" onClick={()=>navigate('/platform/')}>Explore the Platform</button><button className="primary" onClick={()=>navigate('/book-demo/')}>Book Strategy Session</button></div></div>
    </section>
  </div>,target);
}

export default ResourceExperience;
