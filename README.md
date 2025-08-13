결론 먼저: **지금 제안한 00/10/20 + 3축(mode×density×readability) 구조, Tokens Studio 써도 그대로 유효**다. 오히려 Tokens Studio의 “세트(sets)+Themes(Pro)+멀티파일 Export”랑 가장 궁합 좋음.

아래는 **Claude Code용 작업지시서**. 이대로 만들면 된다.

---

# 0. 목표(변함없음)

* **00-primitive → 10-semantic → 20-theme.\*** 계층 고정
* 테마 축은 **mode(light/dark) × density(default/condensed) × readability(base/easy)**
* Tokens Studio를 **SSOT**로 두고, Figma Variables와 **양방향 동기화**
* Style Dictionary(+ sd-transforms)로 **모든 테마 조합 빌드**

---

# 1) Figma에서 “Variables” 세팅 (디자이너 작업 환경)

## 1-1. 컬렉션(Collections) 만들기

* `UDS/Color`  → **Modes:** `light`, `dark`
* `UDS/Space`  → **Modes:** `default`, `condensed`
* `UDS/Type`   → **Modes:** `base`, `easy`

> 포인트: **축마다 컬렉션을 분리**하면, 한 테마에서 컬렉션별로 다른 모드를 매칭하기 쉬움.

## 1-2. Variable 네이밍 규칙

* 팔레트(원시): `palette.neutral.gray.50`, `palette.neutral.grayInverse.900`, `palette.red.400` …
* 의미(시맨틱): `color.bg.primary`, `color.text.primary`, `space.component.md`, `radius.sm`, `type.title.lg` …

> 팔레트는 **단일값(모드 없음)**.
> 의미 변수는 컬렉션 모드에 따라 실제 값이 달라짐(= 컬렉션의 모드가 테마 축 역할).

---

# 2) Tokens Studio 세팅 (플러그인 내부 구조)

## 2-1. Token Sets(세트) 구조

```
tokens/
  00-primitive/
    color.palette.json
    typography.scale.json
    size.icon.json
  10-semantic/
    color.json
    typography.json
    space.json
    radius.json
  20-theme.mode/
    light.json
    dark.json
  20-theme.density/
    default.json
    condensed.json
  20-theme.readability/
    base.json
    easy.json
  $themes.json  // Themes(Pro)가 자동 생성/관리
```

* **00-primitive:** 값만, 모드/브랜드 없음.
* **10-semantic:** 항상 primitive 참조.
* **20-theme.\*:** **오버라이드만**(같은 키 경로를 덮어씀).

## 2-2. Themes(Pro) 구성

* 테마 이름: `light-default-base`, `light-condensed-easy`, … 총 8개
* 각 테마의 **selectedTokenSets**는 아래처럼:

  * `"00-primitive": "source"`
  * `"10-semantic": "enabled"`
  * `"20-theme.mode/light": "enabled"` (또는 `dark`)
  * `"20-theme.density/default": "enabled"` (또는 `condensed`)
  * `"20-theme.readability/base": "enabled"` (또는 `easy`)

> 이렇게 해두면 sd-transforms의 \*\*`permutateThemes()`\*\*로 그대로 모든 조합 뽑힘.

## 2-3. Figma Variables 연결(등록) 방법

Tokens Studio 좌측 **Variables** 탭(또는 Sync 패널)에서:

* **Push to Figma Variables**:

  * 컬렉션별 매핑 지정

    * `10-semantic/color.*` → `UDS/Color`
    * `10-semantic/space.*`, `radius.*` → `UDS/Space`
    * `10-semantic/type.*` → `UDS/Type`
  * **푸시할 Theme 선택**: 예를 들어 `light-default-base`로 푸시하면,

    * `UDS/Color`는 `light` 모드 값으로,
    * `UDS/Space`는 `default` 모드 값으로,
    * `UDS/Type`은 `base` 모드 값으로 들어감.
* **Pull from Figma Variables**:

  * 디자이너가 Variables에서 직접 값 바꿨을 때, 해당 컬렉션/모드를 선택해 **10-semantic/20-theme.\*** 쪽에 반영.
  * 운영 원칙: 디자이너는 **00/10만 수정**, 20-theme는 설계 오버라이드 외에 직접값 금지(검증에서 막음).

> 필요하면 `$extensions`에 “어느 컬렉션/모드/스코프로 보낼지” 메타를 남겨도 됨(선택).

## 2-4. GitHub 연동(멀티파일 Export)

* Tokens Studio **Git Sync** 켜고:

  * repo/branch/path 지정(예: `tokens/`)
  * **Multi-file** on
  * 커밋 메시지 템플릿 세팅
* Pull Request 모드 권장(변경 diff 검토 쉽게).

---

# 3) Style Dictionary 빌드(토큰스튜디오 JSON이 나왔다는 가정)

## 3-1. 의존성

```bash
npm i style-dictionary @tokens-studio/sd-transforms
```

## 3-2. sd.config.ts 요점

