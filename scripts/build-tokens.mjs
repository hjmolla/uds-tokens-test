import fs from "node:fs";
import path from "node:path";
import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

register(StyleDictionary);

// Custom transforms
StyleDictionary.registerTransform({
  name: 'size/px',
  type: 'value',
  matcher: (token) => {
    const isNumeric = (val) => !isNaN(parseFloat(val));
    return (token.$type === 'dimension' || token.$type === 'fontSizes' || token.$type === 'spacing') && isNumeric(token.value);
  },
  transform: (token) => {
    return `${token.value}px`;
  },
});

StyleDictionary.registerTransform({
  name: 'name/js',
  type: 'name',
  transform: (token) => {
    if (/^\d/.test(token.name)) {
      return `size${token.name}`;
    }
    return token.name;
  },
});

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const TOKENS_DIR = path.join(__dirname, "..", "tokens");

// Load themes configuration
const themesPath = path.join(TOKENS_DIR, "themes.json");
const themes = JSON.parse(fs.readFileSync(themesPath, 'utf8'));

// Create build directories
const buildDirs = ["build/web", "build/js", "build/json", "build/scss", "build/ios", "build/android"];
buildDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log("🎨 Building 8-theme streamlined token system...");

// Function to resolve mode values for a specific theme
function resolveTokensForTheme(theme) {
  const resolvedTokens = {};
  
  // Load primitives (no modes)
  const primitiveFiles = ['color.json', 'typography.json', 'dimension.json'];
  primitiveFiles.forEach(file => {
    const filePath = path.join(TOKENS_DIR, 'primitives', file);
    if (fs.existsSync(filePath)) {
      const tokens = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      Object.assign(resolvedTokens, tokens);
    }
  });
  
  // Load and resolve semantic tokens based on theme modes
  const semanticFiles = [
    { file: 'color.json', mode: theme.modes['semantic/color'] },
    { file: 'typography.json', mode: theme.modes['semantic/typography'] }, 
    { file: 'spacing.json', mode: theme.modes['semantic/spacing'] }
  ];
  
  semanticFiles.forEach(({ file, mode }) => {
    const filePath = path.join(TOKENS_DIR, 'semantic', file);
    if (fs.existsSync(filePath)) {
      const tokens = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const resolved = resolveSemanticTokens(tokens, mode);
      Object.assign(resolvedTokens, resolved);
    }
  });
  
  return resolvedTokens;
}

// Function to resolve semantic tokens for a specific mode using $extensions
function resolveSemanticTokens(tokens, mode) {
  const resolved = {};
  
  function processTokens(obj, path = []) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];
      
      if (value && typeof value === 'object') {
        if (value.$type && value.$value) {
          // This is a token with value
          let resolvedValue = value.$value;
          
          // Check for mode-specific overrides in $extensions
          if (value.$extensions && value.$extensions['uds.modes'] && value.$extensions['uds.modes'][mode]) {
            resolvedValue = value.$extensions['uds.modes'][mode];
          }
          
          resolved[currentPath.join('.')] = {
            ...value,
            $value: resolvedValue,
            // Remove $extensions from output to keep it clean
            $extensions: undefined
          };
        } else {
          // This is a group, recurse
          processTokens(value, currentPath);
        }
      }
    }
  }
  
  processTokens(tokens);
  return resolved;
}

for (const theme of themes) {
  console.log(`\\n📦 Building theme: ${theme.id}`);
  
  // Resolve tokens for this specific theme
  const resolvedTokens = resolveTokensForTheme(theme);
  
  // Write resolved tokens to temporary file for this theme
  const tempTokensPath = path.join(TOKENS_DIR, `temp-${theme.id}.json`);
  fs.writeFileSync(tempTokensPath, JSON.stringify(resolvedTokens, null, 2));
  
  const sd = new StyleDictionary({
    source: [tempTokensPath],
    preprocessors: ['tokens-studio'],
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        transforms: ['size/px'],
        buildPath: 'build/web/',
        files: [{
          destination: `vars.${theme.id}.css`,
          format: "css/variables",
          options: {
            outputReferences: true
          }
        }],
      },
      scss: {
        transformGroup: 'tokens-studio',
        transforms: ['size/px'],
        buildPath: 'build/scss/',
        files: [{
          destination: `vars.${theme.id}.scss`,
          format: "scss/variables",
          options: {
            outputReferences: true
          }
        }],
      },
      js: {
        transformGroup: 'tokens-studio',
        transforms: ['size/px', 'name/js'],
        buildPath: 'build/js/',
        files: [{
          destination: `tokens.${theme.id}.js`,
          format: "javascript/es6"
        }],
      },
      json: {
        transformGroup: 'tokens-studio',
        transforms: ['size/px'],
        buildPath: 'build/json/',
        files: [{
          destination: `tokens.${theme.id}.json`,
          format: "json/nested"
        }],
      },
      ios: {
        transformGroup: 'tokens-studio',
        transforms: ['size/px'],
        buildPath: 'build/ios/',
        files: [{
          destination: `Tokens.${theme.id.replace(/[^a-zA-Z0-9]/g, "")}.swift`,
          format: "ios-swift/class.swift",
          options: {
            className: `Tokens${theme.id.replace(/[^a-zA-Z0-9]/g, "").charAt(0).toUpperCase() + theme.id.replace(/[^a-zA-Z0-9]/g, "").slice(1)}`
          }
        }],
      },
      android: {
        transformGroup: 'tokens-studio', 
        transforms: ['size/px'],
        buildPath: 'build/android/',
        files: [
          {
            destination: `values-${theme.id}/colors.xml`,
            format: "android/colors",
            filter: (token) => token.$type === "color" || token.type === "color"
          },
          {
            destination: `values-${theme.id}/dimens.xml`, 
            format: "android/dimens",
            filter: (token) => token.$type === 'dimension' || token.$type === 'spacing' || token.$type === 'fontSizes' || 
                              token.type === 'dimension' || token.type === 'spacing' || token.type === 'fontSizes'
          },
        ],
      },
    },
  });

  await sd.buildAllPlatforms();
  
  // Clean up temporary file
  fs.unlinkSync(tempTokensPath);
  
  console.log(`   ✅ ${theme.id} built`);
}

console.log("\\n✅ All 8 themes built successfully with streamlined token system!");