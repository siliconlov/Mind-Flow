import { useState, useEffect } from 'react';
import { Search, FileText } from 'lucide-react';
import { API_URL } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

interface Note {
    id: string;
    title: string;
    content: string;
    updatedAt: string;
}

interface SearchViewProps {
    onSelectNote: (note: Note) => void;
}

export function SearchView({ onSelectNote }: SearchViewProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Note[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        const searchNotes = async () => {
            if (!query.trim() || !token) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(`${API_URL}/notes/search?q=${encodeURIComponent(query)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(searchNotes, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);
    }, [query, token]);

    return (
        <div className="flex-1 h-full overflow-y-auto bg-background p-12">
            <div className="max-w-3xl mx-auto space-y-8">

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search your mind..."
                        className="w-full bg-surface border border-white/10 rounded-xl py-4 pl-14 pr-4 text-xl text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                        autoFocus
                    />
                </div>

                <div className="space-y-4">
                    {isSearching ? (
                        <div className="text-center text-slate-500 py-8">Searching...</div>
                    ) : results.length > 0 ? (
                        results.map(note => (
                            <div
                                key={note.id}
                                onClick={() => onSelectNote(note)}
                                className="group p-6 rounded-xl border border-white/5 hover:bg-white/5 hover:border-primary/30 cursor-pointer transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-surface text-primary">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">
                                            {note.title || "Untitled Note"}
                                        </h3>
                                        <p className="text-sm text-slate-400 line-clamp-2 font-mono">
                                            {note.content || "Empty note..."}
                                        </p>
                                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                                            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : query && (
                        <div className="text-center text-slate-500 py-8">
                            No notes found matching "{query}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
