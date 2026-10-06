// "Extra money" scribble underline: one confident swipe, then a looser return pass, like a quick marker sketch.
// Run: node brand/generators/underline.js  (writes brand/doodles/underline-scribble.svg)
const fs=require('fs'), path=require('path');
const {draw,cr}=require('./engine.js');
const Y='#FFD066';
const swipe={p:cr([[2,8.6],[30,7.4],[62,6.6],[94,5.4],[117,4.6]],60),raw:true,w:2.6,a:0.35,t:0.55};
const back={p:cr([[108,7.2],[80,8.8],[48,9.6],[16,10.6]],50),raw:true,w:1.7,a:0.45,t:0.6};
const one=(s,seedv)=>draw([s],{color:Y,cls:'dd',seedv});
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 14" width="120" height="14" color="${Y}">${one(swipe,11)}${one(back,23).replace('class="dd"','class="dd" opacity=".75"')}</svg>\n`;
fs.writeFileSync(path.join(__dirname,'../doodles/underline-scribble.svg'),svg);
console.log(svg.length,'bytes');
