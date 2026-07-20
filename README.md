# Personal Portfolio

Static HTML/CSS/JS portfolio hosted on GitHub Pages.

## Structure

```
portfolio/
├── index.html          # Home — orbital nav + bio
├── resume.html         # Resume
├── projects.html       # Projects & slide decks
├── illustrations.html  # Illustration gallery
├── github.html         # GitHub profile link
├── css/style.css
├── js/main.js
└── assets/
    ├── images/         # profile.jpg goes here
    ├── projects/       # project thumbnails + PDFs
    ├── illustrations/  # artwork images
    └── resume.pdf      # downloadable resume
```

## Adding content

- **Profile photo** → drop `profile.jpg` into `assets/images/`, then update the `<div class="center-photo">` in `index.html` to `<img src="assets/images/profile.jpg" alt="Your Name" />`
- **Project** → copy a card block in `projects.html`, drop thumbnail in `assets/projects/`
- **Illustration** → add a `<figure>` in `illustrations.html`, drop image in `assets/illustrations/`
- **Resume PDF** → drop `resume.pdf` into `assets/`, the download button already points there

## Deploy

Hosted on GitHub Pages. Push to `main` → live at `https://mossy-pickle.github.io/portfolio`
