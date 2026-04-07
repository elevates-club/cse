"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

export default function UploadModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !file) return;

    setUploading(true);
    
    // Simulate API call for local persistence
    // In a real environment with a backend, this would be a POST to /api/upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSuccess(true);
    setUploading(false);
    
    setTimeout(() => {
      setSuccess(false);
      setFile(null);
      setCaption("");
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: 20 }}
           className="w-full max-w-lg glassmorphism p-10 rounded-[2rem] relative overflow-hidden"
        >
          {success ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-3xl mb-2">Memory Captured</h2>
              <p className="text-muted">Thank you, {user?.name}. Your contribution is being archived.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="font-display text-4xl text-white mb-2">Contribute</h2>
                <p className="text-muted text-sm italic font-body">Uploading as {user?.name} ({user?.regNo})</p>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div 
                  className="group relative border-2 border-dashed border-white/10 rounded-2xl p-12 text-center transition-all hover:border-accent/40 bg-white/5"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
                  }}
                >
                  <div className="mb-4 flex justify-center">
                     <svg className="w-12 h-12 text-white/20 group-hover:text-accent/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                     </svg>
                  </div>
                  <p className="text-sm font-body text-white/60 mb-2">
                    {file ? file.name : "Drag & Drop your memory or click to browse"}
                  </p>
                  <label className="cursor-pointer">
                    <span className="text-xs text-accent uppercase tracking-widest hover:underline">Choose File</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,video/*"
                      onChange={(e) => e.target.files && setFile(e.target.files[0])}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-widest text-muted font-body">Memorable Caption</label>
                   <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Describe this moment..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors h-24 resize-none"
                    required
                   />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={uploading || !file}
                    className="flex-1 py-4 bg-white text-primary font-bold rounded-xl hover:bg-gold transition-colors disabled:opacity-50"
                  >
                    {uploading ? "Uploading Memory..." : "Add to Archive"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Decorative grain/glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
