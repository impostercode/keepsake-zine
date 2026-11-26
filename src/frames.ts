// Photo frames: where the photo sits on the 5.5 × 8.5 in page, the shape it is clipped to, and any
// paper details drawn around it. Everything is drawn as vector paths, so a frame adds no download.
export type Layout =
  | 'classic' | 'window' | 'full' | 'postcard' | 'wide' | 'square' | 'rounded' | 'octagon' | 'ticket'
  | 'circle' | 'oval' | 'heart' | 'hexagon' | 'diamond' | 'star' | 'flower' | 'scallop'
  | 'instant' | 'stamp' | 'film' | 'torn' | 'tape' | 'corners';

type Box = [number, number, number, number];
export interface FrameDef { id: Layout; label: string; group: 'Classic' | 'Shapes' | 'Keepsake'; box: Box; captionY?: number }

export const FRAMES: FrameDef[] = [
  { id: 'classic', label: 'Classic', group: 'Classic', box: [.55, 1.55, 4.4, 4.95] },
  { id: 'window', label: 'Window', group: 'Classic', box: [.68, 2.25, 4.14, 4.7] },
  { id: 'full', label: 'Tall', group: 'Classic', box: [.45, .5, 4.6, 5.8] },
  { id: 'postcard', label: 'Postcard', group: 'Classic', box: [.55, 2.15, 4.4, 3.35], captionY: 600 },
  { id: 'wide', label: 'Wide', group: 'Classic', box: [.45, 2.2, 4.6, 3], captionY: 600 },
  { id: 'square', label: 'Square', group: 'Classic', box: [.75, 1.8, 4, 4] },
  { id: 'rounded', label: 'Rounded', group: 'Classic', box: [.55, 1.65, 4.4, 4.8] },
  { id: 'octagon', label: 'Octagon', group: 'Classic', box: [.65, 1.7, 4.2, 4.6] },
  { id: 'ticket', label: 'Ticket', group: 'Classic', box: [.55, 1.8, 4.4, 4.4] },
  { id: 'circle', label: 'Circle', group: 'Shapes', box: [.75, 1.9, 4, 4] },
  { id: 'oval', label: 'Oval', group: 'Shapes', box: [.9, 1.65, 3.7, 5] },
  { id: 'heart', label: 'Heart', group: 'Shapes', box: [.6, 1.75, 4.3, 4.1] },
  { id: 'hexagon', label: 'Hexagon', group: 'Shapes', box: [.6, 2, 4.3, 3.75] },
  { id: 'diamond', label: 'Diamond', group: 'Shapes', box: [.75, 1.65, 4, 5] },
  { id: 'star', label: 'Star', group: 'Shapes', box: [.55, 1.65, 4.4, 4.3] },
  { id: 'flower', label: 'Flower', group: 'Shapes', box: [.65, 1.75, 4.2, 4.2] },
  { id: 'scallop', label: 'Scallop', group: 'Shapes', box: [.7, 1.8, 4.1, 4.1] },
  { id: 'instant', label: 'Instant', group: 'Keepsake', box: [.75, 2.05, 4, 4] },
  { id: 'stamp', label: 'Stamp', group: 'Keepsake', box: [.85, 1.8, 3.8, 4.6] },
  { id: 'film', label: 'Film', group: 'Keepsake', box: [1, 1.85, 3.5, 4.5] },
  { id: 'torn', label: 'Torn', group: 'Keepsake', box: [.8, 1.85, 3.9, 4.4] },
  { id: 'tape', label: 'Taped', group: 'Keepsake', box: [.75, 1.9, 4, 4.5] },
  { id: 'corners', label: 'Corners', group: 'Keepsake', box: [.75, 1.9, 4, 4.5] },
];

export const FRAME_GROUPS = ['Classic', 'Shapes', 'Keepsake'] as const;
export const LAYOUTS = FRAMES.map(f => f.id);
const byId = new Map(FRAMES.map(f => [f.id, f]));
export const frameDef = (l: Layout) => byId.get(l) ?? FRAMES[0];
export const layoutLabel = (l: Layout) => frameDef(l).label;
/** Frames without straight corners: the themes' corner diamonds would float outside them. */
export const CURVED = new Set<string>(['octagon', 'ticket', 'circle', 'oval', 'heart', 'hexagon', 'diamond', 'star', 'flower', 'scallop']);
/** Frames that carry their own paper details, so the themes' inner rules are left off. */
export const DRESSED = new Set<string>(['instant', 'film', 'torn', 'tape', 'corners']);

