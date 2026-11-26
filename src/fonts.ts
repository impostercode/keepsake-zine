// Fonts for page text. The two system choices need no download; the rest are open-licensed
// Google Fonts bundled in public/fonts and loaded from this site only when a book uses them,
// so no visitor request ever goes to Google. Canvas drawing waits for them, so exports embed them.

export interface FontChoice { id: string; label: string; family: string; group: string; file?: string; scale?: number }

export const FONTS: FontChoice[] = [
  { id: 'serif', label: 'Editorial serif (Georgia)', family: 'Georgia, serif', group: 'Classic' },
  { id: 'sans', label: 'Modern sans (Arial)', family: 'Arial, sans-serif', group: 'Classic' },
  { id: 'playfair-display', label: 'Playfair Display', family: 'Playfair Display', group: 'Serif' },
  { id: 'lora', label: 'Lora', family: 'Lora', group: 'Serif' },
  { id: 'cormorant-garamond', label: 'Cormorant Garamond', family: 'Cormorant Garamond', group: 'Serif', scale: 1.12 },
  { id: 'eb-garamond', label: 'EB Garamond', family: 'EB Garamond', group: 'Serif' },
  { id: 'libre-baskerville', label: 'Libre Baskerville', family: 'Libre Baskerville', group: 'Serif' },
  { id: 'dm-serif-display', label: 'DM Serif Display', family: 'DM Serif Display', group: 'Serif' },
  { id: 'montserrat', label: 'Montserrat', family: 'Montserrat', group: 'Sans' },
  { id: 'poppins', label: 'Poppins', family: 'Poppins', group: 'Sans' },
  { id: 'work-sans', label: 'Work Sans', family: 'Work Sans', group: 'Sans' },
  { id: 'dm-sans', label: 'DM Sans', family: 'DM Sans', group: 'Sans' },
  { id: 'caveat', label: 'Caveat', family: 'Caveat', group: 'Handwritten', scale: 1.35 },
  { id: 'dancing-script', label: 'Dancing Script', family: 'Dancing Script', group: 'Handwritten', scale: 1.15 },
  { id: 'shadows-into-light', label: 'Shadows Into Light', family: 'Shadows Into Light', group: 'Handwritten', scale: 1.25 },
  { id: 'permanent-marker', label: 'Permanent Marker', family: 'Permanent Marker', group: 'Handwritten' },
  { id: 'pacifico', label: 'Pacifico', family: 'Pacifico', group: 'Display' },
  { id: 'abril-fatface', label: 'Abril Fatface', family: 'Abril Fatface', group: 'Display' },
  { id: 'bebas-neue', label: 'Bebas Neue', family: 'Bebas Neue', group: 'Display', scale: 1.15 },
  { id: 'amatic-sc', label: 'Amatic SC', family: 'Amatic SC', group: 'Display', scale: 1.4 },
  { id: 'special-elite', label: 'Special Elite (typewriter)', family: 'Special Elite', group: 'Typewriter' },
  { id: 'courier-prime', label: 'Courier Prime', family: 'Courier Prime', group: 'Typewriter' },
].map(f => (f.id === 'serif' || f.id === 'sans') ? f : { ...f, file: `${f.id}.woff2` });

export const FONT_IDS = FONTS.map(f => f.id);
const byId = new Map(FONTS.map(f => [f.id, f]));

/** CSS font-family value for canvas text, with a fallback while or if a file can't load. */
export function fontFamily(id: string | undefined, fallback: 'serif' | 'sans' = 'serif') {
  const f = byId.get(id ?? '') ?? byId.get(fallback)!;
  return f.file ? `"${f.family}", ${fallback === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif'}` : f.family;
}

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

/** Size multiplier so handwritten and condensed faces read at about the same size as Georgia. */
export const fontScale = (id: string | undefined) => byId.get(id ?? '')?.scale ?? 1;

/** <option> markup grouped by style, for the title and caption pickers. */
export function fontOptions() {
  const groups = [...new Set(FONTS.map(f => f.group))];
  return groups.map(g => `<optgroup label="${g}">${FONTS.filter(f => f.group === g).map(f => `<option value="${f.id}">${f.label}</option>`).join('')}</optgroup>`).join('');
}
