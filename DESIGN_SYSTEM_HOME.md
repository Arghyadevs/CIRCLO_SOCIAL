# 🎨 DESIGN SYSTEM: Home Page

---

## Color Palette

### **Light Mode**

```css
/* Primary Backgrounds */
--bg-primary: #ffffff
--bg-secondary: #f9f5ff
--bg-tertiary: #f0e6ff

/* Gradients */
--gradient-bg: linear-gradient(to bottom, #ffffff, #f9f5ff, #eff6ff)
--gradient-accent: linear-gradient(135deg, #9333ea, #7c3aed)
--gradient-button: linear-gradient(135deg, #7c3aed, #6366f1)

/* Text */
--text-primary: #111827
--text-secondary: #4b5563
--text-tertiary: #9ca3af

/* Accents */
--accent-purple: #9333ea
--accent-blue: #3b82f6
--accent-green: #10b981
--accent-pink: #ec4899

/* Borders */
--border-light: #e5e7eb
--border-primary: #d1d5db
```

### **Dark Mode**

```css
/* Primary Backgrounds */
--bg-primary: #0f172a
--bg-secondary: #1e1b4b
--bg-tertiary: #312e81

/* Gradients */
--gradient-bg: linear-gradient(to bottom, #0f172a, #1e1b4b, #111827)
--gradient-accent: linear-gradient(135deg, #a78bfa, #818cf8)
--gradient-button: linear-gradient(135deg, #a78bfa, #818cf8)

/* Text */
--text-primary: #f9fafb
--text-secondary: #d1d5db
--text-tertiary: #9ca3af

/* Accents */
--accent-purple: #a78bfa
--accent-blue: #60a5fa
--accent-green: #34d399
--accent-pink: #f472b6

/* Borders */
--border-light: #374151
--border-primary: #4b5563
```

---

## Typography

### **Font Stack**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
             'Droid Sans', 'Helvetica Neue', sans-serif;
```

### **Font Sizes**

| Scale | Size | Usage | Weight |
|-------|------|-------|--------|
| **xs** | 12px | Labels, captions | 400-500 |
| **sm** | 13px | Helper text, secondary | 400 |
| **base** | 14px | Body text | 400 |
| **lg** | 16px | Section body | 400 |
| **xl** | 18px | Subsection titles | 600 |
| **2xl** | 20px | Section titles | 600-700 |
| **3xl** | 24px | Page titles | 700 |
| **4xl** | 28px | Hero titles | 700-800 |

### **Font Weights**

```css
--font-light: 300
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
--font-extrabold: 800
```

### **Line Height**

```css
--leading-tight: 1.2    /* Headlines */
--leading-snug: 1.375   /* Subheads *)
--leading-normal: 1.5   /* Body (DEFAULT) */
--leading-relaxed: 1.625 /* Comfortable reading */
--leading-loose: 2      /* Extra space */
```

---

## Spacing Scale

```css
--space-0: 0px
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-7: 28px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-14: 56px
--space-16: 64px
--space-20: 80px
```

### **Usage**
- **Gutters:** space-6, space-8
- **Component padding:** space-4, space-6
- **Section gaps:** space-8, space-12
- **Page margins:** space-6, space-8

---

## Border Radius

```css
--rounded-none: 0px
--rounded-sm: 2px
--rounded-base: 4px
--rounded-md: 6px
--rounded-lg: 8px
--rounded-xl: 12px
--rounded-2xl: 16px
--rounded-3xl: 24px
--rounded-full: 9999px
```

### **Component Usage**
- **Buttons:** rounded-lg (8px)
- **Cards:** rounded-2xl (16px) - rounded-3xl (24px)
- **Inputs:** rounded-lg (8px)
- **Icons:** rounded-full
- **Pills:** rounded-full
- **Large sections:** rounded-3xl (24px)

---

## Shadows

```css
/* Shadow Elevation */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
               0 1px 2px 0 rgba(0, 0, 0, 0.06)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -1px rgba(0, 0, 0, 0.06)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -2px rgba(0, 0, 0, 0.05)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 10px 10px -5px rgba(0, 0, 0, 0.04)
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### **Component Usage**
- **Default cards:** shadow-md
- **Hover cards:** shadow-lg
- **Elevated modals:** shadow-xl
- **Floating elements:** shadow-lg to shadow-xl

