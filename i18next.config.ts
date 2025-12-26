import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: [
    "en"
  ],
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "src/locales/{{language}}.json",

    /** Glob pattern(s) for files to ignore during extraction */
    ignore: ['node_modules/**'],
    
    // Combine all namespaces into a single file per language (e.g., locales/en.ts)
    // Note: `output` path must not contain `{{namespace}}` when this is true.
    mergeNamespaces: true, 
    
    // Translation functions to detect. Defaults to ['t', '*.t'].
    // Supports wildcards for suffixes.
    functions: ['t', '*.t', 'i18next.t'],
  }
});