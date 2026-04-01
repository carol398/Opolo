"use client";

import { useState, useRef, useCallback } from "react";
import { BreakdownView } from "@/components/BreakdownView";
import { FollowUpView } from "@/components/FollowUpView";
import { LoadingView } from "@/components/LoadingView";

interface BreakdownData {
  warmOpener: string;
  questionAndChoices?: {
    question: string;
    context: string;
    choices: { letter: string; text: string; demo?: string }[];
  };
  whatThisIsAsking?: string;
  visualBreakdown?: string;
  workedExample?: string;
  explanation?: string;
  answerChoices?: { letter: string; text: string; demo?: string }[];
  steps?: string[];
  wordsToKnow?: { word: string; meaning: string; visual?: string }[];
  checkIn: string;
}

interface FollowUpData {
  validation: string;
  workedExample?: string;
  coachingQuestion?: string;
  guidingQuestion?: string;
  newExplanation?: string;
  tryThis?: string;
  checkIn: string;
}

interface QueuedImage {
  base64: string;
  mediaType: string;
}

// Cache key for page+problem combos
function cacheKey(pageIndex: number, problem: number) {
  return `${pageIndex}-${problem}`;
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

  // Multi-problem support
  const [currentProblem, setCurrentProblem] = useState(1);
  const [highestProblem, setHighestProblem] = useState(1); // tracks how far we've discovered

  // Cache: stores breakdowns so going back is instant
  const breakdownCache = useRef<Map<string, BreakdownData>>(new Map());

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

  const analyzeImage = useCallback(
    async (image: QueuedImage, problemNumber: number = 1) => {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: image.base64,
          mediaType: image.mediaType,
          problemNumber,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Something went wrong");
      }

      return (await response.json()) as BreakdownData;
    },
    []
  );

  const goToProblem = useCallback(
    async (pageIdx: number, problemNum: number) => {
      const key = cacheKey(pageIdx, problemNum);

      // Check cache first — instant jump
      const cached = breakdownCache.current.get(key);
      if (cached) {
        setCurrentPageIndex(pageIdx);
        setCurrentProblem(problemNum);
        setBreakdown(cached);
        setFollowUps([]);
        setError(null);
        setState("breakdown");
        return;
      }

      // Not cached — fetch it
      const image = pageQueue[pageIdx];
      if (!image) return;

      setState("loading");
      setFollowUps([]);
      setError(null);

      try {
        const data = await analyzeImage(image, problemNum);
        breakdownCache.current.set(key, data);
        setCurrentPageIndex(pageIdx);
        setCurrentProblem(problemNum);
        setBreakdown(data);
        if (problemNum > highestProblem) {
          setHighestProblem(problemNum);
        }
        setState("breakdown");
      } catch {
        setError("Couldn't load that problem. It might not exist on this page.");
        setState("breakdown");
      }
    },
    [pageQueue, analyzeImage, highestProblem]
  );

  const processFiles = useCallback(
    async (files: File[]) => {
      setError(null);
      setState("loading");
      breakdownCache.current.clear();

      try {
        const images = await Promise.all(files.map(fileToBase64));
        setPageQueue(images);
        setTotalPages(images.length);
        setCurrentPageIndex(0);
        setCurrentProblem(1);
        setHighestProblem(1);

        const data = await analyzeImage(images[0]);
        breakdownCache.current.set(cacheKey(0, 1), data);
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

  const handleDiscoverNext = useCallback(async () => {
    // Try next problem on current page first
    const nextProblem = highestProblem + 1;
    const image = pageQueue[currentPageIndex];
    if (!image) {
      // Try next page
      if (currentPageIndex + 1 < pageQueue.length) {
        goToProblem(currentPageIndex + 1, 1);
      }
      return;
    }

    setState("loading");
    setFollowUps([]);

    try {
      const data = await analyzeImage(image, nextProblem);
      const key = cacheKey(currentPageIndex, nextProblem);
      breakdownCache.current.set(key, data);
      setCurrentProblem(nextProblem);
      setHighestProblem(nextProblem);
      setBreakdown(data);
      setState("breakdown");
    } catch {
      // No more problems on this page — try next page
      if (currentPageIndex + 1 < pageQueue.length) {
        setCurrentPageIndex(currentPageIndex + 1);
        setCurrentProblem(1);
        setHighestProblem(1);
        breakdownCache.current.clear();
        goToProblem(currentPageIndex + 1, 1);
      } else {
        setError(null);
        setState("breakdown");
      }
    }
  }, [highestProblem, currentPageIndex, pageQueue, analyzeImage, goToProblem]);

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
    setCurrentProblem(1);
    setHighestProblem(1);
    breakdownCache.current.clear();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Upload screen
  if (state === "upload") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="space-y-3">
            <div className="text-6xl mb-2">🌱</div>
            <h1 className="text-4xl font-extrabold text-text tracking-tight">
              Opolo
            </h1>
            <p className="text-xl text-text-light font-semibold">
              Your homework helper
            </p>
          </div>

          <div className="bg-warm-white rounded-2xl p-6 border border-border shadow-sm">
            <p className="text-lg text-text leading-relaxed">
              Hey! Take a photo of your homework and drop it here.
              <br />
              <span className="text-text-light">
                Got multiple pages? Drop them all in.
              </span>
            </p>
          </div>

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
              <p className="text-text-light">or click to pick them</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
              {error}
            </div>
          )}

          <p className="text-sm text-text-light">
            No rush. We will figure it out together. ✨
          </p>
        </div>
      </main>
    );
  }

  // Loading screen
  if (state === "loading") {
    return <LoadingView />;
  }

  // Breakdown screen
  if (breakdown) {
    return (
      <main className="min-h-screen px-4 pt-4 pb-24 md:px-8">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="text-lg font-bold text-text">Opolo</span>
            </div>
            <button
              onClick={handleNewAssignment}
              className="text-sm font-semibold text-soft-orange hover:text-text transition-colors px-3 py-1.5 rounded-xl hover:bg-peach/20"
            >
              New assignment →
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* The breakdown */}
          <BreakdownView data={breakdown} />

          {/* Follow-ups */}
          {followUps.map((fu, i) => (
            <FollowUpView key={i} data={fu} />
          ))}

          {/* Follow-up loading */}
          {state === "followup-loading" && (
            <div className="bg-warm-white rounded-2xl p-5 border border-border shadow-sm text-center">
              <div className="animate-pulse text-base text-text-light">
                Let me think about that...
              </div>
            </div>
          )}

          {/* Follow-up input */}
          {state === "breakdown" && (
            <FollowUpInput onSend={handleFollowUp} />
          )}
        </div>

        {/* Sticky bottom navigation */}
        <ProblemNav
          currentProblem={currentProblem}
          highestProblem={highestProblem}
          currentPageIndex={currentPageIndex}
          totalPages={totalPages}
          onGoToProblem={(num) => goToProblem(currentPageIndex, num)}
          onDiscoverNext={handleDiscoverNext}
          isLoading={state === "followup-loading"}
        />
      </main>
    );
  }

  return null;
}

