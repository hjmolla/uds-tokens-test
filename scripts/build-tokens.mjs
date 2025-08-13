import fs from "node:fs";
import path from "node:path";
import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

// sd-transforms를 등록하여 'tokens-studio' preprocessor와 transformGroup을 사용할 수 있게 합니다.
register(StyleDictionary);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const TOKENS_DIR = path.join(__dirname, "..", "tokens");

// 테마 조합 정의 (피그마 구조에 맞춤)
const themes = [
  { name: "light-default-base", color: "light", typography: "default", dimension: "default" },
  { name: "light-default-easy", color: "light", typography: "easy", dimension: "default" },
  { name: "light-condensed-base", color: "light", typography: "default", dimension: "condensed" },
  { name: "light-condensed-easy", color: "light", typography: "easy", dimension: "condensed" },
  { name: "dark-default-base", color: "dark", typography: "default", dimension: "default" },
  { name: "dark-default-easy", color: "dark", typography: "easy", dimension: "default" },
  { name: "dark-condensed-base", color: "dark", typography: "default", dimension: "condensed" },
  { name: "dark-condensed-easy", color: "dark", typography: "easy", dimension: "condensed" }
];

// 'size/px' 커스텀 변환 로직을 객체로 정의
const sizePxTransform = {
  name: 'size/px',
  type: 'value',
  matcher: (token) => {
    const isNumeric = (val) => !isNaN(parseFloat(val));
    return (token.type === 'dimension' || token.type === 'fontSizes' || token.type === 'spacing') && isNumeric(token.value);
  },
  transformer: (token) => {
    return `${token.value}px`;
  },
};

// 빌드 디렉토리 생성
const buildDirs = ["build/web", "build/js", "build/json", "build/scss", "build/ios", "build/android"];
buildDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log("🎨 Building themes with Figma structure...");

for (const theme of themes) {
  console.log(`\\n📦 Building theme: ${theme.name}`);
  
  // 각 테마별 소스 파일 구성
  const sources = [
    "tokens/primitives/**/*.json",
    `tokens/token/color-${theme.color}.json`,
    `tokens/token/typography-${theme.typography}.json`,
    `tokens/token/dimension-${theme.dimension}.json`
  ];
  
  console.log(`Sources: ${sources.join(', ')}`);
  
  const sd = new StyleDictionary({
    source: sources,
    preprocessors: ['tokens-studio'],
    transforms: {
      'size/px': sizePxTransform
    },
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        transforms: ['size/px'],
        buildPath: 'build/web/',
        files: [{
          destination: `vars.${theme.name}.css`,
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
          destination: `vars.${theme.name}.scss`,
          format: "scss/variables",
          options: {
            outputReferences: true
          }
        }],
      },
      js: {
        transformGroup: 'tokens-studio',
        transforms: ['size/px'],
        buildPath: 'build/js/',
        files: [{
          destination: `tokens.${theme.name}.js`,
          format: "javascript/es6"
        }],
      },
      json: {
        transformGroup: 'tokens-studio',
        transforms: ['size/px'],
        buildPath: 'build/json/',
        files: [{
          destination: `tokens.${theme.name}.json`,
          format: "json/nested"
        }],
      },
      ios: {
        transformGroup: 'tokens-studio',
        transforms: ['size/px'],
        buildPath: 'build/ios/',
        files: [{
          destination: `Tokens.${theme.name.replace(/[^a-zA-Z0-9]/g, "")}.swift`,
          format: "ios-swift/class.swift",
          options: {
            className: `Tokens${theme.name.replace(/[^a-zA-Z0-9]/g, "").charAt(0).toUpperCase() + theme.name.replace(/[^a-zA-Z0-9]/g, "").slice(1)}`
          }
        }],
      },
      android: {
        transformGroup: 'tokens-studio', 
        transforms: ['size/px'],
        buildPath: 'build/android/',
        files: [
          {
            destination: `values-${theme.name}/colors.xml`,
            format: "android/colors",
            filter: { type: "color" }
          },
          {
            destination: `values-${theme.name}/dimens.xml`, 
            format: "android/dimens",
            filter: (token) => token.type === 'dimension' || token.type === 'spacing' || token.type === 'fontSizes'
          },
        ],
      },
    },
  });

  await sd.buildAllPlatforms();
  console.log(`   ✅ ${theme.name} built`);
}

console.log("\\n✅ All themes built successfully with Figma structure!");