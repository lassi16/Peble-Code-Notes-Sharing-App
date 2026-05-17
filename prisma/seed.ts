import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@peblo.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@peblo.app",
      passwordHash,
    },
  });

  await prisma.note.deleteMany({ where: { userId: user.id } });

  const notes = [
    {
      title: "Sprint Planning Notes",
      content: `Weekly project planning discussion for Q2 launch.

## Goals
- Finalize UI mockups by Friday
- Review API structure with backend team
- Schedule design review Monday

## Decisions
- Ship MVP with core notes + AI features
- Defer realtime collaboration to v2`,
      tags: JSON.stringify(["work", "meeting", "sprint"]),
      category: "work",
      aiSummary:
        "Weekly sprint planning covering Q2 launch goals, UI mockups, and API review timeline.",
      aiActionItems: JSON.stringify([
        "Prepare UI mockups",
        "Review API structure",
        "Schedule design review",
      ]),
      suggestedTitle: "Sprint Planning Notes",
      isPublic: true,
      shareId: "demo-share-01",
    },
    {
      title: "Product Ideas",
      content: `Brainstorm for kids learning features:
- AI buddy that explains stories
- Quiz mode after animated episodes
- Parent dashboard for progress`,
      tags: JSON.stringify(["ideas", "product"]),
      category: "ideas",
    },
    {
      title: "Meeting Notes - Design Sync",
      content: "Discussed color palette and mascot. Team prefers purple + coral accents.",
      tags: JSON.stringify(["work", "design"]),
      category: "meetings",
    },
  ];

  for (const note of notes) {
    await prisma.note.create({
      data: { userId: user.id, ...note },
    });
  }

  await prisma.aiUsage.create({
    data: { userId: user.id, type: "summary" },
  });

  console.log("Seed complete!");
  console.log("  Email:    demo@peblo.app");
  console.log("  Password: demo1234");
  console.log("  Shared:   /shared/demo-share-01");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
