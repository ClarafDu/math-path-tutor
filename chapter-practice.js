import {chapters} from './curriculum.js?v=1.4';
import {escapeHTML as esc} from './core.js';
import {bankA} from './chapter-bank-a.js';
import {bankB} from './chapter-bank-b.js';
import {bankC} from './chapter-bank-c.js';
import {bankD} from './chapter-bank-d.js';

export const chapterBank={...bankA,...bankB,...bankC,...bankD};
export const practiceTiers=[['基础',0,6],['中档',6,21],['难题',21,27],['拓展',27,30]];
const chapterOf=id=>chapters.find(c=>String(c.number)===id)||chapters[0];
const storageKey='xunshu-chapter-practice-v1';
const label={right:'已独立做对',review:'待重做'};
function readMarks(){try{const data=JSON.parse(localStorage.getItem(storageKey)||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{};}catch{return {};}}
export function chapterPracticeHTML(id){
 const c=chapterOf(id),bank=chapterBank[c.number];
 return `<div class="chapter-practice"><section class="concept-definition-panel chapter-practice-index"><label class="select-field">选择章节<select id="chapter-practice-select">${chapters.map(x=>`<option value="${x.number}" ${x.number===c.number?'selected':''}>第 ${x.number} 章 · ${x.title}</option>`).join('')}</select></label><a class="secondary" href="#lab/${c.sections[0].id}">打开本章数形实验 →</a><p class="fineprint">先在纸上作答，再展开解析对照关键步骤，自评是否做对。拓展 3 题计入 9 道难题。自评保存在当前浏览器，和原专项记录分开。</p><p id="chapter-practice-status" role="status"></p></section>
 ${practiceTiers.map(([name,start,end],tier)=>`<details class="chapter-practice-tier" ${tier===0?'open':''}><summary>${name} · ${end-start} 题</summary>${bank.slice(start,end).map(([prompt,answer,why],i)=>`<article class="chapter-question" data-question="${start+i+1}"><h3>${start+i+1}. ${esc(prompt)}</h3><details class="chapter-solution"><summary>查看答案与解析</summary><p><strong>答案：</strong>${esc(answer)}</p><p><strong>解析：</strong>${esc(why)}</p><div class="chapter-mark-buttons"><button type="button" class="secondary" data-mark="right" aria-pressed="false">我独立做对了</button><button type="button" class="secondary" data-mark="review" aria-pressed="false">标记待重做</button></div></details><small class="chapter-mark"></small></article>`).join('')}</details>`).join('')}</div>`;
}
export function mountChapterPractice(main,id){
 const root=main.querySelector('.chapter-practice');
 const c=chapterOf(id),marks=readMarks(),rows=[...root.querySelectorAll('[data-question]')],status=root.querySelector('#chapter-practice-status');
 root.querySelector('#chapter-practice-select').addEventListener('change',e=>{location.hash='practice/'+e.target.value;});
 function refresh(saved=true){
  let right=0,review=0;
  for(const row of rows){
   const state=marks[c.number+'-'+row.dataset.question];
   right+=Number(state==='right');review+=Number(state==='review');
   row.querySelector('.chapter-mark').textContent=Object.hasOwn(label,state)?label[state]:'';
   for(const b of row.querySelectorAll('[data-mark]'))b.setAttribute('aria-pressed',String(b.dataset.mark===state));
  }
  status.textContent=`本章：独立做对 ${right}/30 · 待重做 ${review} 题${saved?'':' · 浏览器未能保存本次自评'}`;
 }
 root.addEventListener('click',e=>{
  const b=e.target.closest('[data-mark]');if(!b)return;
  const key=c.number+'-'+b.closest('[data-question]').dataset.question;
  if(marks[key]===b.dataset.mark)delete marks[key];else marks[key]=b.dataset.mark;
  let saved=true;try{localStorage.setItem(storageKey,JSON.stringify(marks));}catch{saved=false;}
  refresh(saved);
 });
 refresh();
}
