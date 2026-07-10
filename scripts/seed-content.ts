import "dotenv/config";
import { prisma } from "../lib/prisma";
import { faqItems } from "../data/faq";
import { ruleSections } from "../data/rules";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function main() {
  await Promise.all(
    faqItems.map((item, index) =>
      prisma.faqItem.upsert({
        where: { slug: item.id },
        update: {},
        create: {
          slug: item.id,
          question: item.question,
          note: "Standard FAQ",
          answer: item.answer,
          sortOrder: (index + 1) * 10,
        },
      }),
    ),
  );

  await Promise.all(
    ruleSections.map((section, index) =>
      prisma.ruleSet.upsert({
        where: { slug: section.id || slugify(section.title) },
        update: {},
        create: {
          slug: section.id || slugify(section.title),
          title: section.title,
          summary: section.summary,
          content: section.rules.join("\n"),
          rules: section.rules,
          sortOrder: (index + 1) * 10,
        },
      }),
    ),
  );

  console.log("FAQ and rules content seeded");
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Ukendt content seed-fejl";
    console.error(`Content seed failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
