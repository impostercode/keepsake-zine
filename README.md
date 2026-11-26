# Little Keepsake
A private photo zine editor. Static Vite + TypeScript application, with a shared Canvas renderer for preview and exports. No backend, database, uploads, analytics, external fonts, or image services.

## Run
Node 22+ recommended. `npm ci`, then `npm run dev`. `npm run build` performs strict TypeScript checking and builds `dist/`.

## Use
Add JPEG, PNG, WebP, HEIC or HEIF photos. HEIC conversion stays on this device. Arrange pages with drag or arrow buttons. Edit text, frame style, fit/fill and focal point. Save a `.keepsake` file to keep your work: it includes image data and settings (HEIC is converted to JPEG). Work is held only in memory; reload/closing discards unsaved work.

Exports: 300 DPI PNG/JPEG, all-page ZIP, reading-order PDF (396 × 612 pt) and imposed booklet PDF (792 × 612 pt). Eight pages use two duplex sheets, ordered 8|1, 2|7, 6|3, 4|5. Print US letter landscape at actual size, duplex short-edge; disable printer booklet mode. Nest and fold sheets. Always test a single sheet before a full run.

## Constraints
4–32 pages in multiples of four. One photo per page, five layouts. Up to 30 MB / 60 MP per photo; very large projects can exhaust mobile memory. Import limit 400 MB. PDF text and images are rasterized together at 300 DPI for visual consistency; PDF text is not selectable. RGB color, no CMYK or bleed. Not physically print-tested. Unicode coverage depends on system fonts.

## Verification
`npm test` runs Playwright against an isolated Chrome executable (see playwright.config.ts; adapt the executable path for other operating systems). `node tests/inspect-pdfs.mjs` verifies saved sample PDFs after the browser test. Synthetic artifacts are in ignored `output/`. Never commit or deploy real family assets.

## Literary themes
The original Keepsake theme is preserved. The Raven adds Poe-inspired ink and Gothic arches; Velvet & Fern pairs mahogany and forest-green Victorian bookplate details; Midnight Conservatory blends Gothic arches with woodland ornament. Choose light paper for less ink or rich dark panels with white printer margins. Theme and paper settings apply to the whole book and are included in recovery files. Older projects open as Original / Light. The themed palettes use coordinated ink colors; your original custom accent is retained when switching back. Typography remains editable.

## Instant-photo frame
Choose **Instant** under Photo frame for an original instant-photo look: a 4×4-inch image window, off-white border, and wider caption area. Portrait/landscape images use the existing fit/fill and focal controls. Caption text fits within the lower border (up to 180 characters); theme colors stay readable against the light card. Optional **Subtle paper depth** adds a small shadow that is rendered identically in previews and exports. Frame and depth settings are stored per page and survive project save/import. Existing project files continue to open normally.

## HEIC / HEIF support
HEIC/HEIF photos are detected by their container header, including files with missing or generic MIME types. A same-origin module worker uses pinned heic-to 1.6.6's CSP-compatible libheif 1.23.6 / libde265 1.0.16 build. No decoder CDN, uploads or conversion service. The worker chooses the primary still, applies HEIF rotation/mirroring through libheif and a bounded single-image EXIF fallback when no effective container transform exists. Output is a quality-0.96 JPEG; HDR, depth, Live Photo video, additional frames and original metadata are not retained. Keep your original HEIC separately.

Limits: 30 MB compressed, 60 megapixels decoded, 60-second worker timeout. Mixed batches report failures per filename and keep successful images. Failed replacements keep the existing photo. Very large images can still exceed device memory. Tested with real synthetic HEIC encoded by macOS ImageIO, not renamed JPEG. Chrome desktop and mobile viewport verified; physical iPhone/Safari, 10-bit/HDR, every HEIC codec/variant and EXIF-only orientation in multi-image containers are not verified.

Licensing/security: `public/licenses.html` links LGPL/GPL notices, exact upstream source archives and the application integration source. Decoder is a separate replaceable JS module; source archive hashes are pinned. `npm audit --omit=dev` reported no advisories at this update; npm auditing does not comprehensively audit the embedded C/C++ codec. No eval, remote image processing or relaxed account permissions. The app CSP permits same-origin worker code and continues to prohibit fetch/XHR connections.

## One-sheet mini-zine
Choose **One-sheet mini-zine · PDF** (or PNG/JPEG) for a single-sided US-letter sheet that folds into an eight-panel booklet. Exactly 8 logical pages are required; other page counts are rejected without truncation. Finished panels are 2.75×4.25 inches. Complete page layouts are inset 0.25 inches horizontally (more vertically) and reduced to about 41%, preserving all content. Text becomes small: use short titles/captions and check an actual-size proof. A sheet preview and optional fold/cut guide are included. Existing larger duplex booklet export is unchanged.

Print landscape, SINGLE-SIDED, Actual size/100%, with duplex, printer booklet mode and fit-to-page OFF. Crease into four equal columns and two rows. Cut only the center horizontal crease between x=2.75 and x=8.25 inches (y=4.25 inches). Fold lengthwise, printed sides out; push short ends toward each other to open the slit into a diamond/cross. Collapse the four leaves with logical page 1 at front and page 8 at back. Do not trim the sheet. Test-fold one copy first.

Reference: [High Point University's 8-page mini-zine template](https://guides.highpoint.edu/ld.php?content_id=79077176), rotated clockwise from portrait into landscape and renumbered front=1, back=8. Result: top [5,4,3,2] rotated 180°, bottom [6,7,8,1] upright. [Illustrated folding instructions](https://guides.highpoint.edu/ld.php?content_id=79066031). The reference and raster matching verify arrangement; no physical print/fold test has been performed here.

The first local dev run or build fetches two upstream decoder source archives from GitHub and verifies their SHA-256 hashes. The shipped license page continues to include the matching source downloads.
