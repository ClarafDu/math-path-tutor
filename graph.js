// 所有图形直接按解析式绘制；坐标轴采用相同单位长度。
export const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export const validBase=a=>Number.isFinite(a)&&a>0&&Math.abs(a-1)>1e-8;
export function logValue(x,a,h=0,k=0){return validBase(a)&&x>h?Math.log(x-h)/Math.log(a)+k:NaN;}
export function inequality(a,h,k,sign='>'){
 if(!validBase(a))return null;
 const boundary=h+a**k,right=(a>1)===(sign==='>');
 const boundaryLabel=Math.abs(boundary-Number(boundary.toFixed(3)))<1e-10?fmt(boundary):`${h!==0?fmt(h)+' + ':''}${fmt(a)}^(${fmt(k)})`;
 return {boundary,direction:right?'right':'left',domain:h,interval:right?`(${boundaryLabel}, +∞)`:`(${fmt(h)}, ${boundaryLabel})`};
}
export function fmt(n){return Number.isFinite(n)?String(Number(n.toFixed(3))):'—';}
const area={left:56,top:24,size:56,xmin:-4,xmax:6,ymin:-3,ymax:5};
const sx=x=>area.left+(x-area.xmin)*area.size,sy=y=>area.top+(area.ymax-y)*area.size;
export function chartPoint(clientX,clientY,rect){return {x:(clientX-rect.left)*640/rect.width/56-5,y:5-((clientY-rect.top)*520/rect.height-24)/56};}
function path(fn,min=-4,max=6){let d='',pen=false;for(let i=0;i<=1000;i++){const x=min+(max-min)*i/1000,y=fn(x);if(!Number.isFinite(y)||Math.abs(y)>30){pen=false;continue;}d+=`${pen?'L':'M'}${sx(x).toFixed(2)} ${sy(y).toFixed(2)} `;pen=true;}return d;}
function handle(x,y,type,color,label){if(!Number.isFinite(y)||x<area.xmin||x>area.xmax||y<area.ymin||y>area.ymax)return '';return `<g class="graph-handle" data-handle="${type}" tabindex="0" role="button" aria-label="${label}"><circle cx="${sx(x)}" cy="${sy(y)}" r="20" fill="transparent"/><circle cx="${sx(x)}" cy="${sy(y)}" r="8" fill="${color}" stroke="white" stroke-width="3"/><circle cx="${sx(x)}" cy="${sy(y)}" r="12" fill="none" stroke="${color}" stroke-opacity=".3"/></g>`;}
export function labHTML(){return `<div class="lab-modes" role="group" aria-label="图形实验模式"><button data-mode="transform" class="active" aria-pressed="true">01 函数变形</button><button data-mode="inverse" aria-pressed="false">02 互为反函数</button><button data-mode="inequality" aria-pressed="false">03 图解不等式</button></div>
 <section class="lab-layout"><div class="graph-panel"><div class="graph-header"><div><span class="eyebrow">DRAG · OBSERVE · EXPLAIN</span><h2 id="graph-formula"></h2></div><span class="live-label"><i></i> 实时联动</span></div><svg id="function-graph" viewBox="0 0 640 520" aria-label="可拖动的数学函数图像" role="group"><defs><clipPath id="plot-clip"><rect x="56" y="24" width="560" height="448"/></clipPath></defs><g id="graph-grid"></g><g id="graph-curves" clip-path="url(#plot-clip)"></g><g id="graph-handles"></g></svg><div class="graph-legend" id="graph-legend"></div><p class="graph-instruction" id="graph-instruction"></p></div>
 <aside class="graph-controls"><span class="eyebrow">让公式与图像一起变化</span><h3>动手，看看会发生什么。</h3><div class="graph-presets" aria-label="底数快捷选择"><button data-base="0.5">a = ½</button><button data-base="2">a = 2</button><button data-base="3">a = 3</button></div><label class="range-field" for="base-range">底数 a <output id="base-value"></output><input id="base-range" type="range" min="0.25" max="4" step="0.05" value="2"></label><div id="transform-controls"><label class="range-field" for="h-range">水平平移 h <output id="h-value"></output><input id="h-range" type="range" min="-2" max="2" step="0.25" value="0"></label><label class="range-field" for="k-range"><span id="k-label">竖直平移 k</span> <output id="k-value"></output><input id="k-range" type="range" min="-2" max="2" step="0.25" value="0"></label></div><label class="range-field" for="probe-range"><span id="probe-label">取点距离 x − h</span><output id="probe-value"></output><input id="probe-range" type="range" min="0.25" max="4" step="0.05" value="3"></label><div id="inequality-controls" hidden><label class="select-field" for="inequality-sign">比较方向<select id="inequality-sign"><option value=">">logₐ(x − h) &gt; k</option><option value="<">logₐ(x − h) &lt; k</option></select></label></div><div class="graph-observation" id="graph-observation" aria-live="polite"></div><button class="secondary" id="graph-reset">恢复初始图像 ↺</button></aside></section>
 <section class="graph-challenge"><div><span class="eyebrow">从观察，到表达</span><h3 id="challenge-title"></h3><p id="challenge-description"></p></div><button class="primary" id="check-challenge">检查我的图像 ✓</button><p id="challenge-feedback" role="status"></p></section><p class="fineprint">控制点支持鼠标、触屏和方向键。读数最多保留三位小数。绿色表示函数，黄色表示可调参数，红色表示取点或临界条件。图像帮助发现规律，结论仍需结合定义与推理。</p>`;}
