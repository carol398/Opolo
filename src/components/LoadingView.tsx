export function LoadingView() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="text-6xl animate-bounce">🌱</div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-text">
            Looking at your homework...
          </h2>
          <p className="text-lg text-text-light">
            Give me a sec — I am breaking it down so it makes sense.
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center gap-3">
          <div
            className="w-4 h-4 rounded-full bg-soft-orange animate-pulse"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-4 h-4 rounded-full bg-sky animate-pulse"
            style={{ animationDelay: "300ms" }}
          />
          <div
            className="w-4 h-4 rounded-full bg-mint animate-pulse"
            style={{ animationDelay: "600ms" }}
          />
        </div>
      </div>
    </main>
  );
}
