"use client";

import { useMemo } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, MessageSquareHeart, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSharedPublicReviews } from "@/hooks/use-shared-reviews";
import { Skeleton } from "@/components/ui/skeleton";

const getAverage = (values) => {
  if (!values.length) {
    return 0;
  }

  const total = values.reduce((sum, item) => sum + Number(item.rating || 0), 0);
  return Math.round((total / values.length) * 10) / 10;
};

const getTrend = (reviews) => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const recentStart = now - 30 * dayMs;
  const previousStart = now - 60 * dayMs;

  const recent = reviews.filter((item) => new Date(item.createdAt).getTime() >= recentStart);
  const previous = reviews.filter((item) => {
    const ts = new Date(item.createdAt).getTime();
    return ts >= previousStart && ts < recentStart;
  });

  const recentAvg = getAverage(recent);
  const previousAvg = getAverage(previous);

  if (!previous.length && !recent.length) {
    return { direction: "flat", delta: 0, text: "No rating trend yet" };
  }

  if (!previous.length) {
    return { direction: "up", delta: recentAvg, text: `+${recentAvg.toFixed(1)} from baseline` };
  }

  const delta = Math.round((recentAvg - previousAvg) * 10) / 10;
  if (delta > 0) {
    return { direction: "up", delta, text: `+${delta.toFixed(1)} vs previous 30 days` };
  }
  if (delta < 0) {
    return { direction: "down", delta, text: `${delta.toFixed(1)} vs previous 30 days` };
  }

  return { direction: "flat", delta: 0, text: "No change vs previous 30 days" };
};

const TrendBadge = ({ trend }) => {
  if (trend.direction === "up") {
    return (
      <p className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-xs font-semibold text-success">
        <ArrowUpRight className="h-3.5 w-3.5" /> {trend.text}
      </p>
    );
  }

  if (trend.direction === "down") {
    return (
      <p className="inline-flex items-center gap-1 rounded-full bg-danger/15 px-2 py-1 text-xs font-semibold text-danger">
        <ArrowDownRight className="h-3.5 w-3.5" /> {trend.text}
      </p>
    );
  }

  return (
    <p className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
      <ArrowRight className="h-3.5 w-3.5" /> {trend.text}
    </p>
  );
};

export default function HospitalReviewWidget({ hospitalId }) {
  const { reviews, isLoading: loading } = useSharedPublicReviews(
    {
      target: "hospital",
      hospitalId,
      limit: 50,
      page: 1
    },
    {
      enabled: Boolean(hospitalId),
      staleTime: 2 * 60 * 1000
    }
  );

  const averageRating = useMemo(() => getAverage(reviews), [reviews]);
  const trend = useMemo(() => getTrend(reviews), [reviews]);

  const monthlyBuckets = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en", { month: "short" });
    const monthMap = new Map();

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthMap.set(key, { label: formatter.format(date), total: 0 });
    }

    reviews.forEach((item) => {
      const date = new Date(item.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (monthMap.has(key)) {
        monthMap.get(key).total += 1;
      }
    });

    return Array.from(monthMap.values());
  }, [reviews]);

  const maxMonthCount = useMemo(
    () => Math.max(1, ...monthlyBuckets.map((item) => item.total)),
    [monthlyBuckets]
  );

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareHeart className="h-5 w-5 text-primary" />
            Public Feedback Score
          </CardTitle>
          <CardDescription>Visible patient reviews for your hospital profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <Skeleton className="h-16 w-full" /> : null}
          {!loading ? (
            <>
              <p className="text-3xl font-bold">{averageRating.toFixed(1)} / 5</p>
              <p className="text-xs text-muted-foreground">Based on {reviews.length} public review{reviews.length === 1 ? "" : "s"}</p>
              <TrendBadge trend={trend} />
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Trend</CardTitle>
          <CardDescription>Public review volume over the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-24 w-full" /> : null}
          {!loading ? (
            <div className="flex items-end justify-between gap-2">
              {monthlyBuckets.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-20 w-full items-end rounded bg-muted/40 px-1">
                    <div
                      className="w-full rounded bg-primary"
                      style={{ height: `${Math.max(6, Math.round((item.total / maxMonthCount) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Public Reviews</CardTitle>
          <CardDescription>Latest public feedback shown on your profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : null}
          {!loading && !reviews.length ? <p className="text-sm text-muted-foreground">No public reviews yet.</p> : null}
          {!loading
            ? reviews.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-xl border border-border/70 bg-background/55 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    {item.userProfileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.userProfileImageUrl} alt={item.userName} className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-muted text-xs font-semibold">
                        {String(item.userName || "U").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold">{item.userName}</p>
                      <p className="text-[11px] capitalize text-muted-foreground">{item.role}</p>
                    </div>
                  </div>

                  <div className="mb-1 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={`${item.id}-${index}`}
                        className={`h-3.5 w-3.5 ${index < Number(item.rating || 0) ? "fill-amber-400 text-amber-500" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground">{item.comment}</p>
                </div>
              ))
            : null}
        </CardContent>
      </Card>
    </section>
  );
}
