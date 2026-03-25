import { BellRing, Building2, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const variantConfig = {
  records: {
    icon: FileSearch,
    title: "No medical records yet",
    description: "Upload your first secure report to start building your patient-authorized timeline.",
    actionLabel: "Upload record"
  },
  notifications: {
    icon: BellRing,
    title: "You're all caught up",
    description: "No new alerts right now. We will notify you when updates arrive.",
    actionLabel: "Go to dashboard"
  },
  hospitals: {
    icon: Building2,
    title: "Connect your first hospital",
    description: "Link a hospital profile to unlock direct record collaboration.",
    actionLabel: "Connect now"
  }
};

export function EmptyState({ title, description, action, variant = "records", onAction }) {
  const config = variantConfig[variant] || variantConfig.records;
  const Icon = config.icon;

  return (
    <Card className="border-dashed bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle>{title || config.title}</CardTitle>
        <CardDescription>{description || config.description}</CardDescription>
      </CardHeader>
      {action ? (
        <CardContent>{action}</CardContent>
      ) : (
        <CardContent>
          <Button size="sm" variant="secondary" className="w-full sm:w-auto" onClick={onAction}>{config.actionLabel}</Button>
        </CardContent>
      )}
    </Card>
  );
}
