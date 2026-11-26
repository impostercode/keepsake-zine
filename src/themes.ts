import {shapePath,CURVED,DRESSED} from './frames';
export type Theme = 'original' | 'poe' | 'victorian' | 'conservatory';
export type Paper = 'light' | 'dark';
export const themes: Record<Theme, {name:string; description:string; accent:string; dark:string; ink:string; muted:string; gilding:string}> = {
  original: {name:'Original · Keepsake', description:'Warm cream, open space, everyday moments.',accent:'#8a4f3d',dark:'#343d31',ink:'#292b27',muted:'#56564d',gilding:'#cbbd97'},
  poe: {name:'The Raven · Poe', description:'Ink-black, antique parchment and pointed Gothic arches.',accent:'#62536b',dark:'#27232b',ink:'#302a34',muted:'#5c5261',gilding:'#c9bdd0'},
  victorian: {name:'Velvet & Fern · Victorian',description:'Mahogany, forest green and botanical bookplate details.',accent:'#365448',dark:'#2c211b',ink:'#30281f',muted:'#52604e',gilding:'#c5b07a'},
  conservatory: {name:'Midnight Conservatory · Blend',description:'Gothic arches meet woodland ornament, walnut and deep green.',accent:'#405d50',dark:'#192e28',ink:'#283c32',muted:'#625344',gilding:'#cbb890'},
};
export function palette(theme:Theme,paper:Paper){const t=themes[theme];const dark=theme!=='original'&&paper==='dark';return {...t,darkPaper:dark,paper:theme==='original'?'#f8f5ed':'#fbf9f3',text:dark?'#f5efdf':t.ink,caption:dark?'#e2d8c4':t.muted,ornament:dark?t.gilding:t.accent,matte:dark?(theme==='poe'?'#413b46':'#435046'):'#e7e0d4'}}
// Original vector ornament: no downloaded art, fonts or image processing.
export function ornament(c:CanvasRenderingContext2D,theme:Theme,color:string){
  if(theme==='original')return;
  c.save();c.strokeStyle=color;c.fillStyle=color;c.lineWidth=.8;
  const cx=275,cy=802;
  if(theme==='poe'||theme==='conservatory'){
    c.beginPath();c.moveTo(cx-32,cy);c.lineTo(cx-9,cy);c.moveTo(cx+9,cy);c.lineTo(cx+32,cy);c.stroke();
    c.beginPath();c.moveTo(cx,cy-4);c.lineTo(cx+5,cy);c.lineTo(cx,cy+3);c.lineTo(cx-5,cy);c.closePath();c.stroke();
  }
  if(theme==='victorian'||theme==='conservatory'){
    for(const direction of [-1,1]){c.save();c.translate(cx,cy);c.scale(direction,1);c.beginPath();c.moveTo(8,0);c.quadraticCurveTo(24,-2,42,-1);c.stroke();
      for(const x of [18,28,38]){c.beginPath();c.ellipse(x,-4,4,1.6,-.45,0,Math.PI*2);c.fill();}
      c.restore();}
    if(theme==='victorian'){c.beginPath();c.arc(cx,cy,2,0,Math.PI*2);c.fill();}
  }
  c.restore();
}
export function photoPath(c:CanvasRenderingContext2D,layout:string,theme:Theme,x:number,y:number,w:number,h:number){
 c.beginPath();
 if(layout==='window'&&(theme==='poe'||theme==='conservatory')){c.moveTo(x,y+h);c.lineTo(x,y+w*.47);c.bezierCurveTo(x,y+w*.26,x+w*.3,y+w*.06,x+w/2,y);c.bezierCurveTo(x+w*.7,y+w*.06,x+w,y+w*.26,x+w,y+w*.47);c.lineTo(x+w,y+h);c.closePath();}
 else shapePath(c,layout,x,y,w,h);
}
export function frameDecoration(c:CanvasRenderingContext2D,theme:Theme,layout:string,color:string,x:number,y:number,w:number,h:number){
 if(theme==='original'||DRESSED.has(layout))return;
 c.save();c.strokeStyle=color;c.lineWidth=1.25;photoPath(c,layout,theme,x+3,y+3,w-6,h-6);c.stroke();
 // Fine double rules and tiny corner diamonds evoke nineteenth-century bindings.
 if(theme!=='poe'){c.lineWidth=.65;photoPath(c,layout,theme,x+6,y+6,w-12,h-12);c.stroke();}
 // Corner diamonds only sit on shapes that have corners.
 if(!CURVED.has(layout))for(const [px,py] of [[x+9,y+h-9],[x+w-9,y+h-9]]){c.beginPath();c.moveTo(px,py-3);c.lineTo(px+3,py);c.lineTo(px,py+3);c.lineTo(px-3,py);c.closePath();c.stroke();}
 c.restore();
}
