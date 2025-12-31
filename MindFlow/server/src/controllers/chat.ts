import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const chatWithAI = async (req: AuthRequest, res: Response) => {
    try {
        const { message } = req.body;
        const userId = req.user?.id;

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        if (!process.env.PERPLEXITY_API_KEY) {
            console.warn('PERPLEXITY_API_KEY is not set');
            res.status(500).json({ error: 'AI service not configured' });
            return;
        }

        // Check and Deduct Credits
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (user.credits <= 0) {
            res.status(403).json({ error: 'Insufficient credits. Please upgrade your plan.' });
            return;
        }

        // Deduct 1 credit
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 1 } }
        });

        // 1. Context Retrieval
        const keywords = message.split(' ').filter((w: string) => w.length > 3);
        let contextNotes: any[] = [];
        if (keywords.length > 0) {
            contextNotes = await prisma.note.findMany({
                where: {
                    userId: userId,
                    OR: keywords.map((k: string) => ({
                        OR: [
                            { title: { contains: k } },
                            { content: { contains: k } }
                        ]
                    }))
                },
                take: 3
            });
        }

        const contextSummary = contextNotes.map((n: any) => `- ${n.title}: ${n.content.substring(0, 100)}...`).join('\n');

        // 2. Perplexity API Call
        const systemPrompt = `You are a helpful "Second Brain" assistant.
        
        INSTRUCTIONS FOR FORMATTING:
        1. STRUCTURE YOUR ANSWER: Use clear H2 headers (Markdown ##) for main sections.
        2. USE SUBPARTS: Break down complex explanations into bullet points or numbered lists.
        3. AVOID WALLS OF TEXT: Keep paragraphs short (max 2-3 sentences).
        4. BE VISUAL: Use bold text for key terms.
        
        Here are some relevant notes from the user's knowledge base:
        ${contextSummary}
        
        Answer the user's identifying query using the notes if relevant. If not, answer generally but maintain the rigorous structure described above.`;

        // Setup SSE Headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Send Metadata immediately
        const metadata = {
            type: 'metadata',
            credits: updatedUser.credits,
            context: contextNotes
        };
        res.write(`data: ${JSON.stringify(metadata)}\n\n`);

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "sonar-pro",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                stream: true
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Perplexity API Error:', errorText);
            res.write(`data: ${JSON.stringify({ type: 'error', text: 'AI Provider Error' })}\n\n`);
            res.end();
            return;
        }

        if (!response.body) {
            res.end();
            return;
        }

        // Process Stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Keep the last incomplete line in buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;

                const dataStr = trimmed.slice(6);
                if (dataStr === '[DONE]') continue;

                try {
                    const json = JSON.parse(dataStr);
                    let content = json.choices[0]?.delta?.content || '';

                    if (content) {
                        // Remove citation numbers like [1], [12], etc.
                        content = content.replace(/\[\d+\]/g, '');
                        // Only send if there's still content left (optional, but good practice)
                        if (content) {
                            res.write(`data: ${JSON.stringify({ type: 'delta', text: content })}\n\n`);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing SSE chunk', e);
                }
            }
        }

        res.end();

    } catch (error) {
        console.error('Error in chat:', error);
        if (!res.headersSent) { // If headers not sent, we can send error json, else we must end stream
            res.status(500).json({ error: 'Failed to process chat' });
        } else {
            res.end();
        }
    }
};
