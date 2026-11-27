// Fonts for page text. Georgia and Arial need no download; the rest are open-licensed Google Fonts
// bundled in public/fonts and loaded from this site only when a book uses them, so no visitor request
// ever goes to Google and only the picked fonts download. Canvas drawing waits for them, so exports embed them.
import {GOOGLE_FONTS} from './font-list';

export interface FontChoice { id: string; label: string; family: string; group: string; file?: string; scale?: number }

export const FONT_GROUPS = ['Classic', 'Serif', 'Sans', 'Handwritten', 'Script', 'Display', 'Typewriter & mono'];

export const FONTS: FontChoice[] = [
  { id: 'serif', label: 'Georgia', family: 'Georgia, serif', group: 'Classic' },
  { id: 'sans', label: 'Arial', family: 'Arial, sans-serif', group: 'Classic' },
  ...GOOGLE_FONTS.map(f => ({ id: f.id, label: f.label, family: `${f.label} KZ`, group: f.group, file: `${f.id}.woff2`, scale: f.scale })),
];

export const FONT_IDS = FONTS.map(f => f.id);
const byId = new Map(FONTS.map(f => [f.id, f]));
export const fontById = (id: string | undefined) => byId.get(id ?? '');

/** CSS font-family value for canvas text, with a fallback while or if a file can't load. */
export function fontFamily(id: string | undefined, fallback: 'serif' | 'sans' = 'serif') {
  const f = byId.get(id ?? '') ?? byId.get(fallback)!;
  return f.file ? `"${f.family}", ${fallback === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif'}` : f.family;
}

/** Size multiplier so script, handwritten and condensed faces read at about the same size as Georgia. */
export const fontScale = (id: string | undefined) => byId.get(id ?? '')?.scale ?? 1;

const loading = new Map<string, Promise<void>>();
/** Load a bundled font once. Resolves even if loading fails, so drawing falls back instead of breaking. */
export function ensureFont(id: string | undefined): Promise<void> {
  const f = byId.get(id ?? '');
  if (!f?.file) return Promise.resolve();
  if (!loading.has(f.id)) {
    const face = new FontFace(f.family, `url(${import.meta.env.BASE_URL}fonts/${f.file})`);
    loading.set(f.id, face.load().then(loaded => { document.fonts.add(loaded); }).catch(() => { loading.delete(f.id); }));
  }
  return loading.get(f.id)!;
}

/** <option> markup for one style group. */
export const fontOptions = (group: string) => FONTS.filter(f => f.group === group).map(f => `<option value="${f.id}">${f.label}</option>`).join('');
/** <option> markup for the style filter, with how many fonts each style has. */
export const groupOptions = () => FONT_GROUPS.map(g => `<option value="${g}">${g} (${FONTS.filter(f => f.group === g).length})</option>`).join('');
