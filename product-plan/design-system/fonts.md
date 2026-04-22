# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>` or root CSS file:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=Inter:wght@300..700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
```

## Font Usage

- **Headings:** DM Sans — clean geometric sans with warmth; use for h1–h4 and UI labels
- **Body text:** Inter — optimized for screen readability; use for paragraphs and UI copy
- **Code / technical:** IBM Plex Mono — for timestamps, IDs, codes (cédula, CIE-10, FHIR)

## Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['DM Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
}
```
