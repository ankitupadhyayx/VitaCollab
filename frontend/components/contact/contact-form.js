"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const toast = useToast();

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, message })
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to send message");
      }

      const messageText = result?.message || "Message sent successfully 🚀";
      setSuccessMessage(messageText);
      toast.success(messageText);
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      const text = error?.message || "Unable to send message";
      setErrorMessage(text);
      toast.error(text);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input
        name="name"
        placeholder="Your name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <Input
        type="email"
        name="email"
        placeholder="Your email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Textarea
        name="message"
        placeholder="Write your message"
        rows={6}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        <span className="inline-flex items-center gap-2">
          {isSubmitting ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
          ) : null}
          {isSubmitting ? "Sending..." : "Send Message"}
        </span>
      </Button>
      {successMessage ? <p className="text-sm text-success" role="status">{successMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-destructive" role="alert">{errorMessage}</p> : null}
    </form>
  );
}
