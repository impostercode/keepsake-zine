import{createHash}from'node:crypto';
import{mkdir,copyFile,readFile,readdir,writeFile,access}from'node:fs/promises';
import{zipSync,strToU8}from'fflate';
await mkdir('public/vendor',{recursive:true});await mkdir('public/licenses',{recursive:true});
await copyFile('node_modules/heic-to/src/lib/libheif-without-unsafe-eval.js','public/vendor/libheif.js');
await copyFile('node_modules/heic-to/LICENSE','public/licenses/heic-to-LGPL.txt');
const source={};for(const file of ['package.json','package-lock.json','tsconfig.json','index.html','vercel.json','scripts/prepare-heic.mjs','public/vendor/heic-worker.js','public/vendor/heic-orientation.js','public/licenses.html','public/licenses/libheif-COPYING.txt',... (await readdir('src')).map(n=>'src/'+n)])source[file]=strToU8(await readFile(file,'utf8'));
source['vendor/libheif.js']=strToU8(await readFile('public/vendor/libheif.js','utf8'));source['vendor/LICENSE']=strToU8(await readFile('node_modules/heic-to/LICENSE','utf8'));
await writeFile('public/licenses/keepsake-heic-source.zip',zipSync(source));

for(const [file,url,sha] of [
 ['libheif-1.23.6.tar.gz','https://codeload.github.com/strukturag/libheif/tar.gz/refs/tags/v1.23.6','c9a00b0452f5c16d72ef71e5e40c0e90fbe2ad37148d27a1b2f9bb21546f5f03'],
 ['libde265-1.0.16.tar.gz','https://codeload.github.com/strukturag/libde265/tar.gz/refs/tags/v1.0.16','ed12c931759c1575848832f70db5071a001ac813db4e4f568ee08aef6e234d4e']]){
 const path='public/licenses/'+file;try{await access(path)}catch{const response=await fetch(url);if(!response.ok)throw Error('Cannot retrieve required decoder source archive');const bytes=new Uint8Array(await response.arrayBuffer());if(createHash('sha256').update(bytes).digest('hex')!==sha)throw Error('Decoder source checksum mismatch');await writeFile(path,bytes)}
}
