import { projects } from "@/lib/projects";

export function ProjectHighlights() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10">
        <p className="mb-2 font-mono text-sm text-accent">Research &amp; Engineering</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Quantum Simulation &amp; Developer Tooling
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          A selection of the work coming out of Quantum Powerhouse, spanning
          algorithm design, error mitigation, and developer tooling.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <div
            key={project.title}
            className="group rounded-xl border border-border/80 bg-surface/60 p-6 backdrop-blur-xl transition-all hover:border-[#20507c]/50"
          >
            <h3 className="text-lg font-semibold text-foreground">
              {project.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {project.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-surface-2 px-3 py-1 font-mono text-xs text-accent-2"
                >
                  {tag}
                </span>
              ))}
            </div>
            {(project.href || project.docsHref) && (
              <div className="mt-4 flex flex-wrap gap-4">
                {project.href && (
                  <a
                    href={project.href}
                    className="font-mono text-xs text-accent transition-colors hover:text-foreground"
                  >
                    Open playground →
                  </a>
                )}
                {project.docsHref && (
                  <a
                    href={project.docsHref}
                    className="font-mono text-xs text-muted transition-colors hover:text-foreground"
                  >
                    Read the docs →
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
