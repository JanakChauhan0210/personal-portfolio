# Janak Chauhan | Portfolio

Personal portfolio of Janak Chauhan, an MBA (Tech) Data Science student at Mukesh Patel School of Technology Management & Engineering (MPSTME), NMIMS, Mumbai (expected graduation 2029).

Live site: https://janakchauhan0210.github.io/portfolio/
Source: https://github.com/JanakChauhan0210/portfolio

## Overview

A single-page site written by hand in HTML, CSS and JavaScript. No framework, build step or tracking. The visual direction (paper background, large lowercase name, serif italic accents, hand-written notes, scroll-pinned sections) is inspired by the layout style of samaymaurya.com. All code, copy and assets here are original, and no content or images from that site are used.

Sections: Home, Featured work, Skills, About me (tabbed browser), Contact.

## Features

- Scroll-driven intro and outro, a pinned sideways project rail, and an About section whose tabs flip as you scroll
- Project filters, a project detail view and a presentation mode
- Custom cursor for mouse users (a pointer arrow that turns orange over links and buttons) and a faint ridge drawing that follows the pointer in the hero; touch devices and reduced-motion visitors keep the system cursor and a static hero
- Skills map, a small terminal (press `t`), a command centre (press `?`) and single-key shortcuts
- Flight Management Dashboard demo video with controls and a download fallback
- Copy-email button, pencil scroll indicator, keyboard-friendly focus styles and skip link
- Reduced-motion visitors get a plain stacked layout; all content stays readable without JavaScript
- Layouts for phone, tablet and desktop with no sideways page scroll

## Technologies

HTML5, CSS3 (custom properties, grid, flexbox, sticky positioning), vanilla JavaScript. Fonts are self-hosted: DM Sans, Instrument Serif and Caveat.

## Project structure

```
index.html       page content
styles.css       styling (design tokens at the top)
script.js        scroll stages, hero details, filters, skills map, copy email
features.js      detail view, presentation mode, terminal, command centre
favicon.svg      site icon
assets/cursor/   cursor images and the hero spotlight drawing
assets/fonts/    self-hosted fonts and OFL-LICENSES.txt
assets/video/    Flight Dashboard demo (mp4, webm) and poster image
```

## Run locally

```
python -m http.server 8081
```

Then visit http://localhost:8081.

## Deployment

GitHub Pages: Settings, Pages, Deploy from a branch, `main`, `/ (root)`. Keep `index.html` at the top level and upload the whole `assets` folder.

## Credits and attributions

- Fonts: DM Sans, Instrument Serif and Caveat, under the SIL Open Font License 1.1 (licence texts in `assets/fonts/OFL-LICENSES.txt`).
- The Flight Management Dashboard video is footage of a group project, trimmed so only the dashboard is shown.
- Design and motion guidelines follow the open-source [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT licence). No code was copied.
