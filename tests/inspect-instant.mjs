import {readFile,writeFile} from 'node:fs/promises';
import {createCanvas,loadImage,DOMMatrix,ImageData,Path2D} from '@napi-rs/canvas';
globalThis.DOMMatrix=DOMMatrix;globalThis.ImageData=ImageData;globalThis.Path2D=Path2D;
const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');
const pairs=[[8,1],[2,7],[6,3],[4,5]],report=[];
const read=async name=>getDocument({data:new Uint8Array(await readFile(name)),useSystemFonts:true}).promise;
const raster=async(pdf,n,w,h)=>{const p=await pdf.getPage(n),v=p.getViewport({scale:1});if(v.width!==w||v.height!==h)throw Error('Invalid page size');const c=createCanvas(w,h);await p.render({canvasContext:c.getContext('2d'),viewport:v}).promise;return c};
const contact=createCanvas(396*4,612*2),cc=contact.getContext('2d');let slot=0;
for(const theme of ['original','poe','victorian','conservatory'])for(const paper of theme==='original'?['light']:['light','dark']){
 const name='instant-'+theme+'-'+paper,prefix='output/instant/'+name,reading=await read(prefix+'-reading.pdf'),booklet=await read(prefix+'-booklet.pdf');if(reading.numPages!==8||booklet.numPages!==4)throw Error('Invalid count');
 const pages=[];for(let i=1;i<=8;i++)pages.push(await raster(reading,i,396,612));let maxError=0;
 for(let i=0;i<4;i++){const spread=await raster(booklet,i+1,792,612);for(let side=0;side<2;side++){const a=spread.getContext('2d').getImageData(side*396,0,396,612).data,b=pages[pairs[i][side]-1].getContext('2d').getImageData(0,0,396,612).data;let error=0;for(let k=0;k<a.length;k++)error+=Math.abs(a[k]-b[k]);maxError=Math.max(maxError,error/a.length)}if(i===3)await writeFile(prefix+'-spread-4.png',spread.toBuffer('image/png'));}
 if(maxError>1)throw Error('Incorrect imposition');
 cc.drawImage(pages[0],(slot%4)*396,Math.floor(slot/4)*612);slot++;await writeFile(prefix+'-long-caption.png',pages[2].toBuffer('image/png'));
 const png=await loadImage(prefix+'-01.png'),jpg=await loadImage(prefix+'-01.jpg');if(png.width!==1650||png.height!==2550||jpg.width!==1650||jpg.height!==2550)throw Error('Invalid image dimensions');const c=createCanvas(1650,2550),ctx=c.getContext('2d');ctx.drawImage(png,0,0);const pixel=Array.from(ctx.getImageData(180,600,1,1).data).slice(0,3);if(String(pixel)!=='255,254,250')throw Error(name+' frame border is not off-white');const bottom=Array.from(ctx.getImageData(180,2160,1,1).data).slice(0,3);if(String(bottom)!=='255,254,250')throw Error(name+' caption border changed');const margin=Array.from(ctx.getImageData(100,150,1,1).data).slice(0,3);if(String(margin)!==(theme==='original'?'248,245,237':'251,249,243'))throw Error('Print margin changed');
 report.push({name,readingPages:8,readingPoints:[396,612],bookletSpreads:4,bookletPoints:[792,612],pairs,maxImpositionPixelError:maxError,pngAndJpegPixels:[1650,2550],frameBorderColor:pixel,printMarginColor:margin});
}
await writeFile('output/instant/contact-sheet.png',contact.toBuffer('image/png'));await writeFile('output/instant/verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
