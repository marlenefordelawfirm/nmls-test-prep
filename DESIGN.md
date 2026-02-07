# NMLS Test Prep - Design System Guide

**Last Updated:** February 6, 2026
**Version:** 1.0

This document defines the consistent design patterns used throughout the NMLS Test Prep application. All new features and components MUST follow these standards to maintain visual consistency.

---

## Color Palette

### Primary Colors
```css
/* Primary Brand Color - Blue */
bg-blue-700         /* Primary actions, active states */
bg-blue-800         /* Hover state for primary actions */
bg-blue-50          /* Light blue backgrounds */
border-blue-100     /* Light blue borders */
text-blue-700       /* Blue text */

/* Secondary/Neutral Colors - Slate */
bg-slate-50         /* Light neutral backgrounds */
bg-slate-100        /* Secondary button backgrounds */
bg-slate-200        /* Borders, dividers */
text-slate-900      /* Primary text */
text-slate-600      /* Secondary text */
text-slate-500      /* Tertiary text/labels */

/* Background */
bg-gray-50          /* Page background */
bg-white            /* Card backgrounds */
```

### Status Colors
```css
/* Success/Pass */
bg-emerald-600      /* Success buttons */
bg-emerald-50       /* Success backgrounds */
text-emerald-700    /* Success text */
border-emerald-200  /* Success borders */

/* Warning */
bg-amber-50         /* Warning backgrounds */
text-amber-700      /* Warning text */
border-amber-200    /* Warning borders */

/* Error/Critical */
bg-red-50           /* Error backgrounds */
text-red-700        /* Error text */
border-red-200      /* Error borders */
```

---

## Typography

### Font Weights
- **font-bold** - Primary headings, labels, important text
- **font-medium** - Secondary text (USE SPARINGLY)
- **Regular weight** - Body text (default, no class needed)

### Font Sizes
```css
text-3xl font-bold          /* Page titles (h1) */
text-2xl font-bold          /* Section headings (h2) */
text-xl font-bold           /* Subsection headings (h3) */
text-base font-bold         /* Large body text */
text-sm font-bold           /* Buttons, labels, default UI text */
text-xs font-bold           /* Small labels, badges */
```

### Text Colors
```css
text-slate-900      /* Primary text (headings, important content) */
text-slate-600      /* Secondary text (descriptions, body) */
text-slate-500      /* Tertiary text (captions, labels) */
```

---

## Spacing

### Padding Standards
```css
p-8         /* Large card padding */
p-6         /* Medium card padding */
p-4         /* Small card padding */
p-3         /* Compact padding */

px-8 py-4   /* Large button padding */
px-6 py-3   /* Medium button padding */
px-4 py-2   /* Small button/pill padding */
px-3 py-1   /* Badge/tag padding */
```

### Margins & Gaps
```css
space-y-8   /* Large vertical spacing between sections */
space-y-6   /* Medium vertical spacing */
space-y-3   /* Small vertical spacing */
space-y-2   /* Compact vertical spacing */

gap-6       /* Large gap (flexbox/grid) */
gap-4       /* Medium gap */
gap-3       /* Small gap */
gap-2       /* Compact gap */
```

---

## Border Radius

**ALWAYS use `rounded-xl` for consistency:**

```css
rounded-xl      /* Cards, buttons, inputs, containers */
rounded-full    /* Pills, badges, tags only */
```

❌ **NEVER use:** `rounded`, `rounded-sm`, `rounded-lg`, `rounded-md`

---

## Component Standards

### 1. Buttons

#### Primary Button (Call-to-Action)
```tsx
<button className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-sm transition-all">
  Button Text
</button>
```

**Sizes:**
- **Large:** `px-8 py-4`, `text-lg`
- **Medium:** `px-6 py-3`, `text-sm` (default)
- **Small/Compact:** `px-4 py-2`, `text-sm`

#### Secondary Button (Neutral Action)
```tsx
<button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold text-sm border border-slate-200 transition-all">
  Secondary Action
</button>
```

#### Success Button (Submit, Confirm)
```tsx
<button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all">
  Submit
</button>
```

#### Icon Buttons (Square)
```tsx
<button className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center transition-all">
  <Icon className="w-4 h-4" />
</button>
```

---

### 2. Cards

#### Standard Card
```tsx
<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
  {/* Content */}
</div>
```

#### Featured/Primary Card (with left border accent)
```tsx
<div className="bg-white rounded-xl shadow-sm border-l-4 border-l-blue-700 p-8">
  {/* Content */}
</div>
```

