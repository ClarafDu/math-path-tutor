import test from 'node:test';
import assert from 'node:assert/strict';
import {units,questions} from '../content.js';
import {freshState,validState,addAttempt,unitProgress,reviewQuestions,dueQuestions,weeklySessions,markdownReport,escapeHTML} from '../core.js';

test('题库有六单元三十题，答案与提示结构完整',()=>{
 assert.equal(units.length,6);assert.equal(questions.length,30);assert.equal(new Set(questions.map(q=>q.id)).size,30);
 for(const u of units)assert.equal(questions.filter(q=>q.unit===u.id).length,5);
 for(const q of questions){assert.ok(units.some(u=>u.id===q.unit));assert.equal(q.options.length,4);assert.ok(q.answer>=0&&q.answer<4);assert.equal(q.hints.length,2);assert.ok(q.reason.length>12);}
});
test('作答记录区分无提示答对、提示后答对和答错',()=>{
 let s=freshState();const q=questions[0];
 s=addAttempt(s,q,0,false,1);assert.equal(reviewQuestions(s,questions).length,1);
 s=addAttempt(s,q,q.answer,true,2);assert.equal(unitProgress(s,q.unit,questions).independent,0);assert.equal(reviewQuestions(s,questions).length,1);
 s=addAttempt(s,q,q.answer,false,3);assert.equal(unitProgress(s,q.unit,questions).independent,1);assert.equal(reviewQuestions(s,questions).length,0);
 s=addAttempt(s,q,q.answer,false,4);assert.equal(unitProgress(s,q.unit,questions).independent,1);assert.equal(unitProgress(s,q.unit,questions).seen,1);assert.equal(s.attempts.length,4);
});
test('复习按最近作答安排，未接触题不成为到期题',()=>{
 let s=freshState();const day=86400000,t=100000;
 s=addAttempt(s,questions[0],0,false,t);s=addAttempt(s,questions[1],questions[1].answer,true,t);s=addAttempt(s,questions[2],questions[2].answer,false,t);
 assert.equal(dueQuestions(s,questions,t+day-1).length,0);assert.equal(dueQuestions(s,questions,t+day).length,1);assert.equal(dueQuestions(s,questions,t+3*day).length,2);assert.equal(dueQuestions(s,questions,t+7*day).length,3);
 s=addAttempt(s,questions[0],questions[0].answer,false,t+7*day);assert.equal(dueQuestions(s,questions,t+7*day).length,2);
});
test('周计划按不同日期计数，不把同日重复刷题算成两天',()=>{
 const now=new Date(2026,9,31,12).getTime();const s=freshState();s.sessions=[new Date(2026,9,30,10).getTime(),new Date(2026,9,30,18).getTime(),new Date(2026,9,24,10).getTime()];assert.equal(weeklySessions(s,now),1);
});
test('备份验证拒绝错误格式和不安全图片',()=>{
 assert.ok(validState(freshState()));assert.ok(!validState({version:1,notes:[]}));
 const s=freshState();s.notes.push({id:'1',title:'t',body:'b',at:1,reviewed:false,image:'javascript:alert(1)'});assert.ok(!validState(s));s.notes[0].image=null;assert.ok(validState(s));
 s.attempts.push({questionId:'e1',selected:99,correct:true,hinted:false,at:1});assert.ok(!validState(s));
});
test('导出包含提示证据与教师可用记录，用户文本能安全显示',()=>{
 const s=addAttempt(freshState(),questions[0],questions[0].answer,true,1);const report=markdownReport(s,questions,units);assert.match(report,/使用提示/);assert.match(report,/e1/);assert.match(report,/不等同于高考能力评估/);assert.equal(escapeHTML('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;');
});
test('非法选项不会进入学习记录',()=>{assert.throws(()=>addAttempt(freshState(),questions[0],-1,false));assert.throws(()=>addAttempt(freshState(),questions[0],undefined,false));});