function polar(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: (t: number) => number, steps = 240) {
  const cx = x + w / 2, cy = y + h / 2;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps * Math.PI * 2 - Math.PI / 2, k = r(t);
    const px = cx + Math.cos(t) * w / 2 * k, py = cy + Math.sin(t) * h / 2 * k;
    if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.closePath();
}
function poly(c: CanvasRenderingContext2D, pts: number[][]) { pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); }

/** Adds the frame's outline to the current path (no beginPath), in page units. */
export function shapePath(c: CanvasRenderingContext2D, layout: string, x: number, y: number, w: number, h: number) {
  switch (layout) {
    case 'window': c.roundRect(x, y, w, h, [w / 2, w / 2, 4, 4]); break;
    case 'rounded': c.roundRect(x, y, w, h, 30); break;
    case 'circle': case 'oval': c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); break;
    case 'heart':
      c.moveTo(x + w * .5, y + h * .25); c.bezierCurveTo(x + w * .5, y, x, y, x, y + h * .32);
      c.bezierCurveTo(x, y + h * .6, x + w * .35, y + h * .75, x + w * .5, y + h);
      c.bezierCurveTo(x + w * .65, y + h * .75, x + w, y + h * .6, x + w, y + h * .32);
      c.bezierCurveTo(x + w, y, x + w * .5, y, x + w * .5, y + h * .25); c.closePath(); break;
    case 'octagon': { const k = Math.min(w, h) * .2; poly(c, [[x + k, y], [x + w - k, y], [x + w, y + k], [x + w, y + h - k], [x + w - k, y + h], [x + k, y + h], [x, y + h - k], [x, y + k]]); break; }
    case 'ticket': {
      const r = Math.min(w, h) * .09;
      c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.arc(x + w, y, r, Math.PI, Math.PI / 2, true);
      c.lineTo(x + w, y + h - r); c.arc(x + w, y + h, r, Math.PI * 1.5, Math.PI, true);
      c.lineTo(x + r, y + h); c.arc(x, y + h, r, 0, -Math.PI / 2, true);
      c.lineTo(x, y + r); c.arc(x, y, r, Math.PI / 2, 0, true); c.closePath(); break;
    }
    case 'hexagon': poly(c, [[x + w * .25, y], [x + w * .75, y], [x + w, y + h / 2], [x + w * .75, y + h], [x + w * .25, y + h], [x, y + h / 2]]); break;
    case 'diamond': poly(c, [[x + w / 2, y], [x + w, y + h / 2], [x + w / 2, y + h], [x, y + h / 2]]); break;
    case 'star': {
      const pts: number[][] = [], cx = x + w / 2, cy = y + h * .55, R = w / 2, ry = h / w;
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * .48 : R; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * ry]); }
      poly(c, pts); break;
    }
    case 'flower': polar(c, x, y, w, h, t => .7 + .3 * Math.abs(Math.cos(4 * t))); break;
    case 'scallop': polar(c, x, y, w, h, t => .93 + .07 * Math.abs(Math.cos(10 * t)), 400); break;
    default: c.rect(x, y, w, h);
  }
}

// A fixed jagged edge, the same every time it is drawn.
function tornEdge(x: number, y: number, w: number, h: number) {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pts: number[][] = [], step = 9;
  for (let i = 0; i <= w; i += step) pts.push([x + i, y + rnd() * 7]);
  for (let i = 0; i <= h; i += step) pts.push([x + w - rnd() * 7, y + i]);
  for (let i = w; i >= 0; i -= step) pts.push([x + i, y + h - rnd() * 7]);
  for (let i = h; i >= 0; i -= step) pts.push([x + rnd() * 7, y + i]);
  return pts;
}

