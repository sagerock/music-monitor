import { prisma } from '../db/client';

async function clearLastFetched() {
  const result = await prisma.artistSocial.updateMany({
    where: { platform: 'instagram' },
    data: { lastFetched: null }
  });
  console.log(`Cleared Instagram last fetched times for ${result.count} profiles`);
  await prisma.$disconnect();
}

clearLastFetched();