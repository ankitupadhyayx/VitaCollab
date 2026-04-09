"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const conversations = [
  { id: "conv-1", name: "Sunrise Care Hospital", status: "online" },
  { id: "conv-2", name: "City Diagnostics", status: "offline" }
];

export default function ChatPage() {
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState(conversations[0].id);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([
    { id: "m1", conversationId: "conv-1", from: "other", text: "Hello, we uploaded your latest report.", at: new Date(Date.now() - 6 * 60 * 1000).toISOString(), deliveryStatus: "read" },
    { id: "m2", conversationId: "conv-1", from: "me", text: "Thanks, I am reviewing it now.", at: new Date(Date.now() - 3 * 60 * 1000).toISOString(), deliveryStatus: "delivered" }
  ]);
  const [typingVisible, setTypingVisible] = useState(true);

  const activeMeta = useMemo(
    () => conversations.find((item) => item.id === activeConversation) || conversations[0],
    [activeConversation]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }

    const optimistic = {
      id: `m-${Date.now()}`,
      conversationId: activeConversation,
      from: "me",
      text,
      at: new Date().toISOString(),
      deliveryStatus: "sent"
    };

    setMessages((prev) => [
      ...prev,
      optimistic
    ]);
    setDraft("");
    setTypingVisible(true);

    window.setTimeout(() => {
      setMessages((prev) => prev.map((item) => (item.id === optimistic.id ? { ...item, deliveryStatus: "delivered" } : item)));
    }, 350);

    window.setTimeout(() => {
      setMessages((prev) => prev.map((item) => (item.id === optimistic.id ? { ...item, deliveryStatus: "read" } : item)));
    }, 1100);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="app-page-shell">
          <Sidebar />
          <main className="grid w-full gap-4 pb-28 lg:grid-cols-4 lg:pb-0">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Chats</CardTitle>
                <CardDescription>Patient and hospital conversations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {conversations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveConversation(item.id)}
                    className={`w-full rounded-2xl px-3 py-3 text-left ${activeConversation === item.id ? "bg-primary text-primary-foreground" : "bg-background/70"}`}
                  >
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className={`text-xs ${activeConversation === item.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{item.status}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{activeMeta.name}</CardTitle>
                <CardDescription>
                  Secure messaging thread for {user?.role === "hospital" ? "patient coordination" : "care coordination"}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-[58vh] min-h-[360px] space-y-3 overflow-auto rounded-2xl bg-background/65 p-3 sm:h-[420px]">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.from === "me" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm sm:max-w-[75%] ${message.from === "me" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                        <p>{message.text}</p>
                        <p className={`mt-1 text-[11px] ${message.from === "me" ? "text-primary-foreground" : "text-muted-foreground"}`}>
                          {new Date(message.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {message.from === "me" ? ` • ${message.deliveryStatus || "sent"}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                  {typingVisible ? <p className="text-xs text-muted-foreground">{activeMeta.name} is typing...</p> : null}
                  <div ref={bottomRef} />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Write a secure message..."
                    className="h-11 flex-1 rounded-xl border border-border bg-background px-3 text-sm"
                  />
                  <Button type="button" onClick={sendMessage} className="h-11 w-full sm:w-auto">
                    <SendHorizontal className="h-4 w-4" /> Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
