import {parseParameter,parameterError} from './diagram-parameters.js';
import {escapeHTML as esc} from './core.js';
const round=n=>Number.isFinite(n)?String(n!==0&&(Math.abs(n)<.001||Math.abs(n)>=1e7)?n.toExponential(3):Number(n.toFixed(3))):'未定义';
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
export const choose=(n,r)=>{if(r<0||r>n)return 0;let v=1;for(let k=1;k<=r;k++)v=v*(n-k+1)/k;return Math.round(v);};
export function conicPoint(type,t,a,b){return type==='ellipse'?{x:a*Math.cos(t),y:b*Math.sin(t)}:type==='hyperbola'?{x:a*Math.cosh(t),y:b*Math.sinh(t)}:{x:t*t/(2*a),y:t};}
export const secantSlope=(x,h)=>2*x+h;
export const binomial=(n,p,k)=>choose(n,k)*p**k*(1-p)**(n-k);
const control=(key,label,min,max,step,value)=>({key,label,min,max,step,value});
export const diagramKinds={
 sets:{title:'区间也是集合',controls:[control('p','集合 B 的左端点',-3,3,.1,1)],guide:'拖动黄色端点，让 B 左右移动。比较交集、并集与包含关系。'},
 inequality:{title:'把绝对值看成距离',controls:[control('p','允许距离 r',.2,3,.1,2),control('q','待判断的 x',-4,4,.1,0)],guide:'拖动黄色点 x，比较它到 1 的距离与 r。'},
 quadratic:{title:'二次函数与零点',controls:[control('p','零点间距参数 r',.2,3,.1,2),control('q','取点 x',-4,4,.1,0)],guide:'拖动黄色点 x，观察 y=x²−r² 的正负；调 r 改变两个零点。'},
 function:{title:'函数平移、最值与对称',controls:[control('p','水平平移 h',-2,2,.1,0),control('q','竖直平移 k',-2,2,.1,0),control('u','取点 x',-3,3,.1,1)],guide:'拖动黄色顶点平移抛物线，或拖红色取点观察函数值。'},
 power:{title:'幂函数族',controls:[control('p','幂指数 α（选定整数）',-2,3,1,2),control('q','取点 x（正半轴）',.3,2,.05,1.5)],guide:'拖动黄色取点；切换整数幂，比较图像与变化趋势。'},
 exponential:{title:'指数增长与衰减',controls:[control('p','底数 a',.25,3,.05,2),control('q','取点 x',-2,2,.05,1)],guide:'拖动黄色取点，改变底数，比较增长与衰减。a=1 时得到常函数。'},
 logarithm:{title:'指数与对数互为反函数',controls:[control('p','底数 a',.25,3,.05,2),control('q','对数真数 x',.2,3,.05,2)],guide:'拖动黄色取点；注意 a=1 时对数不成立，坐标交换对应反函数。'},
 unitcircle:{title:'旋转一条半径，读出三角比',controls:[control('p','角度 θ（度）',-180,360,1,45)],guide:'绕圆拖动黄色点，横坐标对应 cos θ，纵坐标对应 sin θ。'},
 sine:{title:'正弦波的四个参数',controls:[control('p','振幅 A',.3,2,.1,1),control('q','角频率 ω',.5,3,.1,1),control('u','相位 φ（弧度）',-3.14,3.14,.02,0),control('v','中线 d',-1,1,.1,0)],guide:'拖动黄色最高点调振幅；用滑条分别改变周期、相位与中线。'},
 tangent:{title:'正切：渐近线两侧不相连',controls:[control('p','角 x（弧度）',-1.4,1.4,.02,.5)],guide:'拖动黄色点，靠近 ±π/2 时观察函数值迅速变化。'},
 vector:{title:'向量、投影与数量积',controls:[control('p','向量 b 的横坐标',-3,3,.1,1),control('q','向量 b 的纵坐标',-2.5,2.5,.1,2)],guide:'拖动黄色向量 b 的终点，观察 a+b、投影和数量积的变化。'},
 space:{title:'立方体的空间投影',controls:[control('p','视角（度）',-180,180,1,25),control('q','仰角（度）',10,65,1,25)],guide:'在图上水平或竖直拖动来旋转视角。这是未作消隐的线框投影，屏幕相交不一定是空间相交。'},
 solid:{title:'圆柱与同底等高圆锥',controls:[control('p','底面半径 r',.4,1.8,.1,1),control('q','高 h',.5,3,.1,2)],guide:'拖动黄色顶点改变高度，比较同底等高的圆柱和圆锥体积。'},
 matrix:{title:'行列式是有向面积',controls:[control('p','第二列向量横坐标 b',-3,3,.1,1),control('q','第二列向量纵坐标 d',-2.5,2.5,.1,2)],guide:'拖动黄色向量，比较两列向量张成的面积；共线时行列式为零。'},
 complex:{title:'复平面：模、共轭与乘 i',controls:[control('p','实部 a',-2.5,2.5,.1,1.5),control('q','虚部 b',-2.5,2.5,.1,1)],guide:'拖动黄色复数点，观察共轭关于实轴对称，乘 i 逆时针转 90°。'},
 sequence:{title:'数列是离散的点',controls:[control('p','首项 a₁',-1,2,.1,1),control('q','公差 d / 公比 q',-.8,1.5,.1,.5),control('u','项数 n',2,10,1,6)],guide:'拖动黄色末项调公差；用按钮切换等差与等比。散点之间不连成函数曲线。'},
 algorithm:{title:'逐步执行求和算法',controls:[control('p','循环次数 n',1,10,1,5)],guide:'拖动黄色节点或调滑条，跟踪 S=1+2+…+n 的每次赋值。'},
 line:{title:'直线、斜率与距离',controls:[control('p','斜率 k',-2,2,.1,1),control('q','纵截距 b',-2,2,.1,0)],guide:'拖动黄色点改变斜率，移动滑条改变截距。红线段是固定点到直线的垂线。'},
 conic:{title:'沿圆锥曲线移动一个点',controls:[control('p','半轴 a / 抛物线参数 p',.5,3,.1,2),control('q','半轴 b（椭圆/双曲线）',.4,1.5,.1,1),control('u','轨迹参数 t',-3.14,3.14,.02,.7)],guide:'拖动黄色点（或调轨迹参数），比较焦距关系。双曲线演示右支，抛物线开口向右。'},
 coordinate:{title:'同一点在不同坐标系中',controls:[control('p','新原点横坐标 h',-2,2,.1,1),control('q','旋转角 θ（度）',-180,180,1,30),control('u','点 P 横坐标 x',-3,3,.1,2),control('v','点 P 纵坐标 y',-2,2,.1,1)],guide:'拖动黄色点，或移动、旋转坐标轴。点没有移动时，新坐标仍会随坐标系变化。'},
 counting:{title:'选择与排序：不同的计数',controls:[control('p','对象个数 n',2,8,1,5),control('q','选取个数 r',1,8,1,2)],guide:'拖动黄色选择边界改变 r，比较“只选人”与“还要排顺序”的结果。'},
 probability:{title:'二项分布：概率与期望',controls:[control('p','独立试验次数 n',1,10,1,5),control('q','每次成功概率 p',.05,.95,.05,.5)],guide:'拖动黄色概率控制点，比较分布、期望 np 与方差 np(1−p)。这里每次试验独立且成功概率相同。'},
 derivative:{title:'割线逼近切线',controls:[control('p','切点横坐标 x₀',-1.5,1.5,.05,1),control('q','增量 h（非零）',.02,1,.02,.5)],guide:'拖动黄色点缩小 h，观察割线斜率趋近切线斜率。此图演示 f(x)=x²。'},
 limit:{title:'趋近一点，不等于代入该点',controls:[control('p','到 1 的距离 δ',.02,.8,.02,.5)],guide:'拖动黄色点趋近空心点，左右函数值都趋近 2，但原式在 x=1 无定义。'}
};
const editable=section=>/^4\.[1-8]$/.test(section.id);
function parameterForm(config){
 return `<form class="diagram-parameter-form"><p>直接填数（支持 1/2 等分数），再点「应用参数」。滑条用于快速调整。</p>${config.controls.map(c=>`<label>${c.label.replace('（选定整数）','').replace('（正半轴）','')}<input type="text" name="${c.key}" inputmode="text" autocomplete="off" spellcheck="false" value="${c.value}"></label>`).join('')}<button class="primary" type="submit">应用参数</button><p class="diagram-parameter-error" role="alert" hidden></p></form>`;
}
export function diagramHTML(section){const config=section.experiment||diagramKinds[section.visual];return `<section class="concept-visual" aria-label="${esc(config.title)}"><div class="section-heading"><div><span class="eyebrow">02 · SEE IT CHANGE</span><h2>${config.title}</h2></div><span class="tag">可拖动</span></div><p>${section.observe}</p><div class="concept-visual-layout"><div><svg class="concept-svg" viewBox="0 0 600 400" role="group" aria-label="${esc(config.title)}交互图形"></svg><p class="diagram-guide">${config.guide}</p></div><div class="diagram-controls">${editable(section)?parameterForm(config):''}${config.controls.map(c=>`<label class="range-field">${c.label}<output data-output="${c.key}">${c.value}</output><input type="range" data-param="${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}" aria-label="${c.label}"></label>`).join('')}${section.visual==='sequence'?'<div class="diagram-switch"><button data-sequence="arithmetic" aria-pressed="true">等差</button><button data-sequence="geometric" aria-pressed="false">等比</button></div>':''}${section.visual==='conic'?'<div class="diagram-switch"><button data-conic="circle">圆</button><button data-conic="ellipse">椭圆</button><button data-conic="hyperbola">双曲线</button><button data-conic="parabola">抛物线</button></div>':''}<div class="diagram-reading" aria-live="polite"></div><button class="secondary" data-diagram-reset>恢复初始图像 ↺</button></div></div><p class="fineprint">图像与读数辅助观察，不能代替证明。控制点超出窗口时，可用滑条调回。数值显示为近似值（最多三位小数）；精确答案以定义、公式与推导为准。</p></section>`;}
export function mountDiagram(root,section){
 const kind=section.visual,config=section.experiment||diagramKinds[kind],svg=root.querySelector('svg'),read=root.querySelector('.diagram-reading');
 const s=Object.fromEntries(config.controls.map(c=>[c.key,c.value]));const initialSequence=['12.4','12.7','12.8'].includes(section.id)?'geometric':'arithmetic';s.sequence=initialSequence;const initialConic=section.id==='15.2'?'circle':section.id==='15.4'?'hyperbola':section.id==='15.5'?'parabola':'ellipse';s.conic=initialConic;
 const form=root.querySelector('.diagram-parameter-form'),error=form?.querySelector('[role=alert]');
 let drag=null,dragStart=null;
 function draw(){
  if(kind==='counting'){s.q=Math.min(s.p,s.q);root.querySelector('[data-param="q"]').max=s.p;}
  if(kind==='conic'){const range=root.querySelector('[data-param="u"]'),hyper=s.conic==='hyperbola';range.min=hyper?-1.1:-3.14;range.max=hyper?1.1:3.14;if(hyper)s.u=clamp(s.u,-1.1,1.1);}
  const {p,q,u,v}=s,U=['unitcircle','complex'].includes(kind)?70:50,X=x=>300+U*x,Y=y=>200-U*y;
  const line=(x1,y1,x2,y2,color='green',dash=false)=>`<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" class="d-${color}" ${dash?'stroke-dasharray="6 5"':''}/>`;
  const txt=(x,y,t,color='ink')=>`<text x="${X(x)}" y="${Y(y)}" class="d-text d-text-${color}">${esc(t)}</text>`;
  let outside=false;
  const dot=(x,y,type='point',color='yellow')=>{if(form&&(!Number.isFinite(x)||!Number.isFinite(y)||X(x)<20||X(x)>580||Y(y)<20||Y(y)>380)){outside=true;return '';}return `<g tabindex="0" role="button" aria-label="可拖动控制点 ${type}，也可用方向键调节" data-drag="${type}"><circle cx="${X(x)}" cy="${Y(y)}" r="24" fill="transparent"/><circle cx="${X(x)}" cy="${Y(y)}" r="8" class="d-fill-${color}" stroke="white" stroke-width="3"/></g>`;};
  const path=(fn,min=-5.5,max=5.5,color='green')=>{let d='',last=null;for(let i=0;i<=550;i++){const x=min+(max-min)*i/550,y=fn(x);if(!Number.isFinite(y)||Math.abs(y)>12){last=null;continue;}const command=last!==null&&Math.abs(y-last)<2?'L':'M';d+=`${command}${X(x).toFixed(2)} ${Y(y).toFixed(2)} `;last=y;}return `<path d="${d}" class="d-${color}"/>`;};
  const poly=(pts,color='green')=>`<polygon points="${pts.map(([x,y])=>`${X(x)},${Y(y)}`).join(' ')}" class="d-fill-${color}" fill-opacity=".15" stroke="currentColor"/>`;
  const circle=(x,y,r,color='green')=>`<circle cx="${X(x)}" cy="${Y(y)}" r="${r*U}" class="d-${color}"/>`;
  let axes='';for(let i=-5;i<=5;i++)axes+=line(i,-3.4,i,3.4,'grid')+line(-5.5,i,5.5,i,'grid');axes+=line(-5.5,0,5.5,0,'axis')+line(0,-3.4,0,3.4,'axis')+txt(5.3,-.32,'x')+txt(.15,3.3,'y')+txt(.1,-.32,'O');
  let g='',out='';
  if(section.experiment){[g,out]=config.draw({path,dot,line,circle,poly,txt},s);}
  else if(kind==='sets'){
   const lo=Math.max(-2,p),hi=Math.min(2,p+2),has=lo<=hi;
   g=line(-2,1.4,2,1.4)+line(p,.6,p+2,.6,'yellow')+txt(-4.9,1.32,'A=[−2,2]')+txt(-4.9,.52,'B=[b,b+2]')+(has?line(lo,-.5,hi,-.5,'red'):'')+txt(-4.9,-.6,'A∩B')+dot(p,.6)+txt(p,-1.2,'b='+round(p));
   for(const x of [-2,2,p+2])g+=circle(x,x===p+2?.6:1.4,.05);
   out=`A∩B = ${has?`[${round(lo)}, ${round(hi)}]`:'∅'}；A∪B = ${has?`[${round(Math.min(-2,p))}, ${round(Math.max(2,p+2))}]`:`[−2, 2] ∪ [${round(p)}, ${round(p+2)}]`}。${p>=-2&&p+2<=2?'B ⊆ A。':'B 不是 A 的子集。'}拖动只演示闭区间，有限集合仍需逐个检查元素。`;
  } else if(kind==='inequality'){
   const d=Math.abs(q-1);g=line(1-p,0,1+p,0,'yellow')+path(x=>Math.abs(x-1))+line(-5,p,5,p,'red',true)+dot(q,d)+txt(1-p,-.6,round(1-p))+txt(1+p,-.6,round(1+p));
   out=`|${round(q)}−1|=${round(d)}，${Math.abs(d-p)<1e-9?'等于':d<p?'小于':'大于'} r=${round(p)}。|x−1|<r 的解是 (${round(1-p)}, ${round(1+p)})，两端不包含。`;
  } else if(kind==='quadratic'){
   g=path(x=>x*x-p*p)+line(-p,0,p,0,'yellow')+dot(q,q*q-p*p)+txt(-p,-.5,'−r')+txt(p,-.5,'r');out=`f(${round(q)})=${round(q*q-p*p)}。当 −${round(p)}<x<${round(p)} 时 f(x)<0；在两根外侧 f(x)>0，两个零点处等于 0。`;
  } else if(kind==='function'){
   g=path(x=>(x-p)**2+q)+line(p,-3.5,p,3.5,'red',true)+dot(p,q,'vertex')+dot(u,(u-p)**2+q,'probe','red');out=`y=(x−${round(p)})²+${round(q)}。顶点 (${round(p)},${round(q)})，全域最小值 ${round(q)}。f(${round(u)})=${round((u-p)**2+q)}。限制定义域后须重新比较边界。`;
  } else if(kind==='power'){
   const f=x=>(p<=0&&x===0)||(form&&!Number.isInteger(p)&&x<0)?NaN:x**p,y=f(q);
   g=path(f)+(Number.isNaN(y)?'':dot(q,y))+(p===0?circle(0,1,.08,'red'):'');
   out=`y=x^${p}，f(${round(q)})${Number.isNaN(y)?'在此模型中无定义':Number.isFinite(y)?'≈'+round(y):'超出数值范围'}。${Number.isInteger(p)?'负整数幂和零次幂排除 x=0。':p>0?'非整数幂在此实验只画 x≥0 的实数分支。':'负的非整数幂在此实验只画 x>0 的实数分支。'}`;
  } else if(kind==='exponential'){
   g=path(x=>p**x)+dot(q,p**q);out=`y=${round(p)}^x，f(${round(q)})≈${round(p**q)}。${p===1?'底数为 1 得到常函数，不属于通常定义的指数函数。':p>1?'底数大于 1，严格递增。':'底数在 (0,1) 内，严格递减。'}所有图像过 (0,1)。`;
  } else if(kind==='logarithm'){
   const valid=p>0&&p!==1,ly=valid?Math.log(q)/Math.log(p):NaN;
   g=line(-4,-4,4,4,'axis',true)+(valid?path(x=>x>0?Math.log(x)/Math.log(p):NaN)+path(x=>p**x,-4,4,'yellow')+dot(q,ly):'');out=valid?`log_${round(p)}(${round(q)})≈${round(ly)}。交换坐标后 (${round(ly)},${round(q)}) 在指数图像上。绿色对数图像仅在 x>0 存在。`:'a=1 不能作为对数底数：1 的任何次方都是 1，无法建立唯一的反函数。';
  } else if(kind==='unitcircle'){
   const t=p*Math.PI/180,x=Math.cos(t),y=Math.sin(t);g=circle(0,0,1)+line(0,0,x,y)+line(x,0,x,y,'red')+line(0,0,x,0,'yellow')+dot(x,y)+txt(1.15,.2,'(1,0)')+txt(-.3,1.25,'(0,1)');out=`θ=${p}°≈${round(t)} 弧度；cos θ≈${round(x)}，sin θ≈${round(y)}；tan θ${Math.abs(x)<1e-8?'未定义':'≈'+round(y/x)}。sin²θ+cos²θ=1。`;
  } else if(kind==='sine'){
   const period=2*Math.PI/q,raw=(Math.PI/2-u)/q,x=raw-Math.round(raw/period)*period;g=path(x=>p*Math.sin(q*x+u)+v)+line(-5,v,5,v,'axis',true)+dot(x,p+v);out=`y=${round(p)}sin(${round(q)}x+${round(u)})+${round(v)}。振幅 ${round(p)}，周期 2π/ω≈${round(2*Math.PI/q)}；值域 [${round(v-p)},${round(v+p)}]。水平平移量是 −φ/ω≈${round(-u/q)}。`;
  } else if(kind==='tangent'){
   g=path(x=>Math.tan(x))+line(-Math.PI/2,-3.4,-Math.PI/2,3.4,'red',true)+line(Math.PI/2,-3.4,Math.PI/2,3.4,'red',true)+dot(p,Math.tan(p));out=`tan(${round(p)})≈${round(Math.tan(p))}。周期为 π；在每个 (−π/2+kπ, π/2+kπ) 上递增，不能跨渐近线说全域递增。`;
  } else if(kind==='vector'||kind==='matrix'){
   const a=[2,0],det=2*q,dotProduct=2*p;
   g=poly([[0,0],a,[2+p,q],[p,q]])+line(0,0,2,0)+line(0,0,p,q,'yellow')+line(2,0,2+p,q,'axis',true)+line(p,q,p+2,q,'axis',true)+dot(p,q)+txt(2.1,.2,'a=(2,0)');
   out=kind==='vector'?`b=(${round(p)},${round(q)})，a+b=(${round(2+p)},${round(q)})。a·b=${round(dotProduct)}；b 在 a 方向的投影是 ${round(p)}。`:`矩阵列向量为 (2,0)、(${round(p)},${round(q)})。det=${round(det)}；平行四边形面积 |det|=${round(Math.abs(det))}。${Math.abs(det)<1e-8?'此时两列线性相关，不可逆。':'此时矩阵可逆。'}`;
  } else if(kind==='space'){
   const az=p*Math.PI/180,el=q*Math.PI/180,pr=([x,y,z])=>{const a=x*Math.cos(az)-y*Math.sin(az),b=x*Math.sin(az)+y*Math.cos(az);return [a,b*Math.sin(el)+z*Math.cos(el)];};
   const pts=[];for(let z of [-1,1])for(let y of [-1,1])for(let x of [-1,1])pts.push([x,y,z]);
   for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)if(pts[i].filter((x,k)=>x!==pts[j][k]).length===1){const a=pr(pts[i]),b=pr(pts[j]);g+=line(...a,...b,(i===0||j===0)?'axis':'green');}
   g+=line(...pr(pts[0]),...pr(pts[7]),'red')+dot(...pr(pts[7]));axes='';out='这是棱长为 2 的立方体的正交线框投影（未作遮挡消隐）。体对角线长度 √(2²+2²+2²)=2√3。投影长度随视角改变，实际边长、平行与垂直关系不变。';
  } else if(kind==='solid'){
   const bottom=-1.5,top=bottom+q;g=`<ellipse cx="${X(0)}" cy="${Y(bottom)}" rx="${p*U}" ry="${p*U*.28}" class="d-green"/><ellipse cx="${X(0)}" cy="${Y(top)}" rx="${p*U}" ry="${p*U*.28}" class="d-green"/>`+line(-p,bottom,-p,top)+line(p,bottom,p,top)+line(-p,bottom,0,top,'yellow')+line(p,bottom,0,top,'yellow')+dot(0,top)+txt(p+.15,bottom+q/2,'h');axes='';out=`底面积 S=πr²≈${round(Math.PI*p*p)}。圆柱体积 Sh≈${round(Math.PI*p*p*q)}，同底等高圆锥体积 Sh/3≈${round(Math.PI*p*p*q/3)}；圆锥母线 √(r²+h²)≈${round(Math.hypot(p,q))}。`;
  } else if(kind==='complex'){
   g=line(0,0,p,q)+dot(p,q)+circle(p,-q,.09,'red')+circle(-q,p,.09,'green')+line(p,q,p,-q,'axis',true)+txt(p+.15,q+.15,'z')+txt(p+.15,-q-.2,'共轭 z')+txt(-q-.4,p+.25,'iz');out=`z=${round(p)}+(${round(q)})i，|z|≈${round(Math.hypot(p,q))}；共轭为 ${round(p)}−(${round(q)})i；iz=${round(-q)}+(${round(p)})i。乘 i 保持模长，逆时针旋转 90°。`;
  } else if(kind==='sequence'){
   let sum=0,an=0;for(let i=1;i<=u;i++){an=s.sequence==='arithmetic'?p+(i-1)*q:p*q**(i-1);sum+=an;g+=circle(i/2-3,an,.06);if(i===u)g+=dot(i/2-3,an);g+=txt(i/2-3,-2.9,String(i));}out=`${s.sequence==='arithmetic'?'等差':'等比'}数列，a₁=${round(p)}，${s.sequence==='arithmetic'?'d':'q'}=${round(q)}；a${u}≈${round(an)}，前 ${u} 项和≈${round(sum)}。横轴标签为项数 n；超出纵轴窗口的点不显示。${s.sequence==='geometric'&&(p===0||q===0)?'这里仅演示 aₙ₊₁=q·aₙ 的递推；出现零项时不符合通常的非零等比数列定义。':''}`;
  } else if(kind==='algorithm'){
   let sum=0;for(let i=1;i<=p;i++){sum+=i;g+=`<rect x="${45+(i-1)%5*110}" y="${60+Math.floor((i-1)/5)*120}" width="94" height="70" rx="10" class="d-node"/><text x="${56+(i-1)%5*110}" y="${87+Math.floor((i-1)/5)*120}" class="d-text">i=${i}</text><text x="${56+(i-1)%5*110}" y="${112+Math.floor((i-1)/5)*120}" class="d-text">S=${sum}</text>`;}g+=dot((p-1)*.5-2,-2);axes='';out=`初始化 S=0。循环 i 从 1 到 ${p}，每轮 S←S+i，最终 S=${sum}=${p}×${p+1}/2。每个框记录一次执行后的状态。`;
  } else if(kind==='line'){
   const x0=1,y0=2,d=(p*x0-y0+q)/(p*p+1),foot=[x0-p*d,y0+d];g=path(x=>p*x+q)+line(x0,y0,...foot,'red')+circle(x0,y0,.08,'red')+dot(1,p+q)+txt(x0+.2,y0+.25,'P(1,2)');out=`y=${round(p)}x+${round(q)}，到 P(1,2) 的距离=|k−2+b|/√(k²+1)≈${round(Math.abs(p-2+q)/Math.hypot(p,1))}。垂足≈(${round(foot[0])},${round(foot[1])})。竖直线不能写成此斜截式。`;
  } else if(kind==='conic'){
   const type=s.conic,t=u;
   let point,extra='';
   if(type==='circle'){g=circle(0,0,p);point={x:p*Math.cos(t),y:p*Math.sin(t)};extra=`x²+y²=${round(p*p)}。圆心为原点，半径 ${round(p)}。`;}
   else if(type==='ellipse'){g=`<ellipse cx="300" cy="200" rx="${p*U}" ry="${q*U}" class="d-green"/>`;point=conicPoint(type,t,p,q);const c=Math.sqrt(Math.abs(p*p-q*q)),horizontal=p>=q;const f1=horizontal?[-c,0]:[0,-c],f2=horizontal?[c,0]:[0,c];g+=circle(...f1,.07,'red')+circle(...f2,.07,'red')+line(...f1,point.x,point.y,'yellow')+line(...f2,point.x,point.y,'yellow');extra=`x²/${round(p*p)}+y²/${round(q*q)}=1。到两焦点距离之和=2×较大半轴=${round(2*Math.max(p,q))}。`;}
   else if(type==='hyperbola'){g=path(y=>p*Math.sqrt(1+y*y/(q*q)),-3.5,3.5);let d='';for(let y=-3.5;y<=3.5;y+=.02){const x=p*Math.sqrt(1+y*y/(q*q));d+=`${d?'L':'M'}${X(x)},${Y(y)} `;}g=`<path d="${d}" class="d-green"/>`+line(-5,-5*q/p,5,5*q/p,'axis',true)+line(-5,5*q/p,5,-5*q/p,'axis',true);point=conicPoint(type,t,p,q);const c=Math.hypot(p,q);g+=circle(c,0,.07,'red')+circle(-c,0,.07,'red');extra=`x²/${round(p*p)}−y²/${round(q*q)}=1。两焦点距离差的绝对值=2a=${round(2*p)}，c²=a²+b²。此处仅画右支。`;}
   else {let d='';for(let y=-3.5;y<=3.5;y+=.02)d+=`${d?'L':'M'}${X(y*y/(2*p))},${Y(y)} `;g=`<path d="${d}" class="d-green"/>`+line(-p/2,-3.4,-p/2,3.4,'red',true)+circle(p/2,0,.07,'red');point=conicPoint('parabola',t,p,q);g+=line(point.x,point.y,p/2,0,'yellow')+line(point.x,point.y,-p/2,point.y,'yellow');extra=`y²=2px=${round(2*p)}x。焦点 (${round(p/2)},0)，准线 x=−${round(p/2)}，点到焦点与准线距离相等。`;}
   g+=dot(point.x,point.y);out=`${extra} P≈(${round(point.x)},${round(point.y)})。`;
  } else if(kind==='coordinate'){
   const t=q*Math.PI/180,dx=u-p,xx=dx*Math.cos(t)+v*Math.sin(t),yy=-dx*Math.sin(t)+v*Math.cos(t);g=line(p-4*Math.cos(t),-4*Math.sin(t),p+4*Math.cos(t),4*Math.sin(t),'red')+line(p+3*Math.sin(t),-3*Math.cos(t),p-3*Math.sin(t),3*Math.cos(t),'red')+dot(u,v)+circle(p,0,.06,'red')+txt(p+.2,-.4,'新原点');out=`新原点 O′=(${round(p)},0)，坐标轴逆时针旋转 ${q}°。P 的新坐标≈(${round(xx)},${round(yy)})。旧坐标极径 ρ≈${round(Math.hypot(u,v))}，${Math.hypot(u,v)<1e-9?'点在极点，极角任意，不能由坐标唯一确定':`极角≈${round(Math.atan2(v,u))} 弧度（相差 2kπ 表示同一方向）`}。`;
  } else if(kind==='counting'){
   const r=Math.min(p,q);let arrangements=1;for(let i=0;i<r;i++)arrangements*=p-i;
   for(let i=0;i<p;i++)g+=`<circle cx="${70+i*62}" cy="130" r="22" class="${i<r?'d-fill-yellow':'d-node'}"/><text x="${64+i*62}" y="136" class="d-text">${i+1}</text>`;g+=dot(r*.85-3,-1);axes='';out=`从 ${p} 个不同对象中选 ${r} 个（r≤n）：组合数 C=${choose(p,r)}，排列数 A=${arrangements}。每组有 r! 种顺序，所以 A=C·r!。`;
  } else if(kind==='probability'){
   let total=0;for(let k=0;k<=p;k++){const prob=binomial(p,q,k);total+=prob;g+=`<rect x="${55+k*46}" y="${320-prob*240}" width="30" height="${prob*240}" class="d-fill-green"/><text x="${64+k*46}" y="343" class="d-text">${k}</text>`;}g+=`<text x="45" y="38" class="d-text">柱高表示 P(X=k)；横轴为成功次数 k</text>`+dot(q*6-3,-2.7);axes='';out=`X~B(${p},${round(q)})，E(X)=np=${round(p*q)}，Var(X)=np(1−p)=${round(p*q*(1-q))}，各柱概率之和≈${round(total)}。这是理论概率，并非随机抽样的频率。`;
  } else if(kind==='derivative'){
   const m=secantSlope(p,q);g=path(x=>x*x)+path(x=>m*(x-p)+p*p,-5,5,'yellow')+path(x=>2*p*(x-p)+p*p,-5,5,'red')+circle(p,p*p,.07,'red')+dot(p+q,(p+q)**2);out=`割线斜率=[(x₀+h)²−x₀²]/h=2x₀+h=${round(m)}。切线斜率 f′(x₀)=2x₀=${round(2*p)}；差值正好是 h=${round(q)}。此演示从 h>0 逼近，导数存在还要求两侧极限相同。`;
  } else if(kind==='limit'){
   g=path(x=>x+1)+`<circle cx="${X(1)}" cy="${Y(2)}" r="7" class="d-red d-open"/>`+dot(1+p,2+p)+circle(1-p,2-p,.07,'green');out=`f(x)=(x²−1)/(x−1)=x+1（x≠1）。在 x=1±${round(p)} 时，f(x)=2±${round(p)}。两侧极限均为 2，原式的 f(1) 却没有定义。空心点不补上。`;
  }
  svg.innerHTML=`<defs><clipPath id="concept-plot"><rect x="20" y="20" width="560" height="360"/></clipPath></defs><g clip-path="url(#concept-plot)">${axes}${g}</g>`;
  read.textContent=out+(outside?' 取点超出当前图窗或数值范围；可重新填写参数。':'');
  if(form){error.hidden=true;for(const c of config.controls){const field=form.elements.namedItem(c.key);field.value=s[c.key];field.removeAttribute('aria-invalid');}}
  for(const c of config.controls){root.querySelector(`[data-param="${c.key}"]`).value=s[c.key];root.querySelector(`[data-output="${c.key}"]`).textContent=round(s[c.key]);}
  for(const b of root.querySelectorAll('[data-sequence]'))b.setAttribute('aria-pressed',String(b.dataset.sequence===s.sequence));
  for(const b of root.querySelectorAll('[data-conic]'))b.setAttribute('aria-pressed',String(b.dataset.conic===s.conic));
 }
 function set(key,value){const c=config.controls.find(c=>c.key===key);if(c)s[key]=Number(clamp(Math.round(value/c.step)*c.step,c.min,c.max).toFixed(8));}
 form?.addEventListener('submit',e=>{
  e.preventDefault();
  const values={};
  for(const c of config.controls){
   const field=form.elements.namedItem(c.key);
   field.removeAttribute('aria-invalid');
   const n=parseParameter(field.value),message=parameterError(section.id,c.key,n);
   if(message){error.textContent=c.label+'：'+message;error.hidden=false;field.setAttribute('aria-invalid','true');field.focus();return;}
   values[c.key]=n;
  }
  Object.assign(s,values);draw();
 });
 root.addEventListener('input',e=>{if(e.target.matches('[data-param]')){set(e.target.dataset.param,Number(e.target.value));draw();}});
 root.addEventListener('click',e=>{if(e.target.closest('[data-diagram-reset]')){for(const c of config.controls)s[c.key]=c.value;s.sequence=initialSequence;s.conic=initialConic;draw();}if(e.target.dataset.sequence){s.sequence=e.target.dataset.sequence;draw();}if(e.target.dataset.conic){s.conic=e.target.dataset.conic;draw();}});
 function move(e){const rect=svg.getBoundingClientRect(),U=['unitcircle','complex'].includes(kind)?70:50,x=((e.clientX-rect.left)*600/rect.width-300)/U,y=(200-(e.clientY-rect.top)*400/rect.height)/U;
  if(section.experiment)set('p',config.drag?config.drag(x,y):x);
  else if(kind==='unitcircle')set('p',Math.atan2(y,x)*180/Math.PI);
  else if(['vector','matrix','complex'].includes(kind)){set('p',x);set('q',y);}
  else if(kind==='sets')set('p',x);
  else if(['inequality','quadratic','power','exponential','logarithm'].includes(kind))set('q',x);
  else if(kind==='function'){if(drag==='vertex'){set('p',x);set('q',y);}else set('u',x);}
  else if(kind==='sine')set('p',y-s.v);
  else if(kind==='tangent')set('p',x);
  else if(kind==='space'&&dragStart){set('p',dragStart.p+(e.clientX-dragStart.x)/rect.width*180);set('q',dragStart.q-(e.clientY-dragStart.y)/rect.height*65);}
  else if(kind==='solid')set('q',y+1.5);
  else if(kind==='sequence'){if(s.sequence==='arithmetic')set('q',(y-s.p)/(s.u-1));else if(Math.abs(s.p)>1e-10){const ratio=y/s.p,degree=s.u-1;if(ratio>=0)set('q',(s.q<0&&degree%2===0?-1:1)*ratio**(1/degree));else if(degree%2===1)set('q',-((-ratio)**(1/degree)));}}
  else if(kind==='algorithm')set('p',(x+2)*2+1);
  else if(kind==='line')set('p',y-s.q);
  else if(kind==='conic'){const t=s.conic==='hyperbola'?Math.asinh(y/s.q):s.conic==='parabola'?y:Math.atan2(y/(s.conic==='circle'?s.p:s.q),x/s.p);set('u',t);}
  else if(kind==='coordinate'){set('u',x);set('v',y);}
  else if(kind==='counting')set('q',(x+3)/.85);
  else if(kind==='probability')set('q',(x+3)/6);
  else if(kind==='derivative')set('q',x-s.p);
  else if(kind==='limit')set('p',x-1);
  draw();
 }
 svg.addEventListener('pointerdown',e=>{const handle=e.target.closest('[data-drag]');if(!handle&&kind!=='space')return;e.preventDefault();drag=handle?.dataset.drag||'view';dragStart={x:e.clientX,y:e.clientY,p:s.p,q:s.q};svg.setPointerCapture(e.pointerId);});
 svg.addEventListener('pointermove',e=>{if(drag)move(e);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(event,()=>{drag=null;});
 svg.addEventListener('keydown',e=>{const point=e.target.closest('[data-drag]');if(!point||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const bindings={coordinate:['u','v'],vector:['p','q'],matrix:['p','q'],complex:['p','q'],space:['p','q'],function:point.dataset.drag==='vertex'?['p','q']:['u'],inequality:['q'],quadratic:['q'],power:['q'],exponential:['q'],logarithm:['q'],solid:['q'],sequence:['q'],conic:['u'],counting:['q'],probability:['q'],derivative:['q']},keys=section.experiment?['p']:bindings[kind]||[config.controls[0].key],key=['ArrowUp','ArrowDown'].includes(e.key)?keys[1]||keys[0]:keys[0],c=config.controls.find(c=>c.key===key);set(key,s[key]+(['ArrowRight','ArrowUp'].includes(e.key)?c.step:-c.step));const type=point.dataset.drag;draw();svg.querySelector(`[data-drag="${type}"]`)?.focus();});
 draw();
}
