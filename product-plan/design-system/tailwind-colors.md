# Tailwind Color Configuration

## Color Choices

- **Primary:** `teal` — Used for buttons, links, key accents, active nav states
- **Secondary:** `sky` — Used for tags, highlights, secondary badges
- **Neutral:** `slate` — Used for backgrounds, text, borders, cards

## Usage Examples

```
Primary button:      bg-teal-600 hover:bg-teal-700 text-white
Primary text accent: text-teal-600 dark:text-teal-400
Secondary badge:     bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300
Neutral background:  bg-slate-50 dark:bg-slate-950
Neutral card:        bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800
Neutral text:        text-slate-600 dark:text-slate-300
Muted text:          text-slate-400 dark:text-slate-500
```

## Tailwind Config (extend)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: require('tailwindcss/colors').teal,
        secondary: require('tailwindcss/colors').sky,
        neutral: require('tailwindcss/colors').slate,
      },
    },
  },
}
```
