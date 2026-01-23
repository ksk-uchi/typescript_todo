// @ts-nocheck
import { prisma } from "@/utils/prisma";

async function main() {
  console.log("Start seeding 2000 todos...");

  const data = [];
  const now = Date.now();

  for (let i = 1; i <= 2000; i++) {
    const isDone = i % 10 === 0; // 10% done
    // Randomize time within last 30 days to test sorting
    const timeOffset = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
    const date = new Date(now - timeOffset);

    data.push({
      title: `Todo ${i}`,
      description: `Description for Todo ${i}`,
      done_at: isDone ? date : null,
      createdAt: date,
      updated_at: date,
    });
  }

  const batchSize = 1000;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await prisma.todo.createMany({
      data: batch,
    });
    console.log(
      `Inserted ${Math.min(i + batchSize, data.length)} / ${data.length}`,
    );
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
