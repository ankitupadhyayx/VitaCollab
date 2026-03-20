"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-danger/10 text-danger">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <CardTitle>Access restricted</CardTitle>
          <CardDescription>Your account role does not have permission to open this page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard" className="text-sm font-semibold text-primary">Go back to dashboard</Link>
        </CardContent>
      </Card>
    </main>
  );
}
