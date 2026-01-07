 AI-Friendly UI Design Guide

  Based on Item Design System (design.item.com)

  ---
  1. Design System Overview

  Purpose

  A design system ensures brand consistency, professional presentation, and recognition across all
  touchpoints—digital, print, and co-branded materials.

  Core Principle

  Every interaction should accurately reflect brand values and distinctive personality.

  ---
  2. Logo Guidelines

  Logo Variants

  | Variant       | Use Case                               |
  |---------------|----------------------------------------|
  | Full Logo     | Primary usage with text                |
  | Logo Mark     | Standalone icon for brand recognition  |
  | Vertical Logo | Stacked layout for vertical spaces     |
  | Favicon       | Browser tabs, bookmarks (16x16, 32x32) |

  Clear Space

  - Minimum padding = height of logo mark on all sides
  - Ensures uncluttered visibility and legibility

  Do's ✅

  - Use original forms with clear visibility
  - Maintain correct proportions and colors
  - Select appropriate version for background
  - Preserve proper spacing

  Don'ts ❌

  - Alter colors or add gradients
  - Distort, rotate, or stretch
  - Add effects, strokes, or shadows
  - Place on cluttered backgrounds
  - Resize elements disproportionately

  ---
  3. Color System

  Primary Colors

  | Color  | Hex     | RGB           | Meaning        |
  |--------|---------|---------------|----------------|
  | White  | #FFFFFF | 255, 255, 255 | Clarity        |
  | Black  | #000000 | 0, 0, 0       | Elegance       |
  | Purple | #6B46C1 | 107, 70, 193  | Innovation     |
  | Orange | #F97316 | 249, 115, 22  | Dynamic energy |

  UI Theme Colors (Element Plus)

  | State   | Light Mode | Dark Mode |
  |---------|------------|-----------|
  | Primary | #753BBD    | #763ABF   |
  | Hover   | #9561D0    | #6C38AD   |
  | Active  | #A788E1    | #693f9d   |
  | Pressed | #5B2D94    | #5c2a9a   |

  Semantic Colors

  | Type    | Color   | Light Variant | Usage                            |
  |---------|---------|---------------|----------------------------------|
  | Success | #15803D | #DCFCE7       | Confirmations, completed actions |
  | Warning | #e79f04 | #FEF3C7       | Cautions, attention needed       |
  | Danger  | #F0283C | #FECACA       | Errors, destructive actions      |
  | Info    | #666666 | #DEDFE0       | Neutral information              |

  Text Colors

  | Level       | Light Mode | Dark Mode | Usage                    |
  |-------------|------------|-----------|--------------------------|
  | Primary     | #181818    | #ffffff   | Headings, important text |
  | Regular     | #3c3c3c    | #ffffff   | Body text                |
  | Secondary   | #666666    | #999999   | Captions, labels         |
  | Placeholder | #666666    | #737373   | Input placeholders       |
  | Disabled    | #6666665d  | #7373736d | Inactive elements        |

  CSS Variables Pattern

  /* Use semantic variables for consistency */
  color: hsl(var(--primary));
  background: hsl(var(--bg-color));
  border: 1px solid hsl(var(--border-color));

  ---
  4. Typography

  Primary Typeface

  Satoshi — A geometric sans-serif providing balance between professionalism and approachability.

  Font Weights

  - Light
  - Regular
  - Medium
  - Bold
  - Black

  Type Scale

  | Element    | Size Name   | Pixels | Use Case               |
  |------------|-------------|--------|------------------------|
  | H1         | 9x Large    | 128px  | Hero headlines         |
  | H2         | 8x Large    | 96px   | Page titles            |
  | H3         | 7x Large    | 64px   | Section headers        |
  | H4         | 6x Large    | 48px   | Subsection headers     |
  | H5         | 5x Large    | 36px   | Card titles            |
  | H6         | 4x Large    | 28px   | Small headings         |
  | Subtitle 1 | 3x Large    | 24px   | Lead paragraphs        |
  | Subtitle 2 | 2x Large    | 20px   | Secondary leads        |
  | Body 1     | Extra Large | 20px   | Large body text        |
  | Body 2     | Large       | 18px   | Standard body          |
  | Base       | Base        | 16px   | Default text           |
  | Button 1   | Small       | 14px   | Buttons, labels        |
  | Button 2   | Extra Small | 12px   | Small labels, captions |

  Key Principles

  - Clear visual hierarchy
  - Optimal readability across screen sizes
  - Responsive scaling

  ---
  5. Spacing & Layout

  Business Card Reference (Translates to UI)

  - Margins: Minimum 0.25" (translates to 16-24px in UI)
  - Hierarchy: Logo top-left, content left-aligned
  - Spacing: Adequate gaps between text blocks

  Recommended UI Spacing Scale

  | Token | Value | Usage            |
  |-------|-------|------------------|
  | xs    | 4px   | Tight gaps       |
  | sm    | 8px   | Related elements |
  | md    | 16px  | Standard spacing |
  | lg    | 24px  | Section gaps     |
  | xl    | 32px  | Major sections   |
  | 2xl   | 48px  | Page sections    |
  | 3xl   | 64px  | Hero areas       |

  ---
  6. Photography & Imagery

  Style Principles

  - Authentic over staged
  - Clean, professional aesthetic
  - Natural lighting preferred
  - Balanced color palette aligned with brand

  Technical Specs

  | Context        | Resolution | Dimensions       |
  |----------------|------------|------------------|
  | Print          | 300 DPI    | As needed        |
  | Digital/Web    | 72 DPI     | As needed        |
  | Hero Images    | —          | Min 2000px width |
  | Content Images | —          | Min 1200px width |

  Color Profiles

  - Web: sRGB
  - Print: Adobe RGB or CMYK

  Do's ✅

  - Capture authentic moments
  - Ensure sharp focus
  - Maintain consistent lighting
  - Show diversity and organized spaces

  Don'ts ❌

  - Cluttered backgrounds
  - Heavy filters or excessive editing
  - Compromised resolution
  - Generic stock photos when authentic options exist

  ---
  7. Component Patterns

  Shadcn/UI Integration

  The system uses shadcn/ui for:
  - Consistency
  - Accessibility
  - Scalability

  Dark Mode Support

  All components include .dark selector rules for theme-consistent rendering.

  Recommended Component Libraries

  - shadcn/ui — React/Next.js
  - Element Plus — Vue.js

  ---
  8. AI Implementation Notes

  For AI Code Generation

  When generating UI code, always:

  1. Use CSS variables for colors (not hardcoded hex)
  /* Good */
  background: hsl(var(--primary));

  /* Avoid */
  background: #753BBD;
  2. Follow the type scale — Don't invent sizes
  /* Good */
  font-size: var(--text-base); /* 16px */

  /* Avoid */
  font-size: 15px;
  3. Respect spacing tokens — Use consistent increments (4, 8, 16, 24, 32, 48, 64)
  4. Include dark mode — Always define both light and dark variants
  5. Semantic color usage:
    - Green = Success
    - Yellow/Amber = Warning
    - Red = Danger/Error
    - Gray = Info/Neutral
  6. Accessibility first:
    - Sufficient color contrast
    - Proper heading hierarchy
    - Focus states for interactive elements

  Quick Reference for AI

  Primary: #753BBD (purple)
  Accent: #F97316 (orange)
  Success: #15803D
  Warning: #e79f04
  Danger: #F0283C
  Text Primary: #181818 (light) / #ffffff (dark)
  Text Secondary: #666666 (light) / #999999 (dark)
  Font: Satoshi
  Base Size: 16px
  Spacing Unit: 8px

  ---
  9. Quick Checklist

  Before shipping any UI:

  - Logo has proper clear space
  - Colors use CSS variables
  - Typography follows scale
  - Spacing uses consistent tokens
  - Dark mode supported
  - Semantic colors applied correctly
  - Images meet resolution requirements
  - Accessibility checked

  ---
  Guide compiled from Item Design System (design.item.com) — December 2025