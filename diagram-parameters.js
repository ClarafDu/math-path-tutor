export function parseParameter(raw){
 const parts=raw.trim().replace(/−/g,'-').split('/').map(x=>x.trim());
 if(parts.length>2||!parts.every(x=>/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(x)))return NaN;
 const values=parts.map(Number);
 if(!values.every(Number.isFinite)||values[1]===0)return NaN;
 return values[0]/(values[1]??1);
}

export function parameterError(id,key,n){
 if(!Number.isFinite(n)||Math.abs(n)>1000)return '请输入绝对值不超过 1000 的数，可用小数或分数（如 1/2）。';
 if((['4.2','4.3','4.5'].includes(id)&&key==='p')||(['4.6','4.7'].includes(id)&&key==='q')){
  if(n<=0||n===1)return '底数必须大于 0 且不等于 1。';
 }
 if((['4.3','4.5'].includes(id)&&key==='q')||(id==='4.6'&&key==='p')||(id==='4.8'&&key==='q')){
  if(n<=0)return '这个参数必须大于 0。';
 }
 if(id==='4.4'&&key==='p'&&n<0)return '本实验只取抛物线右半支，x 必须不小于 0。';
 if(id==='4.8'&&key==='p'&&(!Number.isInteger(n)||n<0))return '期数必须是非负整数。';
 return '';
}
