# Color Palette Guide

This document defines the consistent color palette used throughout the NMLS Test Prep application.

## Overview

The application uses a **blue/indigo** primary color scheme with semantic colors for success, warning, and error states. All colors support both light and dark modes.

---

## Color System

### Primary Colors

Use for main actions, primary elements, branding, and interactive components.

| Usage | Light Mode | Dark Mode | Tailwind Class |
|-------|------------|-----------|----------------|
| **Primary Button** | Blue 700 (#1d4ed8) | Blue 700 (#1d4ed8) | `bg-blue-700 hover:bg-blue-800` |
| **Primary Alt** | Indigo 600 (#4f46e5) | Blue 700 (#1d4ed8) | `bg-indigo-600 dark:bg-blue-700` |
| **Primary Text** | Blue 700 | Blue 400 | `text-blue-700 dark:text-blue-400` |
| **Primary Icons** | Blue 700 | Blue 400 | `text-blue-700 dark:text-blue-400` |
| **Primary Border** | Blue 700 | Blue 700 | `border-blue-700` |

**Examples**:
```tsx
// Primary Button
<button className="bg-blue-700 hover:bg-blue-800 text-white">
  Submit
</button>

// Primary Icon
<Icon className="text-blue-700 dark:text-blue-400" />

// Primary Badge
<span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
  Admin
</span>
```

---

### Semantic Colors

#### Success (Green)
Use for positive scores (≥75%), completed states, strengths, and achievements.

| Usage | Light Mode | Dark Mode | Tailwind Class |
|-------|------------|-----------|----------------|
| **Success Text** | Emerald 600 (#059669) | Emerald 400 | `text-emerald-600 dark:text-emerald-400` |
| **Success Background** | Emerald 50 | Emerald 900/20 | `bg-emerald-50 dark:bg-emerald-900/20` |
| **Success Border** | Emerald 200 | Emerald 800 | `border-emerald-200 dark:border-emerald-800` |
| **Success Icon** | Emerald 600 | Emerald 400 | `text-emerald-600 dark:text-emerald-400` |

**When to use**:
- Scores ≥ 75%
- Completed achievements
- Study streaks
- Perfect scores
- Top strengths

#### Warning (Amber/Orange)
Use for medium scores (60-74%) and caution states.

| Usage | Light Mode | Dark Mode | Tailwind Class |
|-------|------------|-----------|----------------|
| **Warning Text** | Amber 600 (#d97706) | Amber 400 | `text-amber-600 dark:text-amber-400` |
| **Warning Background** | Amber 50 | Amber 900/20 | `bg-amber-50 dark:bg-amber-900/20` |
| **Warning Border** | Amber 200 | Amber 800 | `border-amber-200 dark:border-amber-800` |
| **Warning Icon** | Amber 600 | Amber 400 | `text-amber-600 dark:text-amber-400` |

**When to use**:
- Scores 60-74%
- Areas needing improvement (but not critical)
- Moderate progress indicators

#### Error (Red)
Use for low scores (<60%), errors, and critical warnings.

| Usage | Light Mode | Dark Mode | Tailwind Class |
|-------|------------|-----------|----------------|
| **Error Text** | Red 600 (#dc2626) | Red 400 | `text-red-600 dark:text-red-400` |
| **Error Background** | Red 50 | Red 900/20 | `bg-red-50 dark:bg-red-900/20` |
| **Error Border** | Red 200 | Red 800 | `border-red-200 dark:border-red-800` |
| **Error Icon** | Red 600 | Red 400 | `text-red-600 dark:text-red-400` |

**When to use**:
- Scores < 60%
- Failed attempts
- Weak areas
- Error messages
- Critical warnings

---

### Neutral Colors (Slate)

Use for text, backgrounds, borders, and non-interactive elements.

| Usage | Light Mode | Dark Mode | Tailwind Class |
|-------|------------|-----------|----------------|
| **Page Background** | Gray 50 (#f9fafb) | Slate 950 (#020617) | `bg-gray-50 dark:bg-slate-950` |
| **Card Background** | White (#ffffff) | Slate 900 (#0f172a) | `bg-white dark:bg-slate-900` |
| **Border** | Slate 200 | Slate 700 | `border-slate-200 dark:border-slate-700` |
| **Primary Text** | Slate 900 | White | `text-slate-900 dark:text-white` |
| **Secondary Text** | Slate 600 | Slate 400 | `text-slate-600 dark:text-slate-400` |
| **Muted Text** | Slate 500 | Slate 500 | `text-slate-500` |
| **Hover Background** | Gray 100 | Slate 800 | `hover:bg-gray-100 dark:hover:bg-slate-800` |

---

## Usage Guidelines

### ✅ DO:

1. **Use primary colors (blue/indigo) for all branding and main actions**
   - Navigation highlights
   - Primary buttons
   - Main icons in stat cards
   - Logo and branding elements

2. **Use semantic colors ONLY for their intended purpose**
   - Emerald: High scores and positive achievements
   - Amber: Medium scores and warnings
   - Red: Low scores and errors

3. **Maintain consistency across similar components**
   - All stat card icons: `text-blue-700`
   - All section headers: `text-slate-900 dark:text-white`
   - All primary buttons: `bg-blue-700 hover:bg-blue-800`

4. **Support dark mode for all colors**
   - Always include `dark:` variants
   - Test in both light and dark modes

### ❌ DON'T:

1. **Don't use purple** (except in legacy code to be migrated)
   - NO `purple-*` colors anywhere
   - Replace with `indigo-*` or `blue-*`

2. **Don't mix random colors**
   - NO violet, teal, cyan, lime, etc.
   - Stick to the defined palette

3. **Don't use semantic colors decoratively**
   - Emerald is not a generic "green color" - it means success
   - Amber is not a generic "orange" - it means warning
   - Red is not a generic "red" - it means error or low score

4. **Don't forget dark mode variants**
   - Every color class needs a `dark:` variant
   - Test visibility in both modes

---

## Component Examples

### Stat Card
```tsx
<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
  <Icon className="text-blue-700 dark:text-blue-400" />
  <p className="text-xs text-slate-500 uppercase">Label</p>
  <p className="text-3xl font-bold text-slate-900 dark:text-white">Value</p>
</div>
```

### Score Display (Conditional)
```tsx
<p className={`text-lg font-bold ${
  score >= 75 ? 'text-emerald-600' :
  score >= 60 ? 'text-amber-600' :
  'text-red-600'
}`}>
  {score}%
</p>
```

### Primary Button
```tsx
<button className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-sm transition-colors">
  Take Action
</button>
```

### Secondary Button
```tsx
<button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700">
  Cancel
</button>
```

### Badge (Admin/Role)
```tsx
<span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
  Admin
</span>
```

### Achievement Card (Completed)
```tsx
<div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
  <Icon className="text-emerald-600 dark:text-emerald-400" />
  <p className="text-emerald-900 dark:text-emerald-100">Achievement Name</p>
</div>
```

### Weak Area Card
```tsx
<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
  <Icon className="text-red-600 dark:text-red-400" />
  <p className="text-red-900 dark:text-red-100">Topic Name</p>
</div>
```

---

## Migration Guide

If you encounter legacy colors, replace them as follows:

| Old Color | New Color | Usage |
|-----------|-----------|-------|
| `purple-*` | `indigo-*` or `blue-*` | Primary elements |
| `violet-*` | `blue-*` | Primary elements |
| `green-*` (decorative) | `blue-*` | Primary elements |
| `green-*` (scores) | `emerald-*` | Keep for success states |
| `orange-*` (decorative) | `blue-*` | Primary elements |
| `orange-*` (scores) | `amber-*` | Keep for warning states |

---

## Files Updated

The following files have been updated to follow this color palette:

### ✅ Updated
- `/src/app/(dashboard)/layout.tsx` - Admin badge, navigation
- `/src/app/(dashboard)/analytics/page.tsx` - All stat cards and icons
- `/src/app/(dashboard)/achievements/page.tsx` - Consistent primary colors
- `/src/app/(dashboard)/settings/page.tsx` - Consistent primary colors
- `/src/app/(dashboard)/help/page.tsx` - Consistent primary colors

### 🔍 To Review
Check these files and update any remaining color inconsistencies:
- Practice test pages
- Exam pages
- Dashboard page
- AI Agent page
- Mobile navigation
- Any modals or popups

---

## Testing Checklist

When adding new components or pages:

- [ ] Uses `blue-700` or `indigo-600` for primary elements
- [ ] Uses emerald/amber/red ONLY for score-based states
- [ ] Includes `dark:` variants for all colors
- [ ] No purple, violet, or random colors used
- [ ] Tested in light mode
- [ ] Tested in dark mode
- [ ] Accessible color contrast (WCAG AA minimum)

---

## Resources

- **Tailwind Color Reference**: https://tailwindcss.com/docs/customizing-colors
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Design System**: See `/DESIGN.md` for overall design guidelines

---

**Last Updated**: February 6, 2026
**Version**: 1.0.0
**Maintained By**: Development Team

For questions or suggestions about the color palette, please consult this guide or open a discussion.
