"use client";

import React, { useState } from "react";
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

interface ArchiveItem {
  memory: Memory;
  quote: Quote;
  rotation: number;
}

interface ArchiveGridProps {
  items: ArchiveItem[];
}

export default function ArchiveGrid({ items }: ArchiveGridProps) {
  const [visibleCount, setVisibleCount] = useState(8);

  return (
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
          A scattered collection of physical-style Polaroid prints. Scroll carefully—these are the fragments of a shared journey.
        </p>
      </div>
      
      <div className="relative flex flex-wrap justify-center gap-x-4 gap-y-12 md:gap-x-24 md:gap-y-40 pb-24 px-2">
        {items.slice(0, visibleCount).map((item, index) => (
          <div key={item.memory.id} className="relative group">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={index < 4 ? { opacity: 0.25, x: 0 } : undefined}
              whileInView={index >= 4 ? { opacity: 0.25, x: 0 } : undefined}
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
            
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rotate-12 backdrop-blur-md">
              <span className="text-xs text-gold font-display">CS</span>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < items.length && (
        <div className="flex flex-col items-center justify-center py-12">
          <button 
            onClick={() => setVisibleCount(prev => prev + 12)}
            className="px-8 py-3 rounded-full border border-gold/20 text-gold text-[10px] uppercase tracking-[0.4em] hover:bg-gold/5 hover:border-gold/50 transition-all active:scale-95"
          >
             View More Memories
          </button>
        </div>
      )}
    </div>
  );
}
