import test from 'node:test';
import assert from 'node:assert/strict';
import {chapters,concepts,findConcept,conceptHTML,mapHTML,safeMath} from '../curriculum.js';
import {chaptersA} from '../curriculum-a.js';
import {chaptersB} from '../curriculum-b.js';
import {chaptersC} from '../curriculum-c.js';
import {diagramKinds,choose,conicPoint,secantSlope,binomial} from '../concept-diagrams.js';
const sectionCounts=[7,12,7,8,8,6,6,7,7,5,8,9,2,6,7,6,7,8,5];
test('PDF 目录 19 章 131 节逐节覆盖且编号连续，无重复或空壳',()=>{
 assert.equal(chapters.length,19);assert.equal(concepts.length,131);assert.equal(new Set(concepts.map(s=>s.id)).size,131);
 chapters.forEach((c,i)=>{assert.equal(c.number,i+1);assert.equal(c.sections.length,sectionCounts[i]);c.sections.forEach((s,j)=>assert.equal(s.id,`${i+1}.${j+1}`));});
 for(const s of concepts){for(const field of ['title','intro','formula','boundary','why','pitfall','observe'])assert.ok(typeof s[field]==='string'&&s[field].length>=(field==='title'?2:5),`${s.id} ${field}`);assert.ok(s.definitions.length>=2);assert.ok(s.example.prompt.length>5);assert.ok(s.example.steps.length>=3);assert.ok(s.check.options.length>=3&&s.check.options.length<=4);assert.ok(Number.isInteger(s.check.answer)&&s.check.answer>=0&&s.check.answer<s.check.options.length);assert.ok(s.check.explanation.length>10);assert.ok(diagramKinds[s.visual],`${s.id} has supported diagram`);assert.doesNotMatch(JSON.stringify(s),/TODO|待补充|placeholder|undefined/);}
});
test('深链接逐节可打开，前后概念与自测均存在',()=>{
 for(const s of concepts){const html=conceptHTML(s.id);assert.ok(html.includes(s.title));assert.ok(html.includes('data-concept-check'));assert.ok(html.includes('concept-svg'));assert.ok(html.includes('成立的前提'));}
 assert.equal(findConcept('0.1'),undefined);assert.match(conceptHTML('0.1'),/没有找到/);assert.match(mapHTML(),/全部 19 章/);
});
test('圆锥曲线取点满足各自精确方程',()=>{
 for(const t of [-1,-.5,0,.5,1]){const e=conicPoint('ellipse',t,3,2),h=conicPoint('hyperbola',t,3,2),p=conicPoint('parabola',t,2,1);assert.ok(Math.abs(e.x**2/9+e.y**2/4-1)<1e-12);assert.ok(Math.abs(h.x**2/9-h.y**2/4-1)<1e-12);assert.ok(Math.abs(p.y**2-4*p.x)<1e-12);}
});
test('割线斜率来自差商，h 趋零时逼近导数',()=>{
 for(const x of [-1,0,1])for(const h of [.02,.5,1])assert.ok(Math.abs(secantSlope(x,h)-((x+h)**2-x*x)/h)<1e-12);
});
test('排列组合与二项分布的概率归一化及期望',()=>{
 assert.equal(choose(5,2),10);assert.equal(choose(5,0),1);assert.equal(choose(5,6),0);
 for(const n of [1,5,10])for(const p of [.05,.5,.95]){let total=0,mean=0;for(let k=0;k<=n;k++){const prob=binomial(n,p,k);total+=prob;mean+=k*prob;}assert.ok(Math.abs(total-1)<1e-12);assert.ok(Math.abs(mean-n*p)<1e-12);}
});

test('比较符号不会被误解析为标签，数学上下标仍可排版',()=>{assert.equal(safeMath('a<b 且 x<0；x<sup>2</sup>'), 'a&lt;b 且 x&lt;0；x<sup>2</sup>');assert.equal(safeMath('<img src=x>'), '&lt;img src=x>');});

test('轮换选项后仍对应同一正确答案，答案位置具有变化',()=>{const raw=[...chaptersA,...chaptersB,...chaptersC].flatMap(c=>c.sections);for(const s of raw){const ready=findConcept(s.id);assert.equal(ready.check.options[ready.check.answer],safeMath(s.check.options[s.check.answer]));}assert.ok(new Set(concepts.map(s=>s.check.answer)).size>=3);});
