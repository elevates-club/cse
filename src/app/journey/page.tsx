"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import PageNav from "@/components/ui/PageNav";

const ease = [0.22, 1, 0.36, 1] as any;

interface Memory {
  id: string;
  src: string;
  date: string;
  takenYear: string;
  fullRes: string;
}

const timelineEvents = [
  {
    year: "2022",
    title: "The First Hello",
    tagline: "First day on campus — lost, nervous, and carrying too much. 🍂",
    story:
      "None of us knew where Hall B was. None of us knew each other. We stumbled through orientation with awkward smiles and wrong classrooms. But somewhere between the confusion and the campus map, friendships were quietly beginning.",
    emoji: "🍂",
    side: "left",
  },
  {
    year: "2023",
    title: "We Found Our People",
    tagline: "Late nights, group chats, and the first real bonds. ☕",
    story:
      "The assignments got harder but the study sessions got louder. We started claiming corners of the canteen, debating algorithms over chai, and building the kind of friendships that survive deadlines. The department slowly started feeling like home.",
    emoji: "☕",
    side: "right",
  },
  {
    year: "2024",
    title: "Finding Our Feet",
    tagline: "Library all-nighters and midterm caffeine runs. 📚",
    story:
      "The library became our second home. We stress-coded through midterms, crammed data structures at 3am, and somehow always found time for one more chai break. The grind was real — but so was the laughter between the lines.",
    emoji: "📚",
    side: "left",
  },
  {
    year: "2025",
    title: "A Goodbye Worth Remembering",
    tagline: "We gave our seniors the farewell they deserved. 🎈",
    story:
      "Before it was our turn to leave, we made sure the batch ahead of us got the send-off they deserved. The decor, the performances, the emotions — we poured everything into giving them a farewell they'd never forget. It was the night we realised how much a goodbye can mean.",
    emoji: "🎈",
    side: "right",
  },
  {
    year: "2026",
    title: "Graduation",
    tagline: "We made it. Class of '26. 🎓",
    story:
      "Four years. Countless deadlines, countless memories, and countless people who made us who we are. This isn't the end — it's just the beginning of carrying everything this place gave us, into whatever comes next.",
    emoji: "🎓",
    side: "left",
    isLast: true,
  },
];

