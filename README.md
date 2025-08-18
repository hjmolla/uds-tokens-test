# UDS Tokens - 3축 테마 시스템

U+ Design System의 디자인 토큰을 관리하고 다양한 플랫폼용 파일을 생성하는 시스템입니다.

## 🎯 개요

이 프로젝트는 **3축 테마 시스템**을 구현합니다:

- **Mode (색상)**: Light / Dark
- **Density (간격)**: Default / Condensed  
- **Readability (텍스트)**: Base / Easy

총 **8개의 테마 조합** (2×2×2)을 자동으로 생성하고, 각 테마를 6가지 플랫폼 형식으로 빌드합니다.

## 📁 프로젝트 구조

```
uds-tokens-test/
├── tokens/                    # 소스 토큰 파일들
│   ├── $metadata.json         # Figma Tokens 메타데이터
│   ├── $themes.json          # Figma 테마 정의
│   ├── primitives/           # 기본 토큰 (Primitive tokens)
│   │   ├── color.json        # 기본 색상 팔레트
│   │   ├── size.json         # 기본 크기 값들
│   │   └── typography.json   # 기본 타이포그래피
│   └── tokens/               # 시맨틱 토큰 (Semantic tokens)
│       ├── color-light.json  # 라이트 모드 색상
│       ├── color-dark.json   # 다크 모드 색상
│       ├── dimension-default.json    # 기본 간격
│       ├── dimension-condensed.json  # 압축 간격
│       ├── typography-default.json   # 기본 텍스트 크기
│       └── typography-easy.json      # 접근성 텍스트 크기
├── scripts/
│   └── build-tokens.mjs      # 빌드 스크립트
├── build/                    # 생성된 결과 파일들
│   ├── web/                  # CSS 변수 파일들
│   ├── scss/                 # SCSS 변수 파일들
│   ├── js/                   # JavaScript ES6 모듈들
│   ├── json/                 # JSON 토큰 파일들
│   ├── ios/                  # iOS Swift 파일들
│   └── android/              # Android XML 리소스들
├── demo/
│   └── index.html           # 라이브 데모 페이지
└── package.json
```

## 🎨 3축 테마 시스템 원리

### 1. Mode (색상 축)
- **Light**: 밝은 배경, 어두운 텍스트
- **Dark**: 어두운 배경, 밝은 텍스트

### 2. Density (간격 축)  
- **Default**: 표준 간격과 패딩
- **Condensed**: 좀 더 압축적인 간격 (정보 밀도 높임)

### 3. Readability (텍스트 축)
- **Base**: 표준 텍스트 크기
- **Easy**: 더 큰 텍스트 크기 (접근성 향상)

### 테마 조합 결과

8개의 테마가 자동 생성됩니다:

1. `light-default-base` - 라이트 모드, 표준 간격, 표준 텍스트
2. `light-default-easy` - 라이트 모드, 표준 간격, 큰 텍스트  
3. `light-condensed-base` - 라이트 모드, 압축 간격, 표준 텍스트
4. `light-condensed-easy` - 라이트 모드, 압축 간격, 큰 텍스트
5. `dark-default-base` - 다크 모드, 표준 간격, 표준 텍스트
6. `dark-default-easy` - 다크 모드, 표준 간격, 큰 텍스트
7. `dark-condensed-base` - 다크 모드, 압축 간격, 표준 텍스트
8. `dark-condensed-easy` - 다크 모드, 압축 간격, 큰 텍스트

## 🔧 빌드 시스템

### 사용 기술

- **Style Dictionary**: 토큰을 다양한 플랫폼 형식으로 변환
- **@tokens-studio/sd-transforms**: Figma Tokens 호환성
- **Node.js**: 빌드 스크립트 실행

### 빌드 프로세스 상세

#### 1. 소스 토큰 조합 및 읽기

각 테마별로 다음과 같은 소스 파일들을 조합합니다:

```javascript
// 예: light-default-base 테마의 경우
const sources = [
  "tokens/primitives/*.json",              // 공통 기본 토큰들
  "tokens/tokens/color-light.json",        // Light 모드 색상
  "tokens/tokens/typography-default.json", // Base 텍스트 크기
  "tokens/tokens/dimension-default.json"   // Default 간격
];
```

**토큰 계층 구조**:
- **Primitive Tokens** (기본): 색상 팔레트, 기본 크기 값들
- **Semantic Tokens** (의미): Primitive를 참조하여 용도별로 정의
- **Theme Tokens** (테마): Mode/Density/Readability 축에 따른 구체적 값들

