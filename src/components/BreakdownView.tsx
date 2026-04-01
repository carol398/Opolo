"use client";

import { useState } from "react";

interface BreakdownData {
  warmOpener: string;
  whatThisIsAsking: string;
  visualBreakdown: string;
  workedExample?: string;
  explanation?: string;
  guidingQuestion?: string;
  answerChoices: {
    letter: string;
    text: string;
    demo?: string;
    isCorrect?: boolean;
  }[];
  steps: string[];
  wordsToKnow: { word: string; meaning: string; visual?: string }[];
  startHere?: string;
  checkIn: string;
}

export function BreakdownView({ data }: { data: BreakdownData }) {
  return (
    <div className="space-y-5">
      {/* Warm opener — compact */}
      <section className="bg-warm-white rounded-2xl p-5 border border-border shadow-sm">
        <p className="text-lg leading-relaxed text-text">{data.warmOpener}</p>
      </section>

      {/* Problem context — what + visual together, stays compact */}
      <section className="bg-sky-light rounded-2xl p-5 border border-sky/30 shadow-sm space-y-4">
        <div>
          <h2 className="text-xs font-bold text-sky uppercase tracking-wide mb-2">
            🎯 What this is asking
          </h2>
          <p className="text-lg font-semibold text-text">
            {data.whatThisIsAsking}
          </p>
        </div>
        <StoryFlow text={data.visualBreakdown} />
      </section>

      {/* Worked example — live on screen mini-lesson */}
      {data.workedExample && (
        <section className="bg-peach/20 rounded-2xl p-5 border border-soft-orange/20 shadow-sm">
          <h2 className="text-xs font-bold text-soft-orange uppercase tracking-wide mb-3">
            🎬 Watch how this works
          </h2>
          <div className="bg-white/70 rounded-xl p-5">
            <p className="text-base text-text leading-loose whitespace-pre-line">
              {data.workedExample}
            </p>
          </div>
        </section>
      )}

      {/* Legacy explanation fallback */}
      {!data.workedExample && data.explanation && (
        <section className="bg-peach/20 rounded-2xl p-5 border border-soft-orange/20 shadow-sm">
          <h2 className="text-xs font-bold text-soft-orange uppercase tracking-wide mb-2">
            💡 Why this works
          </h2>
          <p className="text-base text-text leading-relaxed whitespace-pre-line">
            {data.explanation}
          </p>
        </section>
      )}

      {/* Interactive answer choices — click to see demo */}
      {data.answerChoices && data.answerChoices.length > 0 && (
        <section className="rounded-2xl overflow-hidden">
          <div className="bg-warm-white p-5 border border-border rounded-t-2xl">
            <h2 className="text-xs font-bold text-text-light uppercase tracking-wide">
              👆 Click each choice to see what happens
            </h2>
          </div>
          <div className="border border-t-0 border-border rounded-b-2xl divide-y divide-border">
            {data.answerChoices.map((choice, i) => (
              <InteractiveChoice key={i} choice={choice} />
            ))}
          </div>
        </section>
      )}

      {/* Steps — compact */}
      <section className="bg-mint-light rounded-2xl p-5 border border-mint/30 shadow-sm">
        <h2 className="text-xs font-bold text-green-600 uppercase tracking-wide mb-3">
          📝 Steps
        </h2>
        <ol className="space-y-3">
          {data.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-mint flex items-center justify-center text-white font-bold text-sm">
                {i + 1}
              </span>
              <span className="text-base text-text pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Words to know — visual, only if present */}
      {data.wordsToKnow && data.wordsToKnow.length > 0 && (
        <section className="bg-warm-white rounded-2xl p-5 border border-border shadow-sm">
          <h2 className="text-xs font-bold text-text-light uppercase tracking-wide mb-3">
            📚 Words to know
          </h2>
          <div className="space-y-4">
            {data.wordsToKnow.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-base text-text">
                    {item.word}
                  </span>
                  <span className="text-sm text-text-light">
                    — {item.meaning}
                  </span>
                </div>
                {item.visual && (
                  <div className="bg-cream rounded-lg p-3 text-base">
                    {item.visual}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Check-in */}
      <section className="bg-warm-white rounded-2xl p-5 border border-border shadow-sm">
        <p className="text-base text-text">{data.checkIn}</p>
      </section>
    </div>
  );
}

function InteractiveChoice({
  choice,
}: {
  choice: {
    letter: string;
    text: string;
    demo?: string;
    isCorrect?: boolean;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-warm-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-4 hover:bg-peach/10 transition-colors text-left"
      >
        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-soft-orange flex items-center justify-center text-white font-bold text-lg">
          {(choice.letter || "?").charAt(0)}
        </span>
        <span className="text-lg text-text flex-1">{choice.text}</span>
        <span className="text-text-light text-xl">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && choice.demo && (
        <div className="px-4 pb-4">
          <div
            className={`rounded-xl p-5 border-2 ${
              choice.isCorrect
                ? "bg-mint-light border-mint/40"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p className="text-base text-text leading-loose whitespace-pre-line">
              {choice.demo}
            </p>
            <div className="mt-3 pt-3 border-t border-current/10">
              <span
                className={`text-lg font-bold ${
                  choice.isCorrect ? "text-green-600" : "text-red-500"
                }`}
              >
                {choice.isCorrect ? "✅ This one works!" : "❌ This one doesn't work"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StoryFlow({ text }: { text: string }) {
  const blocks = text
    .split(/\n\s*↓\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length <= 1) {
    return (
      <div className="bg-white/60 rounded-xl p-4">
        <p className="text-base text-text leading-relaxed whitespace-pre-line">
          {text}
        </p>
      </div>
    );
  }

  const cardStyles = [
    "bg-white/60 border-sky/20",
    "bg-peach/20 border-soft-orange/15",
    "bg-mint-light/50 border-mint/20",
  ];

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => (
        <div key={i}>
          <div
            className={`rounded-xl p-4 border ${cardStyles[i % cardStyles.length]}`}
          >
            <p className="text-base text-text leading-relaxed whitespace-pre-line">
              {block}
            </p>
          </div>
          {i < blocks.length - 1 && (
            <div className="flex justify-center py-0.5">
              <span className="text-lg text-sky">↓</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
