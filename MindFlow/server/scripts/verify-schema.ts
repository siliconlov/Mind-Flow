
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Attempt to create a user with deletedAt (will fail if field doesn't exist)
        // Actually, just checking if we can query it or if the types are updated is hard at runtime without compilation.
        // Let's try to query the table info using raw SQL since we used sqlite.

        const result = await prisma.$queryRaw`PRAGMA table_info(User);`;
        console.log('User Table Config:', result);

        const noteResult = await prisma.$queryRaw`PRAGMA table_info(Note);`;
        console.log('Note Table Config:', noteResult);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
