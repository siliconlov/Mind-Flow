import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';
import { processNoteLinks } from '../utils/links';

export const getNotes = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { isFavorite } = req.query;

        const where: any = { userId: userId };
        if (isFavorite === 'true') {
            where.isFavorite = true;
        }

        const notes = await prisma.note.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                tags: true,
                links: true,
                backlinks: true
            },
        });
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
};

export const createNote = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, tags, isFavorite } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const newNote = await prisma.note.create({
            data: {
                title: title || 'Untitled Note',
                content: content || '',
                userId: userId,
                isFavorite: isFavorite || false,
                tags: {
                    connectOrCreate: (tags || []).map((tag: string) => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
            },
            include: {
                tags: true,
            }
        });

        await processNoteLinks(newNote.id, newNote.content, userId);

        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
};

export const updateNote = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, tags, isFavorite } = req.body;
        const userId = req.user?.id;

        const note = await prisma.note.findUnique({ where: { id } });
        if (!note || note.userId !== userId) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }

        const updatedNote = await prisma.note.update({
            where: { id },
            data: {
                title,
                content,
                isFavorite,
                updatedAt: new Date(),
                tags: {
                    set: [],
                    connectOrCreate: (tags || []).map((tag: string) => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
            },
            include: { tags: true }
        });

        if (userId) {
            await processNoteLinks(updatedNote.id, updatedNote.content, userId);
        }

        res.json(updatedNote);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const note = await prisma.note.findUnique({ where: { id } });
        if (!note || note.userId !== userId) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }

        await prisma.note.delete({ where: { id } });
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
};

export const getNote = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const note = await prisma.note.findUnique({
            where: { id },
            include: { tags: true }
        });

        if (!note || note.userId !== userId) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }

        res.json(note);
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
};

export const searchNotes = async (req: AuthRequest, res: Response) => {
    try {
        const { q } = req.query;
        const userId = req.user?.id;

        if (!q || typeof q !== 'string') {
            res.status(400).json({ error: 'Query parameter "q" is required' });
            return;
        }

        const notes = await prisma.note.findMany({
            where: {
                userId: userId,
                OR: [
                    { title: { contains: q } },
                    { content: { contains: q } }
                ]
            },
            take: 20,
            orderBy: { updatedAt: 'desc' }
        });

        res.json(notes);
    } catch (error) {
        console.error('Error searching notes:', error);
        res.status(500).json({ error: 'Failed to search notes' });
    }
};

export const getTags = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        // Get all tags used by the user's notes
        // Prisma doesn't support distinct on relation easily in findMany, 
        // but we can query Tags where valid notes exist
        const tags = await prisma.tag.findMany({
            where: {
                notes: {
                    some: {
                        userId: userId
                    }
                }
            },
            distinct: ['name']
        });
        res.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
};