/** Paper drawn under the photo: stamp perforations, film strip, torn paper, print borders. */
export function frameBefore(c: CanvasRenderingContext2D, layout: string, x: number, y: number, w: number, h: number, bg: string) {
  c.save();
  if (layout === 'stamp') {
    const m = 16, r = 5.5, step = 16, X = x - m, Y = y - m, W = w + m * 2, H = h + m * 2;
    c.fillStyle = 'rgba(25,23,18,.07)'; c.fillRect(X + 2, Y + 3, W, H); c.fillStyle = '#fffefa'; c.fillRect(X, Y, W, H); c.fillStyle = bg;
    const nx = Math.round(W / step), ny = Math.round(H / step);
    for (let i = 0; i <= nx; i++) for (const yy of [Y, Y + H]) { c.beginPath(); c.arc(X + i * W / nx, yy, r, 0, Math.PI * 2); c.fill(); }
    for (let i = 0; i <= ny; i++) for (const xx of [X, X + W]) { c.beginPath(); c.arc(xx, Y + i * H / ny, r, 0, Math.PI * 2); c.fill(); }
  } else if (layout === 'film') {
    const band = 34, X = x - band, W = w + band * 2, Y = y - 14, H = h + 28;
    c.fillStyle = '#1f1d1a'; c.fillRect(X, Y, W, H); c.fillStyle = bg;
    for (let yy = Y + 10; yy < Y + H - 14; yy += 24) for (const xx of [X + 10, X + W - 24]) { c.beginPath(); c.roundRect(xx, yy, 14, 11, 2); c.fill(); }
  } else if (layout === 'torn') {
    c.fillStyle = 'rgba(25,23,18,.08)'; c.beginPath(); poly(c, tornEdge(x - 14, y - 12, w + 30, h + 30)); c.fill();
    c.fillStyle = '#fffdf7'; c.beginPath(); poly(c, tornEdge(x - 16, y - 16, w + 32, h + 32)); c.fill();
  } else if (layout === 'tape' || layout === 'corners') {
    c.fillStyle = 'rgba(25,23,18,.08)'; c.fillRect(x - 8, y - 6, w + 18, h + 18);
    c.fillStyle = '#fffefa'; c.fillRect(x - 10, y - 10, w + 20, h + 20);
  }
  c.restore();
}

/** Details drawn over the photo: tape strips and photo-album corners. */
export function frameAfter(c: CanvasRenderingContext2D, layout: string, x: number, y: number, w: number, h: number) {
  c.save();
  if (layout === 'tape') {
    for (const [cx, cy, a] of [[x + 18, y + 4, -.6], [x + w - 18, y + 4, .6]]) {
      c.save(); c.translate(cx, cy); c.rotate(a); c.fillStyle = 'rgba(232,222,190,.82)'; c.fillRect(-44, -13, 88, 26);
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-44, -13, 88, 5); c.restore();
    }
  } else if (layout === 'corners') {
    const s = 38, X = x - 10, Y = y - 10, W = w + 20, H = h + 20;
    c.fillStyle = '#2b2722';
    for (const [px, py, dx, dy] of [[X, Y, 1, 1], [X + W, Y, -1, 1], [X, Y + H, 1, -1], [X + W, Y + H, -1, -1]]) {
      c.beginPath(); c.moveTo(px - dx * 4, py - dy * 4); c.lineTo(px + dx * s, py - dy * 4); c.lineTo(px - dx * 4, py + dy * s); c.closePath(); c.fill();
    }
  }
  c.restore();
}

/** A small picture of the frame for its picker button, drawn with the same paths as the page. */
export function drawFrameIcon(canvas: HTMLCanvasElement, layout: Layout, fill: string, bg: string) {
  const ratio = window.devicePixelRatio || 1, size = 40;
  canvas.width = size * ratio; canvas.height = size * ratio;
  const c = canvas.getContext('2d')!; c.scale(ratio, ratio);
  const [bx, by, bw, bh] = frameDef(layout).box.map(v => v * 100);
  const pad = layout === 'film' ? 40 : layout === 'instant' ? 30 : 22, k = (size - 4) / (Math.max(bw, bh) + pad * 2);
  c.translate(size / 2, size / 2); c.scale(k, k); c.translate(-(bx + bw / 2), -(by + bh / 2));
  if (layout === 'instant') { c.fillStyle = '#fffefa'; c.fillRect(bx - 22, by - 22, bw + 44, bh + 110); }
  frameBefore(c, layout, bx, by, bw, bh, bg);
  c.fillStyle = fill; c.beginPath(); shapePath(c, layout, bx, by, bw, bh); c.fill();
  frameAfter(c, layout, bx, by, bw, bh);
}
