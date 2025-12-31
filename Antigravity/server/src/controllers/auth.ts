import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

import { sendWelcomeEmail } from '../services/email';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        // Send Welcome Email (async, don't await/block response)
        sendWelcomeEmail(email, name || 'Dreamer').catch(err => console.error("Email failed:", err));

        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, credits: user.credits } });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: 'User registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.deletedAt) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, email: user.email, name: user.name, credits: user.credits } });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const deleteAccount = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        await prisma.user.update({
            where: { id: userId },
            data: { deletedAt: new Date() }
        });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};
