import {units,questions} from './content.js';
import {STORAGE_KEY,freshState,validState,localDay,latestAttempts,dueQuestions,reviewQuestions,unitProgress,addAttempt,weeklySessions,escapeHTML as esc,markdownReport} from './core.js';

const $=s=>document.querySelector(s);
let state=freshState(),storageAvailable=true;
try {const raw=localStorage.getItem(STORAGE_KEY);if(raw){const parsed=JSON.parse(raw);if(validState(parsed))state=parsed;else storageAvailable=false;}} catch{storageAvailable=false;}
let view='today',practice=null,lastFocus=null;
const icons={today:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',courses:'<path d="M4 4h7a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4z"/><path d="M14 7a3 3 0 0 1 3-3h4v15h-3a4 4 0 0 0-4 2"/>',review:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/><path d="M12 7v5l3 2"/>',records:'<path d="M5 3h11l3 3v15H5z"/><path d="M9 10h6M9 14h6M9 18h4"/>'};
function icon(id){return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[id]||icons.courses}</svg>`;}
const navs=[['today','今日学习'],['courses','知识地图'],['review','错题与复习'],['records','学习记录']];
function notify(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
function save(next){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));state=next;storageAvailable=true;return true;}catch{state=next;storageAvailable=false;notify('浏览器未能保存记录。请先导出备份；本次仍可继续练习。');return false;}}
function title(kicker,title,desc,extra=''){return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div>${extra}</div>`;}
function dateLabel(){return new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'long'}).format(new Date());}
function recommendedUnit(){return units.find(u=>unitProgress(state,u.id,questions).independent<questions.filter(q=>q.unit===u.id).length)||units[0];}
function stat(label,value,small,cls=''){return `<div class="stat ${cls}"><span>${label}</span><strong>${value}</strong><small>${small}</small></div>`;}
function card(u,compact=false){const p=unitProgress(state,u.id,questions);return `<button class="unit-card ${compact?'compact':''}" data-action="lesson" data-id="${u.id}"><div class="unit-top"><span class="unit-icon ${u.color}">${u.icon}</span><span class="unit-number">UNIT ${u.number}</span><span class="card-arrow">↗</span></div><h3>${u.title}</h3><p>${u.subtitle}</p><div class="unit-meta"><span>${p.seen?`已练 ${p.seen}/${p.total} 题`:'从概念开始'}</span><span>约 ${u.minutes} 分钟</span></div><div class="progress-line"><span style="width:${p.percent}%"></span></div><span class="sr-only">最近无提示答对 ${p.independent}/${p.total}</span></button>`;}
function render(){
  if(!navs.some(x=>x[0]===view))view='today';
  $('#navigation').innerHTML=navs.map(([id,label])=>`<a href="#${id}" class="nav-item ${view===id?'active':''}" ${view===id?'aria-current="page"':''}>${icon(id)}<span>${label}</span>${id==='review'&&reviewQuestions(state,questions).length?`<b>${reviewQuestions(state,questions).length}</b>`:''}</a>`).join('');
  $('#page-title').textContent=navs.find(x=>x[0]===view)[1];
  $('#main').innerHTML=({today:today,courses:courses,review:review,records:records}[view])();
  if(!storageAvailable)$('#main').insertAdjacentHTML('afterbegin','<div class="storage-warning" role="alert">当前浏览器记录暂未可靠保存，请到「学习记录」导出备份。已有不可识别的存档不会在打开时被删除。</div>');
}
function today(){
 const u=recommendedUnit(),sessions=weeklySessions(state),latest=latestAttempts(state),due=dueQuestions(state,questions),ind=[...latest.values()].filter(a=>a.correct&&!a.hinted).length;
 const practicedDays=new Set(state.attempts.map(a=>localDay(a.at))).size;
 return title('YOUR LEARNING JOURNEY','把每一步，真正弄懂。','不急着做更多题。先读懂、想清楚，再独立完成。',`<span class="date-chip">${dateLabel()}</span>`)+`
 <section class="dashboard-grid"><div class="hero-card"><div class="hero-copy"><span class="pill"><i></i> 本次推荐 · ${u.number==='01'?'打好前置基础':'跟着掌握情况前进'}</span><h2>${u.title}</h2><p>${u.subtitle}。<br>从一个小目标开始，把“看懂”变成“会做”。</p><button class="primary" data-action="lesson" data-id="${u.id}">开始这次学习 <span>↗</span></button><div class="hero-foot">约 ${u.minutes} 分钟 <span>·</span> 概念卡 + 5 道练习</div></div><div class="math-art" aria-hidden="true"><span class="art-label">从指数，走向对数</span><svg viewBox="0 0 300 230"><defs><pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#dfc1ad" stroke-width=".6"/></pattern></defs><rect x="0" y="0" width="300" height="230" fill="url(#grid)"/><path d="M20 182H285M72 215V16" stroke="#a2816c" stroke-width="1.2"/><path d="M84 214C91 170 107 137 132 111S197 73 278 56" fill="none" stroke="#c06143" stroke-width="3.2"/><circle cx="105" cy="147" r="5" fill="#c06143"/><path d="M105 147V182" stroke="#bc957c" stroke-dasharray="4 4"/><text x="115" y="133" fill="#8b503b" font-size="13" font-family="Georgia">y = logₐ x</text><text x="111" y="202" fill="#a2816c" font-size="11">a &gt; 1</text><text x="285" y="174" fill="#a2816c" font-size="12">x</text><text x="81" y="20" fill="#a2816c" font-size="12">y</text></svg><div class="formula-tag">a<sup>x</sup> = b <span>⇄</span> log<sub>a</sub>b = x</div></div></div>
 <aside class="weekly-card"><div class="section-kicker">小步学习，长期积累</div><h3>每周两次就好</h3><p>给自己留一点思考的时间。</p><div class="session-row"><span class="session-dot ${sessions>=1?'done':''}">${sessions>=1?'✓':'01'}</span><div><strong>理解与尝试</strong><small>读懂概念，找到卡住的一步</small></div></div><div class="session-connector"></div><div class="session-row"><span class="session-dot ${sessions>=2?'done':''}">${sessions>=2?'✓':'02'}</span><div><strong>独立完成与复测</strong><small>换一道题，验证是否真的会了</small></div></div><div class="weekly-footer">本周已在 <strong>${sessions}</strong> 天完成学习 <span>${sessions>=2?'本周目标已达成 ✓':'目标 2 天'}</span></div></aside></section>
 <section class="stats-row" aria-label="学习概况">${stat('最近无提示答对',`${ind}<em> / ${questions.length}</em>`,'按每题最近一次作答统计')}${stat('到期复习',due.length,'复习安排嵌入下次学习','stat-review')}${stat('练习过的天数',practicedDays,'每一次认真思考，都算数')}</section>
 <div class="section-heading"><div><span class="eyebrow">BUILD YOUR FOUNDATION</span><h2>从这里，搭起知识的桥</h2></div><a href="#courses" class="text-link">全部 6 个单元 <span>→</span></a></div><section class="unit-grid home-units">${units.slice(0,3).map(u=>card(u,true)).join('')}</section>
 <section class="bottom-note"><span class="note-spark">✳</span><div><strong>会解释，才更接近会运用。</strong><p>每做完一道题，问自己一句：这一步为什么成立？</p></div><button class="text-button" data-action="note">记下一个疑问 ↗</button></section>`;
}
function courses(){return title('KNOWLEDGE MAP','基础连起来，思路就清楚了。','建议依次学习前四个单元；对数函数学到后再练。读题逻辑随时回顾。')+`<div class="map-note"><span>学习路线</span> 指数基础 <b>→</b> 对数定义 <b>→</b> 运算法则 <b>→</b> 条件检查 <b>→</b> 对数函数</div><section class="unit-grid">${units.map(u=>card(u)).join('')}</section><p class="fineprint">进度条表示最近一次无提示答对的题数比例，不代表章节掌握率。这里的题目都可以自由学习。</p>`;}
function review(){
 const qs=reviewQuestions(state,questions),due=dueQuestions(state,questions),latest=latestAttempts(state);
 return title('REVIEW & REFLECT','让错题，变成下一次的把握。','答错或用过提示的题，会留在这里。先自己重做，再查看解释。',`<button class="primary small" data-action="note">＋ 添加自己的错题</button>`)+`
 <div class="review-banner"><div><span class="eyebrow">SPACED PRACTICE</span><h2>${due.length?'有 '+due.length+' 道题到期复习':'复习，不必等到忘光'}。</h2><p>答错后约 1 天、提示后答对约 3 天、无提示答对约 7 天安排复测。到期后在下一次学习完成即可。</p></div><button class="secondary" data-action="due" ${due.length?'':'disabled'}>${due.length?'开始到期复测 →':'暂时没有到期题'}</button></div>
 <div class="section-heading"><h2>练习中需要回顾 <span class="count">${qs.length}</span></h2>${qs.length?'<button class="text-button" data-action="review-all">逐题重做 →</button>':''}</div>
 ${qs.length?`<div class="review-list">${qs.map(q=>{const a=latest.get(q.id);return `<button class="review-item" data-action="question" data-id="${q.id}"><span class="review-symbol">${a.correct?'?':'↻'}</span><div><span class="tag">${q.skill}</span><h3>${q.prompt}</h3><small>${a.correct?'提示后答对 · 再独立试一次':'上次未答对 · 回到第一次卡住的地方'}</small></div><span class="row-arrow">→</span></button>`;}).join('')}</div>`:empty('留一点空间，给新的理解。','完成练习后，需要回顾的题会出现在这里。','去选一个单元','courses')}
 <div class="section-heading"><h2>我的纸笔错题 <span class="count">${state.notes.length}</span></h2></div>
 ${state.notes.length?`<div class="notes-grid">${state.notes.slice().reverse().map(n=>`<article class="personal-note"><div class="note-head"><span class="tag">${n.reviewed?'已复习':'待复习'}</span><small>${localDay(n.at)}</small></div><h3>${esc(n.title)}</h3><p>${esc(n.body).replace(/\n/g,'<br>')}</p>${n.image?`<button class="photo-button" data-action="photo" data-id="${esc(n.id)}"><img src="${n.image}" alt="自己上传的错题照片" loading="lazy"><span>点击查看大图</span></button>`:''}<button class="text-button" data-action="review-note" data-id="${esc(n.id)}">${n.reviewed?'改为待复习':'我已独立复习过'} ${n.reviewed?'↺':'✓'}</button></article>`).join('')}</div>`:'<div class="small-empty">拍下纸笔过程，再写一句“我卡在哪里”。照片只保存在当前浏览器。</div>'}`;
}
function empty(h,p,label,target){return `<div class="empty-state"><span>∴</span><h3>${h}</h3><p>${p}</p><a class="secondary" href="#${target}">${label} →</a></div>`;}
function records(){const latest=latestAttempts(state),done=state.attempts.length;
 return title('YOUR LEARNING RECORD','把进步，留得下来。','练习与错题保存在当前浏览器。换设备或清理浏览器前，请导出 JSON 备份。')+`
 <section class="stats-row">${stat('累计作答',done,'包含重做，不等于新题数量')}${stat('已接触题目',latest.size,`共 ${questions.length} 道原创练习`)}${stat('已完成学习',state.sessions.length,'完成一次题组，记录一次')}</section>
 <section class="panel"><div class="section-heading"><h2>单元学习证据</h2><span class="tag">最近一次表现</span></div><div class="progress-table">${units.map(u=>{const p=unitProgress(state,u.id,questions);return `<div class="progress-row"><span class="unit-icon ${u.color}">${u.icon}</span><div><strong>${u.title}</strong><small>已练 ${p.seen}/${p.total} · 无提示答对 ${p.independent}/${p.total}</small></div><div class="progress-line"><span style="width:${p.percent}%"></span></div><button class="text-button" data-action="lesson" data-id="${u.id}">继续 →</button></div>`;}).join('')}</div><p class="fineprint">同一道题重做正确不等于陌生题迁移通过。请结合纸笔作答、解释和隔周复测判断理解。</p></section>
 <section class="panel backup-panel"><div><span class="eyebrow">TAKE YOUR PROGRESS WITH YOU</span><h2>给认真学过的内容，留一份备份。</h2><p>Markdown 适合发给老师、导入 Obsidian；JSON 包含错题照片，可在另一台设备恢复。</p></div><div class="backup-actions"><button class="primary" data-action="export-md">导出 Markdown ↗</button><button class="secondary" data-action="export-json">备份 JSON ↓</button><label class="secondary file-label">恢复备份 ↑<input id="import-file" type="file" accept="application/json,.json"></label></div></section>
 <div class="records-foot"><button class="text-button" data-action="privacy">记录与隐私说明 ↗</button><button class="text-button danger" data-action="reset">清空本机学习记录</button></div>`;
}
function modal(html,wide=false){lastFocus=document.activeElement;$('#modal-root').innerHTML=`<div class="modal-backdrop"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="学习窗口" tabindex="-1">${html}</section></div>`;document.body.classList.add('modal-open');$('.modal').focus();}
function closeModal(){practice=null;$('#modal-root').innerHTML='';document.body.classList.remove('modal-open');render();if(lastFocus?.isConnected)lastFocus.focus();}
function closeButton(){return '<button class="close-button" data-action="close" aria-label="关闭窗口">×</button>';}
function lesson(id){const u=units.find(u=>u.id===id);if(!u)return;
 modal(`${closeButton()}<div class="lesson-header"><span class="unit-icon large ${u.color}">${u.icon}</span><div class="eyebrow">UNIT ${u.number} · 概念先行</div><h2>${u.title}</h2><p>${u.subtitle}</p></div><div class="lesson-points">${u.points.map(([h,p],i)=>`<article><span>0${i+1}</span><div><h3>${h}</h3><p class="math">${p}</p></div></article>`).join('')}</div><div class="worked-example"><span class="eyebrow">一起看一个例子</span><h3 class="math">${u.example.prompt}</h3><ol>${u.example.steps.map(s=>`<li class="math">${s}</li>`).join('')}</ol></div><div class="lesson-summary">记住这一句：${u.summary}</div><div class="modal-actions"><button class="primary" data-action="practice-unit" data-id="${u.id}">我来独立试一试 →</button><span>5 道题 · 先纸笔，再选择</span></div>`,true);
}
function startPractice(qs,label){if(!qs.length)return;practice={qs,index:0,label,selected:null,hints:0,answered:false,results:[]};if(!lastFocus)lastFocus=document.activeElement;showQuestion();}
function showQuestion(){const p=practice,q=p.qs[p.index];
 const html=`${closeButton()}<div class="practice-top"><span class="eyebrow">${esc(p.label)}</span><span>${p.index+1} / ${p.qs.length}</span></div><div class="progress-line practice-progress"><span style="width:${p.index/p.qs.length*100}%"></span></div><span class="tag">${q.skill}</span><h2 class="question-title math">${q.prompt}</h2><p class="question-instruction">先在纸上写出过程，再选答案。也试着说出你的依据。</p><div class="answer-options">${q.options.map((o,i)=>`<button class="answer-option ${p.selected===i?'selected':''} ${p.answered?(i===q.answer?'correct':p.selected===i?'incorrect':''):''}" data-action="select" data-index="${i}" aria-pressed="${p.selected===i}" ${p.answered?'disabled':''}><span class="option-letter">${'ABCD'[i]}</span><span class="math">${o}</span>${p.answered&&i===q.answer?'<span class="answer-check">✓</span>':''}</button>`).join('')}</div>
 ${p.hints?`<aside class="hint-box"><strong>换个方向想一想</strong>${q.hints.slice(0,p.hints).map((h,i)=>`<p>${i+1}. ${h}</p>`).join('')}</aside>`:''}
 ${p.answered?`<div class="feedback ${p.selected===q.answer?'positive':'needs-work'}" role="status"><strong>${p.selected===q.answer?(p.hints?'方向找到了，再独立练一次。':'这一步，做对了。'):'找到需要补上的一步了。'}</strong><p class="math">${q.reason}</p><small>${p.selected===q.answer&&!p.hints?'已记为本题本次无提示答对。':'已加入需要回顾的题，下一次先不看提示再做。'}</small></div>`:''}
 <div class="practice-actions">${p.answered?`<button class="text-button" data-action="note-question">记下这道题的疑问 ↗</button><button class="primary" data-action="next">${p.index===p.qs.length-1?'完成本次学习':'下一题'} →</button>`:`<button class="text-button" data-action="hint" ${p.hints>=q.hints.length?'disabled':''}>${p.hints>=q.hints.length?'提示已全部展开':'给我一点提示'} ${p.hints<q.hints.length?'＋':''}</button><button class="primary" data-action="submit" ${p.selected===null?'disabled':''}>确认答案 →</button>`}</div><p class="fineprint practice-foot">使用提示会被如实记录。答对后仍需要陌生变式与延迟复测。</p>`;
 if(!$('.modal'))modal(html,true);else{$('.modal').innerHTML=html;$('.modal').scrollTop=0;}
}
function complete(){const p=practice,ind=p.results.filter(a=>a.correct&&!a.hinted).length,correct=p.results.filter(a=>a.correct).length;
 save({...state,sessions:[...state.sessions,Date.now()]});
 $('.modal').innerHTML=`${closeButton()}<div class="completion"><span class="completion-mark">✓</span><div class="eyebrow">ONE STEP FORWARD</div><h2>今天，认真走了一小步。</h2><p>完成 ${p.qs.length} 道题，其中 ${correct} 道答对，${ind} 道未使用提示。</p><div class="completion-stats"><div><strong>${ind}</strong><span>无提示答对</span></div><div><strong>${p.qs.length-ind}</strong><span>值得再回顾</span></div></div><div class="reflection"><strong>离开前，试着说一句：</strong><p>“今天我弄懂了____，因为____。”</p><small>如果还说不清，下一次就从这里开始。</small></div><button class="primary" data-action="finish-review">查看复习安排 →</button><button class="text-button" data-action="close">回到学习空间</button></div>`;practice=null;$('.modal').scrollTop=0;
}
function noteForm(prefill=''){
 if(practice){practice=null;notify('刚才已提交的作答已保存。');}
 modal(`${closeButton()}<div class="eyebrow">MY PAPER & PENCIL NOTES</div><h2>记下卡住的一步。</h2><p class="muted">原题、完整过程和一句反思，比只记答案更有用。</p><form id="note-form"><label class="field">给这道题一个标题<input name="title" required maxlength="100" placeholder="例如：真数条件总是漏写" value="${esc(prefill)}"></label><label class="field">原题 / 我卡在哪里 / 下次怎么检查<textarea name="body" required maxlength="5000" rows="5" placeholder="我第一步写了什么？从哪一步开始不确定？"></textarea></label><label class="photo-upload">＋ 拍照或选择纸笔作答<input name="photo" type="file" accept="image/*"><small>可选 · 图片压缩后只保存在当前浏览器，不自动识别或批改</small></label><div id="photo-preview"></div><p class="fineprint">建议只拍题目和解题过程，避免包含姓名、学校等个人信息。</p><button class="primary" type="submit">保存这条错题 →</button></form>`);
}
async function compressedPhoto(file){if(!file)return null;if(!file.type.startsWith('image/'))throw new Error('请选择图片文件');if(file.size>20*1024*1024)throw new Error('图片过大，请选取 20MB 以内的照片');
 return new Promise((resolve,reject)=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{const scale=Math.min(1,1400/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);const data=c.toDataURL('image/jpeg',.75);if(data.length>1200000)reject(new Error('照片内容过大，请裁切到一道题后重试'));else resolve(data);};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('无法读取这张图片，请试试 JPG 或 PNG'));};img.src=url;});
}
function privacy(){modal(`${closeButton()}<div class="eyebrow">YOUR DATA, YOUR DEVICE</div><h2>你的记录，留在你的浏览器。</h2><div class="privacy-copy"><p>第一版使用本机浏览器存储，不需要账号，也不会将作答或错题照片上传到服务器。老师不能直接远程看到记录；可以导出 Markdown 或 JSON 后自行分享。</p><p>不同设备、不同浏览器的数据不会自动同步。无痕模式、浏览器清理或存储空间不足可能导致数据丢失，请定期导出 JSON 备份。</p><p>本版提供 30 道原创选择题、固定分层提示和解析。它没有在线 AI 对话、OCR 或自动手写批改。题目用于学习诊断，不预测或保证考试分数。</p><p>数学判断需要完整推理；选择正确答案只是一项证据。请结合纸笔过程和教师复核使用。</p></div><button class="primary" data-action="close">明白了</button>`);}
function download(text,name,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-action]');if(!el)return;const a=el.dataset.action,id=el.dataset.id;
 if(a==='close')closeModal();
 if(a==='lesson')lesson(id);
 if(a==='practice-unit')startPractice(questions.filter(q=>q.unit===id),units.find(u=>u.id===id).title);
 if(a==='question')startPractice(questions.filter(q=>q.id===id),'独立重做');
 if(a==='review-all')startPractice(reviewQuestions(state,questions),'需要回顾的题');
 if(a==='due')startPractice(dueQuestions(state,questions),'到期复测');
 if(a==='select'&&practice&&!practice.answered){practice.selected=Number(el.dataset.index);showQuestion();}
 if(a==='hint'&&practice&&!practice.answered){practice.hints=Math.min(practice.hints+1,practice.qs[practice.index].hints.length);showQuestion();}
 if(a==='submit'&&practice&&!practice.answered&&practice.selected!==null){const p=practice,q=p.qs[p.index];const next=addAttempt(state,q,p.selected,p.hints>0);save(next);p.answered=true;p.results.push(next.attempts.at(-1));showQuestion();}
 if(a==='next'&&practice?.answered){if(practice.index===practice.qs.length-1)complete();else {practice.index++;practice.selected=null;practice.hints=0;practice.answered=false;showQuestion();}}
 if(a==='finish-review'){closeModal();location.hash='review';view='review';render();}
 if(a==='note')noteForm();
 if(a==='note-question'){const q=practice.qs[practice.index];noteForm(`${q.id} · ${q.skill}`);}
 if(a==='review-note'){save({...state,notes:state.notes.map(n=>n.id===id?{...n,reviewed:!n.reviewed}:n)});render();}
 if(a==='photo'){const n=state.notes.find(n=>n.id===id);if(n?.image)modal(`${closeButton()}<h2>${esc(n.title)}</h2><img class="full-photo" src="${n.image}" alt="错题原始照片">`,true);}
 if(a==='privacy')privacy();
 if(a==='export-md')download(markdownReport(state,questions,units),`循数-学习记录-${localDay()}.md`,'text/markdown;charset=utf-8');
 if(a==='export-json')download(JSON.stringify(state,null,2),`循数-完整备份-${localDay()}.json`,'application/json');
 if(a==='reset'&&confirm('这会清空当前浏览器里的作答和错题照片，无法撤销。建议先导出 JSON 备份。确定清空吗？')){save(freshState());render();notify('本机记录已清空');}
});
document.addEventListener('submit',async e=>{if(e.target.id!=='note-form')return;e.preventDefault();const form=e.target,button=form.querySelector('[type=submit]');button.disabled=true;button.textContent='正在保存…';
 try{const data=new FormData(form),title=String(data.get('title')).trim(),body=String(data.get('body')).trim();if(!title||!body)throw new Error('请填写标题和反思内容');const image=await compressedPhoto(form.elements.photo.files[0]);save({...state,notes:[...state.notes,{id:crypto.randomUUID(),title,body,image,at:Date.now(),reviewed:false}]});closeModal();location.hash='review';view='review';render();notify('错题已保存，请定期备份');}catch(err){notify(err.message);button.disabled=false;button.textContent='保存这条错题 →';}});
document.addEventListener('change',async e=>{
 if(e.target.id==='import-file'){
  const file=e.target.files[0];if(!file)return;
  try{if(file.size>8*1024*1024)throw new Error('备份文件过大（上限 8MB）');const parsed=JSON.parse(await file.text());if(!validState(parsed))throw new Error('这不是有效的循数 V1 备份');if(!confirm('恢复备份将替换本浏览器现有记录。确定继续吗？')){e.target.value='';return;}save(parsed);render();notify('备份已恢复');}catch(err){notify(err.message);e.target.value='';}
 }
 if(e.target.name==='photo'){const file=e.target.files[0];if(file)$('#photo-preview').textContent=`已选择：${file.name}`;}
});
document.addEventListener('keydown',e=>{const m=$('.modal');if(!m)return;if(e.key==='Escape')closeModal();if(e.key==='Tab'){const focusable=[...m.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea,a[href]')];if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===m)){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===m)){e.preventDefault();first.focus();}}});
$('#privacy-button').addEventListener('click',privacy);
window.addEventListener('hashchange',()=>{view=location.hash.slice(1)||'today';closeModal();render();window.scrollTo(0,0);});
view=location.hash.slice(1)||'today';render();
