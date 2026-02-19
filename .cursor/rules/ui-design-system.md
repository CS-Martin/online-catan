---
description: UI design system rules for DeFi-style, interactive, neon-green theme with motion-framer and GSAP animations
globs: src/**/*.tsx,src/**/*.ts,src/**/*.jsx,src/**/*.js
trigger: always_on
---

# UI Design System Rules

## Design Philosophy

**DeFi-Style Interactive Gaming Platform**
- Clean, minimalist interface with neon accents
- High-contrast, modern aesthetic
- Smooth, purposeful animations
- Interactive elements that respond to user actions
- Professional gaming experience with DeFi visual language

## Color Palette

### Primary Colors (Neon Green Theme)
```css
/* Neon Green Primary */
--primary: #10b981;
--primary-foreground: #ecfdf5;
--primary-50: #f0fdf4;
--primary-100: #dcfce7;
--primary-200: #bbf7d0;
--primary-300: #86efac;
--primary-400: #4ade80;
--primary-500: #22c55e;
--primary-600: #16a34a;
--primary-700: #15803d;
--primary-800: #166534;
--primary-900: #14532d;

/* Neon Accents */
--neon-green: #00ff88;
--neon-cyan: #00ffff;
--neon-blue: #0080ff;
--neon-purple: #8000ff;
--neon-pink: #ff00ff;

/* Dark Background */
--background: #0a0a0a;
--surface: #111111;
--surface-variant: #1a1a1a;
--card: #0f0f0f;
--border: #1f1f1f;
--input: #1a1a1a;

/* Text Colors */
--foreground: #ffffff;
--muted: #a1a1a1;
--muted-foreground: #737373;
--accent: #00ff88;
--accent-foreground: #0a0a0a;

/* Status Colors */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

## Typography

### Font Stack
```css
/* Primary: Modern Sans-serif */
--font-primary: 'Inter', 'SF Pro Display', -apple-system, sans-serif;

/* Monospace for data */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Display font for headings */
--font-display: 'Space Grotesk', 'Inter', sans-serif;
```

### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

## Spacing System

### Scale (8px base unit)
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

## Border Radius

### Consistent rounding
```css
--radius-sm: 0.125rem;  /* 2px */
--radius: 0.25rem;     /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;    /* 16px */
--radius-3xl: 1.5rem;  /* 24px */
--radius-full: 9999px;
```

## Shadows

### Neon Glow Effects
```css
/* Neon shadow for interactive elements */
--shadow-neon: 0 0 20px rgba(0, 255, 136, 0.5);
--shadow-neon-green: 0 0 30px rgba(0, 255, 136, 0.7);
--shadow-neon-cyan: 0 0 30px rgba(0, 255, 255, 0.7);

/* Subtle shadows for depth */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## Animation Guidelines

### Motion-Framer Presets
```typescript
// framer-motion.ts
export const animations = {
  // Smooth transitions
  smooth: { type: "spring", stiffness: 300, damping: 30 },
  
  // Quick interactions
  quick: { type: "spring", stiffness: 400, damping: 25 },
  
  // Bouncy effects
  bounce: { type: "spring", stiffness: 200, damping: 20 },
  
  // Slow, dramatic animations
  slow: { type: "spring", stiffness: 100, damping: 40 },
  
  // Instant transitions
  instant: { type: "tween", duration: 0.15 },
  
  // Hover effects
  hover: { type: "spring", stiffness: 400, damping: 25 },
  
  // Neon glow animations
  neon: { 
    type: "spring", 
    stiffness: 200, 
    damping: 20,
    repeat: Infinity,
    repeatType: "reverse"
  }
};
```

### GSAP Animation Patterns
```typescript
// gsap-animations.ts
export const gsapAnimations = {
  // Neon glow pulse
  neonGlow: (element: HTMLElement) => {
    gsap.to(element, {
      boxShadow: "0 0 30px rgba(0, 255, 136, 0.8)",
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    });
  },
  
  // Smooth slide in
  slideIn: (element: HTMLElement, direction = "left") => {
    const from = { x: direction === "left" ? -100 : 100, opacity: 0 };
    const to = { x: 0, opacity: 1 };
    
    return gsap.fromTo(element, from, to, {
      duration: 0.6,
      ease: "power3.out"
    });
  },
  
  // Scale and fade
  scaleIn: (element: HTMLElement) => {
    gsap.fromTo(element, 
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, 
        duration: 0.4, 
        ease: "back.out(1.7)" 
      }
    );
  },
  
  // Stagger animations for lists
  staggerIn: (elements: HTMLElement[]) => {
    gsap.fromTo(elements,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, 
        duration: 0.5, 
        stagger: 0.1,
        ease: "power2.out"
      }
    );
  }
};
```

