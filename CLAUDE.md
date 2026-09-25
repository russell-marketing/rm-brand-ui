# Claude Instructions & Project Learnings

## Project Overview

**rm-brand-ui** is Russell Marketing's comprehensive design system that provides styling solutions for ANY framework (React, Vue, vanilla JS, etc.). It's **not** just a CSS library - it's a multi-layered style system.

## Key Architectural Principle

**The repo is `rm-brand-ui`, not `rm-brand-styles` or `rm-css`, for a reason**: it ships tokens, CSS,
React components and framework adapters — a UI kit, not a stylesheet. The `ui` in the name
distinguishes it from future siblings such as a website-styles package; `rm-` is the GitHub
spelling of the npm scope `@russell-marketing/`.

### The Three Layers

When implementing any new component, always create **all three layers**:

1. **CSS for Native HTML** (`ui/components/*.css`)
   - Framework-agnostic
   - Uses BEM-like naming (`.component`, `.component__element`, `.component--modifier`)
   - Uses CSS custom properties from `tokens.css`
   - Works with vanilla JS, any framework

2. **React Components** (`components/react/*.jsx`)
   - Wraps framework components (like MUI) with RM brand structure
   - Provides proper semantic grouping and accessibility
   - Uses RM tokens via CSS variables
   - Exports via package.json for easy import

3. **Framework Adapters** (`adapters/*.js`)
   - Theme configuration for specific frameworks (MUI, Chakra, etc.)
   - Maps RM tokens to framework APIs
   - Allows any app using that framework to instantly adopt RM styling
   - Reusable across multiple apps

## Repository Structure

```
rm-brand-ui/
├── ui/                           # Core CSS & design tokens
│   ├── tokens.css                # CSS custom properties
│   ├── tokens.js                 # JS token exports
│   ├── core.css                  # Base styles
│   ├── components/               # Component CSS
│   │   ├── slider.css
│   │   ├── table.css
│   │   └── ...
│   └── rm-ui.entry.css           # Main CSS bundle
├── adapters/                     # Framework theme adapters
│   ├── mui-theme.js              # Material-UI theme
│   └── chakra-theme.js           # (future) Chakra UI theme
├── components/                   # Framework-specific components
│   ├── react/
│   │   ├── SliderWithLabel.jsx
│   │   └── ...
│   └── vue/                      # (future)
├── demo.html                     # Live component demos
└── package.json                  # Exports & peer dependencies
```

## Package.json Configuration

### Peer Dependencies

Always mark framework dependencies as **peer dependencies** (not regular dependencies):

```json
"peerDependencies": {
  "react": "^18.0.0 || ^19.0.0",
  "@mui/material": "^5.0.0 || ^6.0.0"
},
"peerDependenciesMeta": {
  "react": { "optional": true },
  "@mui/material": { "optional": true }
}
```

This keeps the package flexible - users install their own framework versions.

### Exports

Structure exports so consumers can import only what they need:

```json
"exports": {
  "./styles": "./ui/rm-ui.entry.css",
  "./tokens.js": "./ui/tokens.js",
  "./adapters/mui-theme": "./adapters/mui-theme.js",
  "./react/SliderWithLabel": "./components/react/SliderWithLabel.jsx"
}
```

## Design Token Philosophy

