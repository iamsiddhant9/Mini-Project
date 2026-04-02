import { useState, useEffect, ReactElement } from "react";
import InternLinkLogo from "../assets/InternlinkLogo";
import introMusic from "../assets/intro.mp3";
import "./SplashScreen.css";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps): ReactElement {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Play music
    const audio = new Audio(introMusic);
    audio.play().catch(err => console.log("Audio playback error:", err));

    // Start boot sequence immediately
    let p = 0;
    const interval = setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsReady(true), 800);
        setTimeout(() => {
          audio.pause();
          onComplete();
        }, 1500);
      }
    }, 35); //  ~3.5s total + 1.5s padding = 5s total animation

    return () => {
      clearInterval(interval);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [onComplete]);

  return (
    <div className={`splash-overlay ${isReady ? "splash-exit" : ""}`}>
      <div className="splash-anim-container">
        <div className="splash-logo-wrap">
          <InternLinkLogo size={120} variant="splash" theme="dark" />
        </div>
        
        <div className="splash-loading-bar-wrap">
          <div className="splash-loading-bar" style={{ width: `${progress}%` }} />
          <div className="splash-loading-text">
            {progress < 30 ? "Initializing core..." : 
             progress < 60 ? "Linking neural pathways..." : 
             progress < 90 ? "Synthesizing market data..." : "System Ready."}
          </div>
        </div>
        
        <div className="splash-bg-glow" />
      </div>
      <div className="splash-caption">
        Created by Siddhant , Rizwan , Vinit , Samarth
      </div>
    </div>
  );
}

