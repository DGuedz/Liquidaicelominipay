# LiquidAI Design Guide

## 🎨 Visual Design System

### Color System

#### Primary Palette
```css
--primary: #0D4B2E          /* Dark Green - Primary actions */
--primary-light: #4A7C59    /* Medium Green - Hover states */
--secondary: #A3D977         /* Lime Green - Secondary actions */
--accent: #10B981            /* Emerald - Highlights & success */
```

#### Surface Colors
```css
--background: #F5F5F0        /* Cream - Main background */
--card-bg: #E8F5E9          /* Light Green - Card backgrounds */
--card-bg-alt: #F0F9F0      /* Alternative card background */
--surface-solid: #FFFFFF     /* White - Elevated surfaces */
```

#### Text Hierarchy
```css
--text-primary: #1A1A1A      /* Primary text */
--text-secondary: #4A5568    /* Secondary text */
--text-muted: #718096        /* Muted text */
--text-on-dark: #FFFFFF      /* Text on dark backgrounds */
```

#### Status Colors
```css
--success: #10B981           /* Success states */
--warning: #F59E0B           /* Warning states */
--destructive: #EF4444       /* Error states */
--info: #3B82F6             /* Informational states */
```

### Typography Scale

#### Font Families
- **UI Text**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`
- **Financial Data**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`

#### Font Sizes
```css
text-xs: 0.75rem     /* 12px - Labels, captions */
text-sm: 0.875rem    /* 14px - Secondary text */
text-base: 1rem      /* 16px - Body text */
text-lg: 1.125rem    /* 18px - Headings */
text-xl: 1.25rem     /* 20px - Large headings */
text-2xl: 1.5rem     /* 24px - Section headers */
text-4xl: 2.25rem    /* 36px - Display text */
text-5xl: 3rem       /* 48px - Hero text */
```

#### Font Weights
```css
font-normal: 400     /* Body text */
font-medium: 500     /* Buttons, labels */
font-semibold: 600   /* Headings, emphasis */
```

### Spacing Scale

Based on 4px baseline grid:

```css
px-1: 0.25rem    /* 4px */
px-2: 0.5rem     /* 8px */
px-3: 0.75rem    /* 12px */
px-4: 1rem       /* 16px */
px-6: 1.5rem     /* 24px */
px-8: 2rem       /* 32px */
px-12: 3rem      /* 48px */
```

### Border Radius

```css
--radius-sm: 0.5rem      /* 8px - Small elements */
--radius-md: 0.75rem     /* 12px - Cards, inputs */
--radius-lg: 1.25rem     /* 20px - Large cards */
--radius-xl: 1.5rem      /* 24px - Hero cards */
--radius-full: 9999px    /* Fully rounded - Buttons, avatars */
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15)
```

## 🎯 Component Patterns

### Buttons

#### Primary Button
```tsx
<button className="bg-primary text-text-on-dark rounded-full py-3 px-6 font-medium">
  Send Money
</button>
```

**Usage**: Main actions, form submissions, critical operations

#### Secondary Button
```tsx
<button className="bg-secondary text-text-primary rounded-full py-3 px-6 font-medium">
  Request Money
</button>
```

**Usage**: Alternative actions, non-critical operations

#### Icon Button
```tsx
<button className="w-10 h-10 rounded-full bg-surface-solid flex items-center justify-center">
  <Search className="w-5 h-5" />
</button>
```

**Usage**: Compact actions, navigation elements

### Cards

#### Elevated Card (White)
```tsx
<div className="bg-surface-solid rounded-2xl p-4 shadow-md">
  {/* Content */}
</div>
```

**Usage**: Primary content containers, transaction details

#### Subtle Card (Green Tint)
```tsx
<div className="bg-card-bg rounded-2xl p-6">
  {/* Content */}
</div>
```

**Usage**: Balance display, overview sections

### Input Elements

#### Numeric Display
```tsx
<div className="text-5xl font-semibold text-text-primary mono-numeric">
  $1,234.56
</div>
```

