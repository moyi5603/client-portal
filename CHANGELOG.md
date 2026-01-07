# Changelog

All notable changes to the Client Portal Permission Management System.

---

## [1.0.0] - 2026-01-07

### 🎨 Major UI Framework Migration

#### Ant Design → shadcn/ui Migration
- **Removed** all Ant Design (`antd`) dependencies and components
- **Created** custom shadcn/ui components based on Radix UI primitives:
  - `Button` - Multiple variants (default, destructive, outline, secondary, ghost, link)
  - `Card` - With CardHeader, CardTitle, CardDescription, CardContent, CardFooter
  - `Input` - Form input with consistent styling
  - `Label` - Accessible form labels
  - `Select` - Dropdown select with search support
  - `Dialog` - Modal dialogs with header, footer, and description
  - `Badge` - Status indicators with color variants
  - `Checkbox` - With indeterminate state support
  - `RadioGroup` - Radio button groups
  - `Tabs` - Tab navigation component
  - `Avatar` - User avatars with fallback
  - `Tooltip` - Hover tooltips with positioning
  - `Alert` - Notification alerts
  - `Accordion` - Collapsible content sections
  - `Separator` - Visual dividers
  - `Switch` - Toggle switches
  - `ScrollArea` - Custom scrollbar areas
  - `Popover` - Positioned popovers
  - `Calendar` - Date picker calendar
  - `DatePicker` - Date selection with range support
  - `Table` - Data tables with sorting
  - `Pagination` - Page navigation
  - `Skeleton` - Loading placeholders
  - `Empty` - Empty state illustrations
  - `Textarea` - Multi-line text input
  - `Tree` - Hierarchical tree view
  - `Toaster` - Toast notification system

### 🛠️ Tailwind CSS Integration

- **Installed** Tailwind CSS v3 with PostCSS and Autoprefixer
- **Configured** `tailwind.config.js` with:
  - Dark mode support (`class` strategy)
  - CSS variable color mappings
  - Custom spacing and border radius tokens
  - Font family configuration (Satoshi)
- **Added** Tailwind directives to `index.css`:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
- **Created** `postcss.config.js` for build pipeline

### 🎯 Design System Implementation

