// Little Keepsake HEIC bridge. Decoder is unmodified LGPL-3.0-or-later code.
// See /licenses/ for notices, sources and replacement instructions.
import {exifFallback,orient} from './heic-orientation.js';
import buildLibheif from './libheif.js';
self.onmessage = async ({data:buffer}) => {
 let lib,decoder,images;
 try {
  lib=await buildLibheif();decoder=new lib.HeifDecoder();images=decoder.decode(buffer);
  if(!images.length)throw Error('No decodable HEIC image was found.');
  const image=images.find(image=>image.is_primary())||images[0];
  const width=image.get_width(),height=image.get_height();
  if(width<=0||height<=0||width*height>60000000)throw Error('Photo exceeds the 60-megapixel limit. Resize or export a smaller JPEG first.');
  const pixels=await new Promise((resolve,reject)=>image.display(new ImageData(width,height),result=>result?resolve(result):reject(Error('Unsupported or damaged HEIC image.'))));
  const canvas=new OffscreenCanvas(width,height);canvas.getContext('2d').putImageData(pixels,0,0);
  const output=orient(canvas,exifFallback(buffer,images.length));
  const blob=await output.convertToBlob({type:'image/jpeg',quality:.96});
  self.postMessage({blob,width:output.width,height:output.height,count:images.length});
 }catch(error){self.postMessage({error:error?.message||'HEIC decoding failed.'});}
 finally{if(images)for(const image of images)image.free();if(decoder?.decoder)lib.heif_context_free(decoder.decoder);}
};