#### 2. Figma Tokens 전처리

`@tokens-studio/sd-transforms`의 `tokens-studio` preprocessor가 처리:

```json
// Figma Tokens 형식 (토큰 참조)
{
  "colorTextPrimary": {
    "$type": "color",
    "$value": "{bw.light.black}"  // 다른 토큰 참조
  }
}

// 전처리 후 (실제 값으로 해석)
{
  "colorTextPrimary": {
    "type": "color", 
    "value": "#1a1a1a"  // 참조된 실제 값
  }
}
```

#### 3. 커스텀 변환 (Transform) 적용

**size/px 변환**:
```javascript
// 매처: 숫자 값을 가진 dimension/spacing 토큰들
matcher: (token) => {
  return (token.$type === 'dimension' || 
          token.$type === 'spacing') && 
         !isNaN(parseFloat(token.value));
}

// 변환: 숫자에 px 단위 추가
transform: (token) => `${token.value}px`

// 결과: "16" → "16px"
```

**name/js 변환**:
```javascript
// 매처: JavaScript 변수명 규칙 위반 토큰들
matcher: (token) => /^\d/.test(token.name)

// 변환: 숫자로 시작하는 이름에 접두사 추가
transform: (token) => {
  if (/^\d/.test(token.name)) {
    return `size${token.name}`;  // "10" → "size10"
  }
  return token.name;
}
```

#### 4. 플랫폼별 변환 및 생성

각 플랫폼별로 다른 변환 규칙과 형식을 적용:

**CSS 플랫폼**:
```javascript
// 변환 그룹: tokens-studio + size/px
transformGroup: 'tokens-studio',
transforms: ['size/px'],

// 출력 형식: CSS 사용자 정의 속성
format: "css/variables"

// 결과:
// :root {
//   --colorTextPrimary: #1a1a1a;
//   --componentInset16: 16px;
// }
```

**JavaScript 플랫폼**:
```javascript
// 변환 그룹: tokens-studio + size/px + name/js
transforms: ['size/px', 'name/js'],

// 출력 형식: ES6 export 상수
format: "javascript/es6"

// 결과:
// export const colorTextPrimary = "#1a1a1a";
// export const size16 = "16px";
```

**Android 플랫폼**:
```javascript
// 색상 파일 필터링
filter: (token) => token.$type === "color"

// 출력 형식: Android XML 리소스
format: "android/colors"

// 결과:
// <resources>
//   <color name="colorTextPrimary">#1a1a1a</color>
// </resources>
```

#### 5. 테마별 파일 생성 로직

```javascript
// 8개 테마 × 6개 플랫폼 = 48개 파일 생성
for (const theme of themes) {
  // 1. 테마별 소스 파일 조합
  const sources = buildSourceList(theme);
  
  // 2. Style Dictionary 인스턴스 생성
  const sd = new StyleDictionary({
    source: sources,
    preprocessors: ['tokens-studio'],
    platforms: { /* 6개 플랫폼 설정 */ }
  });
  
  // 3. 모든 플랫폼으로 빌드
  await sd.buildAllPlatforms();
  
  // 결과: 
  // - build/web/vars.light-default-base.css
  // - build/js/tokens.light-default-base.js
  // - build/android/values-light-default-base/colors.xml
  // ... 등등
}
```

#### 6. 토큰 값 해석 과정

**참조 해석 (Reference Resolution)**:
```
1. 원본: "{bw.light.black}"
2. 경로 파싱: bw → light → black
3. 값 조회: primitives/color.json에서 해당 경로의 값 찾기
4. 결과: "#1a1a1a"
```

**조건부 토큰 적용**:
```json
// light-default-base 테마의 경우
{
  "colorBackground": {
    "light": "#ffffff",    // Mode=light일 때 사용
    "dark": "#000000"      // Mode=dark일 때 사용
  }
}
```

#### 7. 빌드 최적화

- **병렬 처리**: 각 테마는 독립적으로 빌드 가능
- **증분 빌드**: 변경된 소스 파일만 재빌드 (현재 미구현)
- **캐싱**: Style Dictionary 내부 토큰 파싱 결과 캐싱

### 지원 플랫폼

