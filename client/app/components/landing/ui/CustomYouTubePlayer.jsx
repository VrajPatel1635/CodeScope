"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CustomYouTubePlayer
 * Bypasses the standard YouTube <iframe> to use the JavaScript IFrame API.
 * This allows us to completely hide all YouTube branding, controls, and end-video suggestions,
 * resulting in a highly premium, custom media experience.
 */
export default function CustomYouTubePlayer({ videoId }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Initialize YouTube API
  useEffect(() => {
    // If the API script isn't loaded yet, load it.
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Callback when the API is ready
    window.onYouTubeIframeAPIReady = initPlayer;

    // If it's already loaded, just init
    if (window.YT && window.YT.Player) {
      initPlayer();
    }

    function initPlayer() {
      // The YT.Player constructor replaces the div with an iframe
      // We must create a new div inside our container for YT to consume
      if (containerRef.current) {
        containerRef.current.innerHTML = '<div id="yt-player-target"></div>';
        
        playerRef.current = new window.YT.Player("yt-player-target", {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: {
            controls: 0,           // Hide all controls
            disablekb: 1,          // Disable keyboard shortcuts
            fs: 0,                 // No fullscreen button
            iv_load_policy: 3,     // Hide annotations
            modestbranding: 1,     // Minimal YouTube branding
            rel: 0,                // Do not show related videos from other channels
            showinfo: 0,           // Hide title (deprecated but good practice)
            playsinline: 1,        // Play inline on mobile
            // autoplay: 0,
          },
          events: {
            onReady: () => {
              setIsReady(true);
            },
            onStateChange: (event) => {
              // YT.PlayerState:
              // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.UNSTARTED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                // The magic trick to prevent "Related Videos" grid
                setIsPlaying(false);
                event.target.seekTo(0);
                event.target.pauseVideo();
              }
            },
          },
        });
      }
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);


  const togglePlay = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!playerRef.current || !isReady) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying, isReady]);

  const skipBackward = useCallback((e) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(Math.max(0, currentTime - 10));
  }, []);

  const skipForward = useCallback((e) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime();
    const duration = playerRef.current.getDuration();
    playerRef.current.seekTo(Math.min(duration, currentTime + 10));
  }, []);

  return (
    <div 
      className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center cursor-pointer group"
      onClick={togglePlay}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* The container that YT API will transform into an iframe */}
      <div 
        ref={containerRef} 
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'} pointer-events-none`}
        style={{ pointerEvents: 'none' }} // Crucial: prevents users from clicking through to YouTube pause/play which reveals UI
      />

      {/* Loading Skeleton */}
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-(--bg-elevated) z-10">
          <div className="w-8 h-8 border border-(--border-color) rounded-full flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 border-t border-r rounded-full animate-spin border-(--accent-secondary) transition-all duration-300" style={{ animationDuration: "2s" }} />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-(--text-muted)">Initializing Media Pipeline</span>
        </div>
      )}

      {/* Subtle vignette for contrast when controls are visible */}
      {isReady && (
        <AnimatePresence>
          {(isHovering || !isPlaying) && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.3 }}
               className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/80 via-black/10 to-transparent z-10"
            />
          )}
        </AnimatePresence>
      )}

      {/* Premium Floating Controls */}
      {isReady && (
        <AnimatePresence>
          {(isHovering || !isPlaying) && (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 px-6 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
            >
              {/* Skip Back 10s */}
              <button 
                onClick={skipBackward} 
                className="text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1 group/btn"
                aria-label="Rewind 10 seconds"
              >
                <svg className="w-5 h-5 group-hover/btn:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                </svg>
                <span className="text-[10px] font-mono tracking-widest hidden md:block">10s</span>
              </button>

              {/* Play / Pause */}
              <button 
                onClick={togglePlay} 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:bg-(--accent-primary) hover:text-white hover:scale-105 transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                 {isPlaying ? (
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                   </svg>
                 ) : (
                   <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M8 5v14l11-7z" />
                   </svg>
                 )}
              </button>

              {/* Skip Forward 10s */}
              <button 
                onClick={skipForward} 
                className="text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1 group/btn"
                aria-label="Forward 10 seconds"
              >
                <span className="text-[10px] font-mono tracking-widest hidden md:block">10s</span>
                <svg className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Persistent subtle indicator (e.g., when playing but not hovering) */}
      <AnimatePresence>
         {isPlaying && !isHovering && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute bottom-4 right-4 z-10 flex items-center gap-2"
           >
             <div className="flex gap-0.5 items-end h-3">
                <motion.div animate={{ height: ["40%", "100%", "40%"] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }} className="w-0.5 bg-white/40 rounded-full" />
                <motion.div animate={{ height: ["100%", "30%", "100%"] }} transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }} className="w-0.5 bg-white/40 rounded-full" />
                <motion.div animate={{ height: ["60%", "100%", "60%"] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="w-0.5 bg-white/40 rounded-full" />
             </div>
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
