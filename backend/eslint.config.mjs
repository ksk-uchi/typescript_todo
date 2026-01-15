import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig({
  files: ["src/**/*.ts", "tests/**/*.ts"],
  extends: [eslint.configs.recommended, tseslint.configs.recommended],
  rules: {
    "@typescript-eslint/array-type": "error",
    // ...
  },
  ignores: ["tests/helpers/prismaTransaction.ts"],
});
