"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import FujicamCard from "@/components/ui/FujicamCard";
import Link from "next/link";

interface Memory {
  id: string;
  src: string;
  year: string;
  date?: string;
}

interface Quote {
  id: string;
  text: string;
  author: string;
}

export default function ArchivePage() {
  const [items, setItems] = useState<{ memory: Memory; quote: Quote; rotation: number }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/memories");
        const memories = await response.json();
        
        const [quotesRes] = await Promise.all([
          fetch("/data/quotes.json"),
        ]);
        const quotes: Quote[] = await quotesRes.json();

        // Defensive check: If no memories are returned or data is invalid, set combined to empty
        if (!Array.isArray(memories) || memories.length === 0) {
          console.log("No memories found from Drive API.");
          setItems([]);
          setIsLoaded(true);
          return;
        }

        // Already sorted chronologically by the API
        const shuffledQuotes = [...quotes].sort(() => Math.random() - 0.5);

        // Pair them up with dynamic dates
        const combined = memories.map((memory: any, i: number) => ({
          memory,
          quote: shuffledQuotes[i % shuffledQuotes.length],
          rotation: Math.random() * 20 - 10,
        }));

        setItems(combined);
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load archive data:", error);
      }
    };

    fetchData();
  }, []);

  if (!isLoaded) return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
        <span className="text-gold font-body text-[10px] uppercase tracking-[0.4em]">Entering the Sanctuary...</span>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] py-32 px-6 overflow-x-hidden relative selection:bg-gold/30">
      {/* Texture Overlays */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-20 pointer-events-none z-10" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 pointer-events-none z-10" />

      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center group-hover:border-gold transition-colors">
            <span className="text-[10px] text-gold">←</span>
          </div>
          <h3 className="font-display text-xl tracking-tighter group-hover:text-gold transition-colors">CSE&apos;22-26</h3>
        </Link>
        <div className="flex items-center gap-8">
           <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-muted hidden md:block">
            The Digital Scrapbook • Memories in Miniatures
          </span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto relative z-20">
        <div className="flex flex-col items-center mb-16 md:mb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 mb-4 md:mb-6 rounded-full border border-gold/20 bg-gold/5"
          >
            <span className="text-gold font-body text-[8px] md:text-[9px] uppercase tracking-[0.6em]">Archived Legacies</span>
          </motion.div>
          <h2 className="font-display text-4xl md:text-8xl mb-6 md:mb-8 bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent italic">
            Fragments of Us
          </h2>
          <p className="text-muted text-[10px] md:text-sm max-w-[280px] md:max-w-md font-body leading-relaxed opacity-60">
            A scattered collection of physical-style Polaroid prints. 
            Scroll carefully—these are the fragments of a shared journey.
          </p>
        </div>
        
        {/* Immersive Scattered Tabletop Layout */}
        <div className="relative flex flex-wrap justify-center gap-x-4 gap-y-12 md:gap-x-24 md:gap-y-40 pb-24 px-2">
          {items.slice(0, visibleCount).map((item, index) => (
            <div key={item.memory.id} className="relative group">
              {/* Secondary Scattered Quote Beside the Card */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 0.25, x: 0 }}
                transition={{ delay: 0.8 + (index % 8) * 0.1 }}
                viewport={{ once: true }}
                className="absolute -top-12 -left-12 md:-top-20 md:-left-16 max-w-[120px] md:max-w-[160px] z-0 pointer-events-none group-hover:opacity-60 transition-opacity"
              >
                <p className="font-handwriting text-sm md:text-lg text-gold/60 leading-tight -rotate-6 select-none line-clamp-3">
                  &quot;{item.quote.text.substring(0, 35)}...&quot;
                </p>
              </motion.div>

              <FujicamCard 
                src={item.memory.src} 
                index={index % 8} 
                rotation={item.rotation}
                quote={item.quote.text}
                date={item.memory.date}
                priority={index < 4}
                className="hover:shadow-[0_40px_80px_rgba(245,197,24,0.15)]"
              />
              
              {/* Interactive Decoration: Scrapbook Sticker */}
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rotate-12 backdrop-blur-md">
                <span className="text-xs text-gold font-display">CS</span>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Anchor */}
        {visibleCount < items.length && (
          <div className="flex flex-col items-center justify-center py-12">
            <button 
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-8 py-3 rounded-full border border-gold/20 text-gold text-[10px] uppercase tracking-[0.4em] hover:bg-gold/5 hover:border-gold/50 transition-all active:scale-95"
            >
               {isBatchLoading ? "Opening the boxes..." : "View More Memories"}
            </button>
          </div>
        )}
      </div>

       {/* Ambient Subtle Return */}
       <div className="mt-32 text-center pb-24 relative z-20">
         <div className="w-0.5 h-16 bg-gradient-to-b from-gold/40 to-transparent mx-auto mb-8" />
         <Link href="/" className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-all hover:tracking-[0.6em]">
            End of Collection • Return to Sanctuary
         </Link>
      </div>
    </main>
  );
}
