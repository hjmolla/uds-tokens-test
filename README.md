# uds-tokens-test

This repository demonstrates a basic setup for managing design tokens using [Tokens Studio](https://tokens.studio/) and [Style Dictionary](https://amzn.github.io/style-dictionary/).

- Tokens are stored using the [Design Tokens Community Group (DTCG)](https://github.com/design-tokens/community-group) format inside the `tokens/` folder.
- `style-dictionary` is used to generate platform specific token files for web, iOS and Android.
- A small script is included to fetch tokens directly from a Figma file that uses Tokens Studio.

## Getting started

1. Install dependencies:

```sh
npm install
```

2. Optionally pull the latest tokens from Figma. Provide your Figma API token and file key as environment variables:

```sh
FIGMA_TOKEN=your-token FIGMA_FILE_KEY=your-file npm run pull-figma
```

The raw Figma response will be written to `tokens/figma-raw.json` (this file is ignored by Git). You can use Tokens Studio's "sync with repository" features to export tokens in DTCG format.

3. Build tokens for all platforms:

```sh
npm run build
```

The generated files are written to the `build/` directory:

- `build/web/variables.css`
- `build/ios/tokens.json`
- `build/android/tokens.xml`

These files can be consumed by your different platforms or published as a package.
