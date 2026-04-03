import { useState, useEffect } from "react";
import { Sparkles, Route, Target } from "lucide-react";

const textStr = "You bring the skills, we bring the opportunities.";

const features = [
  { icon: Target, text: "Smart Internship Matching", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { icon: Sparkles, text: "AI Career Coach", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: Route, text: "Personalized Roadmaps", color: "text-violet-400", bg: "bg-violet-500/10" }
];

export default function AuthLeft() {
  const [mounted, setMounted] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typewriter and initial mount animation
  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 100);
    
    const startDelay = setTimeout(() => {
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex <= textStr.length) {
          setDisplayText(textStr.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 50); 
      return () => clearInterval(typeInterval);
    }, 400);

    return () => {
      clearTimeout(timeout);
      clearTimeout(startDelay);
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 h-full px-2 sm:px-6 md:px-10 py-10">
      
      {/* Top Section - Title & Subtitle */}
      <div className={`mt-4 lg:mt-8 transition-all duration-700 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="brand-title">InternLink.</h1>
        
        {/* Typewriter text container with generous fixed min-height */}
        <div className="min-h-[4rem] sm:min-h-[5rem] mt-6 mb-12">
          <p className="brand-text font-mono text-slate-300">
            {displayText}
            <span 
              className={`inline-block ml-1 w-[3px] h-[1.1em] bg-white align-middle transition-opacity duration-75 ${showCursor ? 'opacity-100' : 'opacity-0'}`} 
            />
          </p>
        </div>
      </div>

      {/* Middle Section - Features list with increased gap and padding */}
      <div className="flex flex-col gap-6 mt-6 mb-auto">
        {features.map((feature, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-5 bg-white/[0.03] border border-white/5 rounded-2xl p-5 backdrop-blur-md transition-all duration-700 ease-out"
            style={{ 
              opacity: mounted ? 1 : 0, 
              transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
              transitionDelay: `${idx * 150 + 600}ms` 
            }}
          >
            <div className={`p-4 rounded-xl ${feature.bg}`}>
              <feature.icon className={feature.color} size={24} />
            </div>
            <span className="text-slate-200 font-medium font-sans text-[16px] tracking-wide">
              {feature.text}
            </span>
          </div>
        ))}
      </div>
      
      {/* Bottom Section - Pushed to the bottom via mb-auto sibling */}
      <div 
        className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-auto mb-2 opacity-60 transition-all duration-1000 delay-1000"
        style={{ opacity: mounted ? 0.6 : 0, width: mounted ? '4rem' : '0' }}
      ></div>
      
    </div>
  );
}