## Component Patterns

### Button Styles
```css
/* Primary button with neon effect */
.btn-primary {
  background: linear-gradient(135deg, #10b981, #22c55e);
  border: 1px solid #00ff88;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.6);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
}
```

### Card Styles
```css
/* Dark card with subtle border */
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.card:hover {
  border-color: var(--neon-green);
  box-shadow: 0 0 25px rgba(0, 255, 136, 0.2);
  transform: translateY(-4px);
}
```

### Input Styles
```css
/* Modern input with neon focus */
.input {
  background: var(--input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  color: var(--foreground);
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: var(--neon-green);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}
```

## Layout Patterns

### Container Max Widths
```css
.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }
.container-2xl { max-width: 1536px; }
```

### Grid System
```css
.grid {
  display: grid;
  gap: var(--space-4);
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
```

## Interactive States

### Hover Effects
```css
.interactive {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-neon);
}

.interactive:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}
```

### Focus States
```css
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.5);
}
```

### Loading States
```css
.loading {
  position: relative;
  overflow: hidden;
}

.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% { left: 100%; }
}
```

## shadcn/ui Customizations

### Extended Button Component
```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-green-600 to-green-500 text-white border border-green-400 hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-500/25 hover:shadow-green-500/40",
        neon: "bg-black text-green-400 border border-green-400/50 hover:bg-green-950 hover:text-green-300 hover:border-green-300 hover:shadow-lg hover:shadow-green-400/50",
        outline: "border border-green-400/50 text-green-400 hover:bg-green-950 hover:text-green-300",
        ghost: "text-green-400 hover:bg-green-950 hover:text-green-300",
        link: "text-green-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Extended Card Component
```typescript
// components/ui/card.tsx
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-lg transition-all duration-300 hover:shadow-xl hover:border-green-400/50",
      className
    )}
    {...props}
  />
));
```

## Motion-Framer Integration

### Animated Container
```typescript
// components/motion/AnimatedContainer.tsx
import { motion } from 'framer-motion';

export const AnimatedContainer = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
```

### Hover Card Component
```typescript
// components/motion/HoverCard.tsx
export const HoverCard = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    whileHover={{ 
      scale: 1.02, 
      boxShadow: "0 0 30px rgba(0, 255, 136, 0.3)" 
    }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
  >
    {children}
  </motion.div>
);
```

## GSAP Integration

### Neon Text Animation
```typescript
// components/gsap/NeonText.tsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const NeonText = ({ text, className }: { text: string; className?: string }) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      gsap.to(textRef.current, {
        textShadow: "0 0 20px rgba(0, 255, 136, 0.8)",
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    }
  }, []);

  return (
    <div ref={textRef} className={className}>
      {text}
    </div>
  );
};
```

## Responsive Design

### Breakpoints
```css
/* Mobile-first approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Mobile Considerations
- Touch targets minimum 44px
- Simplified animations on mobile
- Reduced motion for accessibility
- Optimized font sizes for readability

## Accessibility

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus Management
- All interactive elements have focus states
- Keyboard navigation support
- Screen reader friendly semantic HTML
- ARIA labels where needed

## Performance Guidelines

### Animation Performance
- Use `transform` and `opacity` for smooth animations
- Avoid animating `width` and `height`
- Use `will-change` sparingly
- Prefer CSS transforms over JavaScript animations

### Image Optimization
- Use Next.js Image component
- Implement lazy loading
- Use appropriate image formats
- Optimize for different screen sizes

## Usage Examples

### Game Board Component
```typescript
// components/game/GameBoard.tsx
import { motion } from 'framer-motion';
import { HoverCard } from '@/components/motion/HoverCard';

export const GameBoard = () => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="bg-surface border border-green-400/20 rounded-2xl p-8"
  >
    <HoverCard>
      <div className="text-green-400 font-mono">
        Game Board Content
      </div>
    </HoverCard>
  </motion.div>
);
```

### Stats Card
```typescript
// components/ui/StatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const StatsCard = ({ title, value }: { title: string; value: string }) => (
  <Card className="bg-card border border-green-400/20 hover:border-green-400/50 transition-all duration-300">
    <CardHeader>
      <CardTitle className="text-green-400">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-green-300">{value}</div>
    </CardContent>
  </Card>
);
```

## Implementation Checklist

- [ ] Configure Tailwind CSS with custom colors
- [ ] Setup shadcn/ui components
- [ ] Install and configure Framer Motion
- [ ] Install and configure GSAP
- [ ] Create base layout components
- [ ] Implement motion variants
- [ ] Add responsive design patterns
- [ ] Test accessibility features
- [ ] Optimize for performance

This design system creates a modern, DeFi-style interface with neon green accents, smooth animations, and excellent user experience.