**Usage**: Balance amounts, transaction values

#### Keypad Button
```tsx
<button className="h-16 flex items-center justify-center text-2xl font-medium text-text-primary rounded-xl hover:bg-surface-solid transition-colors">
  1
</button>
```

**Usage**: Numeric input keypad

## 📐 Layout Patterns

### Mobile Screen Layout
```tsx
<div className="min-h-screen bg-background pb-24">
  {/* Header */}
  <header className="px-4 pt-12 pb-6">
    {/* Header content */}
  </header>

  {/* Main Content */}
  <main className="px-4 space-y-6">
    {/* Page content */}
  </main>

  {/* Bottom Navigation (if applicable) */}
  <nav className="fixed bottom-0 left-0 right-0 bg-surface-solid border-t">
    {/* Navigation items */}
  </nav>
</div>
```

### Card Grid
```tsx
<div className="grid grid-cols-2 gap-3">
  <StatCard {...} />
  <StatCard {...} />
</div>
```

### Stack Layout
```tsx
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## 🎭 Animation Principles

### Page Transitions
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

**Duration**: 300ms
**Easing**: Default ease-out

### Interactive Elements
```tsx
<motion.button
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>
```

**Scale**: 0.95 (slight press effect)
**Timing**: Instantaneous

### Success States
```tsx
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
>
  <CheckIcon />
</motion.div>
```

**Type**: Spring animation
**Stiffness**: 200
**Delay**: 200ms

## 🔤 Content Guidelines

### Number Formatting

#### Currency
```tsx
// Always use 2 decimal places
$1,234.56
$0.00
```

#### Account Numbers
```tsx
// Mask with asterisks, show last 4 digits
**** **** **** 3424
```

#### Transaction IDs
```tsx
// Uppercase alphanumeric
002354B3423
```

#### Dates
```tsx
// Format: MM/DD/YYYY
01/15/2025
```

#### Time
```tsx
// 24-hour format
14:30
```

### Text Hierarchy

1. **Page Title**: text-lg, font-semibold
2. **Section Header**: text-base, font-semibold
3. **Label**: text-sm, font-medium, text-secondary
4. **Value**: text-base, font-medium, text-primary
5. **Caption**: text-xs, text-muted

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
```

**Primary Target**: 375px - 428px (modern smartphones)

## ♿ Accessibility

### Touch Targets
- Minimum size: 44x44px
- Spacing: 8px between interactive elements

### Color Contrast
- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: Clear visual feedback

### Focus States
```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-primary">
  Button
</button>
```

## 🎨 Design Tokens Reference

### Utility Classes

```css
/* Financial Data */
.mono-numeric {
  font-family: var(--font-mono);
  font-feature-settings: "tnum";
}

.text-balance {
  font-family: var(--font-mono);
  font-weight: var(--font-weight-semibold);
}

/* Buttons */
.btn-primary {
  background: var(--primary);
  color: var(--text-on-dark);
  border-radius: var(--radius-full);
  padding: 0.75rem 1.5rem;
  font-weight: var(--font-weight-medium);
}

.btn-secondary {
  background: var(--secondary);
  color: var(--text-primary);
  border-radius: var(--radius-full);
  padding: 0.75rem 1.5rem;
  font-weight: var(--font-weight-medium);
}

/* Cards */
.card-elevated {
  background: var(--surface-solid);
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-lg);
}

.card-subtle {
  background: var(--card-bg);
  border-radius: var(--radius-md);
}
```

## 🎯 Best Practices

### Do's ✅
- Use monospace fonts for all financial data
- Maintain consistent spacing (4px grid)
- Provide clear visual feedback for interactions
- Use semantic color coding (green = success, red = error)
- Keep touch targets at least 44x44px
- Animate with purpose, not decoration

### Don'ts ❌
- Mix different font families for financial data
- Use custom shadows (stick to design tokens)
- Create inconsistent button styles
- Ignore loading and error states
- Forget hover/focus states
- Over-animate (keep it subtle)

---

**Design with intention, build with precision.** ✨
