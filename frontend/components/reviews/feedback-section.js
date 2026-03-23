"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquareHeart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fetchApprovedReviews, fetchMyReviews, submitReview } from "@/services/review.service";

const StarRating = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const active = starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange(starValue)}
            className="rounded-md p-1 transition hover:bg-muted"
            aria-label={`Rate ${starValue}`}
          >
            <Star className={`h-5 w-5 ${active ? "fill-amber-400 text-amber-500" : "text-muted-foreground"}`} />
          </button>
        );
      })}
    </div>
  );
};

const statusToBadge = (status) => {
  if (status === "approved") {
    return "approved";
  }
  if (status === "rejected") {
    return "rejected";
  }
  return "pending";
};

export default function FeedbackSection({ role, records = [] }) {
  const toast = useToast();
  const [target, setTarget] = useState(role === "patient" ? "hospital" : "platform");
  const [hospitalId, setHospitalId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  const hospitalOptions = useMemo(() => {
    const map = new Map();
    records.forEach((record) => {
      if (record?.hospitalId && record?.hospitalName) {
        map.set(String(record.hospitalId), record.hospitalName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [records]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const approvedParams =
        target === "hospital"
          ? {
              target: "hospital",
              ...(hospitalId ? { hospitalId } : {})
            }
          : { target: "platform" };

      const [approvedRes, myRes] = await Promise.all([
        fetchApprovedReviews(approvedParams),
        fetchMyReviews()
      ]);

      setApprovedReviews(approvedRes?.data?.reviews || []);
      setMyReviews(myRes?.data?.reviews || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [hospitalId, target, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (role === "hospital") {
      setTarget("platform");
      return;
    }

    if (target === "hospital" && !hospitalId && hospitalOptions.length) {
      setHospitalId(hospitalOptions[0].id);
    }
  }, [role, target, hospitalId, hospitalOptions]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error("Please write your feedback before submitting.");
      return;
    }

    if (role === "patient" && target === "hospital" && !hospitalId) {
      toast.error("Please select a hospital first.");
      return;
    }

    try {
      setSubmitting(true);
      await submitReview({
        target,
        targetHospitalId: role === "patient" && target === "hospital" ? hospitalId : undefined,
        rating,
        comment: comment.trim()
      });
      toast.success("Feedback submitted for moderation.");
      setComment("");
      setRating(5);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareHeart className="h-5 w-5 text-primary" />
            {role === "patient" ? "Give Feedback" : "Feedback"}
          </CardTitle>
          <CardDescription>
            {role === "patient"
              ? "Share your experience with hospitals or the platform."
              : "Share your experience using the VitaCollab platform."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {role === "patient" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              >
                <option value="hospital">Hospital</option>
                <option value="platform">Platform</option>
              </select>

              {target === "hospital" ? (
                <select
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
                  value={hospitalId}
                  onChange={(event) => setHospitalId(event.target.value)}
                >
                  {!hospitalOptions.length ? <option value="">No hospitals available</option> : null}
                  {hospitalOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              ) : (
                <Input value="VitaCollab Platform" readOnly />
              )}
            </div>
          ) : (
            <Input value="VitaCollab Platform" readOnly />
          )}

          <StarRating value={rating} onChange={setRating} />

          <textarea
            className="min-h-28 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Write your feedback"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1200}
          />

          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>

          <div className="rounded-xl border border-border/70 bg-background/50 p-3">
            <p className="text-sm font-semibold">Your recent submissions</p>
            <div className="mt-2 space-y-2">
              {!myReviews.length ? <p className="text-xs text-muted-foreground">No feedback submitted yet.</p> : null}
              {myReviews.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-lg border border-border/70 bg-background px-3 py-2 text-xs">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold capitalize">{item.target}</span>
                    <Badge status={statusToBadge(item.status)}>{item.status}</Badge>
                  </div>
                  <p className="line-clamp-2 text-muted-foreground">{item.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approved Reviews</CardTitle>
          <CardDescription>Only admin-approved feedback is visible.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? <p className="text-sm text-muted-foreground">Loading reviews...</p> : null}
          {!loading && !approvedReviews.length ? <p className="text-sm text-muted-foreground">No approved reviews yet.</p> : null}
          {!loading
            ? approvedReviews.slice(0, 6).map((item) => (
                <div key={item.id} className="rounded-xl border border-border/70 bg-background/55 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    {item.userProfileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.userProfileImageUrl} alt={item.userName} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-semibold">
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
                        key={`${item.id}-star-${index}`}
                        className={`h-3.5 w-3.5 ${index < item.rating ? "fill-amber-400 text-amber-500" : "text-muted-foreground"}`}
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
