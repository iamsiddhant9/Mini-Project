import { useEffect, useState } from "react";


const text = "Curated internships. Exceptional futures.Built to accelerate your career.Connecting students to internships that match their skills.";

export default function AuthLeft() {
 const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (displayText.length >= text.length) return;

    const timeout = setTimeout(() => {
      setDisplayText(text.slice(0, displayText.length + 1));
    }, 60);

    return () => clearTimeout(timeout);
  }, [displayText]);

  const isComplete = displayText.length === text.length;

  return (
    <>
      <h1 className="brand-title">InternLink..</h1>
      <p className="brand-text">
        {displayText}
       {!isComplete && <span className="cursor">✍️</span>} 
      </p>
    </>
  );
}
