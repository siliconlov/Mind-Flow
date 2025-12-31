import { useState, useEffect } from 'react';
import { Sidebar } from '../components/app/Sidebar';
import { Editor } from '../components/app/EditorComponent';
import { GraphView } from '../components/app/GraphView';
import { SearchView } from '../components/app/SearchView';
import { ChatView } from '../components/app/ChatView';
import { Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';

export function DashboardPage() {
    const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'graph' | 'list' | 'search' | 'chat'
    const [showGraphOverlay, setShowGraphOverlay] = useState(false);
    const [notes, setNotes] = useState<any[]>([]);
    const [activeNote, setActiveNote] = useState<any | null>(null);
    const { token, logout, user } = useAuth();

    // Fetch notes on mount
    useEffect(() => {
        if (!token) return;
        api.getNotes()
            .then(res => {
                if (res.status === 401) logout();
                return res.json();
            })
            .then(data => {
                setNotes(data);
                if (data.length > 0 && !activeNote) setActiveNote(data[0]);
            })
            .catch(err => console.error('Failed to fetch notes:', err));
    }, [token, logout]);

    const handleNewNote = async () => {
        try {
            const res = await api.createNote({ title: 'Untitled Note', content: '' });
            const newNote = await res.json();
            setNotes([newNote, ...notes]);
            setActiveNote(newNote);
            setActiveTab('editor');
        } catch (err) {
            console.error("Failed to create note", err);
        }
    };
    const handleDeleteNote = async (noteId: string) => {
        try {
            const res = await api.deleteNote(noteId);

            if (res.ok) {
                const updatedNotes = notes.filter(n => n.id !== noteId);
                setNotes(updatedNotes);
                if (activeNote?.id === noteId) {
                    setActiveNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
                }
            }
        } catch (err) {
            console.error("Failed to delete note", err);
        }
    };

    const handleNoteUpdate = (updatedNote: any) => {
        setNotes(prevNotes => prevNotes.map(n => n.id === updatedNote.id ? updatedNote : n));
        setActiveNote(updatedNote); // Keep active note in sync
    };

    const handleSelectNote = (note: any) => {
        setActiveNote(note);
        setActiveTab('editor');
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-accent/30 font-sans">

            {/* Sidebar */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                notes={notes}
                onSelectNote={handleSelectNote}
                onNewNote={handleNewNote}
                onDeleteNote={handleDeleteNote}
            />

            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-col min-w-0">

                {/* Top Bar (Context Awareness) */}
                <div className="absolute top-4 right-4 z-20 flex gap-4 items-center">
                    {/* Credit Display */}
                    <div className="bg-surface/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Credits</span>
                        <span className={`text-sm font-bold font-mono ${(user?.credits ?? 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {user?.credits ?? 0}
                        </span>
                    </div>

                    {!showGraphOverlay && (
                        <button
                            onClick={() => setShowGraphOverlay(!showGraphOverlay)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                        >
                            <Maximize2 className="w-3 h-3" />
                            Graph Mode
                        </button>
                    )}
                </div>

                {/* View Switcher */}
                <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
                    {activeTab === 'editor' && (
                        <Editor note={activeNote} onUpdate={handleNoteUpdate} />
                    )}
                    {activeTab === 'graph' && (
                        <GraphView notes={notes} onNodeClick={handleSelectNote} />
                    )}
                    {activeTab === 'search' && (
                        <SearchView onSelectNote={handleSelectNote} />
                    )}
                    {activeTab === 'chat' && (
                        <ChatView />
                    )}
                    {(activeTab === 'list' || activeTab === 'favorites' || activeTab.startsWith('tag:')) && (
                        <div className="p-12 text-center text-slate-500 overflow-y-auto h-full">
                            <h2 className="text-2xl font-bold text-white mb-6 text-left">
                                {activeTab === 'list' ? 'All Notes' :
                                    activeTab === 'favorites' ? 'Favorites' :
                                        `Tag: ${activeTab.split(':')[1]}`}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {notes
                                    .filter(n => {
                                        if (activeTab === 'favorites') return n.isFavorite;
                                        if (activeTab.startsWith('tag:')) {
                                            const tagName = activeTab.split(':')[1];
                                            return n.tags?.some((t: any) => t.name === tagName);
                                        }
                                        return true;
                                    })
                                    .map(note => (
                                        <div
                                            key={note.id}
                                            onClick={() => handleSelectNote(note)}
                                            className="bg-surface p-4 rounded-xl border border-white/5 hover:border-primary/50 cursor-pointer transition-all text-left relative group"
                                        >
                                            <h3 className="font-bold text-white mb-2 pr-6">{note.title}</h3>
                                            <p className="text-sm text-slate-400 line-clamp-3">{note.content}</p>
                                            {note.isFavorite && (
                                                <div className="absolute top-4 right-4 text-yellow-500">
                                                    ★
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                {notes.filter(n => {
                                    if (activeTab === 'favorites') return n.isFavorite;
                                    if (activeTab.startsWith('tag:')) {
                                        const tagName = activeTab.split(':')[1];
                                        return n.tags?.some((t: any) => t.name === tagName);
                                    }
                                    return true;
                                }).length === 0 && (
                                        <div className="col-span-full text-center py-12">
                                            <p className="text-slate-500">No notes found.</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Graph Overlay (Split View Concept) */}
                <AnimatePresence>
                    {showGraphOverlay && (
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: "0%" }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute inset-y-0 right-0 w-1/2 bg-background border-l border-white/10 shadow-2xl z-30"
                        >
                            <div className="absolute top-4 right-4 z-40">
                                <button
                                    onClick={() => setShowGraphOverlay(false)}
                                    className="p-2 rounded-lg bg-surface hover:bg-white/10 text-white transition-colors"
                                >
                                    <Minimize2 className="w-4 h-4" />
                                </button>
                            </div>
                            <GraphView notes={notes} onNodeClick={handleSelectNote} />
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}
