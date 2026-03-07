import CustomCursor from "@/components/CustomCursor";
import StickyFooter from "@/components/StickyFooter";
import FloatingSquares from "@/components/FloatingSquares";
import FadeInSection from "@/components/FadeInSection";
import InteractiveLogo from "@/components/InteractiveLogo";

export const metadata = {
  title: "SecondCortex — AI-Powered Development Companion",
  description:
    "SecondCortex tracks your coding context in real time, giving your AI tools the memory they need to truly understand your workflow.",
};

export default function Home() {
  return (
    <main className="bg-background text-foreground cursor-none selection:bg-white selection:text-black">
      <CustomCursor />
      <FloatingSquares />

      {/* ───── Hero Section ───── */}
      <FadeInSection>
        <span className="text-xs uppercase tracking-[0.3em] mb-6 text-muted-foreground font-mono">
          [AI Context Engine]
        </span>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif max-w-5xl leading-[1.1] tracking-tight">
          Your code has context.
          <br />
          <span className="italic opacity-70">Now your AI does too.</span>
        </h1>
        <p className="max-w-xl text-muted-foreground mt-8 text-base md:text-lg leading-relaxed">
          SecondCortex captures every edit, every commit, every reasoning thread
          — building a live knowledge graph that follows you across tools and
          sessions.
        </p>
      </FadeInSection>

      {/* ───── Philosophy Section ───── */}
      <FadeInSection>
        <span className="text-xs uppercase tracking-[0.3em] mb-6 text-muted-foreground font-mono">
          [The Problem]
        </span>
        <h2 className="text-4xl md:text-6xl font-serif max-w-4xl leading-tight tracking-tight">
          AI assistants forget everything the moment you close the tab.
        </h2>
        <p className="max-w-xl text-muted-foreground mt-8 text-base leading-relaxed">
          Every prompt starts from zero. Every session is a blank slate.
          SecondCortex gives your tools persistent, structured memory — so your
          AI companion understands not just what you typed, but{" "}
          <em className="text-foreground">why</em>.
        </p>
      </FadeInSection>

      {/* ───── Features Section ───── */}
      <FadeInSection>
        <span className="text-xs uppercase tracking-[0.3em] mb-6 text-muted-foreground font-mono">
          [Core Capabilities]
        </span>
        <h2 className="text-4xl md:text-6xl font-serif mb-16 tracking-tight">
          Built Different
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl text-left">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold tracking-wide">
              Live Context Graph
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every file, function, and commit becomes a node in a real-time
              knowledge graph — visible and explorable.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold tracking-wide">
              Session Memory
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your coding context persists across IDE sessions, branches, and
              even machines. No more &quot;let me re-explain&quot;.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold tracking-wide">
              VS Code Extension
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seamless integration into your existing workflow. Zero
              configuration. Install and forget — it just works.
            </p>
          </div>
        </div>
      </FadeInSection>

      {/* ───── Stats / Trust Section ───── */}
      <FadeInSection>
        <span className="text-xs uppercase tracking-[0.3em] mb-6 text-muted-foreground font-mono">
          [By The Numbers]
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl">
          {[
            { value: "10×", label: "Faster Context Switching" },
            { value: "∞", label: "Session Memory" },
            { value: "0ms", label: "Setup Time" },
            { value: "24/7", label: "Context Tracking" },
          ].map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-serif tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </FadeInSection>

      {/* ───── CTA Section ───── */}
      <FadeInSection>
        <span className="text-xs uppercase tracking-[0.3em] mb-6 text-muted-foreground font-mono">
          [Join The Future]
        </span>
        <h2 className="text-4xl md:text-6xl font-serif max-w-3xl leading-tight tracking-tight">
          Stop re-explaining your codebase to AI.
        </h2>
        <p className="max-w-lg text-muted-foreground mt-6 text-base leading-relaxed">
          Get started with SecondCortex today and give your AI tools the context
          they deserve.
        </p>
      </FadeInSection>

      {/* ───── Interactive Logo Section (White BG) ───── */}
      <InteractiveLogo />

      <StickyFooter />
    </main>
  );
}