// ── Year Photo Strip ──────────────────────────────────────────────
function YearPhotoStrip({ memories }: { memories: Memory[] }) {
  if (memories.length === 0) return null;

  const show = memories.slice(0, 4);

  return (
    <div className="mt-5 grid grid-cols-2 gap-2">
      {show.map((mem, i) => (
        <motion.div
          key={mem.id}
          initial={{ opacity: 0, scale: 0.88, rotate: 0 }}
          whileInView={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease, delay: i * 0.07 }}
          whileHover={{ scale: 1.06, rotate: 0, zIndex: 50, transition: { duration: 0.25 } }}
          className="relative group cursor-pointer"
        >
          {/* Polaroid frame */}
          <div className="bg-[#f4f1ea] p-1.5 pb-5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-[#d1cec4]">
            <div className="relative aspect-square w-full overflow-hidden bg-[#1a1a1a]">
              <Image
                loader={({ src, width }) =>
                  src.startsWith("/api/memories/image") ? `${src}&w=${width}` : src
                }
                src={mem.src}
                alt={`Memory ${mem.date}`}
                fill
                className="object-cover sepia-[0.15] contrast-[1.05] brightness-[0.93] group-hover:brightness-105 group-hover:sepia-0 transition-all duration-500"
                sizes="120px"
              />
              {/* grain overlay */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-[0.15] pointer-events-none" />
            </div>
            {/* date chin */}
            <p className="text-center font-handwriting text-[#2c2b29]/70 text-[9px] mt-1 leading-none">
              {mem.date}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Timeline Card ─────────────────────────────────────────────────
function TimelineCard({
  event,
  memories,
}: {
  event: (typeof timelineEvents)[0];
  memories: Memory[];
}) {
  const isLeft = event.side === "left";

  return (
    <div
      className={`flex items-start w-full ${
        isLeft ? "flex-row" : "flex-row-reverse"
      }`}
    >
      {/* Content + Photos */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease, delay: 0.1 }}
        className="w-[calc(50%-28px)] md:w-[calc(50%-40px)]"
      >
        <div
          className={`glassmorphism rounded-2xl p-5 md:p-7 relative overflow-hidden group hover:border-white/20 transition-all duration-500 ${
            isLeft ? "mr-2" : "ml-2"
          }`}
        >
          {/* Hover glow */}
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

          <h3 className="font-display text-2xl md:text-3xl text-white leading-tight">
            {event.title}
          </h3>

          {/* Year photos */}
          <YearPhotoStrip memories={memories} />
        </div>
      </motion.div>

      {/* Spine dot */}
      <div className="flex flex-col items-center flex-shrink-0 w-14 md:w-20 relative z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          className={`flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full border ${
            event.isLast
              ? "bg-gold/20 border-gold/60"
              : "bg-accent/10 border-accent/40"
          } glassmorphism shadow-[0_0_30px_rgba(108,99,255,0.2)]`}
        >
          <span className="text-lg md:text-2xl">{event.emoji}</span>
        </motion.div>
      </div>

      {/* Year label */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? 60 : -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease, delay: 0.15 }}
        className={`w-[calc(50%-28px)] md:w-[calc(50%-40px)] flex items-start pt-4 ${
          isLeft ? "" : "justify-end"
        }`}
      >
        <div className={isLeft ? "ml-2" : "mr-2 text-right"}>
          <span className="font-display text-5xl md:text-7xl font-bold leading-none bg-gradient-to-b from-white/20 to-transparent bg-clip-text text-transparent select-none">
            {event.year}
          </span>
          {memories.length > 0 && (
            <p className="font-body text-[9px] uppercase tracking-widest text-accent/60 mt-1 ml-1">
              {memories.length} {memories.length === 1 ? "memory" : "memories"}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function JourneyPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const [started, setStarted] = useState(false);
  const [memoriesByYear, setMemoriesByYear] = useState<Record<string, Memory[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndGroup = async () => {
      try {
        const res = await fetch("/api/memories");
        const data: Memory[] = await res.json();

        // Group by takenYear — extracted from EXIF imageMediaMetadata.time,
        // filename date pattern, or upload year as last resort.
        const grouped: Record<string, Memory[]> = {};
        data.forEach((mem) => {
          const yr = mem.takenYear ?? "unknown";
          if (!grouped[yr]) grouped[yr] = [];
          grouped[yr].push(mem);
        });

        setMemoriesByYear(grouped);
      } catch (e) {
        console.error("Failed to fetch memories", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAndGroup();
  }, []);

  return (
    <div className="min-h-screen bg-primary overflow-x-hidden">
      <PageNav activePage="/journey" />

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
      >
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-accent/8 rounded-full blur-[100px]" />
        </motion.div>

        {["2022", "2023", "2024", "2025", "2026"].map((yr, i) => (
          <motion.div
            key={yr}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.04 }}
            transition={{ delay: i * 0.3 + 0.5 }}
            className="absolute font-display font-bold text-white select-none pointer-events-none"
            style={{
              fontSize: `${8 + i * 2}rem`,
              top: `${10 + i * 15}%`,
              left: i % 2 === 0 ? `${-2 + i * 3}%` : `${60 - i * 5}%`,
              lineHeight: 1,
            }}
          >
            {yr}
          </motion.div>
        ))}

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.2 }}
            className="text-gold font-body text-[9px] md:text-[11px] uppercase tracking-[0.6em] mb-4 md:mb-6 block"
          >
            Computer Science Engineering
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.4 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl mb-4 md:mb-6 leading-[1.05] bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent"
          >
            Batch 2022—26
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.65 }}
            className="font-display text-xl md:text-2xl text-white/50 italic mb-2 md:mb-3"
          >
            A Journey We&apos;ll Always Carry
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease, delay: 0.85 }}
            className="text-muted font-body text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-10 md:mb-14 opacity-70"
          >
            Four years of laughter, late nights, and lessons learned. Relive
            the moments that defined us — chapter by chapter.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 1.05 }}
            onClick={() => {
              setStarted(true);
              document
                .getElementById("timeline")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-10 py-4 md:py-5 bg-white text-primary font-bold rounded-full hover:bg-gold transition-colors duration-300 text-[11px] md:text-sm uppercase tracking-widest font-body"
          >
            Start the Journey
          </motion.button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: started ? 0 : 0.4 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-body text-[9px] uppercase tracking-[0.5em] text-white/40">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── TIMELINE ── */}
      <section id="timeline" className="relative py-20 md:py-32 px-4 md:px-8">
        {/* Loading bar */}
        {loading && (
          <div className="flex items-center justify-center gap-3 mb-16 opacity-50">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full"
            />
            <span className="font-body text-[10px] uppercase tracking-widest text-muted">
              Loading memories…
            </span>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="text-center mb-16 md:mb-24"
        >
          <span className="text-gold font-body text-[9px] md:text-[11px] uppercase tracking-[0.6em] mb-3 block">
            Our History
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-white">
            The Journey: 2022—2026
          </h2>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Spine line */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.5, ease: "linear" }}
              style={{ transformOrigin: "top" }}
              className="w-full h-full bg-gradient-to-b from-accent/60 via-accent/20 to-transparent"
            />
          </div>

          <div className="flex flex-col gap-16 md:gap-24">
            {timelineEvents.map((event) => (
              <TimelineCard
                key={event.year}
                event={event}
                memories={memoriesByYear[event.year] ?? []}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section className="relative py-24 md:py-40 px-4 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <span className="text-gold font-body text-[9px] md:text-[11px] uppercase tracking-[0.6em] mb-4 block">
            The Archive Awaits
          </span>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
            Meet the Class
          </h2>
          <p className="text-muted font-body text-sm md:text-base leading-relaxed mb-10 opacity-70 max-w-md mx-auto">
            Every photo, every face, every memory — preserved forever in the
            digital archive of CSE&apos;22-26.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/archive"
              className="px-10 py-4 md:py-5 bg-white text-primary font-bold rounded-full hover:bg-gold transition-colors duration-300 text-[11px] md:text-sm uppercase tracking-widest font-body"
            >
              Enter to the Memories
            </Link>
            <Link
              href="/"
              className="px-10 py-4 md:py-5 border border-white/10 text-white font-bold rounded-full hover:border-white/30 transition-all duration-300 text-[11px] md:text-sm uppercase tracking-widest font-body"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="py-10 text-center border-t border-white/5">
        <p className="text-muted font-body text-[8px] uppercase tracking-[0.8em] opacity-30">
          CSE 2022—26 · Memories are better when shared
        </p>
      </footer>
    </div>
  );
}
