"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TestimonialsSection({
  testimonials = [],
  badge = "Trusted by 1000+ users",
  title = "What Patients Are Saying",
  description = "Real feedback from people using VitaCollab for secure, transparent healthcare collaboration.",
  autoScroll = true,
  infiniteLoop = true
}) {
  const rowRef = useRef(null);
  const touchResumeTimeoutRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const validTestimonials = useMemo(
    () =>
      (testimonials || []).filter((item) => {
        const text = String(item?.text || "").trim();
        const name = String(item?.name || "").trim();
        const rating = Number(item?.rating || 0);
        return text.length > 0 && name.length > 0 && Number.isFinite(rating) && rating >= 1 && rating <= 5;
      }),
    [testimonials]
  );

  const total = validTestimonials.length;
  const canLoop = infiniteLoop && total > 1;
  const slides = useMemo(() => {
    if (!canLoop) {
      return validTestimonials;
    }

    return [...validTestimonials, ...validTestimonials, ...validTestimonials];
  }, [canLoop, validTestimonials]);
  const baseStartIndex = canLoop ? total : 0;
  const [currentIndex, setCurrentIndex] = useState(baseStartIndex);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    setCurrentIndex(baseStartIndex);
  }, [baseStartIndex, total]);

  const scrollToIndex = useCallback((index, behavior = "smooth") => {
    const container = rowRef.current;

    if (!container) {
      return;
    }

    const cards = container.querySelectorAll("[data-testimonial-card]");
    const target = cards[index];

    if (!target) {
      return;
    }

    container.scrollTo({
      left: target.offsetLeft,
      behavior
    });
  }, []);

  const goToNext = useCallback(() => {
    if (total < 2) {
      return;
    }

    setCurrentIndex((prev) => {
      if (canLoop) {
        return prev + 1;
      }

      return Math.min(prev + 1, total - 1);
    });
  }, [canLoop, total]);

  const goToPrev = useCallback(() => {
    if (total < 2) {
      return;
    }

    setCurrentIndex((prev) => {
      if (canLoop) {
        return prev - 1;
      }

      return Math.max(prev - 1, 0);
    });
  }, [canLoop, total]);

  const goToDot = useCallback(
    (dotIndex) => {
      if (dotIndex < 0 || dotIndex > total - 1) {
        return;
      }

      setCurrentIndex(canLoop ? baseStartIndex + dotIndex : dotIndex);
    },
    [baseStartIndex, canLoop, total]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (total < 2) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrev();
      }

      if (event.key === "Home") {
        event.preventDefault();
        goToDot(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        goToDot(total - 1);
      }
    },
    [goToDot, goToNext, goToPrev, total]
  );

  useEffect(() => {
    if (!hasInitializedRef.current) {
      scrollToIndex(currentIndex, "auto");
      hasInitializedRef.current = true;
      return;
    }

    scrollToIndex(currentIndex, "smooth");
  }, [currentIndex, scrollToIndex]);

  useEffect(() => {
    if (!canLoop) {
      return undefined;
    }

    let resetTimeout;

    if (currentIndex <= total - 1) {
      resetTimeout = window.setTimeout(() => {
        setCurrentIndex((prev) => prev + total);
        scrollToIndex(currentIndex + total, "auto");
      }, 380);
    }

    if (currentIndex >= total * 2) {
      resetTimeout = window.setTimeout(() => {
        setCurrentIndex((prev) => prev - total);
        scrollToIndex(currentIndex - total, "auto");
      }, 380);
    }

    return () => {
      if (resetTimeout) {
        window.clearTimeout(resetTimeout);
      }
    };
  }, [canLoop, currentIndex, scrollToIndex, total]);

  useEffect(() => {
    if (!autoScroll || isInteracting || total < 2) {
      return undefined;
    }

    const timerId = window.setInterval(goToNext, 3500);

    return () => {
      window.clearInterval(timerId);
    };
  }, [autoScroll, goToNext, isInteracting, total]);

  const handleMouseEnter = () => {
    setIsInteracting(true);
  };

  const handleMouseLeave = () => {
    setIsInteracting(false);
  };

  const handleTouchStart = () => {
    setIsInteracting(true);

    if (touchResumeTimeoutRef.current) {
      window.clearTimeout(touchResumeTimeoutRef.current);
      touchResumeTimeoutRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (touchResumeTimeoutRef.current) {
      window.clearTimeout(touchResumeTimeoutRef.current);
    }

    touchResumeTimeoutRef.current = window.setTimeout(() => {
      setIsInteracting(false);
      touchResumeTimeoutRef.current = null;
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (touchResumeTimeoutRef.current) {
        window.clearTimeout(touchResumeTimeoutRef.current);
      }
    };
  }, []);

  const activeDot = total > 0 ? ((currentIndex % total) + total) % total : 0;
  const activeItem = validTestimonials[activeDot];
  const liveMessage = activeItem
    ? `Showing testimonial ${activeDot + 1} of ${total}: ${activeItem.name}${activeItem.location ? ` from ${activeItem.location}` : ""}.`
    : "";

  if (total === 0) {
    return (
      <section className="mt-16">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{badge}</p>
          <h2 className="heading-font text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground dark:text-gray-400">{description}</p>
        </div>
        <Card className="mx-auto max-w-2xl border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">No reviews yet</CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mt-16">
      <div className="mb-8 space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{badge}</p>
        <h2 className="heading-font text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{title}</h2>
        <p className="mx-auto max-w-2xl text-muted-foreground dark:text-gray-400">{description}</p>
      </div>

      <div
        ref={rowRef}
        className="peer flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Patient testimonials"
      >
        {slides.map((item, index) => (
          <Card
            key={`${item.name}-${item.location || "unknown"}-${index}`}
            data-testimonial-card
            className="w-[260px] flex-none snap-start group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20 sm:w-[320px] xl:w-[24%] dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                {item.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.photo} alt={item.name} className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary dark:bg-emerald-500/20 dark:text-emerald-300">
                    {item.name.charAt(0)}
                  </span>
                )}
                <div>
                  <CardTitle className="text-base dark:text-white">{item.name}</CardTitle>
                  <CardDescription className="dark:text-gray-400">{item.location || "Verified VitaCollab user"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`${item.name}-${index}`}
                    className={`h-4 w-4 ${index < Number(item.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-gray-400">&ldquo;{item.text}&rdquo;</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {total > 1 ? (
        <p
          className="mt-2 text-center text-xs text-slate-500 opacity-0 transition-opacity duration-200 peer-focus:opacity-100 dark:text-gray-300"
          aria-hidden="true"
        >
          Use left and right arrow keys to navigate testimonials.
        </p>
      ) : null}

      {total > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={goToPrev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            {validTestimonials.map((item, dotIndex) => (
              <button
                key={`dot-${item.name}-${dotIndex}`}
                type="button"
                onClick={() => goToDot(dotIndex)}
                className={`h-2.5 rounded-full transition-all ${
                  activeDot === dotIndex ? "w-6 bg-primary" : "w-2.5 bg-slate-300 dark:bg-slate-600"
                }`}
                aria-label={`Go to testimonial ${dotIndex + 1}`}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={goToNext}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </p>
    </section>
  );
}
