import test from 'node:test';
import assert from 'node:assert/strict';
import {chapters} from '../curriculum.js';
import {chapterBank,practiceTiers,chapterPracticeHTML} from '../chapter-practice.js';
import {labSection,functionLabHTML} from '../function-lab.js';

test('19 章共 570 道题，题面不重复，各档计数和解析齐全',()=>{
 assert.equal(Object.keys(chapterBank).length,19);
 assert.deepEqual(practiceTiers.map(([name,start,end])=>[name,end-start]),[['基础',6],['中档',15],['难题',6],['拓展',3]]);
 const prompts=new Set();
 for(const {number} of chapters){
  const rows=chapterBank[number];
  assert.equal(rows.length,30,`第 ${number} 章`);
  for(const q of rows){
   assert.equal(q.length,3);assert.ok(q.every(v=>typeof v==='string'&&v.trim().length>0),q[0]);
   assert.ok(!prompts.has(q[0]),q[0]);prompts.add(q[0]);
  }
  assert.equal((chapterPracticeHTML(String(number)).match(/data-question="/g)||[]).length,30);
 }
 assert.equal(prompts.size,570);
});

test('全部 131 节有自定义参数、章练习与正确的图形路由',()=>{
 for(const c of chapters)for(const s of c.sections){
  assert.equal(labSection(s.id).id,s.id);
  const page=functionLabHTML(s.id);
  assert.match(page,/class="diagram-parameter-form"/);
  assert.ok(page.includes(`href="#practice/${c.number}"`));
 }
});
