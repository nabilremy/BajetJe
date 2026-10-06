const L={100:'#eaffcc',200:'#d9ffa3',300:'#c5ff73',400:'#aef24d',500:'#93db2e',600:'#74b31d',700:'#588a16',800:'#406312',900:'#2b420d'};
let seed=3; const rnd=()=>{seed=(seed*16807)%2147483647; return seed/2147483647;};
function cr(pts,n=70){ // Catmull-Rom through points
  const P=[pts[0],...pts,pts[pts.length-1]], out=[];
  for(let i=1;i<P.length-2;i++){ const [p0,p1,p2,p3]=[P[i-1],P[i],P[i+1],P[i+2]]; const steps=Math.ceil(n/(P.length-3));
    for(let s=0;s<steps;s++){ const t=s/steps,t2=t*t,t3=t2*t; out.push([0,1].map(k=>0.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3))); } }
  out.push(pts[pts.length-1]); return out; }
function wobble(pts,amp=1.1){ const ph=[rnd()*6.28,rnd()*6.28], f=[1.5+rnd()*1.5,3.5+rnd()*2]; const n=pts.length;
  return pts.map((p,i)=>{ const t=i/(n-1); const a=pts[Math.max(0,i-1)], b=pts[Math.min(n-1,i+1)]; let dx=b[0]-a[0], dy=b[1]-a[1]; const l=Math.hypot(dx,dy)||1; const nx=-dy/l, ny=dx/l;
    const o=amp*(Math.sin(6.28*f[0]*t+ph[0])*0.7+Math.sin(6.28*f[1]*t+ph[1])*0.3); return [p[0]+nx*o,p[1]+ny*o]; }); }
function ribbon(pts,w,taper=0.35){ const n=pts.length,L1=[],R=[];
  for(let i=0;i<n;i++){ const t=i/(n-1); const a=pts[Math.max(0,i-1)], b=pts[Math.min(n-1,i+1)]; let dx=b[0]-a[0], dy=b[1]-a[1]; const l=Math.hypot(dx,dy)||1; const nx=-dy/l, ny=dx/l;
    const press=(1-taper)+taper*Math.sin(Math.PI*Math.min(1,Math.max(0,t)))+ (rnd()-0.5)*0.12; const ww=w*press/2;
    L1.push([pts[i][0]+nx*ww,pts[i][1]+ny*ww]); R.push([pts[i][0]-nx*ww,pts[i][1]-ny*ww]); }
  const f=p=>p.map(v=>v.toFixed(1)).join(' '); return 'M'+L1.map(f).join(' L')+' L'+R.reverse().map(f).join(' L')+'Z'; }
const strokes=()=>[
  [[33,16],[32.5,40],[32.2,70],[31.6,104]],
  [[26,22],[48,19.5],[69,21],[81,30],[80.5,44],[69,53.5],[37,57]],
  [[33,56.5],[58,55.5],[79,61],[88.5,77],[84,93],[64,101.5],[27,101]] ];
const tile=(bg,inner,size=240)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}"><rect width="120" height="120" rx="27" fill="${bg}"/>${inner}</svg>`;
// V1 · Marker B: one confident pressure stroke + faint second pass
function marker(t){ seed=3; const dk=t==='dark'; const ink=dk?L[300]:L[900], ghost=dk?L[600]:L[600];
  let s=''; for (const st of strokes()) s+=`<path d="${ribbon(wobble(cr(st),0.8),9.5,0.45)}" fill="${ink}"/>`;
  let g=''; for (const st of strokes()) g+=`<path d="${ribbon(wobble(cr(st.map(([x,y])=>[x+3.2,y+3.4])),1.3),4,0.5)}" fill="${ghost}" opacity=".9"/>`;
  return g+s; }
// V2 · Sketch outline B with scribble hatch fill
const OUT=[[30,19],[64,19.5],[85,26],[87.5,40],[79,55],[92,64],[94,80],[86,96],[66,101],[30,101],[26,95],[26,25],[30.5,19]];
const C1=[[41,32],[62,32],[71,37],[71,45],[62,50],[41,50],[41,32]], C2=[[41,63],[66,63],[77,68],[77,80],[66,86],[41,86],[41,63]];
const poly=pts=>'M'+pts.map(p=>p.join(' ')).join(' L')+'Z';
function sketch(t,extra='',o={}){ const id=o.id||('bc'+t), ow=o.ow||4.2, cw=o.cw||3.4, step=o.step||6.5, hw=o.hw||2.6, ghost=o.ghost!==false; seed=9; const dk=t==='dark'; const ink=dk?L[100]:L[900], hatch=dk?L[500]:L[500];
  const clip=`<clipPath id="${id}"><path d="${poly(OUT)} ${poly(C1)} ${poly(C2)}" clip-rule="evenodd"/></clipPath>`;
  let h=''; for(let k=-40;k<140;k+=step){ const pts=wobble(cr([[k,122],[k+60,10]],20),0.7); h+=`<path d="${ribbon(pts,hw,0.2)}" fill="${hatch}"/>`; }
  let oo=''; for (const [pts,amp,w] of [[OUT,1.2,ow],[C1,0.9,cw],[C2,0.9,cw]]) { const a=cr(pts,90); oo+=`<path d="${ribbon(wobble(a,amp),w,0.25)}" fill="${ink}"/>`; const gp=`<path d="${ribbon(wobble(a.map(([x,y])=>[x+1.4,y-1.1]),1.6),1.4,0.3)}" fill="${ink}" opacity=".6"/>`; if(ghost) oo+=gp; }
  return `<defs>${clip}</defs><g class="sk-hatch" clip-path="url(#${id})" transform="translate(3.5 3.5)">${h}</g><g class="sk-line">${oo}</g>${extra}`; }
// V3 · Sketch wallet B: V2 + stitches, card, snap (all hand-drawn)
function wallet(t){ const dk=t==='dark'; const ink=dk?L[100]:L[900], acc=dk?L[300]:L[600];
  seed=21; let st=''; const path=cr([[35,27],[62,26.5],[78,32],[79,44],[70,56],[85,62],[86,80],[78,92],[64,94],[35,94],[34,27]],120);
  for(let i=0;i<path.length-4;i+=7){ st+=`<path d="${ribbon(wobble(path.slice(i,i+4),0.3),1.7,0.4)}" fill="${ink}"/>`; }
  const card=`<path d="${ribbon(wobble(cr([[46,40],[46,26],[67,25.5],[67.5,40]],30),0.5),2.6,0.2)}" fill="${ink}"/><path d="M47 39 L47 27.5 L66 27 L66.5 39Z" fill="${acc}"/><path d="${ribbon(wobble(cr([[51,31],[61,30.6]],10),0.3),1.8,0.3)}" fill="${ink}"/>`;
  const snap=`<path d="${ribbon(wobble(cr([[84,70],[88.5,72.5],[88,77.5],[83.5,78.5],[80,75],[81.5,70.5],[84.5,69.8]],30),0.4),2.2,0.2)}" fill="${ink}"/>`;
  return sketch(t, st+card+snap); }

module.exports={sketch,L};
