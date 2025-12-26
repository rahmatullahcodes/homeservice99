# Mobile Navbar - Visual Reference Guide

## 📱 Mobile Menu Sections Overview

### SECTION 1: HEADER (Fixed)
```
┌──────────────────────────────────┐
│ [HS] HomeService99              │ X │
│      Your Service Partner       │   │
└──────────────────────────────────┘
```
**Features**: Brand logo, company name, tagline, close button
**Colors**: Light gradient background (#f8fafc)
**Interaction**: Close button removes menu overlay

---

### SECTION 2: LOCATION SELECTOR
```
┌──────────────────────────────────┐
│ 📍 Your Location                 │
│ ┌──────────────────────────────┐ │
│ │ Sector 82, Noida        ▼   │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```
**Features**: Location dropdown with 4 options
**Styling**: Light gray background, dark border on focus
**Interaction**: Select location for service filtering

---

### SECTION 3: SEARCH FORM
```
┌──────────────────────────────────┐
│ 🔍 Search Services               │
│ ┌────────────────────┐ ┌──────┐ │
│ │ Search...         │ │ Go  │ │
│ └────────────────────┘ └──────┘ │
└──────────────────────────────────┘
```
**Features**: Text input + Submit button
**Styling**: White background with blue border on focus
**Interaction**: Navigate to filtered services

---

### SECTION 4: SERVICE CATEGORIES (Popular Services)
```
┌──────────────────────────────────┐
│ ⭐ Popular Services               │
│                                  │
│ ┌──────────┐ ┌──────────┐       │
│ │  🔧     │ │   ⚡    │       │
│ │Plumbing │ │Electrical│       │
│ └──────────┘ └──────────┘       │
│                                  │
│ ┌──────────┐ ┌──────────┐       │
│ │  🧹     │ │   🪛    │       │
│ │Cleaning │ │Carpentry │       │
│ └──────────┘ └──────────┘       │
│                                  │
│ ┌──────────┐ ┌──────────┐       │
│ │  🎨     │ │   ❄️    │       │
│ │Painting │ │AC Repair │       │
│ └──────────┘ └──────────┘       │
│                                  │
│ ┌──────────┐ ┌──────────┐       │
│ │  💄     │ │   ✂️    │       │
│ │ Beauty  │ │  Salon   │       │
│ └──────────┘ └──────────┘       │
└──────────────────────────────────┘
```
**Features**: 8 categories in 2-column grid
**Styling**: White cards with borders, emoji icons
**Interaction**: Click to search for service type

---

### SECTION 5: NAVIGATION LINKS
```
┌──────────────────────────────────┐
│ 📚 EXPLORE                        │
│                                  │
│ › All Services                   │
│ › Pricing Plans                  │
│ › Blog & Tips                    │
│ › Compare Services               │
│ › About Us                       │
└──────────────────────────────────┘
```
**Features**: Link list with icons
**Styling**: Text with icon prefix, hover background
**Interaction**: Navigate to respective pages

---

### SECTION 6: SHOPPING & SUPPORT
```
┌──────────────────────────────────┐
│ 🛒 SHOPPING & SUPPORT            │
│                                  │
│ › My Cart (5)              [red] │
│ › Contact Us                     │
└──────────────────────────────────┘
```
**Features**: Shopping links with cart count badge
**Styling**: Badge shows item count in red
**Interaction**: Access cart or contact page

---

### SECTION 7: ACCOUNT (Not Logged In)
```
┌──────────────────────────────────┐
│ 👤 ACCOUNT                        │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ › Login                      │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ › Sign Up                    │ │ (Blue gradient)
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```
**For**: New/unauthenticated users
**Styling**: Login link normal, Sign Up with blue gradient
**Interaction**: Navigate to login or signup page

---

### SECTION 7B: ACCOUNT (Logged In)
```
┌──────────────────────────────────┐
│ 👤 ACCOUNT                        │
│                                  │
│ › My Account                     │
│ › My Bookings                    │
│ › Vendor Panel            (opt.) │
│ › Logout                        │
└──────────────────────────────────┘
```
**For**: Authenticated users
**Styling**: All gray text, normal links
**Vendor Panel**: Only shows if user is vendor
**Interaction**: Access account features or logout

---

### SECTION 8: SPECIAL CTA (Optional)
```
┌──────────────────────────────────┐
│ ⭐ [Become a Vendor]              │
│    (Yellow/Gold gradient)         │
└──────────────────────────────────┘
```
**Shows For**: Logged-in users who are NOT vendors
**Styling**: Yellow gradient (#fbbf24 to #f59e0b)
**Icon**: Star emoji
**Interaction**: Navigate to vendor signup

---

## 🎨 Color Usage Reference

### Primary Colors
```
Blue (#2563eb):           Links, buttons, focus states
Dark Blue (#1e40af):      Hover states, emphasis
Teal (#0ea5a4):           Logo gradient, accents
Yellow (#fbbf24):         Special CTA, highlight
```

### Neutral Colors
```
Dark Text (#1e293b):      Main text content
Secondary (#475569):      Secondary text, labels
Light (#f8fafc):          Backgrounds, sections
Border (#d1d5db):         Dividers, input borders
```

### Badge Color
```
Red (#ef4444):            Cart count badge
```

---

## 🎭 Interactive States

### Buttons in Different States

#### Default State
```
┌──────────────┐
│ › My Account │  (Gray text, transparent bg)
└──────────────┘
```

#### Active/Pressed State
```
┌──────────────┐
│ › My Account │  (Blue text, light bg, scale 98%)
└──────────────┘
```

#### Primary Button Default
```
┌─────────────────────┐
│ › Sign Up           │  (White text, blue gradient)
└─────────────────────┘
```

#### Primary Button Active
```
┌─────────────────────┐
│ › Sign Up           │  (Darker gradient, scale 98%)
└─────────────────────┘
```

---

## 📐 Spacing Reference

### Header Padding
- Top/Bottom: 16px
- Left/Right: 20px

### Section Padding
- Top/Bottom: 14px
- Left/Right: 16px

### Menu Links
- Padding: 12px 16px
- Margin: 4px 8px (sides only)
- Gap: 12px (icon to text)

### Grid Items
- Padding: 12px 8px
- Gap: 8px (horizontal and vertical)

### Special Buttons
- Margin: 12px (all sides for special CTA)
- Padding: 12px 16px

---

## 🎨 Typography Scale

### Section Headers (Labels)
```
Font Size:  11px
Weight:     700 (Bold)
Color:      #6b7280 (Gray)
Transform:  UPPERCASE
Letter Spacing: 0.5px
Example: "📍 Your Location"
```

### Menu Links
```
Font Size:  14px
Weight:     500 (Medium)
Color:      #475569 (Gray)
Line Height: 1.5
```

### Brand Name
```
Font Size:  15px
Weight:     700 (Bold)
Color:      #1e293b (Dark)
```

### Brand Tagline
```
Font Size:  12px
Weight:     400 (Regular)
Color:      #64748b (Light Gray)
```

### Category Names
```
Font Size:  11px
Weight:     600 (Semibold)
Color:      #475569 (Gray)
Text Align: Center
```

---

## 🔄 Animation Timings

### Menu Open/Close
```
Duration: 0.3s
Easing: ease
Transform: translateX(100%) → translateX(0)
```

### Button Press
```
Duration: 0.2s
Easing: ease
Transform: scale(1) → scale(0.98)
```

### Hover Effects
```
Duration: 0.3s
Easing: ease
Background: transparent → light-bg
Color: gray → blue
```

### Input Focus
```
Duration: 0.2s
Easing: ease
Border-color: gray → blue
Box-shadow: fade in
Background: light → white
```

---

## 📊 Responsive Sizing

### Mobile (320px - 480px)
- Menu width: 100% (full width)
- Category grid: 2 columns
- Font sizes: 11-15px
- Touch targets: min 44x44px

### Small Devices (480px - 640px)
- Menu width: 95% max
- Category grid: 2-3 columns
- Font sizes: 12-16px
- Button padding: increased

### Tablets (641px - 768px)
- Menu may appear as sidebar
- Category grid: 3-4 columns
- Font sizes: 13-17px
- Wider spacing

### Desktop (768px+)
- Mobile menu hidden
- Desktop navbar shown
- Full horizontal layout

---

## ✨ Visual Polish Details

### Box Shadows
- Light: `0 2px 8px rgba(0,0,0,0.06)`
- Medium: `0 4px 12px rgba(37,99,235,0.2)`
- Dark: `0 8px 30px rgba(2,6,23,0.12)`

### Border Radius
- Small: 8px (buttons, inputs)
- Medium: 10px (category chips)
- Large: 12px (search bar)
- Full: 999px (circular buttons)

### Gradients
- Logo: `linear-gradient(135deg, #2563eb 0%, #0ea5a4 100%)`
- Special CTA: `linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)`
- Header BG: `linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)`

---

## 🌓 Dark Mode Adjustments

All colors are automatically adjusted:
- Dark backgrounds become darker
- Light text becomes lighter
- Blue remains primary
- Contrast is maintained
- All interactions work the same

---

## ✅ Accessibility Features

### Keyboard Navigation
- Tab through all focusable elements
- Enter to activate buttons/links
- Focus indicators visible

### ARIA Labels
- `aria-modal="true"` - Menu is modal
- `aria-expanded={state}` - Hamburger button
- `aria-label="..."` - Button descriptions

### Color Contrast
- Text: 4.5:1 (WCAG AA)
- UI Components: 3:1 (WCAG AA)
- All colors meet accessibility standards

### Touch Targets
- Minimum 44x44px for all interactive elements
- Proper spacing between targets
- Clear visual feedback on interaction

---

**Visual Reference Version**: 1.0  
**Last Updated**: December 26, 2025
