"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Student {
  id: string;
  name: string;
  regNo: string;
  photo: string;
}

interface AuthContextType {
  user: Student | null;
  login: (regNo: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Student | null>(null);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem("cse-memory-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (regNo: string) => {
    try {
      // In a real app, this would be an API call
      // For now, we fetch our JSON data
      const response = await fetch("/data/students.json");
      const students: Student[] = await response.json();
      
      const foundStudent = students.find(s => s.regNo.toLowerCase() === regNo.toLowerCase());
      
      if (foundStudent) {
        setUser(foundStudent);
        localStorage.setItem("cse-memory-user", JSON.stringify(foundStudent));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login Error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cse-memory-user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
