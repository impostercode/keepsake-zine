// Comic book style: each page is a grid of panels with black ink borders and white gutters.
// Panel 1 uses the page's own photo; the others use page.panels. Title becomes a narration box,
// caption a speech bubble. Everything is vector drawing, so the mode adds no download.
export type ComicLayout =
  | 'splash' | 'two-rows' | 'two-cols' | 'three-rows' | 'grid4' | 'big-top' | 'big-bottom'
  | 'tall-left' | 'six' | 'strip-top' | 'slant2' | 'slant3' | 'inset';

type Pt = [number, number];
const r = (x0: number, y0: number, x1: number, y1: number): Pt[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

/** Panels as polygons in fractions of the page's drawing area, in reading order. */
export const COMIC: { id: ComicLayout; label: string; panels: Pt[][] }[] = [
  { id: 'splash', label: 'Splash', panels: [r(0, 0, 1, 1)] },
  { id: 'two-rows', label: '2 rows', panels: [r(0, 0, 1, .5), r(0, .5, 1, 1)] },
  { id: 'two-cols', label: '2 columns', panels: [r(0, 0, .5, 1), r(.5, 0, 1, 1)] },
  { id: 'three-rows', label: '3 rows', panels: [r(0, 0, 1, 1 / 3), r(0, 1 / 3, 1, 2 / 3), r(0, 2 / 3, 1, 1)] },
  { id: 'big-top', label: 'Big top', panels: [r(0, 0, 1, .58), r(0, .58, .5, 1), r(.5, .58, 1, 1)] },
  { id: 'big-bottom', label: 'Big bottom', panels: [r(0, 0, .5, .42), r(.5, 0, 1, .42), r(0, .42, 1, 1)] },
  { id: 'tall-left', label: 'Tall left', panels: [r(0, 0, .56, 1), r(.56, 0, 1, .5), r(.56, .5, 1, 1)] },
  { id: 'grid4', label: 'Grid of 4', panels: [r(0, 0, .5, .5), r(.5, 0, 1, .5), r(0, .5, .5, 1), r(.5, .5, 1, 1)] },
  { id: 'strip-top', label: 'Strip + 1', panels: [r(0, 0, 1 / 3, .3), r(1 / 3, 0, 2 / 3, .3), r(2 / 3, 0, 1, .3), r(0, .3, 1, 1)] },
  { id: 'six', label: 'Grid of 6', panels: [r(0, 0, .5, 1 / 3), r(.5, 0, 1, 1 / 3), r(0, 1 / 3, .5, 2 / 3), r(.5, 1 / 3, 1, 2 / 3), r(0, 2 / 3, .5, 1), r(.5, 2 / 3, 1, 1)] },
  { id: 'slant2', label: 'Slant', panels: [[[0, 0], [1, 0], [1, .42], [0, .58]], [[0, .58], [1, .42], [1, 1], [0, 1]]] },
  { id: 'slant3', label: 'Slant 3', panels: [[[0, 0], [1, 0], [1, .28], [0, .38]], [[0, .38], [1, .28], [1, .62], [0, .72]], [[0, .72], [1, .62], [1, 1], [0, 1]]] },
  { id: 'inset', label: 'Inset', panels: [r(0, 0, 1, 1), r(.52, .6, .94, .94)] },
];
export const COMIC_IDS = COMIC.map(l => l.id);
const byId = new Map(COMIC.map(l => [l.id, l]));
export const comicDef = (id: string | undefined) => byId.get(id as ComicLayout) ?? byId.get('grid4')!;
export const panelCount = (id: string | undefined) => comicDef(id).panels.length;
/** A varied starting layout for each page when a book switches to comic style. */
export function defaultComic(index: number, total: number): ComicLayout {
  if (index === 0 || index === total - 1) return 'splash';
  return (['grid4', 'big-top', 'two-rows', 'tall-left', 'slant2', 'six', 'big-bottom', 'strip-top'] as ComicLayout[])[(index - 1) % 8];
}

// Drawing area on the 550 × 850 page, leaving room for the page number.
const AREA = { x: 40, y: 40, w: 470, h: 740 };
const GUTTER = 12, INK = 3;
const toPage = ([fx, fy]: Pt, a = AREA): Pt => [a.x + fx * a.w, a.y + fy * a.h];

function trace(c: CanvasRenderingContext2D, pts: Pt[]) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); }
function bounds(pts: Pt[]) { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }; }

