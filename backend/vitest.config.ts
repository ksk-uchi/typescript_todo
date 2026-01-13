import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()], // これで tsconfig の paths を自動認識します
  test: {
    globals: true,
    environment: "node",
  },
});
