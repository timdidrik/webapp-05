import { faker } from "@faker-js/faker"
import { PrismaClient } from "@prisma/client"

import { type Item } from "@/types"

const prisma = new PrismaClient()

// Strategy: "closest" -> 
// https://fakerjs.dev/api/word.html
// The strategy to apply when no words with a matching length are found.
// Here: Returns any of the words closest to the given length
const createItem = (): Item => {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.word({
      length: { min: 5, max: 10 },
      strategy: "closest",
    }),
    slug: faker.lorem.slug(10),
  }
}

async function main() {
  await prisma.bucket.create({
    data: {
      title: "First bucket",
      description: "My bucket description",
      status: "draft",
    },
  })
  const publishedBucket = await prisma.bucket.create({
    data: {
      title: "Second bucket",
      description: "My second bucket description",
      status: "published",
    },
  })

  const items = Array(10).fill(null).map(createItem)

  for (const item of items) {
    await prisma.item.create({
      data: {
        ...item,
        bucket: {
          connect: {
            id: publishedBucket.id,
          },
        },
      },
    })
  }
}

main().catch((err) => {
  console.error("Failed seed", err)
})
