# LiquidAI - Quick Start Guide

Get up and running with LiquidAI in minutes.

## 🚀 Overview

LiquidAI is a mobile-first financial application with a clean, professional design. This guide will help you understand the codebase and start developing quickly.

## 📂 Project Structure (Simplified)

```
liquidai/
├── src/app/
│   ├── components/       # 5 core components
│   ├── pages/           # 4 main pages
│   └── routes.ts        # Navigation config
├── src/styles/
│   └── theme.css        # All design tokens
└── docs/                # README, guides, etc.
```

## 🎯 Key Files to Know

### 1. Theme Configuration
**File**: `/src/styles/theme.css`

All colors, spacing, and design tokens are here:
```css
:root {
  --primary: #0D4B2E;      /* Dark green */
  --secondary: #A3D977;    /* Lime green */
  --background: #F5F5F0;   /* Cream */
}
```

### 2. Routes
**File**: `/src/app/routes.ts`

Simple route configuration:
```tsx
export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/transfer", Component: TransferPage },
  { path: "/receipt", Component: ReceiptPage },
  { path: "/landing", Component: LandingPage },
]);
```

### 3. Main Pages

**Home** (`/src/app/pages/home.tsx`)
- Dashboard with balance and overview
- Bottom navigation
- Action buttons

**Transfer** (`/src/app/pages/transfer.tsx`)
- Numeric keypad input
- Amount validation
- Smooth animations

**Receipt** (`/src/app/pages/receipt.tsx`)
- Transaction confirmation
- Success animation
- Download receipt

**Landing** (`/src/app/pages/landing.tsx`)
- Product introduction
- Feature highlights
- CTA to home

## 🧩 Core Components

### BalanceCard
Display user balance with privacy controls.

```tsx
import { BalanceCard } from "../components/balance-card";

<BalanceCard 
  balance={12435.00}
  accountNumber="**** **** **** 3424"
  expiryDate="25/12/2029"
/>
```

### ActionButton
Reusable button for primary actions.

```tsx
import { ActionButton } from "../components/action-button";
import { Send } from "lucide-react";

<ActionButton
  icon={Send}
  label="Send"
  variant="primary"
  onClick={() => navigate('/transfer')}
/>
```

### NumericKeypad
Custom numeric input for amounts.

```tsx
import { NumericKeypad } from "../components/numeric-keypad";

<NumericKeypad
  onNumberClick={(num) => handleNumber(num)}
  onDecimalClick={() => handleDecimal()}
  onDelete={() => handleDelete()}
/>
```

### StatCard
Display financial statistics.

```tsx
import { StatCard } from "../components/stat-card";
import { TrendingDown } from "lucide-react";

<StatCard
  icon={TrendingDown}
  label="Income"
  value={4092.00}
  iconBgColor="bg-success/10"
  iconColor="text-success"
/>
```

### PageHeader
Consistent header with back button.

```tsx
import { PageHeader } from "../components/page-header";

<PageHeader title="Transfer" />
```

## 🎨 Styling Quick Reference

### Colors
```tsx
// Backgrounds
className="bg-background"      // Cream
className="bg-card-bg"         // Light green
className="bg-surface-solid"   // White

// Buttons
className="bg-primary"         // Dark green
className="bg-secondary"       // Lime green

// Text
className="text-text-primary"  // Dark
className="text-text-muted"    // Gray
```

### Common Patterns
```tsx
// Financial amounts
<div className="text-balance text-4xl mono-numeric">
  $12,435.00
</div>

// Primary button
<button className="btn-primary">
  Send Money
</button>

// Card container
<div className="card-elevated p-6">
  Content
</div>
```

## 🎭 Animation Patterns

### Page Entry
```tsx
import { motion } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  {/* Content */}
</motion.div>
```

### Button Press
```tsx
<motion.button whileTap={{ scale: 0.95 }}>
  Click Me
</motion.button>
```

### Success State
```tsx
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 200 }}
>
  <SuccessIcon />
</motion.div>
```

## 📱 Navigation Flow

