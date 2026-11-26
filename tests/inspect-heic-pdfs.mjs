import {readFile,writeFile} from 'node:fs/promises';
import {createCanvas,DOMMatrix,ImageData,Path2D} from '@napi-rs/canvas';
globalThis.DOMMatrix=DOMMatrix;globalThis.ImageData=ImageData;globalThis.Path2D=Path2D;
const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');
const read=async name=>getDocument({data:new Uint8Array(await readFile(name)),useSystemFonts:true}).promise;
const reading=await read('output/heic/HEIC-keepsake-reading.pdf'),book=await read('output/heic/HEIC-keepsake-booklet.pdf');
if(reading.numPages!==8||book.numPages!==4)throw Error('Wrong PDF page count');
const raster=async(pdf,n,w,h)=>{const p=await pdf.getPage(n),v=p.getViewport({scale:1});if(v.width!==w||v.height!==h)throw Error('Wrong media box: '+v.width+' x '+v.height);const c=createCanvas(w,h);await p.render({canvasContext:c.getContext('2d'),viewport:v}).promise;return c};
const pages=[];for(let i=1;i<=8;i++)pages.push(await raster(reading,i,396,612));
const expected=[[8,1],[2,7],[6,3],[4,5]],report={reading:{pages:8,points:[396,612]},booklet:{spreads:4,points:[792,612],pairs:expected},pixelComparison:[]};
for(let i=0;i<4;i++){const c=await raster(book,i+1,792,612);await writeFile(`output/heic/spread-${i+1}.png`,c.toBuffer('image/png'));for(let side=0;side<2;side++){const actual=c.getContext('2d').getImageData(side*396,0,396,612).data,ref=pages[expected[i][side]-1].getContext('2d').getImageData(0,0,396,612).data;let diff=0;for(let k=0;k<actual.length;k++)diff+=Math.abs(actual[k]-ref[k]);const mae=diff/actual.length;report.pixelComparison.push({spread:i+1,side,page:expected[i][side],mae});if(mae>1)throw Error('Incorrect imposition: '+mae)}}
await writeFile('output/heic/pdf-checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
