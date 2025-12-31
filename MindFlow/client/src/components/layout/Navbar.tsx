import { useState, useEffect } from 'react';
import { Bot, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="p-2 rounded-xl bg-gradient-to-tr from-primary to-accent group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-500">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        MindFlow
                    </span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {['Features', 'Solutions', 'Pricing', 'Blog'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group">
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Sign In
                    </Link>
                    <Link to="/register" className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-slate-200 transition-all transform hover:scale-105 active:scale-95">
                        Get Started
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <div className="md:hidden">
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300">
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-surface border-b border-white/10 p-6 md:hidden flex flex-col gap-4"
                    >
                        {['Features', 'Solutions', 'Pricing', 'Blog'].map((item) => (
                            <a key={item} href="#" className="text-slate-300 hover:text-white text-lg font-medium">
                                {item}
                            </a>
                        ))}
                        <hr className="border-white/10 my-2" />
                        <button className="w-full py-3 rounded-lg bg-primary text-white font-semibold">
                            Get Started
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
