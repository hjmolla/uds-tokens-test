# Tokens Studio Setup Guide

## 1. Token Set Configuration

In Tokens Studio, you should see these token sets:

```
primitives/color              (source - always active)
primitives/typography         (source - always active)  
primitives/dimension          (source - always active)
semantic/color-light         (mode-specific set)
semantic/color-dark          (mode-specific set)
semantic/typography-default  (mode-specific set)
semantic/typography-easy     (mode-specific set)
semantic/spacing-default     (mode-specific set)
semantic/spacing-condensed   (mode-specific set)
```

## 2. No Mode Configuration Needed

With this structure, **no mode configuration is needed** in individual token sets. Instead, modes are handled by **enabling/disabling specific token sets** per theme.

## 3. Theme Setup (8 themes total)

Create these themes in Tokens Studio by **enabling the correct token sets**:

### Theme: `light-default-default`
- ✅ `primitives/*` (source)
- ✅ `semantic/color-light` (enabled)
- ❌ `semantic/color-dark` (disabled)
- ✅ `semantic/typography-default` (enabled)
- ❌ `semantic/typography-easy` (disabled)
- ✅ `semantic/spacing-default` (enabled)
- ❌ `semantic/spacing-condensed` (disabled)

### Theme: `light-default-condensed`
- ✅ `primitives/*` (source)
- ✅ `semantic/color-light` (enabled)
- ❌ `semantic/color-dark` (disabled)
- ✅ `semantic/typography-default` (enabled)
- ❌ `semantic/typography-easy` (disabled)
- ❌ `semantic/spacing-default` (disabled)
- ✅ `semantic/spacing-condensed` (enabled)

### Theme: `light-easy-default`
- ✅ `primitives/*` (source)
- ✅ `semantic/color-light` (enabled)
- ❌ `semantic/color-dark` (disabled)
- ❌ `semantic/typography-default` (disabled)
- ✅ `semantic/typography-easy` (enabled)
- ✅ `semantic/spacing-default` (enabled)
- ❌ `semantic/spacing-condensed` (disabled)

### Theme: `light-easy-condensed`
- ✅ `primitives/*` (source)
- ✅ `semantic/color-light` (enabled)
- ❌ `semantic/color-dark` (disabled)
- ❌ `semantic/typography-default` (disabled)
- ✅ `semantic/typography-easy` (enabled)
- ❌ `semantic/spacing-default` (disabled)
- ✅ `semantic/spacing-condensed` (enabled)

### Theme: `dark-default-default`
- ✅ `primitives/*` (source)
- ❌ `semantic/color-light` (disabled)
- ✅ `semantic/color-dark` (enabled)
- ✅ `semantic/typography-default` (enabled)
- ❌ `semantic/typography-easy` (disabled)
- ✅ `semantic/spacing-default` (enabled)
- ❌ `semantic/spacing-condensed` (disabled)

### Theme: `dark-default-condensed`
- ✅ `primitives/*` (source)
- ❌ `semantic/color-light` (disabled)
- ✅ `semantic/color-dark` (enabled)
- ✅ `semantic/typography-default` (enabled)
- ❌ `semantic/typography-easy` (disabled)
- ❌ `semantic/spacing-default` (disabled)
- ✅ `semantic/spacing-condensed` (enabled)

### Theme: `dark-easy-default`
- ✅ `primitives/*` (source)
- ❌ `semantic/color-light` (disabled)
- ✅ `semantic/color-dark` (enabled)
- ❌ `semantic/typography-default` (disabled)
- ✅ `semantic/typography-easy` (enabled)
- ✅ `semantic/spacing-default` (enabled)
- ❌ `semantic/spacing-condensed` (disabled)

### Theme: `dark-easy-condensed`
- ✅ `primitives/*` (source)
- ❌ `semantic/color-light` (disabled)
- ✅ `semantic/color-dark` (enabled)
- ❌ `semantic/typography-default` (disabled)
- ✅ `semantic/typography-easy` (enabled)
- ❌ `semantic/spacing-default` (disabled)
- ✅ `semantic/spacing-condensed` (enabled)

## 4. GitHub Sync Setup

1. Go to Settings → Sync in Tokens Studio
2. Choose "GitHub" as sync provider
3. Configure:
   - Repository: `your-org/your-repo`
   - Branch: `main`
   - File path: `tokens/`
   - Enable "Multi-file sync"

## 5. Token Structure

### Primitives (No modes)
These are your foundation tokens:
- `primitives/color.json` - Color palette, scales
- `primitives/typography.json` - Font families, weights
- `primitives/dimension.json` - Spacing scale, radii

### Semantics (With mode extensions)
These reference primitives and have mode variations:
- `semantic/color.json` - Light/dark variations
- `semantic/typography.json` - Default/easy (accessibility) variations  
- `semantic/spacing.json` - Default/condensed (density) variations

## 6. Usage in Tokens Studio

1. **Switch themes** to see different combinations
2. **Edit base values** in `$value` for default behavior
3. **Mode variations** are in `$extensions.uds.modes`
4. **All references** should resolve properly to primitives

## 7. Troubleshooting

If you see errors:

1. **"Cannot read properties of undefined"**:
   - Check that no extra files are in the tokens/ directory
   - Ensure all token files have proper JSON structure

2. **"[object Object]" values**:
   - This should be fixed with the `$extensions` pattern
   - Make sure semantic tokens reference primitives correctly

3. **Missing references**:
   - Verify primitive token names match references
   - Check for typos in `{reference}` syntax

## 8. Build Process

After making changes in Tokens Studio:

1. **Push to GitHub** (or export JSON files)
2. **Run build**: `npm run build`
3. **Check outputs** in `build/` directory
4. **8 theme variants** will be generated automatically

The build system reads the token files and resolves the correct mode values for each of the 8 theme combinations.