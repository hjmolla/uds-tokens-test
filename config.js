import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

register(StyleDictionary);

export default {
  source: ['tokens/**/*.json'],
  preprocessors: ['tokens-studio'],
  platforms: {
    web: {
      transformGroup: 'tokens-studio',
      buildPath: 'build/web/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables'
        }
      ]
    },
    ios: {
      transformGroup: 'tokens-studio',
      buildPath: 'build/ios/',
      files: [
        {
          destination: 'tokens.json',
          format: 'json'
        }
      ]
    },
    android: {
      transformGroup: 'tokens-studio',
      buildPath: 'build/android/',
      files: [
        {
          destination: 'tokens.xml',
          format: 'android/resources'
        }
      ]
    }
  }
};