function ProblemNav({
  currentProblem,
  highestProblem,
  currentPageIndex,
  totalPages,
  onGoToProblem,
  onDiscoverNext,
  isLoading,
}: {
  currentProblem: number;
  highestProblem: number;
  currentPageIndex: number;
  totalPages: number;
  onGoToProblem: (num: number) => void;
  onDiscoverNext: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Page indicator */}
        <div className="text-xs text-text-light font-semibold min-w-fit">
          {totalPages > 1 ? `Page ${currentPageIndex + 1}/${totalPages}` : ""}
        </div>

        {/* Problem dots */}
        <div className="flex items-center gap-2 overflow-x-auto px-2">
          {Array.from({ length: highestProblem }, (_, i) => i + 1).map(
            (num) => (
              <button
                key={num}
                onClick={() => onGoToProblem(num)}
                disabled={isLoading}
                className={`flex-shrink-0 w-10 h-10 rounded-full font-bold text-base transition-all ${
                  num === currentProblem
                    ? "bg-soft-orange text-white scale-110 shadow-md"
                    : "bg-peach/40 text-text hover:bg-peach/70"
                } disabled:opacity-50`}
              >
                {num}
              </button>
            )
          )}

          {/* Discover next button */}
          <button
            onClick={onDiscoverNext}
            disabled={isLoading}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-mint text-white font-bold text-xl hover:bg-mint/80 transition-all disabled:opacity-50"
            title="Next problem"
          >
            +
          </button>
        </div>

        {/* Spacer for balance */}
        <div className="min-w-fit text-xs text-text-light">
          #{currentProblem}
        </div>
      </div>
    </div>
  );
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
    <form onSubmit={handleSubmit}>
      <div className="bg-warm-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Confused about something? Tell me which part..."
          className="w-full p-4 text-base bg-transparent resize-none focus:outline-none placeholder:text-text-light/50"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="px-4 pb-3 flex justify-end">
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-5 py-2 bg-soft-orange text-white font-semibold rounded-xl hover:bg-soft-orange/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            Ask
          </button>
        </div>
      </div>
    </form>
  );
}
