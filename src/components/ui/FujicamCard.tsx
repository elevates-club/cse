"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FujicamCardProps {
  src: string;
  index: number;
  rotation?: number;
  quote?: string;
  date?: string;
  priority?: boolean;
  className?: string;
}

export default function FujicamCard({ src, index, rotation, quote, date, priority, className }: FujicamCardProps) {
  // Classic Polaroid random rotation
  const randomRotation = useMemo(() => (rotation ?? (Math.random() * 8 - 4)), [rotation]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
      animate={priority ? { opacity: 1, scale: 1, rotate: randomRotation } : undefined}
      whileInView={!priority ? { 
        opacity: 1, 
        scale: 1, 
        rotate: randomRotation,
      } : undefined}
      viewport={{ once: true }}
      transition={{ 
        type: "spring", 
        stiffness: 70, 
        delay: index * 0.08,
      }}
      whileHover={{ 
        scale: 1.05, 
        rotate: 0, 
        zIndex: 50,
        transition: { duration: 0.3 } 
      }}
      className={cn(
        "relative p-3 pb-12 md:pb-16 bg-[#f4f1ea] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(0,0,0,0.05)]",
        "border border-[#d1cec4] w-[220px] md:w-[280px] max-w-[90vw] group cursor-pointer",
        // Distressed Edge Effect (using clip-path to mimic torn edges slightly)
        "style-distressed-edge",
        className
      )}
    >
      {/* Decorative "Tape" at the top */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-8 bg-white/20 backdrop-blur-sm rotate-3 shadow-sm border border-white/10 z-20 pointer-events-none self-start" />

      {/* The Image Wrapper */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#1a1a1a] shadow-[inset_0_0_25px_rgba(0,0,0,0.9)]">
        <Image
          loader={({ src, width }) => {
            if (src.startsWith('/api/memories/image')) {
              return `${src}&w=${width}`;
            }
            return src;
          }}
          src={src}
          alt="Vintage Memory"
          fill
          priority={priority}
          className="object-cover sepia-[0.15] contrast-[1.1] brightness-[0.95] grayscale-[0.1] transition-all duration-700 group-hover:brightness-105 group-hover:sepia-0"
          sizes="(max-w-768px) 400px, 800px"
        />
        {/* Physical textures: grain, dust, and scratches */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/5 pointer-events-none" />
      </div>
      
      {/* Date in top white area of the frame */}
      {date && (
        <div className="absolute top-0.5 right-2 w-max rotate-1 select-none z-30">
          <span className="font-handwriting text-[10px] md:text-xs text-black font-medium leading-none">
             {date}
          </span>
        </div>
      )}
      
      {/* Handwritten Quote and Date inside the Polaroid "Chin" */}
      <div className="absolute bottom-1 md:bottom-2 left-0 w-full px-3 md:px-4 flex flex-col items-center justify-center min-h-[40px]">
        {quote && (
          <p className="font-handwriting text-[#2c2b29]/80 text-sm md:text-base leading-tight line-clamp-2 text-center">
            {quote}
          </p>
        )}
      </div>

      {/* Glossy highlight effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Distressed Stains / Wear Marks overlay */}
      <div className="absolute bottom-1 right-2 w-8 h-8 bg-black/5 rounded-full blur-xl pointer-events-none" />
    </motion.div>
  );
}
