import prisma from '../prisma';

export async function processNoteLinks(sourceNoteId: string, content: string, userId: string) {
    // 1. Extract [[WikiLinks]]
    const linkRegex = /\[\[(.*?)\]\]/g;
    const matches = [...content.matchAll(linkRegex)];
    const targetTitles = [...new Set(matches.map(m => m[1]))]; // Deduplicate

    // 2. Clear existing manual links to regenerate them (avoids duplicates/stale links)
    await prisma.link.deleteMany({
        where: {
            sourceId: sourceNoteId,
            type: 'manual'
        }
    });

    for (const title of targetTitles) {
        if (!title.trim()) continue;

        // 3. Find or Create target note
        // We look for a note by this user with this title
        let targetNote = await prisma.note.findFirst({
            where: {
                title: title,
                userId: userId
            }
        });

        if (!targetNote) {
            // Create "Ghost Note" or just a placeholder note
            targetNote = await prisma.note.create({
                data: {
                    title: title,
                    content: '', // Empty content for now
                    userId: userId,
                }
            });
        }

        // 4. Create Link
        // Prevent self-linking
        if (targetNote.id !== sourceNoteId) {
            await prisma.link.create({
                data: {
                    sourceId: sourceNoteId,
                    targetId: targetNote.id,
                    type: 'manual'
                }
            });
        }
    }
}