#### Info/Alert Card
```tsx
<div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
  {/* Info content */}
</div>
```

---

### 3. Pills & Badges

#### Pill/Badge (rounded-full only)
```tsx
<span className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
  Badge Text
</span>
```

**Color Variants:**
- **Primary:** `bg-blue-50 text-blue-700 border-blue-100`
- **Success:** `bg-emerald-50 text-emerald-700 border-emerald-200`
- **Warning:** `bg-amber-50 text-amber-700 border-amber-200`
- **Neutral:** `bg-slate-50 text-slate-600 border-slate-200`

---

### 4. Headers & Navigation

#### Page Header (Sticky)
```tsx
<div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
  {/* Header content */}
</div>
```

#### Section Header
```tsx
<section className="bg-white rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
  <h1 className="text-3xl font-bold text-slate-900 mb-2">Title</h1>
  <p className="text-slate-600">Description</p>
</section>
```

---

### 5. Header UI Elements (Fixed Height Pattern)

**All header buttons/pills MUST have consistent height:**

```tsx
{/* Timer/Info Pills */}
<div className="h-10 flex items-center gap-2 px-4 bg-slate-50 rounded-xl border border-slate-200">
  <Icon className="w-4 h-4 text-slate-600" />
  <span className="text-sm font-bold text-slate-900">Content</span>
</div>

{/* Action Buttons */}
<button className="h-10 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-sm">
  <Icon className="w-4 h-4" />
  Button
</button>

{/* Secondary Buttons */}
<button className="h-10 px-4 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl flex items-center gap-2 transition-all font-bold text-sm border border-slate-200">
  <Icon className="w-4 h-4" />
  Action
</button>
```

**Rules:**
- Height: `h-10` (fixed)
- Padding: `px-4` (horizontal only, no py needed)
- Icons: `w-4 h-4` (consistent size)
- Text: `text-sm font-bold`
- Border radius: `rounded-xl`

---

### 6. Progress Bars

```tsx
<div className="w-full bg-slate-200 rounded-full h-2">
  <div
    className="bg-blue-700 h-2 rounded-full transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

---

### 7. Icons

#### Icon Sizes
```css
w-3 h-3     /* Tiny icons (inside small badges) */
w-4 h-4     /* Small icons (buttons, header elements) */
w-5 h-5     /* Medium icons (standard buttons, cards) */
w-6 h-6     /* Large icons (feature cards) */
w-8 h-8     /* Extra large icons (modals, emphasis) */
```

**Consistency Rule:** Use `w-4 h-4` for all header/button icons, `w-5 h-5` for card/content icons.

---

### 8. Inputs & Forms

#### Text Input
```tsx
<input
  type="text"
  className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 text-sm"
  placeholder="Enter text"
/>
```

#### Radio Button Selection Card
```tsx
<label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
  isSelected
    ? 'border-blue-700 bg-blue-50'
    : 'border-slate-200 hover:border-slate-300 bg-white'
}`}>
  <div className="flex items-start gap-3">
    <input type="radio" className="mt-1 w-4 h-4 text-blue-700" />
    <div className="flex-1">
      <span className="font-bold text-slate-700">Label</span>
      <span className="text-slate-900">Content</span>
    </div>
  </div>
</label>
```

---

### 9. Modals & Overlays

#### Modal Overlay
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
  <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
    <h3 className="text-2xl font-bold text-slate-900 mb-4">Modal Title</h3>
    <p className="text-slate-600 mb-6">Description</p>
    {/* Actions */}
  </div>
</div>
```

---

## Layout Patterns

### Grid Layouts

#### 3-Column Stats
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Label</p>
    <p className="text-2xl font-bold text-slate-900">Value</p>
  </div>
</div>
```

#### Content Cards Grid
```tsx
<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</section>
```

### Vertical Spacing Between Sections
```tsx
<div className="space-y-8">
  <section>{/* Section 1 */}</section>
  <section>{/* Section 2 */}</section>
  <section>{/* Section 3 */}</section>
</div>
```

---

## Transition & Animation

**Always include smooth transitions:**
```css
transition-all      /* For most interactive elements */
transition-colors   /* For color-only changes */
```

**Hover states:**
- Buttons: Background color change
- Cards: Border color change (`hover:border-slate-300`, `hover:shadow-lg`)
- Links: Text color change

---

## Accessibility Standards