| 플랫폼 | 확장자 | 설명 | 예시 파일명 |
|--------|--------|------|-------------|
| **CSS** | `.css` | CSS 사용자 정의 속성 | `vars.light-default-base.css` |
| **SCSS** | `.scss` | Sass 변수 | `vars.light-default-base.scss` |
| **JavaScript** | `.js` | ES6 export 상수 | `tokens.light-default-base.js` |
| **JSON** | `.json` | 중첩된 JSON 객체 | `tokens.light-default-base.json` |
| **iOS** | `.swift` | Swift 클래스 상수 | `Tokens.lightdefaultbase.swift` |
| **Android** | `.xml` | Android 리소스 | `values-light-default-base/colors.xml` |

## 🚀 사용법

### 빌드 실행

```bash
# 의존성 설치
npm install

# 모든 테마 빌드
npm run build
```

### 생성된 파일 확인

```bash
# 빌드 결과 확인
ls -la build/

# 특정 플랫폼 파일들 확인  
ls build/web/     # CSS 파일들
ls build/js/      # JavaScript 파일들
ls build/android/ # Android XML 파일들
```

### 데모 페이지 실행

```bash
# 간단한 HTTP 서버로 데모 실행
python3 -m http.server 8080

# 브라우저에서 http://localhost:8080/demo/ 접속
```

## 💡 사용 예시

### CSS에서 사용

```css
/* 특정 테마 CSS 파일 불러오기 */
@import './build/web/vars.light-default-base.css';

.my-component {
  background-color: var(--colorBackgroundBaseLow);
  color: var(--colorTextBasePrimary);
  padding: var(--componentInset16);
  border-radius: var(--radiusMedium);
  font-family: var(--typeface);
  font-size: var(--bodyBase);
}
```

### JavaScript에서 사용

```javascript
// ES6 모듈로 토큰 가져오기
import * as tokens from './build/js/tokens.light-default-base.js';

console.log(tokens.colorBackgroundBaseLow); // "#fcfcfc"
console.log(tokens.componentInset16);       // "16px"
```

### React에서 동적 테마 전환

```jsx
function App() {
  const [theme, setTheme] = useState('light-default-base');
  
  useEffect(() => {
    // CSS 파일 동적 로드
    const link = document.getElementById('theme-css');
    link.href = `./build/web/vars.${theme}.css`;
  }, [theme]);

  return (
    <div>
      <select onChange={(e) => setTheme(e.target.value)}>
        <option value="light-default-base">Light Default Base</option>
        <option value="light-default-easy">Light Default Easy</option>
        <option value="dark-default-base">Dark Default Base</option>
        {/* ... 다른 테마들 */}
      </select>
      
      <div className="content">
        {/* CSS 변수를 사용한 컴포넌트들 */}
      </div>
    </div>
  );
}
```

### Android에서 사용

```xml
<!-- res/values/styles.xml -->
<style name="AppTheme" parent="Theme.Material3.DayNight">
    <!-- 빌드된 colors.xml 파일의 색상들 사용 -->
    <item name="android:colorPrimary">@color/colorBackgroundBaseLow</item>
    <item name="android:textColorPrimary">@color/colorTextBasePrimary</item>
</style>
```

## 🎨 주요 토큰 카테고리

### 색상 토큰

- **Background**: `colorBackgroundBaseLow`, `colorBackgroundBaseHigh`
- **Container**: `colorContainerBaseLow`, `colorContainerBaseHigh`
- **Text**: `colorTextBasePrimary`, `colorTextBaseSecondary`
- **Border**: `colorBorderBasePrimary`, `colorBorderBaseTertiary`
- **Brand**: `colorTextBrandPrimary`, `colorBorderBrandPrimary`
- **Status**: `statusTextPositive`, `statusContainerNegative`

### 간격 토큰

- **Component**: `componentInset6`, `componentInset8`, `componentInset12`, `componentInset16`, `componentInset20`
- **Layout**: `layoutInsetY12`, `layoutInsetY16`, `layoutInsetY24`, `layoutInsetY32`
- **Gap**: `componentGap8`, `componentGap12`, `componentGap16`

### 타이포그래피 토큰

- **Font Family**: `typeface` (Pretendard)
- **Display**: `displayLarge`, `displayBase`
- **Title**: `titleLarge`, `titleBase`, `titleXSmall`
- **Body**: `bodyLarge`, `bodyBase`, `bodySmall`, `bodyXSmall`
- **Label**: `labelXLarge`, `labelLarge`, `labelBase`, `labelSmall`, `labelXSmall`

