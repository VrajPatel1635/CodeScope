"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const EASE = [0.76, 0, 0.24, 1]; // Cinematic blast-door ease curve

const FINAL_TEXT = "CODESCOPE";
const CHARS = "ABCDEF0123456789";

function DecryptText() {
  const [text, setText] = useState("A8F102C9B");

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setText((prev) =>
        prev
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return FINAL_TEXT[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      if (iteration >= FINAL_TEXT.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3;
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-xl md:text-2xl tracking-[0.5em] text-foreground uppercase ml-[0.5em] font-medium drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
      {text}
    </span>
  );
}

export default function PageLoader({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-100 pointer-events-none flex items-center justify-center overflow-hidden">
          
          {/* The Zooming Mask */}
          <motion.div
            style={{
              boxShadow: "0 0 0 9999px #040405",
            }}
            className="absolute top-1/2 left-1/2 w-[340px] h-[100px] ml-[-170px] mt-[-50px] flex items-center justify-center border border-transparent origin-center"
            initial={{ backgroundColor: "#040405", scale: 1 }}
            animate={{ 
              borderColor: "var(--accent-primary)", 
              boxShadow: "0 0 0 9999px #040405, 0 0 30px rgba(var(--accent-primary-rgb), 0.5) inset",
              transition: { delay: 1.5, duration: 0.1 } 
            }}
            exit={{ 
              backgroundColor: "transparent", 
              scale: 80, 
              opacity: 0,
              transition: { duration: 1.4, ease: EASE } 
            }}
          >
            {/* The Text Payload */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.5 } }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
            >
              <DecryptText />
            </motion.div>
            
            {/* Decryption Subtext */}
            <motion.div 
              className="absolute -bottom-6 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1.6, duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
              <span className="font-mono text-[8px] tracking-[0.4em] text-(--accent-primary) uppercase whitespace-nowrap">
                Handshake Established
              </span>
            </motion.div>
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