---

## Transitions & Animations

### **Duration**
```css
--duration-75: 75ms
--duration-100: 100ms
--duration-150: 150ms
--duration-200: 200ms (DEFAULT)
--duration-300: 300ms
--duration-500: 500ms
--duration-700: 700ms
--duration-1000: 1000ms
```

### **Easing**
```css
--ease-linear: linear
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1) /* DEFAULT */
```

### **Common Animations**

#### Scale Hover
```css
transition: transform 300ms ease-in-out;

&:hover {
  transform: scale(1.05);
}
```

#### Color Transition
```css
transition: all 300ms ease-in-out;
```

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 300ms ease-out;
```

#### Slide In
```css
@keyframes slideIn {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
animation: slideIn 300ms ease-out;
```

---

## Component Design Tokens

### **Button**
```css
/* Base */
padding: 12px 20px
border-radius: 8px
font-size: 14px
font-weight: 600
transition: all 300ms ease-in-out

/* Primary */
background: linear-gradient(135deg, #7c3aed, #6366f1)
color: white

/* On Hover */
transform: scale(1.05)
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

/* On Focus */
outline: 2px solid #a78bfa
outline-offset: 2px
```

### **Card**
```css
/* Base */
background: rgba(255, 255, 255, 0.8) /* Light mode */
background: rgba(30, 27, 75, 0.8) /* Dark mode */
border: 1px solid rgba(229, 231, 235, 0.3)
border-radius: 16px-24px
padding: 24px
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
backdrop-filter: blur(12px)

/* On Hover */
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
transition: all 300ms ease-in-out
```

### **Input**
```css
/* Base */
width: 100%
padding: 12px 16px
border: 1px solid #d1d5db
border-radius: 8px
font-size: 14px
line-height: 1.5
background: white
color: #111827

/* Focus */
outline: none
border-color: #7c3aed
box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1)

/* Dark Mode */
background: #1e1b4b
color: #f9fafb
border-color: #4b5563
```

### **Badge**
```css
/* Base */
display: inline-block
padding: 4px 12px
border-radius: 999px
font-size: 12px
font-weight: 500
background: #f0e6ff
color: #7c3aed

/* Variants */
.badge-success { background: #dcfce7; color: #15803d; }
.badge-warning { background: #fef3c7; color: #ca8a04; }
.badge-error { background: #fee2e2; color: #dc2626; }
.badge-info { background: #dbeafe; color: #1e40af; }
```

---

## Layout System

### **Container**
```css
--width-full: 100%
--max-width-sm: 640px
--max-width-md: 768px
--max-width-lg: 1024px
--max-width-xl: 1280px
--max-width-2xl: 1536px
--max-width-7xl: 80rem /* Default for app */
```

### **Grid**
```css
/* 4-column grid (Explore section) */
grid-template-columns: repeat(4, minmax(0, 1fr));

/* Responsive */
@media (max-width: 1024px) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 768px) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 640px) {
  grid-template-columns: 1fr;
}
```

### **Flexbox**
```css
/* Horizontal alignment */
display: flex;
justify-content: space-between;
align-items: center;
gap: 16px;

/* Vertical alignment */
display: flex;
flex-direction: column;
gap: 12px;
```

---

## Responsive Breakpoints

```css
/* Mobile First */
--screen-sm: 640px
--screen-md: 768px
--screen-lg: 1024px
--screen-xl: 1280px
--screen-2xl: 1536px
```

### **Usage**

```css
/* Default (mobile) */
display: flex;
flex-direction: column;

/* Tablet & up */
@media (min-width: 768px) {
  display: flex;
  flex-direction: row;
}

/* Desktop & up */
@media (min-width: 1024px) {
  max-width: 1280px;
}
```

---

## Z-Index Scale

```css
--z-dropdown: 50
--z-sticky: 40
--z-fixed: 30
--z-offcanvas: 100
--z-modal: 1000
--z-popover: 1100
--z-tooltip: 1200
```

### **Component Usage**
- **Sticky top bar:** z-40
- **Sidebar hover:** z-10
- **Mobile nav:** z-40
- **Modals:** z-1000
- **Tooltips:** z-1200

---

## Dark Mode

### **Implementation**
```css
/* Light mode (default) */
.component {
  background: white;
  color: #111827;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .component {
    background: #1e1b4b;
    color: #f9fafb;
  }
}

/* Or using class */
html[data-theme="dark"] .component {
  background: #1e1b4b;
  color: #f9fafb;
}
```

### **Color Adjustments**
- Lighten text colors in dark mode
- Darken backgrounds (use grays, purples)
- Maintain contrast ratios (AAA level)
- Use adjusted accent colors

---

## Accessibility

### **WCAG AA Compliance**

| Aspect | Standard | Implementation |
|--------|----------|-----------------|
| **Contrast** | 4.5:1 for text | All text meets ratio |
| **Focus** | Visible focus ring | 2px outline, 2px offset |
| **Size** | 44px min touch | All buttons >= 44px |
| **Motion** | Respect prefers-reduced-motion | Removed on request |
| **Color** | Not only color | Used icons + labels |

### **Focus Indicators**
```css
&:focus {
  outline: 2px solid #a78bfa;
  outline-offset: 2px;
}

&:focus-visible {
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.5);
}
```

---

## Backdrop Blur & Glassmorphism

```css
/* Base Glassmorphic Card */
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(12px);
border: 1px solid rgba(229, 231, 235, 0.3);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Intensity Levels */
--blur-none: blur(0px)
--blur-sm: blur(4px)
--blur-base: blur(12px)
--blur-md: blur(16px)
--blur-lg: blur(20px)
```

---

## Usage Guidelines

### **When to Use Colors**
- **Purple-600:** Primary actions, hover states
- **Blue-500:** Secondary actions, links
- **Green-600:** Success states
- **Red-600:** Destructive actions
- **Yellow-600:** Warnings

### **When to Use Shadows**
- **sm/base:** Subtle separations
- **md:** Default card elevation
- **lg:** Hover states, modals
- **xl:** Featured content
- **2xl:** Floating elements

### **When to Use Blur**
- **4px:** Subtle blur
- **12px:** Card backgrounds (glassmorphism)
- **20px:** Modal overlays
- **24px+:** Strong depth effects

### **When to Use Animations**
- **75-150ms:** Micro-interactions
- **200ms:** Standard transitions
- **300ms:** Important state changes
- **500ms+:** Page-level animations

---

## Component Hierarchy

```
┌─ Layout Components
│  ├─ Top Bar (sticky, z-40)
│  ├─ Sidebar (fixed width, z-20)
│  └─ Main Content (flex-1)
│
├─ Surface Components
│  ├─ Cards (md shadow, rounded-2xl)
│  ├─ Panels (lg shadow, rounded-3xl)
│  └─ Modals (xl shadow, backdrop-blur)
│
├─ Input Components
│  ├─ Text Input (rounded-lg)
│  ├─ Select (rounded-lg)
│  └─ Button (gradient, scale hover)
│
├─ Feedback Components
│  ├─ Badge (pill style)
│  ├─ Toast (shadow-lg)
│  └─ Spinner (animated)
│
└─ Navigation Components
   ├─ Menu (active indicator)
   ├─ Breadcrumb (small text)
   └─ Pagination (button style)
```

---

## Quick Reference Checklist

When building components, use:

- [ ] **Spacing:** From space scale (4px increments)
- [ ] **Colors:** From palette with light/dark variants
- [ ] **Typography:** From font scale with weights
- [ ] **Shadows:** Appropriate to elevation
- [ ] **Radius:** Consistent throughout component
- [ ] **Transitions:** 200-300ms ease-in-out
- [ ] **Focus state:** 2px outline or shadow
- [ ] **Dark mode:** Full variant for all states
- [ ] **Responsive:** Mobile-first with breakpoints
- [ ] **Accessibility:** WCAG AA contrast & size

---

**Status:** ✅ **Production Ready**  
**Last Updated:** Today  
**Version:** 1.0

---

Use this guide as your reference for all future component design and styling decisions.
