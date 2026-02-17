"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  MessageSquare,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CampaignRef {
  campaignId: string;
  name: string;
}

interface ChatPanelProps {
  accountId?: string;
  accountName?: string;
  campaigns?: CampaignRef[];
  onHighlight?: (ids: Set<string>) => void;
  /** When true, renders as a sidebar column. When false, renders as a mobile bottom sheet. */
  inline?: boolean;
}

const SUGGESTED_PROMPTS = [
  "Which campaigns should I increase budget for?",
  "Analyze my ACOS trends and recommend optimizations",
  "Find campaigns with high spend but low ROAS",
  "Suggest bid adjustments for my top campaigns",
];

/**
 * Scan the AI response text for campaign names, return matching IDs.
 */
function findMentionedCampaigns(
  text: string,
  campaigns: CampaignRef[],
): Set<string> {
  const ids = new Set<string>();
  for (const c of campaigns) {
    if (text.includes(c.name)) {
      ids.add(c.campaignId);
    }
  }
  return ids;
}

export function ChatPanel({
  accountId,
  accountName,
  campaigns = [],
  onHighlight,
  inline = false,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestResponseRef = useRef("");

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Update highlights whenever the latest assistant message changes
  useEffect(() => {
    if (!onHighlight || campaigns.length === 0) return;
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (lastAssistant?.content) {
      const mentioned = findMentionedCampaigns(
        lastAssistant.content,
        campaigns,
      );
      onHighlight(mentioned);
    }
  }, [messages, campaigns, onHighlight]);

  // Clear highlights when account changes
  useEffect(() => {
    onHighlight?.(new Set());
    setMessages([]);
    latestResponseRef.current = "";
  }, [accountId, onHighlight]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;

      const userMessage: Message = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setStreaming(true);
      latestResponseRef.current = "";

      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/ads/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            history,
            accountId,
            accountName,
          }),
        });

        if (!res.ok) throw new Error("Chat request failed");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                latestResponseRef.current += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + parsed.text,
                    };
                  }
                  return updated;
                });
              }
              if (parsed.error) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content:
                        last.content + `\n\n**Error:** ${parsed.error}`,
                    };
                  }
                  return updated;
                });
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } catch (err) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content: `Failed to get response. ${err instanceof Error ? err.message : ""}`,
            };
          }
          return updated;
        });
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming, accountId, accountName],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const chatContent = (
    <>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF9900]/10 text-[#FF9900]">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Ads Optimizer AI
            </p>
            <p className="font-mono text-[10px] text-zinc-600">
              Powered by Claude on Bedrock
            </p>
          </div>
        </div>
        {/* Mobile collapse button */}
        {!inline && (
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-white xl:hidden"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <Sparkles className="h-8 w-8 text-[#FF9900]/40" />
            <p className="mt-3 text-center text-sm text-zinc-500">
              {accountName
                ? `Ask me anything about ${accountName}'s campaigns`
                : "Select an account to get optimization recommendations"}
            </p>
            {accountId && (
              <div className="mt-5 w-full space-y-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-left font-mono text-[11px] text-zinc-500 transition-colors hover:border-[#FF9900]/20 hover:text-zinc-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#FF9900]/10 text-[#FF9900]">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-[#FF9900]/10 text-white"
                      : "bg-zinc-900/50 text-zinc-300"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-strong:text-white prose-ul:text-zinc-300 prose-li:text-zinc-300 prose-code:text-[#FF9900]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content ||
                          (streaming && i === messages.length - 1
                            ? "Thinking..."
                            : "")}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-zinc-500">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-zinc-800 p-3">
        <div className="flex items-end gap-2 rounded-xl border border-zinc-800 bg-zinc-900/30 px-3 py-2 focus-within:border-[#FF9900]/30">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              accountId
                ? "Ask for campaign recommendations..."
                : "Select an account first..."
            }
            disabled={!accountId || streaming}
            rows={1}
            className="max-h-24 flex-1 resize-none bg-transparent text-sm text-white placeholder-zinc-600 outline-none disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming || !accountId}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:text-[#FF9900] disabled:opacity-30"
          >
            {streaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );

  // --- Inline mode: renders as a normal flex column ---
  if (inline) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-zinc-800 bg-[#0a0a0a]">
        {chatContent}
      </div>
    );
  }

  // --- Mobile mode: bottom toggle bar + slide-up sheet ---
  return (
    <>
      {/* Mobile toggle bar */}
      {!mobileOpen && (
        <motion.button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-2 border-t border-[#FF9900]/20 bg-[#0a0a0a]/95 px-4 py-3 backdrop-blur-sm xl:hidden"
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <MessageSquare className="h-4 w-4 text-[#FF9900]" />
          <span className="font-mono text-xs text-[#FF9900]">
            Ask AI for optimization recommendations
          </span>
          <ChevronUp className="h-4 w-4 text-[#FF9900]/60" />
        </motion.button>
      )}

      {/* Mobile slide-up panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 flex h-[70vh] flex-col rounded-t-2xl border-t border-zinc-800 bg-[#0a0a0a] xl:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
          >
            {chatContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
