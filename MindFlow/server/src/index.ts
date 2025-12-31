import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import chatRoutes from './routes/chat';
import { authenticateToken, AuthRequest } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/chat', chatRoutes);

// Helper to get or create a default user (Optional: kept for dev context if needed, but we should move to real auth)
// For now, let's fix the build error by adding a dummy password
async function getOrCreateDefaultUser() {
    // This function might be deprecated in favor of real login, but keeping it valid for now
    const EMAIL = 'demo@mindflow.app';
    let user = await prisma.user.findUnique({
        where: { email: EMAIL }
    });

    if (!user) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        user = await prisma.user.create({
            data: {
                email: EMAIL,
                password: hashedPassword,
                name: 'MindFlow User',
            }
        });
    }
    return user;
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