**DRY (Don't Repeat Yourself)**: All values come from tokens, never hardcoded.

### Token Hierarchy

1. **Base tokens** (`tokens.css`, `tokens.js`) - Brand colors, spacing, fonts
2. **Component tokens** - Specific to components (e.g., `--slider-label-gap`)
3. **Framework mapping** - Adapters map tokens to framework APIs

### Example: Slider Tokens

```javascript
// In tokens.js
slider: {
  thumbWidth: '20px',
  thumbHeight: '20px',
  thumbBackgroundColor: '#7A64A0',  // RM Galaxy
  trackHeight: '8px',
  marginTop: '1.5rem',
  paddingLeft: '2rem',
  // ... all slider-specific values
}
```

Then use in:
- **CSS**: `var(--slider-label-gap)`
- **React**: `gap: 'var(--slider-label-gap, 1.5rem)'`
- **MUI adapter**: `tokens.slider.thumbBackgroundColor`

## Implementation Pattern: Adding a New Component

### Example: Adding a "Badge" component

1. **Create CSS** (`ui/components/badge.css`):
```css
.badge {
  display: inline-flex;
  padding: var(--space-1) var(--space-2);
  background: var(--rm-galaxy);
  color: var(--rm-moon);
  border-radius: var(--radius-s);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
}
```

2. **Create React Component** (`components/react/Badge.jsx`):
```jsx
export function Badge({ children, variant = 'default', ...props }) {
  return (
    <span className={`badge badge--${variant}`} {...props}>
      {children}
    </span>
  );
}
```

3. **Add to MUI Adapter** (`adapters/mui-theme.js`):
```javascript
components: {
  MuiBadge: {
    styleOverrides: {
      root: {
        backgroundColor: tokens.colors.galaxy,
        color: tokens.colors.moon,
      }
    }
  }
}
```

4. **Update Exports** (`package.json`):
```json
"./react/Badge": "./components/react/Badge.jsx"
```

5. **Add to Demo** (`demo.html`):
```html
<span class="badge">New</span>
<span class="badge badge--success">Active</span>
```

## Integration with Consumer Apps

### Example: rm-internal-interface-front

**Import the MUI theme adapter:**
```javascript
import { getRMThemeConfig } from '@russell-marketing/brand-ui/adapters/mui-theme';

const baseConfig = getRMThemeConfig();
const theme = extendTheme({
  ...baseConfig,
  // App-specific overrides here
});
```

**Import React components:**
```javascript
import SliderWithLabel from '@russell-marketing/brand-ui/react/SliderWithLabel';

<SliderWithLabel
  label="Amount Raised"
  value={amount}
  onChange={setAmount}
  min={0}
  max={10000000}
/>
```

**Import CSS for vanilla usage:**
```html
<link rel="stylesheet" href="./node_modules/@russell-marketing/brand-ui/ui/rm-ui.entry.css">
```

## Common Patterns & Best Practices

### 1. Label-Component Grouping

Always group labels with their controls as a semantic unit:

```jsx
// ✅ Good - grouped with explicit gap
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--slider-label-gap)' }}>
  <Typography component="label">Amount</Typography>
  <Slider value={amount} />
</Box>

// ❌ Bad - separate, relying on implicit spacing
<Typography>Amount</Typography>
<Slider value={amount} />
```

### 2. CSS Variable Fallbacks

Always provide fallbacks when using CSS variables in JS:

```javascript
// ✅ Good
gap: 'var(--slider-label-gap, 1.5rem)'

// ❌ Bad - breaks if variable is undefined
gap: 'var(--slider-label-gap)'
```

### 3. Component Props

Make components flexible but opinionated:

```jsx
export function SliderWithLabel({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,                          // Sensible defaults
  valueLabelDisplay = 'auto',        // Sensible defaults
  sliderProps = {},                  // Escape hatch for advanced use
  sx = {},                           // Allow style overrides
  ...otherProps                      // Forward remaining props
}) {
  // ...
}
```

### 4. Documentation

Always include JSDoc comments with examples:

```jsx
/**
 * SliderWithLabel - A slider component with proper label-slider grouping
 *
 * @param {string} props.label - The label text
 * @param {number} props.value - The slider value
 *
 * @example
 * ```jsx
 * <SliderWithLabel
 *   label="Amount Raised"
 *   value={amount}
 *   onChange={setAmount}
 *   min={0}
 *   max={10000000}
 * />
 * ```
 */
```

## Testing Checklist

When adding new components/features:

- [ ] CSS works standalone in demo.html
- [ ] React component imports correctly
- [ ] MUI adapter applies styling to MUI components
- [ ] Tokens are used (no hardcoded values)
- [ ] Package.json exports are updated
- [ ] JSDoc documentation is complete
- [ ] Demo.html shows all variants
- [ ] Works in consuming app (rm-internal-interface-front)

## Git Workflow

### Linking for Development

```bash
# In rm-brand-ui
npm link

# In consuming app
npm link @russell-marketing/brand-ui

# Or using file: reference in package.json
"@russell-marketing/brand-ui": "file:../rm-brand-ui"
```

### When to Commit

Commit when:
- A complete layer is finished (CSS + React + Adapter)
- All three layers are updated together
- Demo.html is updated with examples
- Consumer app is updated and tested

## Key Learnings from Slider Implementation

### What Was Wrong Before

1. **Assumption Error**: Assumed it was CSS-only because I saw CSS files, ignored the repo name
2. **Incomplete Implementation**: Created only CSS layer, didn't create React component or MUI adapter
3. **Wrong Question**: Should have asked "which layers do you want?" instead of assuming

### What Fixed Everything

1. **Multi-layer approach**: Creating CSS + React component + MUI adapter
2. **Proper grouping**: Label and slider wrapped in explicit container with token-based gap
3. **DRY principle**: All styling comes from tokens, no duplication between theme files
4. **Reusability**: MUI apps can now import theme config instead of duplicating it

### Architecture Benefits

- **Single source of truth**: rm-brand-ui defines everything
- **Framework flexibility**: Can add Chakra, Tailwind, Vue adapters without changing core
- **Consistent UX**: All apps using RM tokens look and feel the same
- **Easy updates**: Change a token in one place, updates everywhere

## Questions to Ask When Starting New Work

1. **What framework is the consumer app using?** (React/MUI, Vue/Vuetify, vanilla, etc.)
2. **Do all three layers exist?** (CSS, React component, framework adapter)
3. **Are the tokens defined?** (Check tokens.js for component-specific tokens)
4. **Is it properly exported?** (Check package.json exports)
5. **Does the demo show it?** (demo.html should have live examples)

## Future Expansion Ideas

- `adapters/chakra-theme.js` - Chakra UI theme
- `adapters/tailwind.config.js` - Tailwind config
- `components/vue/` - Vue components
- `components/svelte/` - Svelte components
- Dark mode tokens expansion
- Animation tokens and utilities

---

**Remember**: This is a **design system**, not just a CSS library. Always think in terms of "How can this work across ALL frameworks?" rather than "How do I style this one component?"
