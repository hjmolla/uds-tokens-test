# UDS Streamlined Token System

This repository implements a streamlined 3-axis token management system following design token best practices.

## Architecture Overview

### Token Structure

```
tokens/
├── primitives/          # Mode-less foundation tokens
│   ├── color.json       # Color palette, neutrals, brand scales  
│   ├── typography.json  # Font families, weights, scales
│   └── dimension.json   # Spacing scale, radii, border-width
├── semantic/           # Mode-enabled semantic tokens
│   ├── color.json      # Modes: light, dark
│   ├── typography.json # Modes: default, easy  
│   └── spacing.json    # Modes: default, condensed
├── themes.json         # 8 theme configurations
└── $metadata.json      # Token set order
```

### Three Axes System

1. **Color**: `light` / `dark`
2. **Typography**: `default` / `easy` (accessibility)  
3. **Spacing**: `default` / `condensed` (density)

### 8 Theme Combinations

| Theme ID | Color | Typography | Spacing |
|----------|-------|------------|---------|
| `light-default-default` | light | default | default |
| `light-default-condensed` | light | default | condensed |
| `light-easy-default` | light | easy | default |
| `light-easy-condensed` | light | easy | condensed |
| `dark-default-default` | dark | default | default |
| `dark-default-condensed` | dark | default | condensed |
| `dark-easy-default` | dark | easy | default |
| `dark-easy-condensed` | dark | easy | condensed |

## Token Resolution

### Primitives (No Modes)
```json
{
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": "#6366f1"
      }
    }
  }
}
```

### Semantics (With Mode Extensions)
```json
{
  "color": {
    "text": {
      "primary": {
        "$type": "color",
        "$value": "{bw.light.black}",
        "$extensions": {
          "uds.modes": {
            "light": "{bw.light.black}",
            "dark": "{naturalGray.dark.900}"
          }
        }
      }
    }
  }
}
```

## Build System

The build system automatically:

1. **Loads theme configurations** from `tokens/themes.json`
2. **Resolves mode values** from `$extensions.uds.modes` for each theme combination
3. **Generates platform outputs** (CSS, SCSS, JS, JSON, iOS, Android)
4. **Creates 8× outputs** per platform (one per theme)

### Mode Resolution with Extensions

The system uses GitHub Primer's `$extensions` pattern:
- **Base value**: Default fallback in `$value`
- **Mode overrides**: Specific values in `$extensions.uds.modes.{mode}`
- **Build-time resolution**: Resolves correct value per theme during build

### Build Commands

```bash
npm run build           # Build all 8 themes
npm run build:clean     # Clean build + rebuild
```

### Generated Files

```
build/
├── web/               # CSS Variables
│   ├── vars.light-default-default.css
│   ├── vars.light-default-condensed.css
│   └── ... (8 total)
├── js/                # JavaScript ES6
│   ├── tokens.light-default-default.js
│   └── ... (8 total)
├── json/              # Nested JSON
├── scss/              # SCSS Variables  
├── ios/               # Swift Classes
└── android/           # XML Resources
```

## Usage Examples

### CSS
```css
/* Import specific theme */
@import './build/web/vars.light-default-default.css';

.button {
  background-color: var(--colorContainerBrandPrimary);
  color: var(--colorTextBaseWhite);
  padding: var(--spacingComponentInset16);
  font-size: var(--typographyBodyBaseSize);
}
```

### JavaScript
```js
import tokens from './build/js/tokens.dark-easy-condensed.js';

const styles = {
  backgroundColor: tokens.color.container.brand.primary,
  color: tokens.color.text.base.white,
  padding: tokens.spacing.component.inset[16],
  fontSize: tokens.typography.body.base.size
};
```

## Figma Integration

### Variable Collections (3)

1. **Color Collection**
   - Modes: Light, Dark
   - Maps to `semantic/color.json` modes

2. **Typography Collection** 
   - Modes: Default, Easy
   - Maps to `semantic/typography.json` modes

3. **Spacing Collection**
   - Modes: Default, Condensed  
   - Maps to `semantic/spacing.json` modes

### Export Setup

1. Export semantic tokens only (not primitives)
2. Map each collection to its respective modes
3. Use consistent naming: `color.text.primary`, `typography.body.size`, `spacing.gap.md`

## Service Customization

For service-specific overrides:

```
tokens/
└── overrides/
    └── service-a/
        ├── color.json      # Brand-specific colors
        ├── typography.json # Custom font stacks
        └── spacing.json    # Adjusted spacing
```

Enable in themes as needed without creating global axis explosion.

## Maintenance

### Adding New Tokens

1. **Primitives**: Add to appropriate primitive file (no modes)
2. **Semantics**: Add with mode-specific values in semantic files
3. **Rebuild**: Run `npm run build` to generate new outputs

### Adding New Modes

1. Update semantic token files with new mode values
2. Update `themes.json` with new theme combinations  
3. Rebuild to generate additional theme outputs

### Adding Service Overrides

1. Create `tokens/overrides/{service}/` directory
2. Add override tokens that alias primitives
3. Update build system to include overrides when `SERVICE={service}` env var is set

---

This streamlined system provides maximum flexibility with minimal complexity, supporting all 8 theme combinations while maintaining a clean, maintainable token architecture.