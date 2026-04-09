export function PageIntro({ badge, title, description, className = "" }) {
  return (
    <section className={`space-y-6 animate-rise ${className}`.trim()}>
      {badge ? (
        <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase leading-none tracking-[0.16em] text-primary">
          {badge}
        </p>
      ) : null}
      <h1 className="heading-font text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-5xl">{title}</h1>
      {description ? <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p> : null}
    </section>
  );
}

export function SectionHeading({ title, className = "" }) {
  return <h2 className={`heading-font text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-3xl ${className}`.trim()}>{title}</h2>;
}