/** A panel's box in inches, for the photo resolution hint. */
export function panelBox(id: string | undefined, i = 0): [number, number, number, number] {
  const panels = comicDef(id).panels, b = bounds(panels[Math.min(i, panels.length - 1)].map(p => toPage(p))); return [b.x / 100, b.y / 100, b.w / 100, b.h / 100];
}

function halftone(c: CanvasRenderingContext2D, b: { x: number; y: number; w: number; h: number }, n: number) {
  c.fillStyle = '#f1ede3'; c.fillRect(b.x, b.y, b.w, b.h); c.fillStyle = '#d8d1c1';
  for (let y = b.y; y < b.y + b.h; y += 9) for (let x = b.x + ((y - b.y) / 9 % 2) * 4.5; x < b.x + b.w; x += 9) { c.beginPath(); c.arc(x, y, 2, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#b9b1a0'; c.font = 'bold 15px Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(String(n), b.x + b.w / 2, b.y + b.h / 2); c.textAlign = 'start'; c.textBaseline = 'alphabetic';
}

export interface ComicPanelImage { image?: HTMLImageElement; fit: 'fill' | 'fit'; x: number; y: number }

/** Draws the panel grid: photos (or halftone placeholders), white gutters and ink borders. */
export function drawPanels(c: CanvasRenderingContext2D, id: string | undefined, images: ComicPanelImage[], area = AREA) {
  comicDef(id).panels.forEach((frac, i) => {
    const pts = frac.map(p => toPage(p, area)), b = bounds(pts), img = images[i];
    c.save(); trace(c, pts); c.clip();
    if (img?.image) {
      const im = img.image, s = img.fit === 'fill' ? Math.max(b.w / im.width, b.h / im.height) : Math.min(b.w / im.width, b.h / im.height);
      const w = im.width * s, h = im.height * s; c.fillStyle = '#1f1d1a'; c.fillRect(b.x, b.y, b.w, b.h);
      c.drawImage(im, b.x + (b.w - w) * img.x / 100, b.y + (b.h - h) * img.y / 100, w, h);
    } else halftone(c, b, i + 1);
    // Inside the clip, half of each stroke shows: an ink border with a white gutter outside it.
    c.lineJoin = 'miter'; c.strokeStyle = '#111'; c.lineWidth = GUTTER + INK * 2; trace(c, pts); c.stroke();
    c.strokeStyle = '#fffdf8'; c.lineWidth = GUTTER; trace(c, pts); c.stroke();
    c.restore();
  });
}

function wrap(c: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const t = line ? line + ' ' + word : word;
      if (c.measureText(t).width > maxW && line) { out.push(line); line = word; } else line = t;
    }
    if (line) out.push(line);
  }
  return out;
}

/** Title as a yellow narration box in panel 1's top-left corner. */
export function narrationBox(c: CanvasRenderingContext2D, id: string | undefined, text: string, font: string, size: number): number {
  if (!text.trim()) return 0;
  const b = bounds(comicDef(id).panels[0].map(p => toPage(p))), pad = 9, maxW = Math.min(300, b.w - 40);
  let s = size, lines: string[] = [];
  for (; s >= 12; s--) { c.font = `${s}px ${font}`; lines = wrap(c, text, maxW - pad * 2); if (lines.length <= 3) break; }
  lines = lines.slice(0, 3);
  const w = Math.max(...lines.map(l => c.measureText(l).width)) + pad * 2, h = lines.length * s * 1.2 + pad * 2 - s * .2, x = b.x + GUTTER / 2 + INK + 8, y = b.y + GUTTER / 2 + INK + 8;
  c.save(); c.fillStyle = '#ffe56b'; c.fillRect(x, y, w, h); c.strokeStyle = '#111'; c.lineWidth = 2; c.strokeRect(x, y, w, h);
  c.fillStyle = '#111'; c.textBaseline = 'top'; lines.forEach((l, i) => c.fillText(l, x + pad, y + pad + i * s * 1.2)); c.restore();
  return y + h;
}

