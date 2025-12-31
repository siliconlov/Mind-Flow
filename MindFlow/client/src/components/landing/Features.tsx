import { Network, Sparkles, Zap, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        icon: <Network className="w-6 h-6 text-indigo-400" />,
        title: "Neural Linking",
        description: "Your notes auto-connect based on context, building a living knowledge graph.",
        colSpan: "md:col-span-2",
    },
    {
        icon: <Sparkles className="w-6 h-6 text-purple-400" />,
        title: "AI Synthesis",
        description: "Ask questions across your entire knowledge base and get instant answers.",
        colSpan: "md:col-span-1",
    },
    {
        icon: <Zap className="w-6 h-6 text-yellow-400" />,
        title: "Instant Capture",
        description: "Capture thoughts in milliseconds with global slash commands.",
        colSpan: "md:col-span-1",
    },
    {
        icon: <Brain className="w-6 h-6 text-pink-400" />,
        title: "Context Aware",
        description: "MindFlow understands the 'why' behind your notes, not just the text.",
        colSpan: "md:col-span-2",
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-background relative">
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Designed for the <span className="text-accent">Speed of Thought</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Traditional tools force you to be a librarian. MindFlow lets you be an explorer.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className={`${feature.colSpan} p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
