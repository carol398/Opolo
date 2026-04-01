interface FollowUpData {
  validation: string;
  workedExample?: string;
  coachingQuestion?: string;
  guidingQuestion?: string;
  newExplanation?: string;
  tryThis?: string;
  checkIn: string;
}

export function FollowUpView({ data }: { data: FollowUpData }) {
  return (
    <div className="space-y-4">
      {/* Validation */}
      <section className="bg-warm-white rounded-2xl p-5 border border-border shadow-sm">
        <p className="text-lg leading-relaxed text-text">{data.validation}</p>
      </section>

      {/* Worked example — fresh mini-lesson */}
      {data.workedExample && (
        <section className="bg-peach/20 rounded-2xl p-5 border border-soft-orange/20 shadow-sm">
          <h2 className="text-xs font-bold text-soft-orange uppercase tracking-wide mb-3">
            🎬 Let me show it a different way
          </h2>
          <div className="bg-white/70 rounded-xl p-5">
            <p className="text-base text-text leading-loose whitespace-pre-line">
              {data.workedExample}
            </p>
          </div>
        </section>
      )}

      {/* Coaching/guiding question */}
      {(data.coachingQuestion || data.guidingQuestion) && (
        <section className="bg-sky-light rounded-2xl p-5 border-2 border-sky/40 shadow-sm">
          <h2 className="text-xs font-bold text-sky uppercase tracking-wide mb-2">
            🤔 Think about this
          </h2>
          <p className="text-lg font-semibold text-text">
            {data.coachingQuestion || data.guidingQuestion}
          </p>
        </section>
      )}

      {/* New explanation */}
      {data.newExplanation && (
        <section className="bg-warm-white rounded-2xl p-5 border border-border shadow-sm">
          <p className="text-base text-text leading-relaxed whitespace-pre-line">
            {data.newExplanation}
          </p>
        </section>
      )}

      {/* Try this */}
      {data.tryThis && (
        <section className="bg-soft-orange/15 rounded-2xl p-5 border-2 border-soft-orange/40 shadow-sm">
          <h2 className="text-xs font-bold text-soft-orange uppercase tracking-wide mb-2">
            ▶️ Try this
          </h2>
          <p className="text-lg font-semibold text-text">{data.tryThis}</p>
        </section>
      )}

      {/* Check-in */}
      <section className="bg-warm-white rounded-2xl p-5 border border-border shadow-sm">
        <p className="text-base text-text">{data.checkIn}</p>
      </section>
    </div>
  );
}