```ts
import StyleDictionary from 'style-dictionary';
import { registerTransforms, permutateThemes } from '@tokens-studio/sd-transforms';
import themes from './tokens/$themes.json' assert { type: 'json' };

registerTransforms(StyleDictionary);
const variants = permutateThemes(themes);

export default {
  source: ['tokens/**/*.json'],
  platforms: {
    web: {
      transformGroup: 'tokens-studio',
      buildPath: 'build/web/',
      files: variants.map(v => ({
        destination: `vars.${v.name}.css`,
        format: 'css/variables',
        options: { theme: v }
      }))
    },
    android: {
      transformGroup: 'tokens-studio',
      buildPath: 'build/android/',
      files: variants.map(v => ({
        destination: `values-${v.name}/tokens.xml`,
        format: 'android/resources',
        options: { theme: v }
      }))
    },
    ios: {
      transformGroup: 'tokens-studio',
      buildPath: 'build/ios/',
      files: variants.map(v => ({
        destination: `Tokens.${v.name}.json`,
        format: 'json/nested',
        options: { theme: v }
      }))
    }
  }
};
```

## 3-3. 변환 규칙 팁

* color → hex/rgba 변환, dimension → px 단위 부여 등은 `transformGroup: 'tokens-studio'`가 커버.
* 타입(typography) 묶음이 필요하면 iOS/Android 포맷은 **커스텀 formatter**로 확장.

---

# 4) 앱 런타임 적용(간단 지침)

## Web

* 빌드 산출: `vars.light-default-base.css` … 8개
* 페이지엔 “기본”을 로드하고, data-attr로 오버라이드만 스코프:

```css
:root { /* light-default-base */ }
:root[data-mode="dark"] { /* dark-*-* */ }
:root[data-density="condensed"] { /* *-condensed-* */ }
:root[data-readability="easy"] { /* *-*-easy */ }
```

```ts
function setTheme({mode, density, readability}) {
  const r = document.documentElement;
  r.dataset.mode = mode; r.dataset.density = density; r.dataset.readability = readability;
}
```

## Android (Compose)

* 색: `lightColorScheme`/`darkColorScheme`를 SD JSON에서 로드.
* 간격/반지름: `CompositionLocal`로 density 주입.
* 타이포: readability에 따라 Typography 세트 교체.

## iOS (SwiftUI/UIKit)

* SD JSON 디코드 → 팩토리로 `Color`, `Font`, spacing 주입.
* 환경값으로 density/readability 주입.

---

# 5) 운영 & 동기화 플로우

## 모범 플로우(권장: Tokens Studio → Figma → Git)

1. 디자이너/토큰 담당자가 **Tokens Studio**에서 00/10/20 수정
2. **Push to Figma Variables**로 Figma 모드값 갱신
3. **Git Sync**로 tokens JSON 커밋/PR
4. CI가 Style Dictionary 빌드, 산출물 패키징/배포

## 반대 플로우(디자이너가 Figma에서 먼저 바꿨다면)

1. Figma Variables에서 변경
2. Tokens Studio에서 **Pull from Figma Variables**
3. 00/10/20에 반영 → Git Sync → SD 빌드

> 한 줄 룰: **SSOT는 Tokens Studio**. Figma는 프런트, Git은 저장/배포. 둘 다 수정 가능하지만 **최종은 TS 기준으로 동기화**.

---

# 6) 가드레일(검증 규칙)

* 20-theme.\* 파일에 **직접값(hex/숫자)** 들어오면 실패(항상 primitive/semantic 참조만).
* 미해결 참조(예: `{palette…}` 경로 없음), `$type` 누락 → 실패.
* VariableID가 값으로 남아있으면 경고(값으로 쓰지 말 것).
* 컬렉션/모드 불일치(예: `UDS/Space`에 `dark` 같은 모드) → 실패.

---

# 7) DoD(수락 기준)

* Tokens Studio에서 **8개 테마**가 `$themes.json`에 정의됨.
* **Push/Pull**이 세 컬렉션(색/간격/타이포) 모드 매칭대로 동작.
* `npm run build`로 web/css, android/xml, ios/json **모든 조합** 산출.
* Web 데모에서 data-attr 토글로 실제 값 변함 확인.
* Android/iOS 샘플에서 mode/density/readability 토글 동작.

---

## 질문에 대한 짧은 답

* **“이 구조 맞아?”** → 맞음. TS와 궁합 최고. 유지보수/확장 쉽다.
* **“TS에 변수 어떻게 등록?”** → TS에서 semantic 키를 만들고 **컬렉션별로 매핑**하여 Push. 테마(Themes)로 **어떤 세트 조합을 어떤 컬렉션 모드에 보낼지** 결정.
* **“동기화는?”** → TS↔Figma는 Push/Pull, TS↔Git은 멀티파일 Sync(+PR). CI에서 SD 빌드.

필요하면 **TS Push/Pull 매핑 스크린 기준의 체크리스트**도 바로 써줄게.
