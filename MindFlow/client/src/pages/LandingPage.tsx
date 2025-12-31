import { Navbar } from '../components/layout/Navbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { Pricing } from '../components/landing/Pricing';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <Pricing />
            </main>

            <footer className="py-8 text-center text-slate-600 text-sm border-t border-white/5">
                <p>© 2025 MindFlow AI. All rights reserved.</p>
            </footer>
        </div>
    );
}
