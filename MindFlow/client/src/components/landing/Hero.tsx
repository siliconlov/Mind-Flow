import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import dashboardPreview from '../../assets/dashboard_preview.png';

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-background">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background" />
                {/* Animated Particles (Neural Network Simulation) */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-accent/30 rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight
                        }}
                        animate={{
                            y: [null, Math.random() * -100],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            <div className="relative max-w-7xl mx-auto px-6 text-center z-10">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-accent-light text-sm font-medium mb-8 backdrop-blur-sm"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                    </span>
                    MindFlow AI v1.0 is Live
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
                >
                    Your Second Brain, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-pulse-slow">
                        Powered by AI.
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    Stop losing great ideas. MindFlow connects your thoughts, summarizes your
                    notes, and builds a knowledge graph that thinks with you.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-slate-200 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                        Start Thinking Free
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md flex items-center justify-center gap-2 group">
                        <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                        Watch Demo
                    </button>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="mt-20 relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-indigo-500/20"
                >
                    <img
                        src={dashboardPreview}
                        alt="MindFlow Dashboard Preview"
                        className="w-full h-auto"
                    />
                </motion.div>

            </div>
        </section>
    );
}
