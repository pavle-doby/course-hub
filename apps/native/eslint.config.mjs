import { config } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  { ignores: [".expo/**", "ios/**", "android/**", "expo-env.d.ts"] },
  // Metro / Babel / Tailwind configs run in Node as CommonJS
  {
    files: ["*.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { require: "readonly", module: "writable", __dirname: "readonly" },
    },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
];
