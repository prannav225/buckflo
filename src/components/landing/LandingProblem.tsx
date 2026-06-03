import { useEffect, useRef, useState } from "react";
import { EyeOff, HelpCircle, TrendingDown } from "lucide-react";
import { PixelBanner } from "../layout/PixelBanner";

export function LandingProblem() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const painPoints = [
    {
      title: "The Mid-Month Anxiety",
      text: "You open your bank app mid-month and feel vaguely anxious about the number.",
      icon: <EyeOff size={16} style={{ color: "var(--accent)" }} />,
    },
    {
      title: "The Food Guesswork",
      text: "You know you spent too much on food but you're not sure exactly how much.",
      icon: <HelpCircle size={16} style={{ color: "var(--accent)" }} />,
    },
    {
      title: "The Month-End Mystery",
      text: "The month ends and you're not sure where it went.",
      icon: <TrendingDown size={16} style={{ color: "var(--accent)" }} />,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="landing-problem-section py-24 sm:py-32 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      id="section-problem"
    >
      {/* Angled slash pixel banner — standardized to 1200x400 for consistent pixel sizing */}
      <div className="absolute top-[-100px] right-[-200px] w-[1200px] h-[400px] rotate-15 opacity-15 pointer-events-none select-none z-0 mask-[linear-gradient(to_bottom,black_20%,transparent_80%)]">
        <PixelBanner seed="problem-section" />
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center text-left">
          {/* Left Column — Branding and statement */}
          <div className="md:col-span-5 flex flex-col justify-center">
            <div className="landing-eyebrow mb-4">Sound Familiar?</div>
            <h2
              className="landing-headline mb-4"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                color: "#f5f5f3",
                lineHeight: 1.15,
              }}
            >
              Most people know roughly where their money goes.
            </h2>
            <p
              className="font-display text-3xl italic mb-6"
              style={{ color: "var(--accent)" }}
            >
              Roughly.
            </p>
            <div className="h-px w-12 bg-white/10 mb-6 hidden md:block" />
            <p
              className="font-display text-xl italic m-0 opacity-80"
              style={{ color: "#d1d1cf" }}
            >
              buckflo fixes the &lsquo;roughly&rsquo;.
            </p>
          </div>

          {/* Right Column — Pain point cards */}
          <div className="md:col-span-7 relative">
            {/* Ambient glow behind cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-(--accent) opacity-10 blur-[100px] pointer-events-none rounded-full" />

            <div className="flex flex-col gap-5 md:pl-8 relative z-10">
              {painPoints.map((point, i) => (
                <div
                  key={i}
                  className={`stagger-item relative overflow-hidden rounded-[1.25rem] p-6 text-left flex gap-5 items-start bg-white/5 border border-white/10 shadow-lg backdrop-blur-2xl ${
                    isVisible ? "visible" : ""
                  } ${i === 1 ? "md:translate-x-8" : ""}`}
                >
                  {/* Subtle inner top highlight */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent opacity-50" />

                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden"
                    style={{ background: "rgba(217, 119, 87, 0.15)" }}
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-50" />
                    {point.icon}
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <h4 className="text-base font-bold text-[#f5f5f3] m-0 tracking-tight">
                      {point.title}
                    </h4>
                    <p className="text-[13px] leading-relaxed text-[#d1d1cf] m-0">
                      {point.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
