# --- Build Stage ---
FROM node:25-slim AS builder

WORKDIR /app

# pnpm のインストール
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PATH="/app/node_modules/.bin:$PATH"
RUN npm install -g pnpm


# 依存関係定義のコピー
COPY package.json pnpm-lock.yaml ./

# 依存関係のインストール
# --frozen-lockfile は yarn install --immutable と同等の動作
RUN pnpm install --frozen-lockfile

# ソースコードのコピーとビルド
COPY . .
RUN pnpm build

# --- Production Stage ---
FROM node:25-slim
WORKDIR /app

# 実行に必要なファイルのみをコピー
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
