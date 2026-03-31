interface FollowUpData {
  validation: string;
  newExplanation: string;
  tryThis: string;
  checkIn: string;
}

export function FollowUpView({ data }: { data: FollowUpData }) {
  return (
    <div className="space-y-5">
      {/* Validation */}
      <section className="bg-warm-white rounded-2xl p-6 border border-border shadow-sm">
        <p className="text-xl leading-relaxed text-text">{data.validation}</p>
      </section>

      {/* New explanation with visual */}
      <section className="bg-lavender-light rounded-2xl p-6 border border-lavender/30 shadow-sm">
        <h2 className="text-sm font-bold text-lavender uppercase tracking-wide mb-4">
          🔄 Let me show it a different way
        </h2>
        <pre className="text-lg font-mono leading-loose text-text whitespace-pre-wrap bg-white/60 rounded-xl p-5">
          {data.newExplanation}
        </pre>
      </section>

      {/* Try this */}
      <section className="bg-soft-orange/15 rounded-2xl p-6 border-2 border-soft-orange/40 shadow-sm">
        <h2 className="text-sm font-bold text-soft-orange uppercase tracking-wide mb-3">
          ▶️ Try this
        </h2>
        <p className="text-xl font-semibold text-text leading-relaxed">
          {data.tryThis}
        </p>
      </section>

      {/* Check-in */}
      <section className="bg-warm-white rounded-2xl p-6 border border-border shadow-sm">
        <p className="text-lg text-text leading-relaxed">{data.checkIn}</p>
      </section>
    </div>
  );
}
