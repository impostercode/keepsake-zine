import {test,expect} from '@playwright/test';
import {mkdir,readFile} from 'node:fs/promises';
import {unzipSync} from 'fflate';
test('legacy import and all theme/paper combinations in every export',async({page})=>{
 await mkdir('output/themes',{recursive:true});page.on('dialog',d=>d.accept());const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.locator('.page-item')).toHaveCount(8);
 const image=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1500;c.height=2000;const x=c.getContext('2d')!;x.fillStyle='#be9b79';x.fillRect(0,0,1500,2000);x.fillStyle='#6b7e63';x.beginPath();x.arc(750,1100,470,0,Math.PI*2);x.fill();x.fillStyle='#f3e8ca';x.font='70px Georgia';x.fillText('A memory to keep',450,1100);return c.toDataURL('image/png')});
 const legacy={version:1,name:'Legacy book',accent:'#8a4f3d',font:'serif',pages:Array.from({length:8},(_,i)=>({id:String(i),title:'Page '+(i+1)+' · A little wonder',caption:'A quiet moment, kept close. This is synthetic test artwork.',image,fit:'fill',x:50,y:50,layout:['window','classic','postcard','full'][i%4]}))};
 await page.locator('#project-file').setInputFiles({name:'old.keepsake',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});await expect(page.locator('#theme')).toHaveValue('original');await expect(page.locator('#paper-label')).toBeHidden();await expect(page.locator('#title')).toHaveValue('Page 1 · A little wonder');
 for(const theme of ['poe','victorian','conservatory'])for(const paper of ['light','dark']){
  const name=theme+'-'+paper;await page.locator('#theme').selectOption(theme);await page.locator('#paper').selectOption(paper);await page.locator('#name').fill(name);await expect(page.locator('#accent')).toBeDisabled();await page.locator('#preview canvas').screenshot({path:`output/themes/${name}-preview.png`});
  const save=page.waitForEvent('download');await page.locator('#save').click();await(await save).saveAs(`output/themes/${name}.keepsake`);const data=JSON.parse(await readFile(`output/themes/${name}.keepsake`,'utf8'));expect(data.theme).toBe(theme);expect(data.paper).toBe(paper);
  await page.locator('#theme').selectOption('original');await page.locator('#project-file').setInputFiles(`output/themes/${name}.keepsake`);await expect(page.locator('#theme')).toHaveValue(theme);await expect(page.locator('#paper')).toHaveValue(paper);
  for(const format of ['reading','booklet','png','jpeg','zip-png','zip-jpeg']){await page.locator('#format').selectOption(format);const d=page.waitForEvent('download');await page.locator('#export').click();const file=await d;await file.saveAs('output/themes/'+file.suggestedFilename());await expect(page.locator('#export')).toBeEnabled();}
  const png=await readFile(`output/themes/${name}-01.png`);expect(png.readUInt32BE(16)).toBe(1650);expect(png.readUInt32BE(20)).toBe(2550);const zip=unzipSync(new Uint8Array(await readFile(`output/themes/${name}-png.zip`)));expect(Buffer.from(zip[`${name}-01.png`]).equals(png)).toBe(true);
  const jpg=await readFile(`output/themes/${name}-01.jpg`);const jpgZip=unzipSync(new Uint8Array(await readFile(`output/themes/${name}-jpeg.zip`)));expect(Buffer.from(jpgZip[`${name}-01.jpg`]).equals(jpg)).toBe(true);
 }
 await page.locator('#theme').selectOption('original');await expect(page.locator('#accent')).toHaveValue('#8a4f3d');await expect(page.locator('#paper-label')).toBeHidden();expect(errors).toEqual([]);
});
