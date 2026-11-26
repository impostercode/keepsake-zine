import {render,type Project} from './render';
// Reference: High Point University 8-page mini-zine template, rotated clockwise
// into landscape and numbered with front=1, back=8. Top row is inverted.
export const MINI_PANELS=[{page:5,turn:180},{page:4,turn:180},{page:3,turn:180},{page:2,turn:180},{page:6,turn:0},{page:7,turn:0},{page:8,turn:0},{page:1,turn:0}] as const;
export const MINI_COUNT_MESSAGE='One-sheet mini-zines need exactly 8 pages. Save your project, then use Add 4 pages or Remove last 4 pages to make an 8-page edition. No pages are omitted automatically.';
export const MINI_INSTRUCTIONS='Print ONE SIDED on US Letter, landscape, Actual size / 100%. Turn off duplex, booklet printing and fit-to-page. Crease into 4 columns and 2 rows. Unfold; cut ONLY the center horizontal crease from 2¾″ to 8¼″ (a 5½″ slit). Fold lengthwise with printing outside and the slit along the folded edge. Push the two short ends toward each other until the slit opens into a diamond, then a cross. Collapse the four leaves into a book with page 1 at the front and page 8 at the back. Test-fold one copy first.';
export async function renderMini(project:Project,dpi=300,guides=false){
 if(project.pages.length!==8)throw Error(MINI_COUNT_MESSAGE);
 const sheet=document.createElement('canvas');sheet.width=11*dpi;sheet.height=8.5*dpi;const c=sheet.getContext('2d')!;c.fillStyle='#fff';c.fillRect(0,0,sheet.width,sheet.height);
 // Keep the entire layout, including captions, inside each panel. No trimming.
 const width=2.25,height=width*8.5/5.5;
 for(let slot=0;slot<8;slot++){
  const spec=MINI_PANELS[slot],page=await render(project.pages[spec.page-1],project,spec.page-1,Math.ceil(dpi*width/5.5));
  c.save();c.translate(((slot%4)*2.75+1.375)*dpi,(Math.floor(slot/4)*4.25+2.125)*dpi);c.rotate(spec.turn*Math.PI/180);c.drawImage(page,-width*dpi/2,-height*dpi/2,width*dpi,height*dpi);c.restore();page.width=page.height=1;
 }
 if(guides){
  c.save();c.scale(dpi,dpi);c.strokeStyle='#aaa69d';c.lineWidth=.006;c.setLineDash([.055,.05]);
  for(const x of [2.75,5.5,8.25]){c.beginPath();c.moveTo(x,.25);c.lineTo(x,8.25);c.stroke()}
  c.beginPath();c.moveTo(.25,4.25);c.lineTo(10.75,4.25);c.stroke();c.setLineDash([]);c.strokeStyle='#605c54';c.lineWidth=.012;c.beginPath();c.moveTo(2.75,4.25);c.lineTo(8.25,4.25);c.stroke();
  for(const x of [2.75,8.25]){c.beginPath();c.moveTo(x,4.2);c.lineTo(x,4.3);c.stroke()}
  c.fillStyle='#605c54';c.font='.085px Arial';c.textAlign='center';c.fillText('CUT ONLY THIS CENTER SLIT',5.5,4.2);c.restore();
 }
 // Exported for clarity in review: sheet inset is .25 horizontally and >.38 vertically.
 return sheet;
}
