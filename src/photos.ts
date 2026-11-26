import {loadImage} from './render';
export const HEIC_HELP='HEIC uses its primary still image; bursts, Live Photo video, depth and HDR metadata are not retained. Converted photos are stored as high-quality JPEG in your project.';
export async function readPhoto(file:File,progress:(message:string)=>void):Promise<{src:string;note?:string}>{
 if(file.size>30*1024*1024)throw Error('Exceeds 30 MB. Export a smaller photo first.');
 const head=new Uint8Array(await file.slice(0,256).arrayBuffer());
 const str=(a:number,b:number)=>String.fromCharCode(...head.slice(a,b));
 const brands=new Set(['heic','heix','hevc','hevx','heim','heis','hevm','hevs','mif1','msf1']);
 const heif=str(4,8)==='ftyp'&&[str(8,12),...Array.from({length:Math.max(0,Math.floor((Math.min(new DataView(head.buffer).getUint32(0),head.length)-16)/4))},(_,i)=>str(16+i*4,20+i*4))].some(b=>brands.has(b));
 const claimsHeif=/\.(heic|heif|hif)$/i.test(file.name)||/^image\/(heic|heif)(-sequence)?$/i.test(file.type);
 let blob:Blob=file,note:string|undefined;
 if(heif){
  progress('Converting HEIC locally…');
  const result=await new Promise<{blob:Blob;count:number}>((resolve,reject)=>{
   const worker=new Worker('/vendor/heic-worker.js',{type:'module'});
   const timeout=setTimeout(()=>{worker.terminate();reject(Error('HEIC conversion timed out. Try a smaller image or export JPEG from Photos.'));},60000);
   const finish=()=>{clearTimeout(timeout);worker.terminate()};
   worker.onmessage=e=>{finish();if(e.data.error)reject(Error(e.data.error));else resolve(e.data)};
   worker.onerror=()=>{finish();reject(Error('HEIC decoder could not run in this browser. Try current Chrome, Edge or Safari, or export JPEG from Photos.'))};
   file.arrayBuffer().then(buffer=>worker.postMessage(buffer,[buffer])).catch(()=>{finish();reject(Error('Could not read the photo.'))});
  });
  blob=result.blob;note=result.count>1?`Primary still imported from ${result.count} images.`:'HEIC converted locally to JPEG.';
 }else{
  if(claimsHeif)throw Error('This file is labelled HEIC/HEIF but has no supported HEIF container header.');
  const type=head[0]===255&&head[1]===216?'image/jpeg':head[0]===137&&str(1,4)==='PNG'?'image/png':str(0,4)==='RIFF'&&str(8,12)==='WEBP'?'image/webp':null;
  if(!type)throw Error('Choose a valid JPEG, PNG, WebP, HEIC or HEIF photo.');
  blob=new Blob([file],{type});
 }
 const src=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result as string);reader.onerror=()=>reject(Error('Could not read photo'));reader.readAsDataURL(blob)});
 const image=await loadImage(src);if(image.width*image.height>60000000)throw Error('Photo exceeds 60 megapixels. Resize it before adding.');
 return {src,note};
}
