import test from 'node:test';
import assert from 'node:assert/strict';
import {validBase,logValue,inequality,chartPoint} from '../graph.js';
import {videos} from '../videos.js';

test('对数函数定义域与底数限制',()=>{
 assert.equal(validBase(1),false);assert.equal(validBase(0),false);assert.equal(validBase(-2),false);assert.ok(validBase(.5));
 assert.ok(Number.isNaN(logValue(0,2)));assert.ok(Number.isNaN(logValue(-1,2)));assert.ok(Number.isNaN(logValue(2,1)));
 assert.equal(logValue(4,2),2);assert.equal(logValue(.25,.5),2);
 assert.equal(logValue(5,2,1,3),5);assert.ok(Number.isNaN(logValue(1,2,1,0)));
});
test('对数不等式按底数与方向求解，并始终保留定义域',()=>{
 assert.equal(inequality(2,0,1,'>').interval,'(2, +∞)');
 assert.equal(inequality(2,0,1,'<').interval,'(0, 2)');
 assert.equal(inequality(.5,0,1,'>').interval,'(0, 0.5)');
 assert.equal(inequality(.5,0,1,'<').interval,'(0.5, +∞)');
 assert.equal(inequality(.5,1,1,'>').interval,'(1, 1.5)');
 assert.equal(inequality(1,0,1),null);
});
test('不将无理数临界值的近似小数冒充精确端点',()=>{
 const result=inequality(2,0,.5,'>');assert.match(result.interval,/2\^\(0.5\)/);assert.ok(Math.abs(result.boundary-Math.sqrt(2))<1e-12);
});
test('触屏缩放后的屏幕坐标准确转换为数学坐标',()=>{
 const rect={left:20,top:30,width:320,height:260};
 const p=chartPoint(20+(56+(2+4)*56)/2,30+(24+(5-1)*56)/2,rect);
 assert.equal(p.x,2);assert.equal(p.y,1);
});
test('视频入口覆盖六个单元，均使用 HTTPS 公共视频地址',()=>{
 assert.equal(videos.length,11);assert.equal(new Set(videos.map(v=>v.id)).size,11);
 for(const unit of ['exponent','meaning','rules','conditions','function','reading'])assert.ok(videos.some(v=>v.unit===unit));
 for(const v of videos){assert.equal(new URL(v.url).protocol,'https:');assert.equal(new URL(v.url).hostname,'www.bilibili.com');assert.ok(v.question.length>8);}
});
