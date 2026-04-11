"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import UploadModal from "@/components/sections/UploadModal";

interface Memory {
  id: string;
  src: string;
  date: string;
  sortDate: string;
  takenYear: string;
  fullRes: string;
  type?: "image" | "video";
}

interface ArchiveItem {
  memory: Memory;
  rotation: number;
}

interface ArchiveGridProps {
  items: ArchiveItem[];
}

const ease = [0.22, 1, 0.36, 1] as any;

// ── Polaroid Card ──────────────────────────────────────────────────
function PolaroidCard({
  item,
  index,
  onClick,
}: {
  item: ArchiveItem;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0, rotate: item.rotation / 3 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, ease, delay: (index % 8) * 0.055 }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 50, transition: { duration: 0.25 } }}
      onClick={onClick}
      className="cursor-zoom-in"
    >
      <div className="relative bg-[#f4f1ea] p-3 pb-12 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(0,0,0,0.04)] border border-[#d1cec4] w-[200px] md:w-[240px] group">
        {/* Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-7 bg-white/20 backdrop-blur-sm rotate-2 shadow-sm border border-white/10 z-20 pointer-events-none" />
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#1a1a1a] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
          <Image
            loader={({ src, width }) =>
              src.startsWith("/api/memories/image") ? `${src}&w=${width}` : src
            }
            src={item.memory.src}
            alt={item.memory.date}
            fill
            className="object-cover sepia-[0.12] contrast-[1.05] brightness-[0.93] group-hover:brightness-[1.05] group-hover:sepia-0 transition-all duration-500"
            sizes="260px"
          />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-[0.12] pointer-events-none" />
          {/* Zoom hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <span className="text-white/0 group-hover:text-white/70 font-body text-[10px] uppercase tracking-widest transition-all duration-300">
              View
            </span>
          </div>
        </div>
        {/* Date chin */}
        <div className="absolute bottom-2 left-0 w-full flex justify-center">
          <p className="font-handwriting text-[#2c2b29]/75 text-sm leading-none">
            {item.memory.date || "\u2727"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Video Card ─────────────────────────────────────────────────────
function VideoCard({ item, index }: { item: ArchiveItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, ease, delay: (index % 8) * 0.055 }}
      className="w-[200px] md:w-[280px]"
    >
      <div className="glassmorphism rounded-2xl overflow-hidden border border-white/10 group hover:border-white/20 transition-all">
        <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={`https://drive.google.com/file/d/${item.memory.id}/preview`}
            className="w-full h-full"
            allow="autoplay"
            title={`Video ${item.memory.date}`}
          />
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <p className="font-handwriting text-white/60 text-sm">{item.memory.date || "\u2727"}</p>
          <span className="text-[9px] uppercase tracking-widest text-accent/60 font-body border border-accent/20 px-2 py-0.5 rounded-full">
            Video
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Lightbox ───────────────────────────────────────────────────────
function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: ArchiveItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl px-4"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors z-10 text-lg"
      >
        ✕
      </button>

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-3 md:left-8 w-11 h-11 glassmorphism rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors z-10 text-lg"
        >
          ←
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-3 md:right-8 w-11 h-11 glassmorphism rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors z-10 text-lg"
        >
          →
        </button>
      )}

      {/* Photo */}
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.88 }}
        transition={{ duration: 0.3, ease }}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center"
      >
        <div className="bg-[#f4f1ea] p-3 md:p-4 pb-14 md:pb-16 shadow-[0_40px_120px_rgba(0,0,0,0.9)] border border-[#d1cec4] max-w-[90vw] max-h-[80vh]">
          <div className="relative overflow-hidden" style={{ maxWidth: "min(80vw, 700px)", maxHeight: "65vh" }}>
            <Image
              loader={({ src, width }) =>
                src.startsWith("/api/memories/image") ? `${src}&w=${width}` : src
              }
              src={item.memory.src}
              alt={item.memory.date}
              width={800}
              height={800}
              className="object-contain"
              style={{ maxWidth: "min(80vw, 700px)", maxHeight: "65vh", width: "auto", height: "auto" }}
              priority
            />
          </div>
          <div className="absolute bottom-3 left-0 w-full text-center">
            <p className="font-handwriting text-[#2c2b29]/80 text-base md:text-lg">
              {item.memory.date || "\u2727"}
            </p>
          </div>
        </div>
        <p className="text-white/25 font-body text-[9px] uppercase tracking-[0.5em] mt-4">
          {index + 1} / {items.length}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function ArchiveGrid({ items }: ArchiveGridProps) {
  const { isAuthenticated } = useAuth();
  const [activeYear, setActiveYear] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [visibleCount, setVisibleCount] = useState(12);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Unique years from items (put "Unknown" at the end)
  const realYears = Array.from(new Set(items.map((i) => i.memory.takenYear)))
    .filter(Boolean)
    .sort()
    .reverse();
  const hasUnknown = realYears.includes("Unknown");
  const years = [
    "all",
    ...realYears.filter((y) => y !== "Unknown"),
    ...(hasUnknown ? ["Unknown"] : []),
  ];

  const sortedItems = [...items].sort((a, b) => {
    const da = new Date(a.memory.sortDate).getTime() || 0;
    const db = new Date(b.memory.sortDate).getTime() || 0;
    return sortOrder === "newest" ? db - da : da - db;
  });

  const filteredItems =
    activeYear === "all"
      ? sortedItems
      : sortedItems.filter((i) => i.memory.takenYear === activeYear);

  const visibleItems = filteredItems.slice(0, visibleCount);

  // Keyboard nav for lightbox
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft" && lightboxIndex > 0)
        setLightboxIndex((p) => (p ?? 0) - 1);
      if (e.key === "ArrowRight" && lightboxIndex < visibleItems.length - 1)
        setLightboxIndex((p) => (p ?? 0) + 1);
    },
    [lightboxIndex, visibleItems.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  return (
    <div className="max-w-[1400px] mx-auto relative z-20">

      {/* ── Section Header ── */}
      <div className="flex flex-col items-center mb-10 md:mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1 mb-4 md:mb-6 rounded-full border border-gold/20 bg-gold/5"
        >
          <span className="text-gold font-body text-[8px] md:text-[9px] uppercase tracking-[0.6em]">
            Archived Legacies
          </span>
        </motion.div>

        <h2 className="font-display text-4xl md:text-8xl mb-3 md:mb-4 bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent italic">
          Fragments of Us
        </h2>

        <p className="text-muted text-[10px] md:text-sm max-w-xs font-body leading-relaxed opacity-50 mb-8">
          {items.length} memories · {realYears.filter((y) => y !== "Unknown").length} years
        </p>

        {/* Year filter pills + sort */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {years.map((year) => (
            <button
              key={year}
              onClick={() => { setActiveYear(year); setVisibleCount(12); setLightboxIndex(null); }}
              className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-body transition-all duration-200 ${
                activeYear === year
                  ? "bg-gold text-primary font-bold scale-105"
                  : "border border-white/10 text-white/40 hover:border-white/30 hover:text-white"
              }`}
            >
              {year === "all" ? "All Years" : year === "Unknown" ? "Undated" : year}
            </button>
          ))}
          <span className="text-white/10">·</span>
          <button
            onClick={() => { setSortOrder((s) => s === "newest" ? "oldest" : "newest"); setVisibleCount(12); }}
            className="px-4 py-1.5 rounded-full border border-white/10 text-white/40 hover:border-white/30 hover:text-white text-[10px] uppercase tracking-widest font-body transition-all"
          >
            {sortOrder === "newest" ? "Newest ↑" : "Oldest ↑"}
          </button>
        </motion.div>

        {/* Filtered count */}
        {activeYear !== "all" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-body text-[9px] uppercase tracking-widest text-muted/40 mt-4"
          >
            {filteredItems.length} {filteredItems.length === 1 ? "memory" : "memories"}{activeYear === "Unknown" ? ", undated" : ` from ${activeYear}`}
          </motion.p>
        )}
      </div>

      {/* ── Grid ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeYear}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap justify-center gap-x-6 gap-y-14 md:gap-x-14 md:gap-y-24 pb-24 px-2"
        >
          {visibleItems.map((item, index) =>
            item.memory.type === "video" ? (
              <VideoCard key={item.memory.id} item={item} index={index} />
            ) : (
              <PolaroidCard
                key={item.memory.id}
                item={item}
                index={index}
                onClick={() => setLightboxIndex(index)}
              />
            )
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-20 text-muted/40 font-body text-sm">
              No memories for {activeYear} yet.
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Load more */}
      {visibleCount < filteredItems.length && (
        <div className="flex flex-col items-center gap-3 py-12">
          <button
            onClick={() => setVisibleCount((p) => p + 12)}
            className="px-8 py-3 rounded-full border border-gold/20 text-gold text-[10px] uppercase tracking-[0.4em] hover:bg-gold/5 hover:border-gold/50 transition-all active:scale-95 font-body"
          >
            View More Memories
          </button>
          <p className="text-muted/30 font-body text-[9px]">
            {Math.min(visibleCount, filteredItems.length)} of {filteredItems.length} shown
          </p>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={visibleItems}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex((p) => Math.max(0, (p ?? 0) - 1))}
            onNext={() =>
              setLightboxIndex((p) => Math.min(visibleItems.length - 1, (p ?? 0) + 1))
            }
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
