import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { api } from '../../api/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}



export function ChatView() {
    const { user, updateUser } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: "Hello! I am your Second Brain AI. Ask me anything about your notes." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Cancel previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Create a placeholder for AI message
        const aiMsgId = (Date.now() + 1).toString();
        const aiMsg: Message = { id: aiMsgId, role: 'assistant', content: '' };
        setMessages(prev => [...prev, aiMsg]);

        try {
            const res = await api.chatWithAI(userMsg.content, controller.signal);

            if (!res.ok) throw new Error(res.statusText);
            if (!res.body) throw new Error("No response body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith('data: ')) continue;

                    try {
                        const json = JSON.parse(trimmed.slice(6));

                        if (json.type === 'metadata') {
                            if (json.credits !== undefined && user) {
                                updateUser({ ...user, credits: json.credits });
                            }
                        } else if (json.type === 'delta') {
                            setMessages(prev => prev.map(msg =>
                                msg.id === aiMsgId
                                    ? { ...msg, content: msg.content + json.text }
                                    : msg
                            ));
                        } else if (json.type === 'error') {
                            setMessages(prev => prev.map(msg =>
                                msg.id === aiMsgId
                                    ? { ...msg, content: msg.content + "\n\n*[Error: " + json.text + "]*" }
                                    : msg
                            ));
                        }
                    } catch (e) {
                        console.error("Error parsing stream chunk", e);
                    }
                }
            }

        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Chat aborted');
                setMessages(prev => prev.map(msg =>
                    msg.id === aiMsgId
                        ? { ...msg, content: msg.content + " ... [Stopped]" }
                        : msg
                ));
            } else {
                console.error("Chat failed", err);
                setMessages(prev => prev.map(msg =>
                    msg.id === aiMsgId
                        ? { ...msg, content: msg.content + "\n\n*[Connection Error]*" }
                        : msg
                ));
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
        }
    };

    const credits = user?.credits ?? 0;

    return (
        <div className="flex-1 h-full flex flex-col bg-background">
            {/* Header with Credits */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-surface/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-primary">
                    <Bot className="w-5 h-5" />
                    <span className="font-semibold">AI Assistant</span>
                </div>
                <div className="text-sm">
                    <span className="text-slate-400">Credits: </span>
                    <span className={`font-mono font-bold ${credits > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {credits}
                    </span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-primary/20 text-primary' : 'bg-slate-700 text-white'
                            }`}>
                            {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                        </div>

                        <div className={`max-w-[85%] rounded-2xl px-6 py-4 ${msg.role === 'assistant'
                            ? 'bg-surface border border-white/5 text-slate-200 shadow-sm'
                            : 'bg-primary text-white shadow-md'
                            }`}>
                            <div className={`prose prose-invert max-w-none ${msg.role === 'assistant'
                                    ? 'prose-chat prose-p:text-slate-200 prose-headings:text-white prose-strong:text-white prose-ul:list-disc prose-ol:list-decimal'
                                    : 'prose-p:text-white'
                                }`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator (Only shown if waiting for FIRST chunk, optional, but good for latency) */}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="bg-surface border border-white/5 rounded-2xl px-5 py-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 bg-background">
                <div className="max-w-3xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && credits > 0 && !isLoading && handleSend()}
                        placeholder={credits > 0 ? "Ask your second brain..." : "Refill credits to continue chatting"}
                        className={`w-full bg-surface border border-white/10 rounded-xl py-4 pl-6 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors shadow-lg ${credits <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        autoFocus
                        disabled={credits <= 0}
                    />
                    <button
                        onClick={isLoading ? handleStop : handleSend}
                        disabled={(!input.trim() && !isLoading) || credits <= 0}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isLoading
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? (
                            <div className="w-3 h-3 bg-white rounded-sm" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
                {credits <= 0 && (
                    <div className="text-center mt-2 text-xs text-red-400">
                        You have run out of credits.
                    </div>
                )}
            </div>
        </div>
    );
}
