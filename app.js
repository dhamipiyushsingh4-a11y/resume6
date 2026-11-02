const $ = id => document.getElementById(id);
const fields = ['name','role','email','phone','location','summary','skills','experience','education','projects','certifications'];
const sample = {
 name:'Jordan Davis', role:'Frontend Developer', email:'jordan@example.com', phone:'+91 98765 43210', location:'Pithoragarh, India',
 summary:'Motivated frontend developer with experience building responsive web interfaces, improving user experience, and collaborating across teams.',
 skills:'HTML, CSS, JavaScript, Responsive Design, Git, React, UI Design',
 experience:'Frontend Developer Intern | Example Studio | Jun 2025 – Aug 2025\\nBuilt responsive landing pages and reusable UI components.\\nImproved page load performance and fixed cross-browser issues.',
 education:'BCA | Example College | 2025',
 projects:'ATS Resume Builder — Created a browser-based resume builder with job keyword analysis and PDF export.',
 certifications:'JavaScript Fundamentals — Example Academy — 2025'
};
function value(id){return $(id).value.trim()}
function updatePreview(){
 $('p-name').textContent=value('name')||'Your Name';
 $('p-role').textContent=value('role')||'Professional Title';
 $('p-contact').textContent=[value('email'),value('phone'),value('location')].filter(Boolean).join(' · ');
 $('p-summary').textContent=value('summary');
 $('p-skills').textContent=value('skills');
 ['experience','education','projects','certifications'].forEach(k=>$('p-'+k).textContent=value(k));
 $('cert-section').style.display=value('certifications')?'':'none';
}
fields.forEach(id=>$(id).addEventListener('input',updatePreview));
$('sampleBtn').addEventListener('click',()=>{fields.forEach(k=>$(k).value=sample[k]);updatePreview()});
$('saveBtn').addEventListener('click',()=>{
 const data={};fields.forEach(k=>data[k]=$(k).value);
 localStorage.setItem('resumecraft-data',JSON.stringify(data));
 $('saveBtn').textContent='Saved ✓';setTimeout(()=>$('saveBtn').textContent='Save in this browser',1600);
});
try{const saved=JSON.parse(localStorage.getItem('resumecraft-data'));if(saved){fields.forEach(k=>{if(saved[k]!==undefined)$(k).value=saved[k]})}}catch(e){}
updatePreview();
function printResume(){window.print()}
$('printBtn').addEventListener('click',printResume);$('printTop').addEventListener('click',printResume);
document.querySelectorAll('.template-card').forEach(btn=>btn.addEventListener('click',()=>{
 document.querySelectorAll('.template-card').forEach(b=>b.classList.remove('selected'));
 btn.classList.add('selected');
 const type=btn.dataset.template;const resume=$('resume');
 resume.className='resume '+(type==='executive'?'executive':type==='classic'?'classic':type==='tech'?'tech':'modern');
 $('templateLabel').textContent=btn.querySelector('strong').textContent;
}));

