import {chapters,findConcept} from './curriculum.js';
import {diagramHTML,mountDiagram} from './concept-diagrams.js';
import {labHTML,mountLab} from './graph.js';
import {escapeHTML as esc} from './core.js';
import {functionChapters,exercises,experiments} from './function-experiments.js';

export const labChapters=chapters.filter(c=>functionChapters.includes(c.number));
export const labSections=labChapters.flatMap(c=>c.sections);
export function labSection(id){
 const s=findConcept(exercises[id]&&Object.hasOwn(exercises,id)?id:'3.1');
 const [observe,prompt,options,answer,explanation]=exercises[s.id];
 return {...s,observe,experiment:experiments[s.id],questions:[s.check,{prompt:esc(prompt),options:options.map(esc),answer,explanation:esc(explanation)}]};
}
export function functionLabHTML(id){
 if(id==='classic')return '<p><a class="secondary" href="#lab">← 返回函数实验目录</a></p><div id="lab-content">'+labHTML()+'</div>';
 const s=labSection(id),c=labChapters.find(c=>c.number===s.chapter),next=labSections[labSections.findIndex(x=>x.id===s.id)+1];
 return `<section class="concept-definition-panel function-lab-index"><div class="lab-modes" aria-label="函数章节">${labChapters.map(c=>`<a class="secondary" href="#lab/${c.sections[0].id}" ${s.chapter===c.number?'aria-current="true"':''}>第 ${c.number} 章 · ${c.title}</a>`).join('')}</div><label class="select-field">选择本章小节<select id="function-lab-section">${c.sections.map(x=>`<option value="${x.id}" ${s.id===x.id?'selected':''}>${x.id} ${x.title}</option>`).join('')}</select></label><p><a class="text-link" href="#lab/classic">原有对数专项实验 →</a></p></section>
 <div class="section-heading"><h2>${s.id} · ${s.title}</h2><a class="text-link" href="#concept/${s.id}">看知识讲解 →</a></div>
 ${diagramHTML(s)}
 <section class="concept-selfcheck"><h2>本节测试 · 先独立做，再看解析</h2><p>先写下理由。提交后会显示得分与每题解析；本节测试不计入原有专项练习记录。</p>
 <form id="function-lab-quiz">${s.questions.map((q,i)=>`<fieldset><legend>${i+1}. ${q.prompt}</legend>${q.options.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}" required> <span>${o}</span></label>`).join('')}<p class="lab-answer" hidden></p></fieldset>`).join('')}<button class="primary" type="submit">提交本节测试 →</button> <button class="secondary" type="reset">清空重做</button><p class="lab-score" role="status"></p></form></section>
 ${next?`<p><a class="secondary" href="#lab/${next.id}">下一节：${next.id} ${next.title} →</a></p>`:''}`;
}
export function mountFunctionLab(root,id){
 if(id==='classic'){mountLab(root.querySelector('#lab-content'));return;}
 const s=labSection(id),form=root.querySelector('#function-lab-quiz'),score=form.querySelector('.lab-score'),feedback=[...form.querySelectorAll('.lab-answer')];
 root.querySelector('#function-lab-section').addEventListener('change',e=>{location.hash='lab/'+e.target.value;});
 mountDiagram(root.querySelector('.concept-visual'),s);
 const clear=()=>{score.textContent='';feedback.forEach(p=>{p.hidden=true;});};
 form.addEventListener('reset',clear);
 form.addEventListener('change',clear);
 form.addEventListener('submit',e=>{
  e.preventDefault();const data=new FormData(form);let count=0;
  s.questions.forEach((q,i)=>{
   const right=Number(data.get('q'+i))===q.answer;count+=Number(right);
   const p=feedback[i];p.hidden=false;p.className='lab-answer feedback '+(right?'positive':'needs-work');
   p.innerHTML=`<strong>${right?'答对了':'再核对一下'}。答案：${q.options[q.answer]}</strong><br>${q.explanation}`;
  });
  score.textContent=`本次答对 ${count} / ${s.questions.length} 题。`;
 });
}
