// First-visit walkthrough: a few short cards that spotlight each step of making a zine.
// Shown once per browser (remembered in localStorage, nothing sent anywhere) and replayable
// from the "How it works" button. Skipped for automated browsers so tests see the plain editor.

type Step = { target?: string; title: string; body: string };

const KEY = 'keepsake.tour.v1';

const STEPS: Step[] = [
  {
    title: 'Make a little zine in three steps',
    body: 'Add photos, give each page a few words, then print and fold. Your photos stay on this device: nothing is uploaded.',
  },
  {
    target: '.sequence',
    title: '1. Add your photos',
    body: 'Each photo becomes one page. iPhone photos work too. Use the arrows to change the order, and add pages in fours.',
  },
  {
    target: '.controls',
    title: '2. Make each page yours',
    body: 'Pick a page, then add a title, a caption and a frame. Whole book sets the name, theme and fonts. Switch Book style to Comic book for panel layouts and speech bubbles.',
  },
  {
    target: '.finish',
    title: '3. Download, print, fold',
    body: 'Choose the booklet or the one-sheet mini-zine and download the PDF. Print at actual size and test one sheet first.',
  },
  {
    target: '#save',
    title: 'Save to come back later',
    body: 'Closing this tab clears your work. Save keeps a project file on your device, and Open picks up where you left off.',
  },
];

const seen = () => {
  try { return localStorage.getItem(KEY) === 'done'; } catch { return false; }
};
const markSeen = () => {
  try { localStorage.setItem(KEY, 'done'); } catch { /* private mode: show again next time */ }
};

export function initTour(replayButton: HTMLButtonElement) {
  let index = 0;
  let current: HTMLElement | null = null;
  let returnFocus: HTMLElement | null = null;

  const shade = document.createElement('div');
  shade.className = 'tour-shade';
  shade.hidden = true;

  const card = document.createElement('div');
  card.className = 'tour';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'false');
  card.setAttribute('aria-labelledby', 'tour-title');
  card.hidden = true;
  card.innerHTML = '<h2 id="tour-title"></h2><p id="tour-body"></p><div class="tour-actions"><button type="button" class="tour-skip">Skip</button><span class="tour-count" aria-live="polite"></span><button type="button" class="tour-back">Back</button><button type="button" class="primary tour-next">Next</button></div>';
  document.body.append(shade, card);

  const title = card.querySelector<HTMLElement>('#tour-title')!;
  const body = card.querySelector<HTMLElement>('#tour-body')!;
  const count = card.querySelector<HTMLElement>('.tour-count')!;
  const back = card.querySelector<HTMLButtonElement>('.tour-back')!;
  const next = card.querySelector<HTMLButtonElement>('.tour-next')!;
  const skip = card.querySelector<HTMLButtonElement>('.tour-skip')!;

  const clearTarget = () => {
    current?.classList.remove('tour-target');
    current = null;
  };

  const show = (i: number) => {
    index = i;
    const step = STEPS[i];
    clearTarget();
    document.body.classList.add('touring');
    title.textContent = step.title;
    body.textContent = step.body;
    count.textContent = `${i + 1} of ${STEPS.length}`;
    back.hidden = i === 0;
    next.textContent = i === STEPS.length - 1 ? 'Start making' : 'Next';
    const target = step.target ? document.querySelector<HTMLElement>(step.target) : null;
    if (target) {
      current = target;
      target.classList.add('tour-target');
      // Keep the card off the highlighted column on wide screens.
      const box = target.getBoundingClientRect();
      card.classList.toggle('tour-left', box.left > window.innerWidth / 2);
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    } else {
      card.classList.remove('tour-left');
      window.scrollTo({ top: 0 });
    }
    shade.hidden = false;
    card.hidden = false;
    next.focus({ preventScroll: true });
  };

  const close = () => {
    clearTarget();
    document.body.classList.remove('touring');
    shade.hidden = true;
    card.hidden = true;
    markSeen();
    (returnFocus ?? replayButton).focus({ preventScroll: true });
    returnFocus = null;
  };

  next.onclick = () => (index < STEPS.length - 1 ? show(index + 1) : close());
  back.onclick = () => show(Math.max(0, index - 1));
  skip.onclick = close;
  card.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
  });
  replayButton.onclick = () => {
    returnFocus = replayButton;
    show(0);
  };

  if (!seen() && !navigator.webdriver) show(0);
}
