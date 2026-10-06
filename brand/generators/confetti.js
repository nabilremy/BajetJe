// Doodle confetti for the Healthy moment: small hand-drawn pieces (squiggle, plus, ring, dash, zigzag, dot), 16 x 16 each,
// coloured with currentColor. Run with the other generators (CommonJS): writes brand/doodles/confetti.svg
const fs=require('fs'), path=require('path');
const {draw,circ}=require('./engine.js');
const S=(p,o={})=>({p,...o});
const pieces=[
  [S([[2,9.5],[5,6],[8,10],[11,6],[14,9.5]],{n:30,w:1.8})],
  [S([[8,2.5],[8,13.5]],{w:2}),S([[2.5,8],[13.5,8]],{w:2})],
  [{p:circ(8,8,4.4,0.18),raw:true,w:1.7}],
  [S([[3,11],[13,5]],{w:2.4,t:0.6})],
  [S([[2,10],[5.5,5],[8,10],[10.5,5],[14,10]],{n:20,w:1.6})],
  [{dot:[8,8,2.6]}],
];
const body=pieces.map((p,i)=>`<g id="c${i}">${draw(p,{color:'currentColor',seedv:300+i*7,amp:0.3})}</g>`).join('');
fs.writeFileSync(path.join(__dirname,'../doodles/confetti.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 16" width="96" height="16" color="#F7F7F6">${pieces.map((_,i)=>`<use href="#c${i}" x="${i*16}"/>`).join('')}<defs>${body}</defs></svg>\n`);
console.log(pieces.length,'pieces');