/** Caption as a speech bubble near the bottom of the last panel, tail pointing up-left into the panel. */
export function speechBubble(c: CanvasRenderingContext2D, id: string | undefined, text: string, font: string, size: number) {
  if (!text.trim()) return;
  const panels = comicDef(id).panels, b = bounds(panels[panels.length - 1].map(p => toPage(p)));
  const maxW = Math.min(220, b.w * .58);
  let s = size, lines: string[] = [];
  for (; s >= 10; s--) { c.font = `${s}px ${font}`; lines = wrap(c, text, maxW); if (lines.length <= 5) break; }
  lines = lines.slice(0, 5);
  const tw = Math.max(...lines.map(l => c.measureText(l).width)), th = lines.length * s * 1.25;
  const w = tw / .76 + 12, h = th / .7 + 10, x = b.x + b.w - w - GUTTER / 2 - INK - 14, y = b.y + b.h - h - GUTTER / 2 - INK - 14;
  c.save(); c.fillStyle = '#fffdf8'; c.strokeStyle = '#111'; c.lineWidth = 2.5;
  c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  c.moveTo(x + w * .3, y + h * .12); c.lineTo(x + w * .12 - 18, y - 26); c.lineTo(x + w * .42, y + h * .06);
  c.fill(); c.stroke();
  // Cover the tail's join with the bubble so the outline reads as one shape.
  c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2 - 1.5, h / 2 - 1.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#111'; c.textAlign = 'center'; c.textBaseline = 'top';
  lines.forEach((l, i) => c.fillText(l, x + w / 2, y + (h - th) / 2 + i * s * 1.25)); c.restore();
}

/** A panel's own speech bubble: top-right of the panel, tail pointing down-left toward the photo.
 *  `below` pushes it under the narration box when both sit in panel 1. */
export function panelBubble(c: CanvasRenderingContext2D, id: string | undefined, panel: number, text: string, font: string, size: number, below = 0) {
  const panels = comicDef(id).panels; if (!text.trim() || panel >= panels.length) return;
  const b = bounds(panels[panel].map(p => toPage(p))), inset = GUTTER / 2 + INK + 12;
  const maxW = Math.min(200, b.w * .6);
  let s = size, lines: string[] = [];
  for (; s >= 9; s--) { c.font = `${s}px ${font}`; lines = wrap(c, text, maxW); if (lines.length <= 4) break; }
  lines = lines.slice(0, 4);
  const tw = Math.max(...lines.map(l => c.measureText(l).width)), th = lines.length * s * 1.25;
  const w = tw / .76 + 12, h = th / .7 + 10, x = b.x + b.w - w - inset, y = Math.max(b.y + inset, below + 8);
  c.save(); c.fillStyle = '#fffdf8'; c.strokeStyle = '#111'; c.lineWidth = 2.5;
  c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  c.moveTo(x + w * .28, y + h * .86); c.lineTo(x + w * .14 - 16, y + h + 24); c.lineTo(x + w * .44, y + h * .94);
  c.fill(); c.stroke();
  c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2 - 1.5, h / 2 - 1.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#111'; c.textAlign = 'center'; c.textBaseline = 'top';
  lines.forEach((l, i) => c.fillText(l, x + w / 2, y + (h - th) / 2 + i * s * 1.25)); c.restore();
}

/** A small picture of a comic layout for its picker button. */
export function drawComicIcon(canvas: HTMLCanvasElement, id: ComicLayout) {
  const ratio = window.devicePixelRatio || 1, size = 40;
  canvas.width = size * ratio; canvas.height = size * ratio;
  const c = canvas.getContext('2d')!; c.scale(ratio, ratio);
  c.fillStyle = '#fffdf8'; c.beginPath(); c.roundRect(5, 2, 30, 36, 2); c.fill();
  const a = { x: 8, y: 5, w: 24, h: 30 };
  for (const frac of comicDef(id).panels) {
    const pts = frac.map(p => toPage(p, a));
    c.save(); trace(c, pts); c.clip(); c.fillStyle = '#b5ad9c'; c.fillRect(0, 0, size, size);
    c.strokeStyle = '#111'; c.lineWidth = 3.2; trace(c, pts); c.stroke(); c.strokeStyle = '#fffdf8'; c.lineWidth = 1.6; trace(c, pts); c.stroke(); c.restore();
  }
}