export function mountLab(container){
 const s={mode:'transform',a:2,h:0,k:0,q:3,t:1,sign:'>'};
 const get=id=>container.querySelector('#'+id),svg=get('function-graph');
 let grid='';for(let x=-4;x<=6;x++)grid+=`<line x1="${sx(x)}" y1="24" x2="${sx(x)}" y2="472" class="${x===0?'axis':'grid-line'}"/><text x="${sx(x)}" y="${sy(0)+19}" class="axis-label" text-anchor="middle">${x===0?'':x}</text>`;
 for(let y=-3;y<=5;y++)grid+=`<line x1="56" y1="${sy(y)}" x2="616" y2="${sy(y)}" class="${y===0?'axis':'grid-line'}"/><text x="${sx(0)-13}" y="${sy(y)+4}" class="axis-label" text-anchor="end">${y===0?'O':y}</text>`;
 grid+=`<text x="621" y="${sy(0)-9}" class="axis-name">x</text><text x="${sx(0)+10}" y="18" class="axis-name">y</text>`;get('graph-grid').innerHTML=grid;
 const tasks={transform:['让图像递减，并经过 (1, 0)。','先预测底数的范围，再动手验证。注意：取到一个点还不足以确定全部性质。'],inverse:['把指数图像上的点移到 (2, 4)。','先选底数 2，再拖动绿色点。观察对数图像上的对应点去了哪里。'],inequality:['用图像解 log₁⁄₂x > 1。','把底数设为 ½、h 设为 0、k 设为 1，选择 >，再观察交点和横轴阴影。']};
 function update(){
  const valid=validBase(s.a),inv=s.mode==='inverse',ineq=s.mode==='inequality';
  for(const button of container.querySelectorAll('[data-mode]')){button.classList.toggle('active',button.dataset.mode===s.mode);button.setAttribute('aria-pressed',String(button.dataset.mode===s.mode));}
  get('transform-controls').hidden=inv;get('inequality-controls').hidden=!ineq;get('k-label').textContent=ineq?'比较高度 k':'竖直平移 k';
  get('base-range').value=s.a;get('h-range').value=s.h;get('k-range').value=s.k;
  get('base-value').textContent=fmt(s.a);get('h-value').textContent=fmt(s.h);get('k-value').textContent=fmt(s.k);
  const probe=get('probe-range');probe.min=inv?'-2':'0.25';probe.max=inv?'2':'4';probe.value=inv?s.t:s.q;get('probe-label').textContent=inv?'指数图像的横坐标 t':'取点距离 x − h';get('probe-value').textContent=fmt(inv?s.t:s.q);
  const argument=s.h===0?'x':`(x ${s.h>0?'−':'+'} ${fmt(Math.abs(s.h))})`,vertical=s.k===0?'':` ${s.k>0?'+':'−'} ${fmt(Math.abs(s.k))}`;
  get('graph-formula').innerHTML=inv?`y = ${fmt(s.a)}<sup>x</sup> ↔ y = log<sub>${fmt(s.a)}</sub>x`:ineq?`log<sub>${fmt(s.a)}</sub>${argument} ${s.sign==='>'?'&gt;':'&lt;'} ${fmt(s.k)}`:`y = log<sub>${fmt(s.a)}</sub>${argument}${vertical}`;
  get('challenge-title').textContent=tasks[s.mode][0];get('challenge-description').textContent=tasks[s.mode][1];
  let curves='',handles='';
  if(valid){
   if(inv){
    curves=`<path d="${path(x=>x)}" class="mirror-line"/><path d="${path(x=>s.a**x)}" class="function-line"/><path d="${path(x=>logValue(x,s.a))}" class="inverse-line"/>`;
    const y=s.a**s.t;curves+=`<line x1="${sx(s.t)}" y1="${sy(y)}" x2="${sx(y)}" y2="${sy(s.t)}" class="point-guide"/>`;
    handles=handle(s.t,y,'inverse','#23734a','拖动指数函数上的点；方向键调整横坐标')+handle(y,s.t,'inverse-log','#db2222','拖动对数函数上的对应点；方向键调整指数');
    get('graph-observation').innerHTML=`<strong>交换横纵坐标</strong><p>指数图像 P = (${fmt(s.t)}, ${fmt(y)})</p><p>对数图像 P′ = (${fmt(y)}, ${fmt(s.t)})</p><p>两点关于虚线 y = x 对称。</p>${y>5?'<small>对应点超出当前画面，可减小指数或调整底数。</small>':''}`;
   }else{
    curves=`<path d="${path(x=>logValue(x,s.a,s.h,ineq?0:s.k),s.h+.00001,6)}" class="function-line"/><line x1="${sx(s.h)}" y1="24" x2="${sx(s.h)}" y2="472" class="asymptote"/>`;
    if(ineq){
     const result=inequality(s.a,s.h,s.k,s.sign),b=result.boundary;
     curves+=`<line x1="56" y1="${sy(s.k)}" x2="616" y2="${sy(s.k)}" class="threshold-line"/>`;
     const left=result.direction==='right'?b:s.h,right=result.direction==='right'?6:b;
     const lo=Math.max(-4,left),hi=Math.min(6,right);
     if(hi>lo)curves+=`<rect x="${sx(lo)}" y="${sy(0)-8}" width="${(hi-lo)*56}" height="16" class="solution-shade"/>`;
     if(b>=-4&&b<=6)curves+=`<line x1="${sx(b)}" y1="${sy(s.k)}" x2="${sx(b)}" y2="${sy(0)}" class="point-guide"/><circle cx="${sx(b)}" cy="${sy(0)}" r="5" fill="white" stroke="#db2222" stroke-width="2"/>`;
     handles=handle(s.h,-1,'domain','#e6b900','水平拖动黄色点改变 h；方向键左右调整')+handle(b,s.k,'threshold','#db2222','上下拖动红色交点改变 k；方向键上下调整');
     get('graph-observation').innerHTML=`<strong>解集：${result.interval}</strong><p>先保留定义域 x > ${fmt(s.h)}。</p><p>临界点 x = h + aᵏ，约为 ${fmt(b)}。</p><p>${s.a>1?'函数递增，比较方向保持。':'函数递减，比较真数时反向。'}空心端点表示不能取等号。</p>${b>6||b< -4?'<small>临界点超出当前画面，以数值和解集为准。</small>':''}`;
    }else{
     const x=s.h+s.q,y=logValue(x,s.a,s.h,s.k);
     curves+=`<line x1="${sx(x)}" y1="${sy(y)}" x2="${sx(x)}" y2="${sy(0)}" class="point-guide"/>`;
     handles=handle(s.h+1,s.k,'anchor','#23734a','拖动绿色点平移图像；方向键调整 h 和 k')+handle(s.h+s.a,s.k+1,'base','#e6b900','左右拖动黄色点改变底数 a；方向键左右调整')+handle(x,y,'probe','#db2222','左右拖动红色点读取坐标；方向键左右调整');
     get('graph-observation').innerHTML=`<strong>${s.a>1?'递增':'递减'} · 定义域 x > ${fmt(s.h)}</strong><p>竖直渐近线：x = ${fmt(s.h)}</p><p>固定参照点：(${fmt(s.h+1)}, ${fmt(s.k)})</p><p>红色取点：(${fmt(x)}, ${fmt(y)})</p>${y>5||y< -3?'<small>红色取点超出当前画面，可用取点滑块调回。</small>':''}`;
    }
   }
  }else get('graph-observation').innerHTML='<strong class="invalid-base">a = 1：对数函数没有定义。</strong><p>1 的任何实数次幂都等于 1，不能建立对所有正真数的对数函数。请将底数拖离 1。</p>';
  get('graph-curves').innerHTML=curves;get('graph-handles').innerHTML=handles;
  get('graph-legend').innerHTML=inv?'<span><i class="legend-green"></i>指数函数</span><span><i class="legend-yellow"></i>对数函数</span><span>╱ 对称轴 y = x</span>':ineq?'<span><i class="legend-green"></i>对数函数</span><span><i class="legend-red"></i>比较高度 y = k</span><span><i class="legend-yellow"></i>横轴上的解集</span>':'<span><i class="legend-green"></i>平移图像</span><span><i class="legend-yellow"></i>底数 a</span><span><i class="legend-red"></i>坐标取点</span>';
  get('graph-instruction').textContent=inv?'拖动绿色或红色点，观察对应点如何交换坐标。':ineq?'左右拖黄色点改变定义域，上下拖红色交点改变比较高度。':'拖绿色点平移图像，左右拖黄色点改变底数，拖红色点读取坐标。';
 }
 function change(){get('challenge-feedback').textContent='';update();}
 for(const [id,key] of [['base-range','a'],['h-range','h'],['k-range','k']])get(id).addEventListener('input',e=>{s[key]=Number(e.target.value);change();});
 get('probe-range').addEventListener('input',e=>{s[s.mode==='inverse'?'t':'q']=Number(e.target.value);change();});
 get('inequality-sign').addEventListener('change',e=>{s.sign=e.target.value;change();});
 container.addEventListener('click',e=>{const mode=e.target.closest('[data-mode]'),base=e.target.closest('[data-base]');if(mode){s.mode=mode.dataset.mode;change();}if(base){s.a=Number(base.dataset.base);change();}});
 get('graph-reset').addEventListener('click',()=>{Object.assign(s,{a:2,h:0,k:0,q:3,t:1,sign:'>'});get('inequality-sign').value='>';change();});
 get('check-challenge').addEventListener('click',()=>{const near=(a,b)=>Math.abs(a-b)<1e-6;const ok=validBase(s.a)&&(s.mode==='transform'?s.a<1&&near(s.h,0)&&near(s.k,0):s.mode==='inverse'?near(s.a,2)&&near(s.t,2):near(s.a,.5)&&near(s.h,0)&&near(s.k,1)&&s.sign==='>');const text=get('challenge-feedback');text.textContent=ok?(s.mode==='transform'?'图像符合要求。请解释：为什么底数小于 1 时递减，且 logₐ1 = 0？':s.mode==='inverse'?'对应点是 (4, 2)。请把 2² = 4 翻译成对数式。':'解集为 (0, 1/2)。请说明为什么比较方向反转，并保留 x > 0。'):'还差一点。按题目中的条件调整参数，再观察图像。';text.className=ok?'challenge-success':'challenge-retry';});
 let dragging=null;
 function drag(type,p){
  const snap=(v,lo,hi)=>clamp(Math.round(v*20)/20,lo,hi);
  if(type==='base'){s.a=snap(p.x-s.h,.25,4);if(Math.abs(s.a-1)<.025)s.a=p.x-s.h<1?.95:1.05;}
  if(type==='anchor'){s.h=clamp(Math.round((p.x-1)*4)/4,-2,2);if(s.mode==='transform')s.k=clamp(Math.round(p.y*4)/4,-2,2);}
  if(type==='domain')s.h=clamp(Math.round(p.x*4)/4,-2,2);
  if(type==='probe')s.q=snap(p.x-s.h,.25,4);
  if(type==='threshold')s.k=clamp(Math.round(p.y*4)/4,-2,2);
  if(type==='inverse')s.t=snap(p.x,-2,2);
  if(type==='inverse-log'&&p.x>0)s.t=snap(logValue(p.x,s.a),-2,2);
  change();
 }
 svg.addEventListener('pointerdown',e=>{const handle=e.target.closest('[data-handle]');if(!handle)return;e.preventDefault();dragging=handle.dataset.handle;svg.setPointerCapture(e.pointerId);});
 svg.addEventListener('pointermove',e=>{if(dragging)drag(dragging,chartPoint(e.clientX,e.clientY,svg.getBoundingClientRect()));});
 const stop=()=>{dragging=null;};svg.addEventListener('pointerup',stop);svg.addEventListener('pointercancel',stop);
 svg.addEventListener('keydown',e=>{const handle=e.target.closest('[data-handle]');if(!handle||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const dx=e.key==='ArrowLeft'?-.25:e.key==='ArrowRight'?.25:0,dy=e.key==='ArrowUp'?.25:e.key==='ArrowDown'?-.25:0,type=handle.dataset.handle;
  if(type==='base'){s.a=clamp(s.a+dx,.25,4);if(Math.abs(s.a-1)<.025)s.a=dx<0?.95:1.05;}
  if(type==='anchor'){s.h=clamp(s.h+dx,-2,2);if(s.mode==='transform')s.k=clamp(s.k+dy,-2,2);}
  if(type==='domain')s.h=clamp(s.h+dx,-2,2);
  if(type==='probe')s.q=clamp(s.q+dx,.25,4);
  if(type==='threshold')s.k=clamp(s.k+dy,-2,2);
  if(type.startsWith('inverse'))s.t=clamp(s.t+dx+dy,-2,2);
  change();container.querySelector(`[data-handle="${type}"]`)?.focus();
 });
 update();
}
