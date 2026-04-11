"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { useState, useEffect } from "react";
import LoginModal from "@/components/auth/LoginModal";
import UploadModal from "@/components/sections/UploadModal";
import FujicamCard from "@/components/ui/FujicamCard";

const defaultTransition = { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as any;

export default function Home() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [heroMemory, setHeroMemory] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchHero = async () => {
      try {
        const res = await fetch("/api/memories");
        const data = await res.json();
        if (data && data.length > 0) {
          // Set initial random memory
          const initialIndex = Math.floor(Math.random() * data.length);
          setHeroMemory(data[initialIndex]);

          // Start rotation every 20 seconds
          interval = setInterval(() => {
            const newIndex = Math.floor(Math.random() * data.length);
            setHeroMemory(data[newIndex]);
          }, 20000); 
        }
      } catch (err) {
        console.error("Failed to fetch hero memory:", err);
      }
    };
    fetchHero();
    return () => clearInterval(interval);
  }, []);

  const handleUploadClick = () => {
    if (isAuthenticated) {
      setIsUploadOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary">
       {/* Navigation Overlay */}
      <nav className="fixed top-0 left-0 w-full z-[80] px-4 md:px-8 py-4 flex justify-between items-center bg-primary/80 backdrop-blur-md border-b border-white/5">
        <h3 className="font-display text-xl md:text-2xl tracking-tighter">CSE&apos;22-26</h3>
        <div className="hidden md:flex items-center gap-5 lg:gap-7">
          {[
            { href: "/archive", label: "Archive" },
            { href: "/journey", label: "Journey" },
            { href: "/videos", label: "Videos" },
            { href: "/confessions", label: "Confessions" },
            { href: "/people", label: "People" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[9px] uppercase tracking-widest text-white/40 hover:text-white font-body transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <span className="text-white/10">|</span>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-widest text-gold font-body hidden lg:block">
                {user?.name.split(" ")[0]}
              </span>
              <button
                onClick={handleUploadClick}
                className="px-4 py-2 bg-white text-primary text-[10px] font-bold rounded-full hover:bg-gold transition-all"
              >
                Upload
              </button>
              <button
                onClick={logout}
                className="text-[9px] uppercase tracking-widest text-white/40 hover:text-white font-body transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-4 py-2 border border-white/10 text-white text-[10px] font-bold rounded-full hover:bg-white hover:text-primary transition-all"
            >
              Sign In
            </button>
          )}
        </div>
        {/* Mobile right */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated ? (
            <button onClick={handleUploadClick} className="px-3 py-1.5 bg-white text-primary text-[10px] font-bold rounded-full hover:bg-gold transition-all">Upload</button>
          ) : (
            <button onClick={() => setIsLoginOpen(true)} className="px-3 py-1.5 border border-white/10 text-white text-[10px] font-bold rounded-full hover:bg-white hover:text-primary transition-all">Sign In</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center justify-center text-center px-4 md:px-6 pt-12 md:pt-20">
        <div className="mb-8 md:mb-12 relative min-h-[300px] flex items-center justify-center">
          {heroMemory ? (
            <FujicamCard 
              src={heroMemory.src}
              index={0}
              rotation={0}
              date={heroMemory.date}
              className="w-[240px] md:w-[350px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
            />
          ) : (
            <div className="w-[240px] md:w-[350px] aspect-[4/5] bg-white/5 rounded-lg border border-white/10 animate-pulse flex items-center justify-center">
               <span className="text-white/20 font-body text-[10px] uppercase tracking-widest">Loading Memory...</span>
            </div>
          )}
        </div>
        
        <motion.div
  initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...defaultTransition, delay: 0.5 }}
          className="max-w-2xl"
        >
          <span className="text-gold font-body text-[8px] md:text-[10px] uppercase tracking-[0.6em] mb-3 md:mb-4 block">Class of 2022-26</span>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent px-2">
             A Digital Sanctuary.
          </h1>
          <p className="text-muted text-sm md:text-lg mb-8 md:mb-10 font-body leading-relaxed max-w-[280px] md:max-w-lg mx-auto opacity-70">
            A piece of us will always belong to these hallways and these faces. 
            Relive the chemistry, the caffeine, and the code.
          </p>
          
          <Link 
            href="/archive"
            className="px-8 md:px-10 py-4 md:py-5 bg-white text-primary font-bold rounded-full hover:bg-gold transition-colors duration-300 inline-block text-[11px] md:text-sm uppercase tracking-widest"
          >
            Enter the Memories
          </Link>

          {/* Quick nav links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mt-8"
          >
            {[
              { href: "/journey", label: "Our Journey" },
              { href: "/videos", label: "Video Vault" },
              { href: "/confessions", label: "Wall of Whispers" },
              { href: "/people", label: "The People" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 text-[9px] md:text-[10px] uppercase tracking-widest font-body transition-all"
              >
                {l.label}
              </Link>
            ))}
          </motion.div>
        </motion.div>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
      </section>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full py-8 text-center bg-gradient-to-t from-primary/80 to-transparent pointer-events-none">
        <p className="text-muted text-[8px] font-body tracking-[0.8em] uppercase opacity-40">
           Memories are better when shared
        </p>
      </footer>

      {/* Overlays */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
