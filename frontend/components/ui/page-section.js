export function PageIntro({ badge, title, description, className = "" }) {
  return (
    <section className={`space-y-5 animate-rise ${className}`.trim()}>
      {badge ? (
        <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {badge}
        </p>
      ) : null}
      <h1 className="heading-font text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      {description ? <p className="max-w-3xl text-muted-foreground">{description}</p> : null}
    </section>
  );
}

export function SectionHeading({ title, className = "" }) {
  return <h2 className={`heading-font text-2xl font-bold tracking-tight sm:text-3xl ${className}`.trim()}>{title}</h2>;
}
