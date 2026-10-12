"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDark) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const handleUpload = async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/parse", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Server is currently busy. Please try again.");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      
      {/* Header */}
      <header className="flex justify-between items-end border-b-[2px] border-[#0A0A0A] dark:border-[#E8E6E3] pb-4 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-none">Bias-Free Parser</h1>
          <p className="font-mono text-sm mt-2 opacity-70">Objective candidate evaluation.</p>
        </div>
        <button 
          onClick={toggleTheme}
          className="font-mono text-xs uppercase tracking-widest border-[1px] border-[#0A0A0A] dark:border-[#E8E6E3] px-3 py-1 hover:bg-[#0A0A0A] hover:text-[#F4F1EA] dark:hover:bg-[#E8E6E3] dark:hover:text-[#0A0A0A]"
        >
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload */}
        <section className="lg:col-span-4 space-y-6">
          <div className="border-[2px] border-[#0A0A0A] dark:border-[#E8E6E3] relative group">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              accept="application/pdf"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
            <div className="p-8 flex flex-col items-start justify-center min-h-[160px] font-mono text-sm uppercase group-hover:bg-[#0A0A0A] group-hover:text-[#F4F1EA] dark:group-hover:bg-[#E8E6E3] dark:group-hover:text-[#0A0A0A]">
              {loading ? (
                <span className="animate-pulse">Analyzing document...</span>
              ) : file ? (
                <span className="font-bold group-hover:text-inherit">Loaded: {file.name}</span>
              ) : (
                <span>Upload PDF Resume</span>
              )}
            </div>
          </div>

          {error && (
            <div className="border-[2px] border-red-700 dark:border-red-500 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 p-4 font-mono text-sm">
              Error: {error}
            </div>
          )}

          <div className="text-sm font-mono opacity-60 space-y-1">
            <p>Notes:</p>
            <p>- Maximum file size: 10MB</p>
            <p>- PDF format only</p>
            <p>- All demographic identifiers are automatically scrubbed.</p>
          </div>
        </section>

        {/* Right Column: Results */}
        <section className="lg:col-span-8">
          {!result ? (
            <div className="border-[2px] border-dashed border-[#0A0A0A] dark:border-[#E8E6E3] opacity-30 h-full min-h-[400px] flex items-center justify-center font-mono text-sm uppercase">
              No document uploaded.
            </div>
          ) : (
            <div className="border-[2px] border-[#0A0A0A] dark:border-[#E8E6E3] bg-white dark:bg-[#111111] animate-in fade-in duration-500">
              
              <div className="flex justify-between items-center border-b-[2px] border-[#0A0A0A] dark:border-[#E8E6E3] p-4 bg-[#0A0A0A] text-[#F4F1EA] dark:bg-[#E8E6E3] dark:text-[#0A0A0A]">
                <h2 className="font-mono text-sm uppercase font-bold">Evaluation Results</h2>
                <span className="font-mono text-xs uppercase bg-[#D95D39] text-white px-2 py-1">
                  Score: {result.readiness_score}/10
                </span>
              </div>
              
              <div className="p-6 md:p-8 space-y-10">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest border-b-[1px] border-[#0A0A0A] dark:border-[#E8E6E3] pb-2 mb-4 opacity-60">
                    Candidate Summary
                  </h3>
                  <p className="font-serif text-lg md:text-xl leading-relaxed">
                    {result.candidate_summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-widest border-b-[1px] border-[#0A0A0A] dark:border-[#E8E6E3] pb-2 mb-4 opacity-60">
                      Technical Skills
                    </h3>
                    <ul className="font-mono text-sm space-y-2">
                      {result.matched_skills.map((skill: string, i: number) => (
                        <li key={i} className="before:content-['-'] before:mr-2 before:opacity-50">{skill}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-widest border-b-[1px] border-[#0A0A0A] dark:border-[#E8E6E3] pb-2 mb-4 opacity-60">
                      Redacted Information
                    </h3>
                    <ul className="font-mono text-sm space-y-2 text-red-700 dark:text-red-400">
                      {result.bias_flags.map((flag: string, i: number) => (
                        <li key={i} className="before:content-['Removed:'] before:mr-2 before:opacity-50 line-through opacity-80">{flag}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          )}
        </section>
      </div>
    </main>
  );
}