// Deterministic local ATS estimate: extracts meaningful terms and compares them with resume text.
const stopWords=new Set(('the and for with you your our are will have has this that from into about ability skills skill experience years year work working role job candidate preferred required requirements responsibilities responsible including strong good excellent using use knowledge team teams a an to of in on or be is as at by we it their they who what how').split(' '));
function extractKeywords(text){
 const words=(text.toLowerCase().match(/[a-z][a-z+#.-]{1,}/g)||[]);
 const counts=new Map();
 words.forEach(w=>{const term=w.replace(/[.,]+$/,'');if(term.length>2&&!stopWords.has(term))counts.set(term,(counts.get(term)||0)+1)});
 return [...counts.entries()].sort((a,b)=>b[1]-a[1]).map(x=>x[0]).slice(0,35);
}
function resumeText(){return fields.map(k=>value(k)).join(' ').toLowerCase()}
function showReport(score,matched,missing,suggestions){
 $('report').classList.remove('hidden');document.querySelector('.empty-state').classList.add('hidden');
 $('score').textContent=score;$('scoreRing').style.background=`conic-gradient(${score>=75?'#13845b':score>=50?'#d59b2b':'#d36b50'} ${score*3.6}deg,#e8edf3 0deg)`;
 $('meterFill').style.width=score+'%';$('scoreTitle').textContent=score>=75?'Strong keyword match':score>=50?'Good starting point':'Needs improvement';
 $('scoreCaption').textContent=score>=75?'Your resume includes many terms from this job description.':score>=50?'Add relevant missing terms where they accurately reflect your experience.':'Tailor your resume more closely to the role.';
 $('matchedCount').textContent=matched.length;$('missingCount').textContent=missing.length;
 $('matched').innerHTML=matched.length?matched.map(w=>`<span class="chip">${escapeHtml(w)}</span>`).join(''):'<span class="muted">No matches found yet</span>';
 $('missing').innerHTML=missing.length?missing.slice(0,18).map(w=>`<span class="chip missing">${escapeHtml(w)}</span>`).join(''):'<span class="muted">No major gaps detected</span>';
 $('suggestions').innerHTML=suggestions.map(s=>`<li>${escapeHtml(s)}</li>`).join('');
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('analyzeBtn').addEventListener('click',async()=>{
 const jd=value('jobDescription');
 if(!jd){alert('Please paste a job description first.');return}
 const btn=$('analyzeBtn');btn.disabled=true;btn.textContent='Analyzing...';
 try{
  const keywords=extractKeywords(jd);const rtext=resumeText();
  const matched=keywords.filter(k=>rtext.includes(k));const missing=keywords.filter(k=>!rtext.includes(k));
  const score=keywords.length?Math.round(matched.length/keywords.length*100):0;
  const suggestions=[];
  if(!value('summary'))suggestions.push('Add a short professional summary tailored to this role.');
  if(!value('experience'))suggestions.push('Add relevant experience, internships, volunteering or practical work.');
  if(missing.length)suggestions.push('Include relevant missing terms only where they truthfully describe your skills or experience: '+missing.slice(0,8).join(', ')+'.');
  suggestions.push('Use measurable achievements, such as percentages, time saved, users supported or projects delivered.');
  suggestions.push('Keep headings standard (Experience, Education, Skills) and use a simple, single-column layout.');
  showReport(score,matched,missing,suggestions);
  const key=value('apiKey');
  if(key){await getAIAdvice(key,jd,matched,missing)}
 }catch(err){console.error(err);alert('Analysis could not be completed. Check your connection or API key and try again.')}
 finally{btn.disabled=false;btn.innerHTML='Analyze my resume <span>→</span>'}
});

// Job-description-to-resume generator.
// Local mode tailors wording and prioritizes skills found in the JD.
// AI mode asks Gemini to rewrite only the candidate's supplied facts.
function extractPhrases(text){
 const clean=text.replace(/\r/g,' ').replace(/[•●▪]/g,' ').replace(/\s+/g,' ');
 const phrasePatterns=[
  /\b(?:proficient|proficiency|experience|experienced|knowledge|knowledgeable|familiarity|familiar)\s+(?:in|with|of)\s+([a-z][a-z0-9+#./ -]{1,35})/gi,
  /\b(?:skills?|technologies|tools|frameworks|languages|platforms)\s*:\s*([^.;\n]+)/gi
 ];
 const found=[];
 phrasePatterns.forEach(re=>{let m;while((m=re.exec(clean))!==null){(m[1]||'').split(/,|\/| and /i).forEach(x=>{const t=x.trim().replace(/[()]+/g,'');if(t.length>2&&t.length<40)found.push(t)})}});
 return [...new Set(found.map(x=>x.toLowerCase()))];
}
function generateLocalResume(jd){
 const currentSkills=value('skills').split(',').map(s=>s.trim()).filter(Boolean);
 const keywords=extractKeywords(jd);
 const phraseSkills=extractPhrases(jd);
 const candidateText=resumeText();
 const relevant=[...phraseSkills,...keywords.filter(k=>candidateText.includes(k))];
 const ordered=[...new Set([...relevant.filter(k=>candidateText.includes(k)),...currentSkills.filter(s=>jd.toLowerCase().includes(s.toLowerCase())),...currentSkills])];
 if(ordered.length) $('skills').value=ordered.slice(0,18).join(', ');
 const titleMatch=jd.match(/(?:job title|position|role|hiring for|looking for)\s*[:\-]?\s*([A-Z][A-Za-z0-9 /&+-]{2,45})/i);
 if(titleMatch && !value('role')) $('role').value=titleMatch[1].trim();
 const role=value('role')||'Professional';
 const existingSummary=value('summary');
 const matched=keywords.filter(k=>resumeText().includes(k));
 const summaryStart=existingSummary || `Candidate targeting the ${role} position`;
 const tailored=`${summaryStart.replace(/[. ]+$/,'')}. Focused on the role's relevant requirements, including ${matched.slice(0,5).join(', ')||'the skills and experience listed below'}.`;
 $('summary').value=tailored;
 updatePreview();
 return {matched,keywords,missing:keywords.filter(k=>!resumeText().includes(k))};
}
async function generateWithGemini(key,jd){
 const candidate=fields.map(k=>k.toUpperCase()+': '+value(k)).join('\n');
 const prompt=`Create ATS-friendly resume wording using ONLY the candidate facts supplied below. Tailor the professional summary and reorder/prioritize existing skills for the job. You may improve clarity and grammar of experience/project descriptions, but must not invent employers, dates, qualifications, skills, metrics, achievements or responsibilities. Return valid JSON only with keys: role, summary, skills (array of strings), experience, projects. Keep unsupported facts out. If information is missing, leave it unchanged or omit it.\n\nCANDIDATE FACTS:\n${candidate}\n\nJOB DESCRIPTION:\n${jd}`;
 const res=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+encodeURIComponent(key),{
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json'}})
 });
 if(!res.ok)throw new Error('Gemini request failed ('+res.status+').');
 const data=await res.json();
 const raw=data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
 const parsed=JSON.parse(raw.replace(/^```json\s*|```\s*$/g,''));
 if(parsed.role)$('role').value=parsed.role;
 if(parsed.summary)$('summary').value=parsed.summary;
 if(Array.isArray(parsed.skills)&&parsed.skills.length)$('skills').value=parsed.skills.join(', ');
 if(parsed.experience)$('experience').value=parsed.experience;
 if(parsed.projects)$('projects').value=parsed.projects;
 updatePreview();
}
$('generateResumeBtn').addEventListener('click',async()=>{
 const jd=value('generateJD');
 if(!jd){alert('Please paste a job description first.');return}
 const btn=$('generateResumeBtn');const status=$('generateStatus');
 btn.disabled=true;btn.textContent='Generating...';status.textContent='Tailoring your resume...';
 try{
  const mode=value('generationMode');
  if(mode==='ai'){
   const key=value('generateApiKey');
   if(!key)throw new Error('Enter a Gemini API key or select Instant generation.');
   await generateWithGemini(key,jd);
   status.textContent='Your AI-tailored resume is ready. Review every section before downloading.';
  }else{
   const result=generateLocalResume(jd);
   status.textContent='Your resume has been tailored using your profile and job keywords. Review the content, choose a template and download PDF.';
  }
  document.querySelector('#builder').scrollIntoView({behavior:'smooth'});
 }catch(err){status.textContent=err.message;status.style.color='#bd563e'}
 finally{btn.disabled=false;btn.innerHTML='Generate my ATS resume <span>✦</span>'}
});

async function getAIAdvice(key,jd,matched,missing){
 const prompt=`You are a resume coach. Review this resume against the job description. Give 4 concise, practical suggestions. Do not invent qualifications. Point out weak or missing evidence and suggest truthful improvements.\n\nRESUME:\n${fields.map(k=>k.toUpperCase()+': '+value(k)).join('\n')}\n\nJOB DESCRIPTION:\n${jd}\n\nLocal keyword matches: ${matched.join(', ')}\nPotential missing terms: ${missing.join(', ')}`;
 const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+encodeURIComponent(key),{
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})
 });
 if(!response.ok)throw new Error('AI request failed: '+response.status);
 const data=await response.json();const answer=data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('\\n')||'No AI suggestions returned.';
 $('aiText').textContent=answer;$('aiAdvice').classList.remove('hidden');
}
