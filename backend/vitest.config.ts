import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()], // これで tsconfig の paths を自動認識します
  test: {
    globals: true,
    environment: "node", // カスタム環境の場合は別途定義が必要です。標準のnode環境に変更します。
    globalSetup: ["./tests/setup.int.ts"],
    testTimeout: 100000,
    include: ["tests/**/*.test.ts"],
    // ファイル間の並列実行を無効化（直列実行を強制）
    fileParallelism: false,
    // 1つのプロセス/スレッド内で全テストを実行させる
    pool: "forks",
  },
});
