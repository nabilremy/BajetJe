// BajetJe doodle engine: hand-drawn lines as tapered, wobbly filled ribbons (deterministic)
let seed=1; const rs=s=>{seed=s;}; const rnd=()=>{seed=(seed*16807)%2147483647; return seed/2147483647;};
function cr(pts,n){ if(pts.length<3) { const out=[]; const [a,b]=pts; const m=n||12; for(let i=0;i<=m;i++){const t=i/m; out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);} return out; }
  const P=[pts[0],...pts,pts[pts.length-1]], out=[]; const steps=Math.max(4,Math.ceil((n||pts.length*8)/(P.length-3)));
  for(let i=1;i<P.length-2;i++){ const [p0,p1,p2,p3]=[P[i-1],P[i],P[i+1],P[i+2]];
    for(let s=0;s<steps;s++){ const t=s/steps,t2=t*t,t3=t2*t; out.push([0,1].map(k=>0.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3))); } }
  out.push(pts[pts.length-1]); return out; }
function wob(pts,amp){ const ph=[rnd()*6.28,rnd()*6.28], f=[1+rnd()*1.2,2.5+rnd()*1.5]; const n=pts.length;
  return pts.map((p,i)=>{ const t=i/(n-1); const a=pts[Math.max(0,i-1)], b=pts[Math.min(n-1,i+1)]; const dx=b[0]-a[0], dy=b[1]-a[1]; const l=Math.hypot(dx,dy)||1;
    const o=amp*(Math.sin(6.28*f[0]*t+ph[0])*0.7+Math.sin(6.28*f[1]*t+ph[1])*0.3); return [p[0]-dy/l*o,p[1]+dx/l*o]; }); }
function rib(pts,w,taper=0.4){ const n=pts.length,A=[],B=[];
  for(let i=0;i<n;i++){ const t=i/(n-1); const a=pts[Math.max(0,i-1)], b=pts[Math.min(n-1,i+1)]; const dx=b[0]-a[0], dy=b[1]-a[1]; const l=Math.hypot(dx,dy)||1;
    const ww=w*((1-taper)+taper*Math.sin(Math.PI*t)+(rnd()-0.5)*0.1)/2; A.push([pts[i][0]-dy/l*ww,pts[i][1]+dx/l*ww]); B.push([pts[i][0]+dy/l*ww,pts[i][1]-dx/l*ww]); }
  const f=p=>p[0].toFixed(2)+' '+p[1].toFixed(2); return 'M'+A.map(f).join('L')+'L'+B.reverse().map(f).join('L')+'Z'; }
// primitives -> point lists
const circ=(cx,cy,r,o=0.12)=>{ const pts=[]; const a0=rnd()*6.28; for(let i=0;i<=26;i++){ const t=a0+i/24*6.28*(1+o); pts.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]);} return pts; };
const arc=(cx,cy,r,a1,a2,n=20)=>{ const pts=[]; for(let i=0;i<=n;i++){ const t=(a1+(a2-a1)*i/n)*Math.PI/180; pts.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]);} return pts; };
const rrect=(x,y,w,h,r)=>[[x+r,y],[x+w-r,y],[x+w,y+r],[x+w,y+h-r],[x+w-r,y+h],[x+r,y+h],[x,y+h-r],[x,y+r],[x+r+0.6,y-0.2]];
// draw a list of strokes: each {p:points, s:smooth?} with width w, wobble amp, optional ghost pass
function draw(strokes,{w=1.6,amp=0.25,ghost=0,gw=0.6,color='currentColor',cls='dd',seedv=7}={}){ rs(seedv); let out='';
  for (const st of strokes){ if (st.dot){ const [x,y,r]=st.dot; out+=`<circle class="${cls}" cx="${x}" cy="${y}" r="${r}" fill="${st.c||color}"/>`; continue; } if (st.hatch){ out+=hatch(st.hatch,st.c||color); continue; } const pts=st.raw?st.p:cr(st.p,st.n); const ww=st.w||w; out+=`<path class="${cls}" d="${rib(wob(pts,st.a??amp),ww,st.t??0.4)}" fill="${st.c||color}"/>`;
    if (ghost && !st.noghost) out+=`<path class="${cls}" d="${rib(wob(pts.map(([x,y])=>[x+ghost*0.6,y-ghost*0.5]),(st.a??amp)*1.6),gw,0.5)}" fill="${color}" opacity=".55"/>`; }
  return out; }
// hatching: {x,y,w,h,step,angle,clip:'svg path d'} -> short wobbly diagonal strokes clipped to a polygon via clipPath id
let hid=0; function hatch(h,color){ const id='h'+(++hid)+'_'+Math.floor(rnd()*1e6); let lines=''; for(let k=h.x-h.h; k<h.x+h.w; k+=h.step){ const pts=cr([[k,h.y+h.h],[k+h.h,h.y]],10); lines+=`<path d="${rib(wob(pts,0.3),h.lw||1.1,0.3)}" fill="${color}"/>`; }
  return `<clipPath id="${id}"><path d="${h.clip}"/></clipPath><g clip-path="url(#${id})">${lines}</g>`; }
module.exports={draw,cr,wob,rib,circ,arc,rrect,rs,rnd};
