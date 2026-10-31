export const STORAGE_KEY = 'xunshu-math-v1';
export function freshState(){ return {version:1,attempts:[],notes:[],sessions:[],lastUnit:'exponent'}; }
export function localDay(value = Date.now()) { const d = new Date(value); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function validState(s){
  return s && s.version===1 && Array.isArray(s.attempts) && Array.isArray(s.notes) && Array.isArray(s.sessions)
    && s.attempts.length<=10000 && s.notes.length<=500 && s.sessions.length<=10000
    && s.attempts.every(a=>a && typeof a.questionId==='string' && typeof a.correct==='boolean' && typeof a.hinted==='boolean' && Number.isFinite(a.at) && Number.isInteger(a.selected) && a.selected>=0 && a.selected<4)
    && s.notes.every(n=>n && typeof n.id==='string' && typeof n.title==='string' && typeof n.body==='string' && Number.isFinite(n.at) && typeof n.reviewed==='boolean' && (!n.image || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(n.image)))
    && s.sessions.every(t=>Number.isFinite(t)) && (s.lastUnit===undefined || typeof s.lastUnit==='string');
}
export function latestAttempts(state){ const map=new Map(); for(const a of state.attempts) map.set(a.questionId,a); return map; }
export function dueQuestions(state, questions, now=Date.now()){
  const latest=latestAttempts(state);
  return questions.filter(q=>{const a=latest.get(q.id);if(!a)return false;const days=a.correct?(a.hinted?3:7):1;return now-a.at>=days*86400000;});
}
export function reviewQuestions(state,questions){const latest=latestAttempts(state);return questions.filter(q=>{const a=latest.get(q.id);return a && (!a.correct||a.hinted);});}
export function unitProgress(state,id,questions){
  const qs=questions.filter(q=>q.unit===id),latest=latestAttempts(state);
  const seen=qs.filter(q=>latest.has(q.id)).length;
  const independent=qs.filter(q=>{const a=latest.get(q.id);return a?.correct&&!a.hinted;}).length;
  return {total:qs.length,seen,independent,percent:Math.round(independent/qs.length*100)};
}
export function addAttempt(state,question,selected,hinted,at=Date.now()){
  if(!Number.isInteger(selected)||selected<0||selected>=question.options.length)throw new Error('请选择一个答案');
  return {...state,lastUnit:question.unit,attempts:[...state.attempts,{questionId:question.id,selected,correct:selected===question.answer,hinted:Boolean(hinted),at}]};
}
export function weeklySessions(state,now=Date.now()){
  const start=new Date(now);start.setHours(0,0,0,0);start.setDate(start.getDate()-((start.getDay()+6)%7));
  return new Set(state.sessions.filter(t=>t>=start.getTime()&&t<=now).map(t=>localDay(t))).size;
}
export function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function markdownReport(state,questions,units){
  const latest=latestAttempts(state),lines=['# 循数 · 学习记录',`导出日期：${localDay()}`,'','说明：以下为本浏览器的练习记录，不等同于高考能力评估。原题重做正确，不代表陌生题迁移通过。','','## 单元进度'];
  for(const u of units){const p=unitProgress(state,u.id,questions);lines.push(`- ${u.title}：已练 ${p.seen}/${p.total}；最近一次无提示答对 ${p.independent}/${p.total}`);}
  lines.push('','## 逐题表现');
  for(const q of questions){const a=latest.get(q.id);if(a)lines.push(`- ${q.id}（${q.skill}）：${a.correct?'答对':'答错'}；${a.hinted?'使用提示':'未用提示'}；${localDay(a.at)}`);}
  lines.push('','## 自己的错题与反思');
  for(const n of state.notes)lines.push(`\n### ${n.title}\n\n${n.body}\n\n${n.reviewed?'已标记复习':'待复习'}${n.image?'；附图保存在 JSON 备份中':''}`);
  return lines.join('\n');
}
