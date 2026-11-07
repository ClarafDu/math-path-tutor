import test from 'node:test';
import assert from 'node:assert/strict';
import {powerExponent,realPower} from '../power-domain.js';
test('负半轴按最简分数分母与分子奇偶确定实数图像',()=>{
 for(const [raw,p,want] of [['1/3',1/3,-2],['2/3',2/3,4],['2/6',1/3,-2],['-1/3',-1/3,-.5],['.2',.2,-(8**.2)]])assert.ok(Math.abs(realPower(-8,p,powerExponent(raw))-want)<1e-10,raw);
 for(const raw of ['1/2','0.333','3/6'])assert.ok(Number.isNaN(realPower(-8,.5,powerExponent(raw))),raw);
 assert.ok(Number.isNaN(realPower(0,0,powerExponent('0'))));
 assert.equal(realPower(0,1/3,powerExponent('1/3')),0);
});