### 둥근 모서리 토큰

- `radiusNone` (0px)
- `radiusSmall` (4px)
- `radiusMedium` (8px)
- `radiusLarge` (12px)
- `radiusFull` (9999px)

## ⚙️ 빌드 스크립트 분석

### 핵심 빌드 로직 (`scripts/build-tokens.mjs`)

#### 테마 정의 및 조합

```javascript
// 3축 시스템을 통한 8개 테마 조합 정의
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
```

#### 동적 소스 파일 조합

각 테마마다 다른 소스 파일 조합을 생성:

```javascript
// 테마별 소스 파일 동적 구성
for (const theme of themes) {
  const sources = [
    "tokens/primitives/*.json",                           // 공통: 모든 기본 토큰
    `tokens/tokens/color-${theme.color}.json`,            // 색상축: light 또는 dark
    `tokens/tokens/typography-${theme.typography}.json`,  // 텍스트축: default 또는 easy  
    `tokens/tokens/dimension-${theme.dimension}.json`     // 간격축: default 또는 condensed
  ];
  
  console.log(`Building theme: ${theme.name}`);
  console.log(`Sources: ${sources.join(', ')}`);
}
```

#### 커스텀 변환기 등록

빌드 시작 전에 필요한 변환기들을 Style Dictionary에 등록:

```javascript
// 1. px 단위 추가 변환기
StyleDictionary.registerTransform({
  name: 'size/px',
  type: 'value',
  matcher: (token) => {
    const isNumeric = (val) => !isNaN(parseFloat(val));
    return (token.$type === 'dimension' || 
            token.$type === 'fontSizes' || 
            token.$type === 'spacing') && isNumeric(token.value);
  },
  transform: (token) => `${token.value}px`
});

// 2. JavaScript 변수명 유효성 변환기
StyleDictionary.registerTransform({
  name: 'name/js', 
  type: 'name',
  transform: (token) => {
    // 숫자로 시작하는 토큰명에 'size' 접두사 추가
    if (/^\d/.test(token.name)) {
      return `size${token.name}`;
    }
    return token.name;
  }
});
```

#### 플랫폼별 빌드 설정

각 플랫폼마다 다른 변환 규칙과 필터를 적용:

```javascript
const platforms = {
  // CSS: 모든 토큰을 CSS 변수로 변환
  css: {
    transformGroup: 'tokens-studio',
    transforms: ['size/px'],
    buildPath: 'build/web/',
    files: [{
      destination: `vars.${theme.name}.css`,
      format: "css/variables",
      options: { outputReferences: true }
    }]
  },
  
  // JavaScript: 유효한 변수명으로 변환 후 ES6 export
  js: {
    transformGroup: 'tokens-studio',
    transforms: ['size/px', 'name/js'],  // 추가 변환 적용
    buildPath: 'build/js/',
    files: [{
      destination: `tokens.${theme.name}.js`,
      format: "javascript/es6"
    }]
  },
  
  // Android: 타입별로 필터링하여 XML 생성
  android: {
    transformGroup: 'tokens-studio',
    transforms: ['size/px'],
    buildPath: 'build/android/',
    files: [
      {
        destination: `values-${theme.name}/colors.xml`,
        format: "android/colors",
        filter: (token) => token.$type === "color" || token.type === "color"
      },
      {
        destination: `values-${theme.name}/dimens.xml`,
        format: "android/dimens", 
        filter: (token) => token.$type === 'dimension' || 
                           token.$type === 'spacing' || 
                           token.$type === 'fontSizes' ||
                           token.type === 'dimension' || 
                           token.type === 'spacing' || 
                           token.type === 'fontSizes'
      }
    ]
  }
};
```

#### 빌드 실행 및 에러 처리

```javascript
for (const theme of themes) {
  try {
    // Style Dictionary 인스턴스 생성
    const sd = new StyleDictionary({
      source: sources,
      preprocessors: ['tokens-studio'],  // Figma Tokens 전처리
      platforms: platforms
    });
    
    // 모든 플랫폼으로 동시 빌드
    await sd.buildAllPlatforms();
    console.log(`✅ ${theme.name} built successfully`);
    
  } catch (error) {
    console.error(`❌ Failed to build ${theme.name}:`, error.message);
    // 에러가 발생해도 다른 테마 빌드는 계속 진행
  }
}
```

### 빌드 결과 구조

