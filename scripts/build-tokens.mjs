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
const themesPath = path.join(__dirname, "..", "config", "themes.json");
const themes = JSON.parse(fs.readFileSync(themesPath, 'utf8'));

// Create build directories
const buildDirs = ["build/web", "build/js", "build/json", "build/scss", "build/ios", "build/android"];
buildDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log("🎨 Building 8-theme streamlined token system...");

for (const theme of themes) {
  console.log(`\\n📦 Building theme: ${theme.id}`);
  
  // Build source files array based on theme's selectedTokenSets
  const sources = [];
  
  // Add primitives (always source)
  sources.push("tokens/primitives/*.json");
  
  // Add enabled semantic token sets
  for (const [tokenSet, status] of Object.entries(theme.selectedTokenSets)) {
    if (status === 'enabled' && tokenSet.startsWith('semantic/')) {
      sources.push(`tokens/${tokenSet}.json`);
    }
  }
  
  console.log(`   Sources: ${sources.join(', ')}`);
  
  const sd = new StyleDictionary({
    source: sources,
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
  console.log(`   ✅ ${theme.id} built`);
}

console.log("\\n✅ All 8 themes built successfully with streamlined token system!");