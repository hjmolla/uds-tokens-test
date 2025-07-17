// scripts/build-tokens.mjs
import fs from "node:fs";
import path from "node:path";
import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

register(StyleDictionary);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const TOKENS_DIR = path.join(__dirname, "..", "tokens");
const THEMES = JSON.parse(
	fs.readFileSync(path.join(TOKENS_DIR, "$themes.json"), "utf-8")
);

for (const theme of THEMES) {
	const sources = Object.entries(theme.selectedTokenSets)
		.filter(([, state]) => state !== "disabled")
		.map(([set]) => path.join(TOKENS_DIR, `${set}.json`));

	const sd = new StyleDictionary({
		// ← v4 API
		source: sources,
		preprocessors: ["tokens-studio"],
		platforms: {
			css: {
				transformGroup: "tokens-studio",
				buildPath: `tokens/build/${theme.id}/`,
				files: [{ destination: "vars.css", format: "css/variables" }],
			},
			scss: {
				transformGroup: "tokens-studio",
				buildPath: `tokens/build/${theme.id}/`,
				files: [{ destination: "tokens.scss", format: "scss/map-deep" }],
			},
			js: {
				transformGroup: "tokens-studio",
				buildPath: `tokens/build/${theme.id}/`,
				files: [{ destination: "tokens.js", format: "javascript/es6" }],
			},
			ios: {
				transformGroup: "tokens-studio",
				buildPath: `tokens/build/${theme.id}/`,
				files: [
					{ destination: "Tokens.swift", format: "ios-swift/class.swift" },
				],
			},
			android: {
				transformGroup: "tokens-studio",
				buildPath: `tokens/build/${theme.id}/`,
				files: [
					{ destination: "colors.xml", format: "android/colors" },
					{ destination: "dimens.xml", format: "android/dimens" },
				],
			},
		},
	});

	await sd.buildAllPlatforms(); // top-level await OK in .mjs (Node ≥ 14)
}
