/** Static, non-WebGL, non-animated visual — shown when reduced motion is requested or WebGL is unavailable. */
export function ResearchHeroFallback() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 55%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 14%, transparent 30%), " +
            "radial-gradient(ellipse 60% 22% at 50% 55%, rgba(6,182,212,0.5), rgba(124,58,237,0.35) 55%, transparent 75%), " +
            "radial-gradient(ellipse 70% 50% at 20% 10%, rgba(6,182,212,0.12), transparent 60%), " +
            "radial-gradient(ellipse 60% 45% at 85% 15%, rgba(124,58,237,0.14), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(1px 1px at 60% 70%, white, transparent), radial-gradient(1px 1px at 80% 20%, white, transparent), radial-gradient(1px 1px at 35% 85%, white, transparent), radial-gradient(1px 1px at 90% 60%, white, transparent)",
          backgroundSize: "100% 100%",
        }}
      />
    </div>
  );
}
