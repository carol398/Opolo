interface FollowUpData {
  validation: string;
  guidingQuestion?: string;
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

      {/* Guiding question — scaffolded thinking */}
      {data.guidingQuestion && (
        <section className="bg-sky-light rounded-2xl p-6 border-2 border-sky/40 shadow-sm">
          <h2 className="text-sm font-bold text-sky uppercase tracking-wide mb-3">
            🤔 Think about this
          </h2>
          <p className="text-xl font-semibold text-text leading-relaxed">
            {data.guidingQuestion}
          </p>
        </section>
      )}

      {/* New explanation */}
      {data.newExplanation && (
        <section className="bg-peach/20 rounded-2xl p-5 border border-soft-orange/20 shadow-sm">
          <h2 className="text-sm font-bold text-soft-orange uppercase tracking-wide mb-2">
            🔄 A different way to see it
          </h2>
          <p className="text-lg text-text leading-relaxed whitespace-pre-line">
            {data.newExplanation}
          </p>
        </section>
      )}

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
