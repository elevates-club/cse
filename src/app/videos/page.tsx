"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageNav from "@/components/ui/PageNav";
import type { Memory } from "@/lib/memories";

type SortOrder = "newest" | "oldest";

// Sprocket strip — the little holes on a film reel
function Sprockets() {
  return (
    <div className="flex items-center justify-around px-1 py-[3px]" style={{ background: "#0e0c09" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[2px]"
          style={{
            width: 8,
            height: 6,
            background: "#000",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        />
      ))}
    </div>
  );
}

function VideoCard({
  item,
  index,
  onClick,
}: {
  item: Memory;
  index: number;
  onClick: () => void;
}) {
  const [thumbFailed, setThumbFailed] = useState(false);
  // Route through the server-side image proxy — same as archive photos,
  // so Drive auth/CORS is handled server-side
  const thumbSrc = `/api/memories/image?id=${item.id}&w=600`;

  const frameNum = String(index + 1).padStart(3, "0");
  const rotate = index % 2 === 0 ? 1.2 : -1.2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: rotate * 2 }}
      animate={{ opacity: 1, y: 0, rotate }}
      whileHover={{ scale: 1.06, rotate: 0, zIndex: 50, transition: { duration: 0.25 } }}
      transition={{ delay: Math.min(index * 0.07, 0.9), duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="group cursor-pointer origin-bottom"
      style={{ filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.7))" }}
    >
      {/* Film strip outer wrapper */}
      <div
        className="relative overflow-hidden"
        style={{
          width: 210,
          background: "#0e0c09",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 4,
        }}
      >
        {/* Top sprockets */}
        <Sprockets />

        {/* Thumbnail frame */}
        <div
          className="relative overflow-hidden flex items-center justify-center"
          style={{ height: 160, background: "#050503" }}
        >
          {!thumbFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbSrc}
              alt=""
              onError={() => setThumbFailed(true)}
              className="absolute inset-0 w-full h-full object-cover sepia-[0.3] contrast-[1.1] brightness-[0.85] group-hover:sepia-0 group-hover:brightness-100 transition-all duration-500"
            />
          ) : (
            /* Placeholder when no thumbnail available */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #111008, #0a0d08)" }}>
              {/* Film reel icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                className="w-8 h-8" style={{ color: "rgba(245,197,24,0.25)" }}>
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="2" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="22" y2="12" />
              </svg>
              <span className="font-body text-[8px] uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.15)" }}>
                No Preview
              </span>
            </div>
          )}

          {/* Grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.15]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "200px",
            }}
          />

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

          {/* Play button — appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Frame counter — top left */}
          <span
            className="absolute top-2 left-2 font-body text-[9px] tracking-widest pointer-events-none z-10"
            style={{ color: "rgba(255,220,100,0.5)", fontVariantNumeric: "tabular-nums" }}
          >
            {frameNum}
          </span>
        </div>

        {/* Bottom sprockets */}
        <Sprockets />

        {/* Film label */}
        <div
          className="px-3 py-2.5 flex justify-between items-center"
          style={{ background: "#0e0c09", borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <p className="font-handwriting text-sm leading-none"
            style={{ color: "rgba(240,225,180,0.75)" }}>
            {item.date}
          </p>
          <p className="font-body text-[8px] uppercase tracking-widest"
            style={{ color: "rgba(245,197,24,0.4)" }}>
            CSE&apos;22
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function VideoLightbox({
  video,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  video: Memory;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl px-4"
      onClick={onClose}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-5 z-10">
        <p className="text-white/40 font-body text-[10px] uppercase tracking-widest">{video.date}</p>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white text-lg transition-all"
        >
          ×
        </button>
      </div>

      {/* Video */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={video.src}
          className="w-full h-full"
          allow="autoplay"
          allowFullScreen
        />
      </motion.div>

      {/* Navigation */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          disabled={!hasPrev}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          ←
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          disabled={!hasNext}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          →
        </button>
      </div>
    </motion.div>
  );
}

export default function VideosPage() {
  const [allVideos, setAllVideos] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/memories")
      .then((r) => r.json())
      .then((data: Memory[]) => {
        setAllVideos(data.filter((m) => m.type === "video"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const years = ["all", ...Array.from(new Set(allVideos.map((v) => v.takenYear))).sort((a, b) => Number(b) - Number(a))];

  const filtered = allVideos
    .filter((v) => activeYear === "all" || v.takenYear === activeYear)
    .sort((a, b) => {
      const da = new Date(a.date).getTime() || 0;
      const db = new Date(b.date).getTime() || 0;
      return sort === "newest" ? db - da : da - db;
    });

  return (
    <main className="min-h-screen bg-primary px-4 md:px-8 pb-24 overflow-x-hidden relative selection:bg-accent/30">
      {/* Ambient */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />

      <PageNav activePage="/videos" />

      {/* Hero */}
      <div className="pt-32 pb-12 text-center relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gold font-body text-[9px] uppercase tracking-[0.7em] mb-3 block"
        >
          Motion · Class of 2022–26
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl md:text-6xl lg:text-7xl bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent mb-4"
        >
          Video Vault
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted font-body text-sm md:text-base max-w-md mx-auto opacity-70 leading-relaxed"
        >
          The moments that moved — captured in motion.
        </motion.p>

        {/* Filters + Sort */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-8"
        >
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setActiveYear(y)}
              className={`px-4 py-2 rounded-full text-[9px] uppercase tracking-widest font-body transition-all ${
                activeYear === y
                  ? "bg-white text-primary font-bold"
                  : "border border-white/10 text-white/40 hover:text-white hover:border-white/30"
              }`}
            >
              {y === "all" ? "All Years" : y}
            </button>
          ))}
          <span className="text-white/10">·</span>
          <button
            onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
            className="px-4 py-2 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 text-[9px] uppercase tracking-widest font-body transition-all"
          >
            {sort === "newest" ? "Newest ↑" : "Oldest ↑"}
          </button>
        </motion.div>
      </div>

      {/* Count */}
      {!loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white/20 font-body text-[10px] uppercase tracking-widest mb-10 relative z-10"
        >
          {filtered.length} {filtered.length === 1 ? "video" : "videos"}
          {activeYear !== "all" ? ` from ${activeYear}` : ""}
        </motion.p>
      )}

      {/* Grid */}
      <div className="max-w-6xl mx-auto relative z-10">
        {loading && (
          <div className="flex flex-col items-center gap-3 py-24 text-white/20">
            <div className="w-5 h-5 border border-white/10 border-t-white/40 rounded-full animate-spin" />
            <span className="font-body text-[10px] uppercase tracking-widest">Loading videos</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 py-28 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7 text-accent/50">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-2xl text-white/50 mb-2">No Videos Yet</h3>
              <p className="text-muted/50 font-body text-sm max-w-xs mx-auto leading-relaxed">
                Videos from Google Drive will appear here once your Apps Script returns video files.
              </p>
            </div>
            <div className="max-w-sm bg-surface/50 border border-white/8 rounded-xl p-5 text-left mt-2">
              <p className="text-[9px] uppercase tracking-widest text-gold font-body mb-3">To enable videos</p>
              <p className="text-white/40 font-body text-xs leading-relaxed">
                Update your Apps Script query to include:{" "}
                <code className="text-accent/80 bg-accent/10 px-1.5 py-0.5 rounded text-[10px]">
                  mimeType contains &apos;video/&apos;
                </code>{" "}
                and add <code className="text-accent/80 bg-accent/10 px-1.5 py-0.5 rounded text-[10px]">mimeType</code> to the returned fields.
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!loading && filtered.length > 0 && (
            <motion.div
              key={activeYear + sort}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap justify-center gap-x-10 gap-y-16 pb-16 px-2"
            >
              {filtered.map((video, i) => (
                <VideoCard
                  key={video.id}
                  item={video}
                  index={i}
                  onClick={() => setLightboxIndex(i)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <VideoLightbox
            video={filtered[lightboxIndex]}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex((p) => Math.max(0, (p ?? 0) - 1))}
            onNext={() => setLightboxIndex((p) => Math.min(filtered.length - 1, (p ?? 0) + 1))}
            hasPrev={lightboxIndex > 0}
            hasNext={lightboxIndex < filtered.length - 1}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
