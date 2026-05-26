"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, MessageSquare, Loader2 } from "lucide-react";

interface ChatPanelProps {
  meetingId: string;
}

export function ChatPanel({ meetingId }: ChatPanelProps) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSession();
  }, [meetingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSession = async () => {
    try {
      const data = await api.getChatSession(meetingId);
      if (data.session) {
        setSessionId(data.session.id);
        setMessages(data.session.messages);
      }
    } catch {
      // no session yet
    }
    setInitialLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");

    const userMsg: ChatMessage = {
      id: "temp",
      role: "user",
      content: msg,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await api.sendChatMessage(meetingId, msg, sessionId || undefined);
      setSessionId(data.session_id);
      const botMsg: ChatMessage = {
        id: data.session_id + "-reply",
        role: "assistant",
        content: data.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: "error",
        role: "assistant",
        content: t("chat.error"),
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-surface-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-500/10 mb-3">
              <MessageSquare className="w-6 h-6 text-primary-400" />
            </div>
            <p className="text-surface-400 text-sm">{t("chat.emptyHint")}</p>
            <p className="text-surface-500 text-xs mt-1">&ldquo;{t("chat.example")}&rdquo;</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                msg.role === "user"
                  ? "bg-primary-500/20"
                  : "bg-accent-500/20"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-primary-400" />
              ) : (
                <Bot className="w-4 h-4 text-accent-400" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-primary-500/10 text-primary-100 border border-primary-500/20"
                  : "bg-surface-800/50 text-surface-200 border border-surface-700/50"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-500/20">
              <Bot className="w-4 h-4 text-accent-400" />
            </div>
            <div className="rounded-xl px-4 py-2.5 bg-surface-800/50 border border-surface-700/50">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-surface-800/50">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chat.placeholder")}
            disabled={loading}
          />
          <Button type="submit" disabled={!input.trim() || loading} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
