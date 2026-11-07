import test from 'node:test';
import assert from 'node:assert/strict';
import {parseParameter,parameterError} from '../diagram-parameters.js';
import {diagramHTML} from '../concept-diagrams.js';
import {labSection} from '../function-lab.js';
test('参数支持分数与小数，拒绝空值、除零和任意表达式',()=>{
 assert.equal(parseParameter(' −1 / 2 '),-.5);
 assert.equal(parseParameter('0.1234'),.1234);
 for(const s of ['','1/0','1/1e999','2+3','Infinity'])assert.ok(Number.isNaN(parseParameter(s)),s);
});
test('仅第四章提供填写入口，参数校验按函数定义区分',()=>{
 for(let i=1;i<=8;i++)assert.match(diagramHTML(labSection('4.'+i)),/应用参数/);
 assert.doesNotMatch(diagramHTML(labSection('3.1')),/应用参数/);
 assert.equal(parameterError('4.1','p',.5),'');
 assert.equal(parameterError('4.7','p',-4),'');
 assert.ok(parameterError('4.7','q',1));
 assert.ok(parameterError('4.5','q',0));
 assert.ok(parameterError('4.6','p',0));
 assert.ok(parameterError('4.4','p',-1));
 assert.ok(parameterError('4.8','p',1.5));
 assert.equal(parameterError('4.2','p',5),'');
});
