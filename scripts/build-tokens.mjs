import fs from "node:fs";
import path from "node:path";
import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

register(StyleDictionary);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const TOKENS_DIR = path.join(__dirname, "..", "tokens");
const CONFIG = JSON.parse(
	fs.readFileSync(path.join(TOKENS_DIR, "$themes.json"), "utf-8")
);

// 각 테마 조합에 대해 빌드 실행
for (const theme of CONFIG.themes) {
	console.log(`\nBuilding theme: ${theme.name}...`);

	// 1. 기본 소스 파일 (primitive, component)을 가져옵니다.
	const sources = [...CONFIG.source];

	// 2. 선택된 시맨틱 토큰셋을 소스에 추가합니다.
	for (const [category, selection] of Object.entries(theme.selectedTokenSets)) {
		sources.push(path.join(TOKENS_DIR, category, `${selection}.json`));
	}

	console.log("Sources for this theme:", sources);

	const sd = new StyleDictionary({
		source: sources,
		preprocessors: ["tokens-studio"],
		platforms: {
			css: {
				transformGroup: "tokens-studio",
				buildPath: `tokens/build/${theme.name}/`,
				files: [{ destination: "vars.css", format: "css/variables" }],
			},
			scss: {
				transformGroup: "tokens-studio",
				buildPath: `tokens/build/${theme.name}/`,
				files: [{ destination: "tokens.scss", format: "scss/map-deep" }],
			},
			js: {
				transformGroup: "tokens-studio",
				buildPath: `tokens/build/${theme.name}/`,
				files: [{ destination: "tokens.js", format: "javascript/es6" }],
			},
			ios: {
				transformGroup: "tokens-studio",
				buildPath: `tokens/build/${theme.name}/`,
				files: [{ destination: "Tokens.swift", format: "ios-swift/class.swift" }],
			},
			android: {
				transformGroup: "tokens-studio",
				buildPath: `tokens/build/${theme.name}/`,
				files: [
					{ destination: "colors.xml", format: "android/colors" },
					{ destination: "dimens.xml", format: "android/dimens" },
				],
			},
		},
	});

	await sd.buildAllPlatforms();
}

console.log("\nAll themes built successfully!");