```
User Journey:
├─ Landing (/landing) → Home (/)
│
Home (/)
├─ Send Button → Transfer (/transfer)
│                    ↓
│              Amount Entry
│                    ↓
│           Receipt (/receipt)
│                    ↓
│              Back to Home
│
├─ Request Button (future)
├─ Analytics Tab (future)
├─ Scan Tab (future)
└─ Profile Tab (future)
```

## 🔧 Common Tasks

### Adding a New Page

1. **Create page component**
```tsx
// src/app/pages/new-page.tsx
export function NewPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="New Page" />
      {/* Content */}
    </div>
  );
}
```

2. **Add route**
```tsx
// src/app/routes.ts
import { NewPage } from "./pages/new-page";

export const router = createBrowserRouter([
  // ... existing routes
  { path: "/new", Component: NewPage },
]);
```

### Changing Colors

Edit `/src/styles/theme.css`:
```css
:root {
  --primary: #YOUR_COLOR;
}
```

Colors update automatically throughout the app.

### Adding an Icon

```tsx
// 1. Import from lucide-react
import { IconName } from "lucide-react";

// 2. Use in JSX
<IconName className="w-5 h-5 text-primary" />
```

Browse icons at [lucide.dev](https://lucide.dev)

## 💡 Pro Tips

### 1. Use Design Tokens
```tsx
// ❌ Don't hardcode colors
<div style={{ color: '#0D4B2E' }}>

// ✅ Use Tailwind classes
<div className="text-primary">
```

### 2. Keep Components Small
```tsx
// ❌ 500 line component
export function MassiveComponent() { ... }

// ✅ Small, focused components
export function Header() { ... }
export function Content() { ... }
export function Footer() { ... }
```

### 3. Financial Data = Monospace
```tsx
// ✅ Always use mono-numeric class for numbers
<div className="mono-numeric">$1,234.56</div>
```

### 4. Mobile First
```tsx
// ✅ Start with mobile, add desktop
<div className="px-4 md:px-8 lg:px-12">
```

### 5. Animations: Less is More
```tsx
// ❌ Don't over-animate
<motion.div animate={{ rotate: 360, scale: 2, x: 100 }}>

// ✅ Subtle, purposeful
<motion.div whileTap={{ scale: 0.95 }}>
```

## 🐛 Troubleshooting

### "Component not found"
- Check import path (relative paths!)
- Verify file exists
- Check export/import match

### "Styles not applying"
- Verify Tailwind class name is correct
- Check theme.css has the custom property
- Restart dev server (sometimes needed)

### "Animations not working"
- Import from `motion/react` not `framer-motion`
- Check Motion is installed
- Verify component is wrapped in motion element

### "Route not working"
- Check path matches exactly
- Verify component is exported
- Check RouterProvider is in App.tsx

## 📚 Learning Resources

### Essential Docs
- [React Docs](https://react.dev) - Framework fundamentals
- [Tailwind CSS](https://tailwindcss.com) - Styling system
- [Motion](https://motion.dev) - Animations
- [Lucide Icons](https://lucide.dev) - Icon set

### Design Reference
- [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) - Complete design system
- [Figma Mockups](./mockups) - Visual references

### Code Reference
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Detailed guide
- [Component Examples](./src/app/components) - See the code

## 🎯 Next Steps

1. **Explore the code**: Start with `/src/app/pages/home.tsx`
2. **Try making changes**: Modify colors in `theme.css`
3. **Add a feature**: Create a new stat card on home page
4. **Read the docs**: Check out DESIGN_GUIDE.md

## 💬 Need Help?

- 📖 Read [IMPLEMENTATION.md](./IMPLEMENTATION.md) for detailed guide
- 🎨 Check [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) for design system
- 📋 See [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) for architecture
- 🔍 Look at existing components for examples

## ⚡ Speed Run (5 Minutes)

Want to understand the whole app fast?

1. **Look at routes** → `/src/app/routes.ts` (4 pages)
2. **Check home page** → `/src/app/pages/home.tsx` (main UI)
3. **See design tokens** → `/src/styles/theme.css` (all colors)
4. **View components** → `/src/app/components/` (5 files)

That's it! You now understand 90% of the codebase.

---

**Ready to build?** 🚀

Start with small changes, test frequently, and refer to the design guide. Welcome to LiquidAI!

*Happy coding!* 💚
