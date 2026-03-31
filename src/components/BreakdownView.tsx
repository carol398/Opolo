interface BreakdownData {
  warmOpener: string;
  whatThisIsAsking: string;
  visualBreakdown: string;
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

      {/* Visual breakdown — THE MOST IMPORTANT PART */}
      <section className="bg-lavender-light rounded-2xl p-6 border border-lavender/30 shadow-sm">
        <h2 className="text-sm font-bold text-lavender uppercase tracking-wide mb-4">
          👀 Here is what it looks like
        </h2>
        <pre className="text-lg font-mono leading-loose text-text whitespace-pre-wrap bg-white/60 rounded-xl p-5 overflow-x-auto">
          {data.visualBreakdown}
        </pre>
      </section>

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
