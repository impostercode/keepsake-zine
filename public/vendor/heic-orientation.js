// Bounded EXIF fallback for single-image files with no effective HEIF transform.
// Container rotation/mirroring is applied by libheif; never apply EXIF twice.
export function exifFallback(buffer,count){
 if(count!==1)return 1;
 const b=new Uint8Array(buffer),v=new DataView(buffer);
 const match=(i,s)=>[...s].every((c,j)=>b[i+j]===c.charCodeAt(0));
 for(let i=4;i+5<=b.length;i++)if(v.getUint32(i-4)===9&&((match(i,'irot')&&(b[i+4]&3)!==0)||match(i,'imir')))return 1;
 for(let i=0;i+14<b.length;i++){
  if(!match(i,'Exif\0\0'))continue;const t=i+6,le=match(t,'II');if(!le&&!match(t,'MM'))continue;
  try{if(v.getUint16(t+2,le)!==42)continue;const start=t+v.getUint32(t+4,le);if(start<t||start+2>b.length)continue;const n=Math.min(v.getUint16(start,le),256);for(let j=0;j<n;j++){const at=start+2+j*12;if(at+12>b.length)break;if(v.getUint16(at,le)===0x112&&v.getUint16(at+2,le)===3&&v.getUint32(at+4,le)===1){const o=v.getUint16(at+8,le);return o>=1&&o<=8?o:1}}}catch{/* Malformed metadata is ignored; pixel decoding still validates the image. */}
 }
 return 1;
}
export function orient(canvas,o){
 if(o===1)return canvas;const w=canvas.width,h=canvas.height,out=new OffscreenCanvas(o>=5?h:w,o>=5?w:h),c=out.getContext('2d');
 const transforms={2:[-1,0,0,1,w,0],3:[-1,0,0,-1,w,h],4:[1,0,0,-1,0,h],5:[0,1,1,0,0,0],6:[0,1,-1,0,h,0],7:[0,-1,-1,0,h,w],8:[0,-1,1,0,0,w]};c.setTransform(...transforms[o]);c.drawImage(canvas,0,0);return out;
}
