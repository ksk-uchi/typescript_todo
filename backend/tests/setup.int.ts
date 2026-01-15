import { execSync } from "node:child_process";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "root_password";
const DB_NAME = process.env.DB_NAME || "test_todo_db";

export async function setup() {
  // 管理用クライアントの接続設定
  const adminAdapter = new PrismaMariaDb({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    allowPublicKeyRetrieval: true, // 不要な場合は削除
    connectionLimit: 5,
  });
  const adminClient = new PrismaClient({ adapter: adminAdapter });

  try {
    console.log(`Ensuring database '${DB_NAME}' exists...`);
    // CREATE DATABASE IF NOT EXISTS は、存在しない場合にのみデータベースを作成します。
    await adminClient.$executeRawUnsafe(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`,
    );
    console.log(`Database '${DB_NAME}' is ready.`);
  } catch (error) {
    console.error("Error creating or ensuring database:", error);
    throw error; // エラーを再スローしてテストを中断させる
  } finally {
    await adminClient.$disconnect();
  }

  // 2. スキーマを反映
  console.log(`🚀 Applying schema to ${DB_NAME}...`);
  // CLI は process.env.DATABASE_URL を参照して動く
  try {
    execSync("pnpm prisma db push --accept-data-loss", {
      stdio: "inherit", // ログを表示させる
      env: { ...process.env }, // 現在の環境変数を引き継ぐ
    });
    console.log("Prisma schema applied successfully.");
  } catch (error) {
    console.error("Error applying Prisma schema:", error);
    throw error; // エラーを再スローしてテストを中断させる
  }
}
