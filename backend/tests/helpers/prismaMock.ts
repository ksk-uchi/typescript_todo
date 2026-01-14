import { PrismaClient } from "@/generated/prisma/client";
import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { prisma } from "@/utils/prisma";

// 実際のインスタンスをモックに差し替える
vi.mock("@/utils/prisma", () => ({
  prisma: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