#### CSS Variables & Design Tokens
- **Established** comprehensive CSS variable system in `index.css`:
  - Primary colors: `--primary`, `--primary-hover`, `--primary-light`
  - Semantic colors: `--success`, `--warning`, `--danger`, `--info`
  - Text colors: `--text-primary`, `--text-secondary`, `--text-tertiary`
  - Background colors: `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
  - Border colors and styles
  - Spacing scale (4px - 64px)
  - Typography scale (12px - 36px)
  - Border radius tokens
  - Shadow definitions
  - Transition timings

#### Dark Mode Support
- **Created** `ThemeContext.tsx` for theme state management
- **Implemented** system preference detection
- **Added** localStorage persistence for theme preference
- **Applied** dark mode CSS variables automatically via `.dark` class

### 📱 Page Refactoring

#### Login Page (`Login.tsx`)
- Converted to inline styles for reliable rendering
- Fixed card centering (max-width 420px, centered)
- Added proper icon positioning inside input fields
- Implemented gradient background (purple theme)
- Added theme toggle button in top-right corner
- Demo credentials displayed at bottom

#### Account Management (`AccountManagement.tsx`)
- Migrated from Ant Design Table to shadcn/ui Table
- Updated search filters with new Input and Select components
- Replaced message notifications with toast system
- Added proper loading states with Skeleton

#### Role Management (`RoleManagement.tsx`)
- Complete redesign of Create/Edit Role view
- **Two-column layout**:
  - Left: Role Details (Name, ID, Description, Status)
  - Right: Permission Configuration
- Integrated new PermissionsTree component
- Added role templates dropdown
- Added Select All / Clear All functionality

#### Permission View (`PermissionView.tsx`)
- Updated to use shadcn/ui components
- Replaced Ant Design Select, Table, and Tags
- Improved visual hierarchy with new Card components

#### Audit Log (`AuditLog.tsx`)
- Migrated to shadcn/ui DatePicker for date filtering
- Updated Table and Badge components
- Replaced message API with toast notifications

#### Menu Management (`MenuManagement.tsx`)
- Updated Tree component usage
- Migrated to new Alert and Badge components
- Improved tab navigation with shadcn/ui Tabs

### 🔐 Permission Configuration Redesign

#### New PermissionsTree Component (`PermissionsTree.tsx`)
**Problem:** Original design required 3+ clicks (expand module → expand feature → select operation)

**Solution:** Inline icon toggle design

| Before | After |
|--------|-------|
| Nested 3-level tree | Flat 2-level structure |
| Hidden operations | All operations visible |
| 3+ clicks to select | 1 click to toggle |
| Confusing navigation | Clear visual hierarchy |

**Features:**
- **Horizontal icon layout** - All operation icons in a single row
- **Instant toggle** - Click any icon to select/deselect
- **Visual feedback**:
  - Selected icons turn purple with filled background
  - Module headers highlight when containing selections
  - Real-time counter updates (e.g., "3/7")
- **Tooltips** - Hover to see operation name
- **Module-level actions** - Select all / clear all per module
- **Checkbox cascade** - Feature checkbox selects all operations

**Operation Icons:**
- 👁 View (`Eye`)
- ➕ Create (`Plus`)
- ✏️ Edit (`Pencil`)
- 🗑️ Delete (`Trash2`)
- ⬇️ Export (`Download`)
- ⬆️ Import (`Upload`)
- 🚫 Cancel (`Ban`)
- 💳 Pay (`CreditCard`)
- 🖨️ Print (`Printer`)
- 🔒 Hold Inventory (`Lock`)
- 🔓 Release Inventory (`Unlock`)

### 🧩 Shared Component Updates

#### MainLayout (`MainLayout.tsx`)
- Replaced Ant Design Layout with flex-based CSS
- Updated sidebar navigation styling
- Integrated theme toggle in header
- Added language selector dropdown
- User menu with avatar

#### Breadcrumb (`Breadcrumb.tsx`)
- Converted from Ant Design Breadcrumb to custom implementation
- Added home icon with link
- Improved separator styling

#### EmptyState (`EmptyState.tsx`)
- Replaced Ant Design icons with Lucide React
- Multiple empty state variants (no data, no search results, no users, etc.)

#### TableSkeleton (`TableSkeleton.tsx`)
- Updated to use shadcn/ui Skeleton component
- Configurable rows and columns

#### PageHeader (`PageHeader.tsx`)
- Replaced Ant Design Space with flex layout
- Updated back button with Lucide icon

#### PasswordStrengthIndicator (`PasswordStrengthIndicator.tsx`)
- Created custom progress component
- Visual strength meter with color coding

### 🔔 Notification System

- **Created** `useToast` hook for toast management
- **Created** `Toaster` component for rendering toasts
- **Replaced** all `message.success()` and `message.error()` calls
- Toast features:
  - Multiple variants (default, success, destructive)
  - Auto-dismiss with configurable duration
  - Manual dismiss button
  - Stacked positioning

### 🔧 Context Updates

#### AuthContext (`AuthContext.tsx`)
- Replaced Ant Design message with useToast
- Updated login/logout notifications

#### LocaleContext (`LocaleContext.tsx`)
- Maintained i18n translation support
- No breaking changes

#### ThemeContext (`ThemeContext.tsx`)
- New context for theme management
- Supports light/dark mode toggle
- System preference detection
- localStorage persistence

### 📦 Dependencies

#### Added
```json
{
  "tailwindcss": "^3.x",
  "postcss": "^8.x",
  "autoprefixer": "^10.x",
  "@radix-ui/react-accordion": "^1.x",
  "@radix-ui/react-alert-dialog": "^1.x",
  "@radix-ui/react-avatar": "^1.x",
  "@radix-ui/react-checkbox": "^1.x",
  "@radix-ui/react-dialog": "^1.x",
  "@radix-ui/react-dropdown-menu": "^1.x",
  "@radix-ui/react-label": "^1.x",
  "@radix-ui/react-popover": "^1.x",
  "@radix-ui/react-radio-group": "^1.x",
  "@radix-ui/react-scroll-area": "^1.x",
  "@radix-ui/react-select": "^1.x",
  "@radix-ui/react-separator": "^1.x",
  "@radix-ui/react-slot": "^1.x",
  "@radix-ui/react-switch": "^1.x",
  "@radix-ui/react-tabs": "^1.x",
  "@radix-ui/react-tooltip": "^1.x",
  "lucide-react": "^0.x",
  "class-variance-authority": "^0.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x",
  "date-fns": "^3.x",
  "react-day-picker": "^8.x"
}
```

#### Removed
```json
{
  "antd": "removed",
  "@ant-design/icons": "removed"
}
```

### 📁 New Files Created

```
client/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── accordion.tsx & .css
│   │   │   ├── alert.tsx & .css
│   │   │   ├── avatar.tsx & .css
│   │   │   ├── badge.tsx & .css
│   │   │   ├── button.tsx & .css
│   │   │   ├── calendar.tsx & .css
│   │   │   ├── card.tsx & .css
│   │   │   ├── checkbox.tsx & .css
│   │   │   ├── date-picker.tsx & .css
│   │   │   ├── dialog.tsx & .css
│   │   │   ├── dropdown-menu.tsx & .css
│   │   │   ├── empty.tsx & .css
│   │   │   ├── input.tsx & .css
│   │   │   ├── label.tsx & .css
│   │   │   ├── pagination.tsx & .css
│   │   │   ├── popover.tsx & .css
│   │   │   ├── radio-group.tsx & .css
│   │   │   ├── scroll-area.tsx & .css
│   │   │   ├── select.tsx & .css
│   │   │   ├── separator.tsx & .css
│   │   │   ├── skeleton.tsx & .css
│   │   │   ├── switch.tsx & .css
│   │   │   ├── table.tsx & .css
│   │   │   ├── tabs.tsx & .css
│   │   │   ├── textarea.tsx & .css
│   │   │   ├── toaster.tsx & .css
│   │   │   ├── tooltip.tsx & .css
│   │   │   ├── tree.tsx & .css
│   │   │   ├── use-toast.ts
│   │   │   └── index.ts
│   │   └── PermissionsTree.tsx
│   └── contexts/
│       └── ThemeContext.tsx
├── tailwind.config.js
└── postcss.config.js
```

### 🐛 Bug Fixes

- Fixed login card stretching to full width
- Fixed input icons positioning outside input fields
- Fixed sidebar displaying horizontally instead of vertically
- Fixed header controls stacking vertically
- Fixed Tailwind CSS classes not being processed
- Fixed theme toggle not persisting across sessions

### ⚡ Performance Improvements

- Reduced bundle size by removing Ant Design (~1MB reduction)
- Lighter Radix UI primitives with better tree-shaking
- CSS-based styling reduces runtime overhead

---

## Migration Notes

### For Developers

1. **Import Changes**: Update imports from `antd` to `../components/ui`
2. **Message API**: Replace `message.success()` with `toast()` from `useToast`
3. **Form Components**: Use new Form, Input, Select, Checkbox components
4. **Icons**: Use Lucide React instead of @ant-design/icons
5. **Layout**: Use Tailwind utilities or flex-based layouts instead of Ant Design Grid

### Component Mapping

| Ant Design | shadcn/ui Equivalent |
|------------|---------------------|
| `Button` | `Button` |
| `Input` | `Input` |
| `Select` | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` |
| `Modal` | `Dialog`, `DialogTrigger`, `DialogContent` |
| `Table` | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` |
| `Form` | Native form with `Label` and validation |
| `message` | `useToast` hook |
| `Tag` | `Badge` |
| `Checkbox` | `Checkbox` |
| `Radio.Group` | `RadioGroup`, `RadioGroupItem` |
| `Tabs` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| `Collapse` | `Accordion` |
| `Tooltip` | `Tooltip`, `TooltipTrigger`, `TooltipContent` |
| `Avatar` | `Avatar`, `AvatarImage`, `AvatarFallback` |
| `DatePicker` | `DatePicker` |
| `Skeleton` | `Skeleton` |
| `Empty` | `Empty` |
| `Divider` | `Separator` |
| `Switch` | `Switch` |

---

*This changelog follows [Keep a Changelog](https://keepachangelog.com/) format.*