#### 디렉터리 구조 자동 생성

```javascript
// 빌드 전 필요한 디렉터리들 미리 생성
const buildDirs = [
  "build/web", "build/js", "build/json", 
  "build/scss", "build/ios", "build/android"
];

buildDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
```

#### 생성되는 파일 예시

**CSS 결과** (`build/web/vars.light-default-base.css`):
```css
:root {
  --colorTextBasePrimary: #1a1a1a;
  --componentInset16: 16px;
  --bodyBase: 16px;
  --radiusMedium: 8px;
}
```

**JavaScript 결과** (`build/js/tokens.light-default-base.js`):
```javascript
export const colorTextBasePrimary = "#1a1a1a";
export const componentInset16 = "16px";
export const size16 = "16px";  // 숫자명 → size 접두사 추가
export const radiusMedium = "8px";
```

**Android 결과** (`build/android/values-light-default-base/colors.xml`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<resources>
  <color name="colorTextBasePrimary">#1a1a1a</color>
  <color name="colorContainerBaseHigh">#f2f2f2</color>
</resources>
```

### 빌드 성능 및 최적화

#### 현재 구현된 최적화

1. **비동기 빌드**: `await sd.buildAllPlatforms()` 사용
2. **에러 격리**: 한 테마 실패 시 다른 테마는 계속 빌드
3. **선택적 플랫폼 빌드**: 필요한 플랫폼만 설정 가능

#### 향후 개선 가능한 부분

1. **병렬 테마 빌드**: 현재는 순차 처리, 향후 동시 처리 가능
2. **증분 빌드**: 변경된 소스만 재빌드
3. **빌드 캐시**: 토큰 파싱 결과 캐싱으로 속도 향상

## 🛠️ 개발 가이드

### 새로운 토큰 추가

1. **Primitive 토큰**: `tokens/primitives/` 파일들에 기본 값 추가
2. **Semantic 토큰**: `tokens/tokens/` 파일들에 의미있는 이름으로 참조 추가
3. **빌드 실행**: `npm run build`로 모든 플랫폼 파일 재생성

### 새로운 테마 축 추가

1. **build-tokens.mjs** 파일의 `themes` 배열에 새로운 조합 추가
2. 해당하는 토큰 파일들을 `tokens/tokens/` 폴더에 생성
3. 빌드 스크립트가 자동으로 새로운 조합들을 처리

### 새로운 플랫폼 추가

1. **build-tokens.mjs** 파일의 `platforms` 객체에 새로운 플랫폼 추가
2. Style Dictionary의 내장 format 사용하거나 커스텀 format 정의
3. 필요한 경우 커스텀 transform 추가

## 🔄 워크플로우

### 디자이너 워크플로우

1. **Figma Tokens 플러그인**에서 토큰 편집
2. **JSON 파일로 Export** → `tokens/` 폴더에 저장
3. **빌드 실행** → 개발자가 사용할 파일들 자동 생성

### 개발자 워크플로우

1. **토큰 파일 import** → 프로젝트에서 생성된 토큰 사용
2. **테마 전환 로직** → 동적으로 다른 테마 파일 로드
3. **컴포넌트 스타일링** → CSS 변수나 토큰 상수 사용

## 🚨 주의사항

### 토큰 파일 수정 금지

`tokens/` 폴더의 파일들은 **Figma Tokens에서 관리**되므로 직접 수정하지 마세요. 
변경사항은 Figma에서 작업 후 Export해야 합니다.

### 빌드 파일 커밋 금지

`build/` 폴더의 파일들은 **자동 생성**되므로 Git에 커밋하지 마세요.
CI/CD에서 빌드하거나 배포 시점에 생성하세요.

### 브라우저 호환성

CSS 사용자 정의 속성(CSS Variables)을 사용하므로 **IE 11 이하는 지원하지 않습니다**.
필요시 PostCSS 플러그인으로 폴백 처리를 고려하세요.

## 📚 참고 자료

- [Style Dictionary 공식 문서](https://amzn.github.io/style-dictionary/)
- [Figma Tokens 플러그인](https://www.figma.com/community/plugin/843461159747178946/Figma-Tokens)
- [CSS 사용자 정의 속성 MDN](https://developer.mozilla.org/ko/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens W3C 스펙](https://design-tokens.github.io/community-group/format/)

## 📄 라이선스

MIT License - 자세한 내용은 LICENSE 파일을 참조하세요.