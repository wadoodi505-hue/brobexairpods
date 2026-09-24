# BROBEX website

Static multi-page BROBEX website built from the supplied project and assets.

## Run locally

Serve this directory with any static file server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Pages

- `index.html` — cinematic product sequence, signal visualizer, and repair estimator
- `airpods.html` — BROBEX Audio product study
- `repair.html` — mobile repair services and indicative estimator
- `work.html` — studio capabilities
- `about.html` — BROBEX point of view
- `contact.html` — frontend-only validated inquiry form

The homepage uses the supplied 155-frame `assets/frames/` sequence as a scroll-controlled canvas experience. The renderer loads the first frames immediately, warms only a small window around the current scroll position, caps decoded memory, and falls back to the CSS wallpaper if the frame pack is unavailable. The original source frame files are kept intact.

## Interaction and performance notes

- Scroll rendering is scheduled through `requestAnimationFrame` and uses a DPR cap to avoid oversized canvas buffers.
- Frames are loaded with async decoding, low fetch priority outside the active window, and bounded cache eviction.
- Reduced-motion users receive a static first frame and no decorative motion.
- Shared pages include reveal, letter, counter, magnetic-button, card-tilt, parallax, and hover-zoom enhancements without a runtime dependency.