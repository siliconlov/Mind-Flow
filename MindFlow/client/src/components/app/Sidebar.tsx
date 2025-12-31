

import { Home, Search, PlusSquare, Settings, Star, Hash, ChevronRight, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useEffect } from 'react';

interface Note {
    id: string;
    title: string;
    updatedAt: string;
}

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    notes: Note[];
    onSelectNote: (note: Note) => void;
    onNewNote: () => void;
    onDeleteNote: (id: string) => void;
}

export function Sidebar({ activeTab, setActiveTab, notes, onSelectNote, onNewNote, onDeleteNote }: SidebarProps) {
    const { logout } = useAuth();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [tags, setTags] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.getTags().then(res => res.json()).then(setTags).catch(console.error);
    }, [notes]); // Refresh tags when notes change

    const handleLogout = () => {
        navigate('/');
        logout();
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone immediately, though data is soft-deleted.')) return;
        try {
            await api.deleteAccount();
            handleLogout();
        } catch (error) {
            console.error('Failed to delete account:', error);
            alert('Failed to delete account');
        }
    };
    return (
        <aside className="w-64 border-r border-white/5 bg-background flex flex-col h-screen">

            {/* User / Workspace */}
            <div className="p-4 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent" />
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">Preet's Mind</h3>
                    <p className="text-xs text-slate-400">Free Plan</p>
                </div>
            </div>

            {/* Primary Actions */}
            <div className="p-4 space-y-2">
                <button
                    onClick={onNewNote}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'editor' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <PlusSquare className="w-4 h-4" />
                    New Note
                </button>
                <button
                    onClick={() => setActiveTab('search')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'search' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Search className="w-4 h-4" />
                    Search
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'chat' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <div className="w-4 h-4 flex items-center justify-center">✨</div>
                    AI Chat
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Library</h4>
                    <nav className="space-y-1">
                        <NavItem
                            icon={<Home className="w-4 h-4" />}
                            label="All Notes"
                            active={activeTab === 'list'}
                            onClick={() => setActiveTab('list')}
                        />
                        <NavItem
                            icon={<Star className="w-4 h-4" />}
                            label="Favorites"
                            active={activeTab === 'favorites'}
                            onClick={() => setActiveTab('favorites')}
                        />
                        <div className="pt-2">
                            <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                                <Hash className="w-3 h-3" /> Tags
                            </h5>
                            <div className="space-y-0.5">
                                {tags.map(tag => (
                                    <button
                                        key={tag.id}
                                        onClick={() => setActiveTab(`tag:${tag.name}`)}
                                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === `tag:${tag.name}` ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Hash className="w-3 h-3 opacity-50" />
                                        {tag.name}
                                    </button>
                                ))}
                                {tags.length === 0 && (
                                    <p className="px-3 text-xs text-slate-600 italic">No tags yet</p>
                                )}
                            </div>
                        </div>
                    </nav>
                </div>

                <div className="px-4">
                    <div className="flex items-center justify-between px-2 mb-2 group cursor-pointer">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent</h4>
                        <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <div className="space-y-0.5">
                        {notes.slice(0, 5).map(note => (
                            <div key={note.id} className="relative group/item">
                                <button
                                    onClick={() => onSelectNote(note)}
                                    className="w-full text-left px-2 py-1.5 rounded-md text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors truncate pr-8"
                                >
                                    {note.title || "Untitled Note"}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to delete this note?')) {
                                            onDeleteNote(note.id);
                                        }
                                    }}
                                    className="absolute right-1 top-1.5 p-1 rounded hover:bg-red-500/20 text-slate-600 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/5 relative">
                <AnimatePresence>
                    {isSettingsOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-4 right-4 mb-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
                        >
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-3 text-slate-400 hover:bg-white/5 hover:text-slate-300 transition-colors text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                            <div className="h-px bg-white/5 my-1" />
                            <button
                                onClick={handleDeleteAccount}
                                className="w-full flex items-center gap-3 px-3 py-3 text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Account
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSettingsOpen ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Settings className="w-4 h-4" />
                    Settings
                </button>
            </div>
        </aside>
    );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}
