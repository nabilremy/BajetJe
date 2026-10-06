const {draw,arc}=require('./engine.js');
const S=(p,o={})=>({p,...o}), R=(p,o={})=>({p,raw:true,...o});
// doodle loader: hand-drawn open circle with an arrowhead (rotates)
const spinner=draw([R(arc(12,12,7.6,-80,220,26),{w:2.1}), S([[2.7, 8.05],[6.18,7.11],[5.86, 10.7]],{w:2})],{w:2,amp:0.25,seedv:777,color:'currentColor'});
// doodle arrow from note down-left to the button
const arrow=draw([S([[40,4],[30,6],[20,12],[12,20],[8,28]],{w:1.8,n:30}), S([[3,22],[8,29],[14,24]],{w:1.8})],{w:1.8,amp:0.35,seedv:779,color:'currentColor'});
require('fs').writeFileSync('loader.json',JSON.stringify({spinner,arrow}));
require('fs').writeFileSync('loader.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40" width="320" height="160"><rect width="80" height="40" fill="#c5ff73"/><g color="#1e1e1e">${spinner}</g><g transform="translate(30 0)" color="#1e1e1e">${arrow}</g></svg>`);
