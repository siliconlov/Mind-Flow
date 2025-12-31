
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Cleaning up database...');

        // Delete in order of dependencies
        await prisma.link.deleteMany({});
        console.log('Deleted Links');

        // Notes must be deleted before Users. 
        // Tags are many-to-many with Notes. 
        // We should delete Notes first. 
        // (Implicit join table records are deleted by Prisma)
        await prisma.note.deleteMany({});
        console.log('Deleted Notes');

        await prisma.tag.deleteMany({});
        console.log('Deleted Tags');

        await prisma.user.deleteMany({});
        console.log('Deleted Users');

        console.log('Database cleanup completed successfully.');
    } catch (error) {
        console.error('Error cleaning up password:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