### Color Contrast
- Ensure text meets WCAG 2.1 AA standards
- Primary text on white: `text-slate-900` ✅
- Secondary text on white: `text-slate-600` ✅
- White text on blue-700: ✅

### Focus States
All interactive elements MUST have visible focus states:
```css
focus:outline-none focus:ring-2 focus:ring-blue-700
```

### Disabled States
```tsx
<button
  disabled
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
  Disabled
</button>
```

---

## Common Mistakes to Avoid

❌ **DON'T:**
- Mix `indigo` colors with `blue` colors
- Use `rounded-lg` or `rounded-md` (use `rounded-xl` only)
- Mix `font-medium` and `font-semibold` (use `font-bold` for emphasis)
- Use different icon sizes in the same context (header = w-4 h-4)
- Mix `gray-` with `slate-` (use `slate-` for neutrals)
- Use `text-base` for buttons (use `text-sm font-bold`)
- Create buttons without `transition-all`

✅ **DO:**
- Use `blue-700` for all primary actions
- Use `slate-` for all neutral colors
- Use `rounded-xl` for all containers
- Use `font-bold` for all emphasis
- Use `h-10` for all header elements
- Use `w-4 h-4` for all header icons
- Include `transition-all` on interactive elements

---

## Quick Reference Checklist

When creating a new component, verify:

- [ ] Uses `bg-blue-700` for primary actions
- [ ] Uses `slate-` colors for neutrals (not `gray-`)
- [ ] Uses `rounded-xl` for all containers (not `rounded-lg`)
- [ ] Uses `font-bold` for emphasis (not `font-semibold`)
- [ ] Uses `text-sm` for UI text (buttons, labels)
- [ ] Uses consistent icon sizes (`w-4 h-4` in headers, `w-5 h-5` in cards)
- [ ] Includes `transition-all` on interactive elements
- [ ] Uses `shadow-sm` for elevated elements
- [ ] Uses `border border-slate-200` for borders
- [ ] Follows spacing standards (`p-8` for cards, `gap-3` for flex items)

---

## Example Component Implementations

### Example: Header with Timers and Actions
```tsx
<div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
  <div className="flex items-center justify-between mb-4">
    {/* Left: Info */}
    <div className="flex items-center gap-6">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Question 1 of 125</h2>
        <p className="text-xs text-slate-500">Content Area</p>
      </div>
      <div className="text-sm font-medium text-slate-600">
        <span className="font-bold text-slate-900">5</span> / 125 answered
      </div>
    </div>

    {/* Right: Actions */}
    <div className="flex items-center gap-3">
      {/* Timer Pills */}
      <div className="h-10 flex items-center gap-2 px-4 bg-slate-50 rounded-xl border border-slate-200">
        <Clock className="w-4 h-4 text-slate-600" />
        <span className="text-sm font-bold text-slate-900 font-mono">0:12</span>
      </div>

      {/* Action Button */}
      <button className="h-10 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-sm">
        <Icon className="w-4 h-4" />
        Action
      </button>
    </div>
  </div>

  {/* Progress Bar */}
  <div className="w-full bg-slate-200 rounded-full h-2">
    <div className="bg-blue-700 h-2 rounded-full transition-all" style={{ width: '40%' }} />
  </div>
</div>
```

### Example: Feature Card
```tsx
<article className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all group">
  <div className="p-6 space-y-4">
    {/* Icon and Badge */}
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
        <Icon className="w-6 h-6 text-blue-700" />
      </div>
      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
        Badge
      </span>
    </div>

    {/* Content */}
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
        Card Title
      </h2>
      <p className="text-sm text-slate-600 leading-relaxed">
        Description text
      </p>
    </div>

    {/* Action */}
    <button className="w-full px-4 py-3 bg-blue-700 text-white text-sm font-bold rounded-xl hover:bg-blue-800 transition-all shadow-sm">
      Action Button
    </button>
  </div>
</article>
```

---

## Version History

- **v1.0** (Feb 6, 2026) - Initial design system documentation
  - Standardized color palette (blue-700 primary, slate neutrals)
  - Unified border radius (rounded-xl)
  - Consistent button sizing and typography
  - Fixed header element heights (h-10)
  - Icon size standards

---

**For questions or clarifications, refer to:**
- Dashboard: `/src/app/(dashboard)/dashboard/page.tsx`
- Practice Page: `/src/app/(dashboard)/practice/page.tsx`
- Exam Interface: `/src/components/exam/ExamInterface.tsx`
