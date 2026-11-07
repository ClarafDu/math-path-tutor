import {test} from 'node:test';
import assert from 'node:assert/strict';
import {labChapters,labSections,labSection,functionLabHTML} from '../function-lab.js';
import {exercises,experiments} from '../function-experiments.js';

test('函数五章的全部小节都有图形入口和两道带解析的题',()=>{
 assert.deepEqual(labChapters.map(c=>[c.number,c.sections.length]),[[3,7],[4,8],[5,8],[6,6],[19,5]]);
 assert.deepEqual(Object.keys(exercises).sort(),labSections.map(s=>s.id).sort());
 for(const {id} of labSections){
  const s=labSection(id);
  assert.equal(s.id,id);
  assert.ok(s.observe.length>8);
  assert.equal(s.questions.length,2);
  for(const q of s.questions)assert.ok(q.prompt&&q.options[q.answer]&&q.explanation,id);
  assert.match(functionLabHTML(id),/id="function-lab-quiz"/);
 }
 assert.equal(labSection('__proto__').id,'3.1');
 assert.match(functionLabHTML('classic'),/id="lab-content"/);
});

test('专项图形默认与边界参数都有读数，且控制点坐标有限',()=>{
 const finite=(x,y)=>{assert.ok(Number.isFinite(x)&&Number.isFinite(y));return '';};
 const api={path:()=>'',dot:finite,circle:finite,line:()=>'',poly:()=>''};
 for(const [id,e] of Object.entries(experiments)){
  const start=Object.fromEntries(e.controls.map(c=>[c.key,c.value]));
  const states=[start,...e.controls.flatMap(c=>[c.min,c.max].map(v=>({...start,[c.key]:v})))];
  for(const s of states)assert.doesNotMatch(e.draw(api,s)[1],/NaN|undefined|Infinity/,id);
 }
});
