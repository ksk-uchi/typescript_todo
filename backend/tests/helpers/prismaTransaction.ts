import { prisma } from "@/utils/prisma";

let rollback: (() => void) | null = null;
const originalModels: Record<string, any> = {};

/**
 * Prismaの全モデルプロパティを取得するヘルパー
 */
const getModelNames = (client: any) => {
  return Object.getOwnPropertyNames(client).filter(
    (key) => !key.startsWith("$") && !key.startsWith("_"),
  );
};

export const startTransaction = async () => {
  return new Promise<void>((resolve, reject) => {
    // トランザクションを開始
    prisma
      .$transaction(async (tx) => {
        const modelNames = getModelNames(tx);

        // 1. オリジナルのモデル（実際のDB接続）を退避し、txで上書きする
        modelNames.forEach((model) => {
          originalModels[model] = (prisma as any)[model];
          (prisma as any)[model] = (tx as any)[model];
        });

        // 2. テストの実行を許可
        resolve();

        // 3. rollbackTransactionが呼ばれるまで、このプロミスを未完了のまま待機させる
        await new Promise<void>((waitResolve) => {
          rollback = waitResolve;
        });

        // 4. エラーを投げて強制的にロールバックさせる
        throw new Error("ROLLBACK");
      })
      .catch((err) => {
        if (err.message === "ROLLBACK") return;
        reject(err);
      });
  });
};

export const rollbackTransaction = async () => {
  // 待機状態のPromiseを解消し、エラーを投げさせる
  if (rollback) {
    rollback();
    rollback = null;

    // 元のモデル定義に戻す（クリーンアップ）
    const modelNames = Object.keys(originalModels);
    modelNames.forEach((model) => {
      (prisma as any)[model] = originalModels[model];
      delete originalModels[model];
    });
  }
};
