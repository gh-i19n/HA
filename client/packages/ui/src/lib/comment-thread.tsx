"use client";

import { Avatar, AvatarFallback } from "../components/avatar";
import { Button } from "../components/button";
import { ScrollArea } from "../components/scroll-area";
import { Textarea } from "../components/textarea";
import { cn } from "./utils";
import { FormEvent, useState } from "react";

export interface CommentThreadItem {
  readonly id: string;
  readonly authorName: string;
  readonly authorInitials: string;
  readonly body: string;
  readonly timestamp: string;
  readonly isCurrentUser?: boolean;
}

interface CommentThreadProps {
  readonly comments: readonly CommentThreadItem[];
  readonly onSubmit: (body: string) => void | Promise<unknown>;
  readonly submitting?: boolean;
  readonly loading?: boolean;
  readonly title?: string;
  readonly emptyMessage?: string;
  readonly placeholder?: string;
  readonly className?: string;
}

export function CommentThread({
  comments,
  onSubmit,
  submitting = false,
  loading = false,
  title = "Discussion",
  emptyMessage = "No comments yet. Start the conversation here.",
  placeholder = "Add context, a question, or an update...",
  className,
}: CommentThreadProps) {
  const [body, setBody] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextBody = body.trim();
    if (!nextBody || submitting) return;
    await onSubmit(nextBody);
    setBody("");
  }

  return (
    <section
      aria-label={title}
      className={cn(
        "flex min-h-0 flex-col rounded-xl border border-border bg-surface",
        className,
      )}
    >
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-xs text-foreground-muted">
          Keep decisions and working context attached to this item.
        </p>
      </header>

      <ScrollArea className="min-h-64 flex-1">
        <div className="space-y-4 p-4">
          {loading ? (
            <p className="text-sm text-foreground-muted">Loading discussion...</p>
          ) : comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-foreground-muted">
              {emptyMessage}
            </p>
          ) : (
            comments.map((comment) => (
              <article className="flex gap-3" key={comment.id}>
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary-subtle text-xs font-semibold text-primary">
                    {comment.authorInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-semibold text-foreground">
                      {comment.authorName}
                    </span>
                    {comment.isCurrentUser ? (
                      <span className="text-xs text-foreground-muted">You</span>
                    ) : null}
                    <time className="text-xs text-foreground-muted">
                      {comment.timestamp}
                    </time>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground-muted">
                    {comment.body}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </ScrollArea>

      <form
        className="space-y-2 border-t border-border p-3"
        onSubmit={handleSubmit}
      >
        <Textarea
          aria-label="Add a comment"
          onChange={(event) => setBody(event.target.value)}
          placeholder={placeholder}
          value={body}
        />
        <div className="flex justify-end">
          <Button
            disabled={!body.trim() || submitting}
            size="sm"
            type="submit"
            variant="primary"
          >
            {submitting ? "Posting..." : "Post comment"}
          </Button>
        </div>
      </form>
    </section>
  );
}
