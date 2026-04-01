"use client";

import { useState, useRef, useCallback } from "react";
import { BreakdownView } from "@/components/BreakdownView";
import { FollowUpView } from "@/components/FollowUpView";
import { LoadingView } from "@/components/LoadingView";

interface BreakdownData {
  warmOpener: string;
  whatThisIsAsking: string;
  visualBreakdown: string;
  workedExample?: string;
  explanation?: string;
  answerChoices: {
    letter: string;
    text: string;
    demo?: string;
    isCorrect?: boolean;
  }[];
  steps: string[];
  wordsToKnow: { word: string; meaning: string; visual?: string }[];
  checkIn: string;
}

interface FollowUpData {
  validation: string;
  workedExample?: string;
  guidingQuestion?: string;
  newExplanation?: string;
  tryThis: string;
  checkIn: string;
}

interface QueuedImage {
  base64: string;
  mediaType: string;
}

type AppState = "upload" | "loading" | "breakdown" | "followup-loading";

export default function Home() {
  const [state, setState] = useState<AppState>("upload");
  const [breakdown, setBreakdown] = useState<BreakdownData | null>(null);
  const [followUps, setFollowUps] = useState<FollowUpData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-page support
  const [pageQueue, setPageQueue] = useState<QueuedImage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fileToBase64 = (file: File): Promise<QueuedImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve({
          base64: result.split(",")[1],
          mediaType: file.type || "image/jpeg",
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeImage = useCallback(async (image: QueuedImage) => {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: image.base64,
        mediaType: image.mediaType,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Something went wrong");
    }

    return (await response.json()) as BreakdownData;
  }, []);

  const processFiles = useCallback(
    async (files: File[]) => {
      setError(null);
      setState("loading");

      try {
        // Convert all files to base64 and queue them
        const images = await Promise.all(files.map(fileToBase64));
        setPageQueue(images);
        setTotalPages(images.length);
        setCurrentPageIndex(0);

        // Analyze only the first page
        const data = await analyzeImage(images[0]);
        setBreakdown(data);
        setFollowUps([]);
        setState("breakdown");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Try sending the photos again."
        );
        setState("upload");
      }
    },
    [analyzeImage]
  );

  const handleNextPage = useCallback(async () => {
    const nextIndex = currentPageIndex + 1;
    if (nextIndex >= pageQueue.length) return;

    setState("loading");
    setFollowUps([]);

    try {
      const data = await analyzeImage(pageQueue[nextIndex]);
      setCurrentPageIndex(nextIndex);
      setBreakdown(data);
      setState("breakdown");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong loading the next page. Try again."
      );
      setState("breakdown");
    }
  }, [currentPageIndex, pageQueue, analyzeImage]);

  const handleFollowUp = useCallback(
    async (message: string) => {
      if (!breakdown) return;
      setState("followup-loading");

      try {
        const response = await fetch("/api/followup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            previousBreakdown: breakdown,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Something went wrong");
        }

        const data: FollowUpData = await response.json();
        setFollowUps((prev) => [...prev, data]);
        setState("breakdown");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Try asking again."
        );
        setState("breakdown");
      }
    },
    [breakdown]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleNewAssignment = () => {
    setState("upload");
    setBreakdown(null);
    setFollowUps([]);
    setError(null);
    setPageQueue([]);
    setCurrentPageIndex(0);
    setTotalPages(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasMorePages = currentPageIndex < totalPages - 1;

  // Upload screen
  if (state === "upload") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Logo & welcome */}
          <div className="space-y-3">
            <div className="text-6xl mb-2">🌱</div>
            <h1 className="text-4xl font-extrabold text-text tracking-tight">
              Opolo
            </h1>
            <p className="text-xl text-text-light font-semibold">
              Your homework helper
            </p>
          </div>

          {/* Warm greeting */}
          <div className="bg-warm-white rounded-2xl p-6 border border-border shadow-sm">
            <p className="text-lg text-text leading-relaxed">
              Hey! Take a photo of your homework and drop it here.
              <br />
              <span className="text-text-light">
                Got multiple pages? No problem — drop them all in.
                <br />
                We will go through them one at a time.
              </span>
            </p>
          </div>

          {/* Upload area */}
          <div
            className={`relative border-3 border-dashed rounded-2xl p-12 transition-all cursor-pointer ${
              isDragging
                ? "border-soft-orange bg-peach/30 scale-[1.02]"
                : "border-border hover:border-soft-orange hover:bg-peach/10"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <div className="space-y-4">
              <div className="text-5xl">📸</div>
              <p className="text-lg font-semibold text-text">
                Drop your photos here
              </p>
              <p className="text-text-light">or click to pick them — one or more pages</p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Reassurance */}
          <p className="text-sm text-text-light">
            No rush. Take your time. We will figure it out together. ✨
          </p>
        </div>
      </main>
    );
  }

  // Loading screen
  if (state === "loading") {
    return <LoadingView />;
  }

  // Breakdown + follow-up screen
  if (breakdown) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header with page indicator and new assignment button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌱</span>
              <span className="text-xl font-bold text-text">Opolo</span>
              {totalPages > 1 && (
                <span className="text-sm font-semibold text-text-light bg-peach/40 px-3 py-1 rounded-full">
                  Page {currentPageIndex + 1} of {totalPages}
                </span>
              )}
            </div>
            <button
              onClick={handleNewAssignment}
              className="text-sm font-semibold text-soft-orange hover:text-text transition-colors px-4 py-2 rounded-xl hover:bg-peach/20"
            >
              New assignment →
            </button>
          </div>

          {/* The breakdown */}
          <BreakdownView data={breakdown} />

          {/* Follow-ups */}
          {followUps.map((fu, i) => (
            <FollowUpView key={i} data={fu} />
          ))}

          {/* Follow-up loading */}
          {state === "followup-loading" && (
            <div className="bg-warm-white rounded-2xl p-6 border border-border shadow-sm text-center">
              <div className="animate-pulse text-lg text-text-light">
                Let me think about that for a sec...
              </div>
            </div>
          )}

          {/* Follow-up input */}
          {state === "breakdown" && (
            <FollowUpInput onSend={handleFollowUp} />
          )}

          {/* Next page button — only when there are more pages */}
          {state === "breakdown" && hasMorePages && (
            <section className="bg-sky-light rounded-2xl p-6 border border-sky/30 shadow-sm text-center space-y-3">
              <p className="text-lg text-text">
                Ready for the next page? No rush — only when you are.
              </p>
              <button
                onClick={handleNextPage}
                className="px-8 py-3 bg-sky text-white font-bold rounded-xl hover:bg-sky/80 transition-all text-lg"
              >
                Show me page {currentPageIndex + 2} →
              </button>
            </section>
          )}

          {/* All done indicator */}
          {state === "breakdown" && totalPages > 1 && !hasMorePages && (
            <section className="bg-mint-light rounded-2xl p-5 border border-mint/30 shadow-sm text-center">
              <p className="text-lg text-text font-semibold">
                That is all the pages. Nice work getting through them all! ✨
              </p>
            </section>
          )}
        </div>
      </main>
    );
  }

  return null;
}

function FollowUpInput({ onSend }: { onSend: (msg: string) => void }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="bg-warm-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Which part still feels confusing? Tell me and I will help..."
          className="w-full p-5 text-lg bg-transparent resize-none focus:outline-none placeholder:text-text-light/50"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="px-5 pb-4 flex justify-end">
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-6 py-2.5 bg-soft-orange text-white font-semibold rounded-xl hover:bg-soft-orange/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-base"
          >
            Ask
          </button>
        </div>
      </div>
    </form>
  );
}
