import { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Star } from 'lucide-react';

import { api } from '../../api/client';

interface Note {
    id: string;
    title: string;
    content: string;
    tags?: { id: string; name: string }[];
    updatedAt: string;
    isFavorite: boolean;
}

interface EditorProps {
    note: Note | null;
    onUpdate: (note: Note) => void;
}

export function Editor({ note, onUpdate }: EditorProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [placeholder, setPlaceholder] = useState("Start writing... (Markdown supported)");

    const WRITING_PROMPTS = [
        "What's on your mind today?",
        "Describe a new idea you had...",
        "What did you learn today?",
        "Draft your next big project...",
        "Journal your thoughts...",
        "Write about a goal you want to achieve.",
        "What are you grateful for right now?",
        "Brainstorm ideas for...",
        " Notes on...",
    ];

    useEffect(() => {
        setPlaceholder(WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)]);
    }, [note?.id]); // Change prompt when note changes

    // Debounce Ref
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Update local state when note prop changes
    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
        } else {
            setTitle("");
            setContent("");
        }
    }, [note]);

    const handleSave = async (newTitle: string, newContent: string) => {
        if (!note) return;
        setIsSaving(true);
        try {
            const res = await api.updateNote(note.id, { title: newTitle, content: newContent });
            if (res.ok) {
                const updated = await res.json();
                onUpdate(updated);
            }
        } catch (err) {
            console.error("Failed to save", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!note) return;
        const newIsFavorite = !note.isFavorite;
        // Optimistic update logic could be handled by parent, but here we just call API
        try {
            const res = await api.updateNote(note.id, {
                title: note.title,
                content: note.content,
                isFavorite: newIsFavorite
            });
            if (res.ok) {
                const updated = await res.json();
                onUpdate(updated);
            }
        } catch (err) {
            console.error("Failed to toggle favorite", err);
        }
    };

    const handleChange = (type: 'title' | 'content', value: string) => {
        if (type === 'title') setTitle(value);
        if (type === 'content') setContent(value);

        const newTitle = type === 'title' ? value : title;
        const newContent = type === 'content' ? value : content;

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout (Auto-save after 1.5s)
        timeoutRef.current = setTimeout(() => {
            handleSave(newTitle, newContent);
        }, 1500);
    };

    if (!note) {
        return (
            <div className="flex-1 h-full flex items-center justify-center text-slate-500">
                Select a note to start writing.
            </div>
        );
    }

    return (
        <div className="flex-1 h-full overflow-y-auto bg-background p-12">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Status Indicator */}
                <div className="flex items-center justify-between">
                    <div className="h-4 text-xs text-slate-500">
                        {isSaving ? "Saving..." : "Saved"}
                    </div>
                    <button
                        onClick={handleToggleFavorite}
                        className={`p-2 rounded-lg transition-all ${note.isFavorite ? 'text-yellow-500 bg-yellow-500/10' : 'text-slate-600 hover:text-yellow-500 hover:bg-white/5'}`}
                        title={note.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                        <Star className={`w-5 h-5 ${note.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Title */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full bg-transparent text-5xl font-bold text-white placeholder-slate-600 focus:outline-none"
                    placeholder="Untitled"
                />

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>

                {/* Content Area - Split View (Simple for now, just edit) */}
                <TextareaAutosize
                    minRows={10}
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('content', e.target.value)}
                    className="w-full bg-transparent text-lg text-slate-300 leading-relaxed focus:outline-none resize-none placeholder-slate-600 font-mono"
                    placeholder={placeholder}
                />

                {/* Use ReactMarkdown if you want a preview mode later */}
            </div>
        </div>
    );
}
