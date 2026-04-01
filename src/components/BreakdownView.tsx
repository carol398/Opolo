interface BreakdownData {
  warmOpener: string;
  whatThisIsAsking: string;
  visualBreakdown: string;
  explanation: string;
  answerChoices: { letter: string; text: string }[];
  steps: string[];
  wordsToKnow: { word: string; meaning: string }[];
  startHere: string;
  checkIn: string;
}

export function BreakdownView({ data }: { data: BreakdownData }) {
  return (
    <div className="space-y-6">
      {/* Warm opener */}
      <section className="bg-warm-white rounded-2xl p-6 border border-border shadow-sm">
        <p className="text-xl leading-relaxed text-text">{data.warmOpener}</p>
      </section>

      {/* What this is asking — plain language summary */}
      <section className="bg-sky-light rounded-2xl p-6 border border-sky/30 shadow-sm">
        <h2 className="text-sm font-bold text-sky uppercase tracking-wide mb-3">
          🎯 What this is asking you to do
        </h2>
        <p className="text-xl font-semibold text-text leading-relaxed">
          {data.whatThisIsAsking}
        </p>
      </section>

      {/* Visual breakdown — Story Flow format */}
      <section className="bg-lavender-light rounded-2xl p-6 border border-lavender/30 shadow-sm">
        <h2 className="text-sm font-bold text-lavender uppercase tracking-wide mb-4">
          👀 Here is what it looks like
        </h2>
        <StoryFlow text={data.visualBreakdown} />
      </section>

      {/* Explanation — short, 5th grade level */}
      {data.explanation && (
        <section className="bg-peach/20 rounded-2xl p-5 border border-soft-orange/20 shadow-sm">
          <h2 className="text-sm font-bold text-soft-orange uppercase tracking-wide mb-2">
            💡 Why this works
          </h2>
          <p className="text-base text-text leading-relaxed whitespace-pre-line">
            {data.explanation}
          </p>
        </section>
      )}

      {/* Answer choices — only if the homework has them */}
      {data.answerChoices && data.answerChoices.length > 0 && (
        <section className="bg-warm-white rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-sm font-bold text-text-light uppercase tracking-wide mb-4">
            🔤 Your answer choices
          </h2>
          <div className="space-y-3">
            {data.answerChoices.map((choice, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-cream rounded-xl p-4 border border-border"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-soft-orange flex items-center justify-center text-white font-bold text-lg">
                  {(choice.letter || String(i + 1)).charAt(0)}
                </span>
                <span className="text-lg text-text leading-snug">
                  {choice.text}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Steps */}
      <section className="bg-mint-light rounded-2xl p-6 border border-mint/30 shadow-sm">
        <h2 className="text-sm font-bold text-green-600 uppercase tracking-wide mb-4">
          📝 Here is how to do it, one step at a time
        </h2>
        <ol className="space-y-4">
          {data.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="flex-shrink-0 w-9 h-9 rounded-full bg-mint flex items-center justify-center text-white font-bold text-lg">
                {i + 1}
              </span>
              <span className="text-lg text-text pt-1 leading-relaxed">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Words to know — only if there are any */}
      {data.wordsToKnow && data.wordsToKnow.length > 0 && (
        <section className="bg-peach/30 rounded-2xl p-6 border border-soft-orange/20 shadow-sm">
          <h2 className="text-sm font-bold text-soft-orange uppercase tracking-wide mb-4">
            📚 Words to know
          </h2>
          <div className="space-y-3">
            {data.wordsToKnow.map((item, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="font-bold text-lg text-text">
                  {item.word}
                </span>
                <span className="text-text-light text-base">
                  {item.meaning}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Start here */}
      <section className="bg-soft-orange/15 rounded-2xl p-6 border-2 border-soft-orange/40 shadow-sm">
        <h2 className="text-sm font-bold text-soft-orange uppercase tracking-wide mb-3">
          ▶️ Start here
        </h2>
        <p className="text-xl font-semibold text-text leading-relaxed">
          {data.startHere}
        </p>
      </section>

      {/* Check-in */}
      <section className="bg-warm-white rounded-2xl p-6 border border-border shadow-sm">
        <h2 className="text-sm font-bold text-text-light uppercase tracking-wide mb-3">
          💬 How are you feeling about this?
        </h2>
        <p className="text-lg text-text leading-relaxed">{data.checkIn}</p>
      </section>
    </div>
  );
}

function StoryFlow({ text }: { text: string }) {
  // Split on arrow separators (↓) to get individual blocks
  const blocks = text
    .split(/\n\s*↓\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length <= 1) {
    // Fallback: if no arrow separators found, render as styled text
    return (
      <div className="bg-white/60 rounded-xl p-5">
        <p className="text-lg text-text leading-loose whitespace-pre-line">
          {text}
        </p>
      </div>
    );
  }

  // Color cycle for the cards
  const cardStyles = [
    "bg-sky-light border-sky/30",
    "bg-peach/30 border-soft-orange/20",
    "bg-mint-light border-mint/30",
    "bg-lavender-light border-lavender/40",
  ];

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={i}>
          <div
            className={`rounded-xl p-5 border ${cardStyles[i % cardStyles.length]}`}
          >
            <p className="text-lg text-text leading-relaxed whitespace-pre-line">
              {block}
            </p>
          </div>
          {/* Arrow between blocks */}
          {i < blocks.length - 1 && (
            <div className="flex justify-center py-1">
              <span className="text-2xl text-lavender">↓</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
