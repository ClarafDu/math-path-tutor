// Preserve the exact denominator of typed fractions and terminating decimals.
function ratio(text){
 const m=/^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(text.trim());
 if(!m||!(m[2]||m[3]))return null;
 const digits=m[2]+(m[3]||''),scale=(m[3]?.length||0)-Number(m[4]||0);
 if(digits.length>200||Math.abs(scale)>400)return null;
 const n=BigInt(digits)*(m[1]==='-'?-1n:1n);
 return scale>=0?[n,10n**BigInt(scale)]:[n*10n**BigInt(-scale),1n];
}
export function powerExponent(raw){
 const parts=raw.trim().replace(/−/g,'-').split('/').map(ratio);
 if(parts.length>2||parts.some(p=>!p)||parts[1]?.[0]===0n)return null;
 let [n,d]=parts[0];
 if(parts.length===2){n*=parts[1][1];d*=parts[1][0];}
 if(d<0n){n=-n;d=-d;}
 let a=n<0n?-n:n,b=d;
 while(b!==0n){[a,b]=[b,a%b];}
 return {negativeBase:(d/a)%2n===1n,negativeResult:(n/a)%2n!==0n};
}
export function realPower(x,p,domain){
 if(x===0)return p>0?0:NaN;
 if(x>0)return x**p;
 if(!domain?.negativeBase)return NaN;
 return (domain.negativeResult?-1:1)*(-x)**p;
}
