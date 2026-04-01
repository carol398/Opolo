"use client";

import { useState } from "react";

interface ChoiceData {
  letter: string;
  text: string;
  demo?: string;
}

interface BreakdownData {
  warmOpener: string;
  // New unified format
  questionAndChoices?: {
    question: string;
    context: string;
    choices: ChoiceData[];
  };
  // Legacy fields (backward compat)
  whatThisIsAsking?: string;
  visualBreakdown?: string;
  answerChoices?: ChoiceData[];
  workedExample?: string;
  explanation?: string;
  steps?: string[];
  wordsToKnow?: { word: string; meaning: string; visual?: string }[];
  checkIn: string;
}

export function BreakdownView({ data }: { data: BreakdownData }) {
  // Support both new and legacy formats
  const question =
    data.questionAndChoices?.question || data.whatThisIsAsking || "";
  const context = data.questionAndChoices?.context || "";
  const choices =
    data.questionAndChoices?.choices || data.answerChoices || [];

  return (
    <div className="space-y-5">
      {/* Warm opener */}
      <section className="bg-warm-white rounded-2xl p-5 border border-border shadow-sm">
        <p className="text-lg text-text">{data.warmOpener}</p>
      </section>

      {/* Question + choices — ONE section, no separation */}
      <section className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Question header */}
        <div className="bg-sky-light p-5 border-b border-sky/20">
          <p className="text-lg font-semibold text-text">{question}</p>
          {context && (
            <p className="text-base text-text-light mt-2">{context}</p>
          )}
        </div>

        {/* Legacy visual breakdown if no choices */}
        {data.visualBreakdown && choices.length === 0 && (
          <div className="p-5 border-b border-border">
            <StoryFlow text={data.visualBreakdown} />
          </div>
        )}

        {/* Clickable choices — right here with the question */}
        {choices.length > 0 && (
          <div className="divide-y divide-border">
            {choices.map((choice, i) => (
              <InteractiveChoice key={i} choice={choice} />
            ))}
          </div>
        )}

        {/* Inline prompt */}
        {choices.length > 0 && (
          <div className="bg-cream/50 px-5 py-3 border-t border-border">
            <p className="text-sm text-text-light">
              👆 Click each choice to see what happens
            </p>
          </div>
        )}
      </section>

      {/* Worked example — coaching mini-lesson */}
      {data.workedExample && (
        <WorkedExample text={data.workedExample} />
      )}

      {/* Legacy: explanation fallback */}
      {!data.workedExample && data.explanation && (
        <section className="bg-peach/20 rounded-2xl p-5 border border-soft-orange/20 shadow-sm">
          <p className="text-base text-text leading-relaxed whitespace-pre-line">
            {data.explanation}
          </p>
        </section>
      )}

      {/* Legacy: steps fallback — only if no interactive choices */}
      {data.steps && data.steps.length > 0 && choices.length === 0 && (
        <section className="bg-mint-light rounded-2xl p-5 border border-mint/30 shadow-sm">
          <h2 className="text-xs font-bold text-green-600 uppercase tracking-wide mb-3">
            📝 Steps
          </h2>
          <ol className="space-y-2">
            {data.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-mint flex items-center justify-center text-white font-bold text-xs">
                  {i + 1}
                </span>
                <span className="text-base text-text">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Check-in */}
      <section className="bg-warm-white rounded-2xl p-5 border border-border shadow-sm">
        <p className="text-base text-text">{data.checkIn}</p>
      </section>
    </div>
  );
}

function InteractiveChoice({ choice }: { choice: ChoiceData }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-4 hover:bg-peach/10 transition-colors text-left"
      >
        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-soft-orange flex items-center justify-center text-white font-bold">
          {(choice.letter || "?").charAt(0)}
        </span>
        <span className="text-base text-text flex-1">{choice.text}</span>
        <span className="text-text-light text-sm">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && choice.demo && (
        <div className="px-4 pb-4">
          <div className="bg-cream rounded-xl p-5 border border-border">
            <p className="text-base text-text leading-loose whitespace-pre-line">
              {choice.demo}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkedExample({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="bg-peach/15 rounded-2xl border border-soft-orange/20 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <h2 className="text-xs font-bold text-soft-orange uppercase tracking-wide">
          🎬 Watch how this works (with different numbers)
        </h2>
        <span className="text-text-light text-sm">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="px-5 pb-5">
          <div className="bg-white/70 rounded-xl p-5">
            <p className="text-base text-text leading-loose whitespace-pre-line">
              {text}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function StoryFlow({ text }: { text: string }) {
  const blocks = text
    .split(/\n\s*↓\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length <= 1) {
    return (
      <p className="text-base text-text leading-relaxed whitespace-pre-line">
        {text}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => (
        <div key={i}>
          <div className="bg-cream/50 rounded-lg p-3 border border-border/50">
            <p className="text-base text-text leading-relaxed whitespace-pre-line">
              {block}
            </p>
          </div>
          {i < blocks.length - 1 && (
            <div className="flex justify-center">
              <span className="text-sm text-text-light">↓</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
