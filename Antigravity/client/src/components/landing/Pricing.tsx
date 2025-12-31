import { Check } from 'lucide-react';

const plans = [
    {
        name: "Starter",
        price: "$0",
        description: "For casual thinkers.",
        features: ["Up to 100 notes", "Basic Graph View", "Mobile App"],
        highlight: false,
    },
    {
        name: "Pro Mind",
        price: "$12",
        description: "For serious knowledge workers.",
        features: ["Unlimited Notes", "AI Synthesis (GPT-4)", "4K Export", "Priority Support"],
        highlight: true,
    },
    {
        name: "Team",
        price: "$29",
        description: "For collaborative brains.",
        features: ["Shared Graphs", "Team Permissioning", "API Access", "SSO"],
        highlight: false,
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-background border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Invest in your <span className="text-primary">Intellect</span>
                    </h2>
                    <p className="text-slate-400">
                        Start for free, upgrade as your second brain grows.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`relative p-8 rounded-3xl border ${plan.highlight
                                    ? 'bg-surface border-accent shadow-[0_0_40px_rgba(139,92,246,0.1)]'
                                    : 'bg-white/5 border-white/10'
                                } flex flex-col`}
                        >
                            {plan.highlight && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-wider">
                                    Most Popular
                                </span>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-slate-400">/mo</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-2">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feat) => (
                                    <li key={feat} className="flex items-center gap-3 text-slate-300 text-sm">
                                        <Check className="w-4 h-4 text-accent" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-3 rounded-xl font-bold transition-all ${plan.highlight
                                    ? 'bg-accent hover:bg-accent/90 text-white'
                                    : 'bg-white text-black hover:bg-slate-200'
                                }`}>
                                Choose {plan.name}
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
