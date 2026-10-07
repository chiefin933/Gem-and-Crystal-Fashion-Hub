import React, { useState, useEffect, useRef } from "react";
import { Bot, X, Send, MessageCircle, Globe, Loader2 } from "lucide-react";
import { API_BASE } from "../../api/client";
import { useModalDialog } from "../../utils/useModalDialog";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const API_URL = `${API_BASE}/ai/chat`;

export const BilingualAiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  useModalDialog(isOpen, "assistant", () => setIsOpen(false));
  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener("gem:open-assistant", open);
    return () => window.removeEventListener("gem:open-assistant", open);
  }, []);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Habari! Welcome to Gem & Crystal Fashion Hub 💖. Natumai upo salama. Ungependa kusaidiwa na nini leo? / How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Build history for the API — last 20 messages excluding the welcome message
    const history = messages
      .filter((m) => m.id !== "welcome")
      .slice(-20)
      .map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text.slice(0, m.sender === "user" ? 500 : 12000),
      }));
    while (
      history.reduce((total, item) => total + item.content.length, 0) > 24000
    )
      history.shift();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history }),
        signal: AbortSignal.timeout(50_000),
      });

      const data = await res.json();
      const reply = data.success
        ? data.reply
        : (data.error?.message ??
          "Something went wrong. Please try again or contact us on WhatsApp. 💬");

      setMessages((prev) => [
        ...prev,
        {
          id: "bot-" + Date.now(),
          sender: "bot",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "bot-err-" + Date.now(),
          sender: "bot",
          text: "I'm having trouble connecting right now. Please try again in a moment, or reach us on WhatsApp. 💬",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Window — full-width bottom sheet on mobile, popup on sm+ */}
      {isOpen && (
        <div
          role="dialog"
          data-dialog="assistant"
          aria-modal="true"
          aria-label="Gem AI assistant"
          className="gem-chat fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-6 sm:right-auto z-50 w-full sm:w-[92vw] sm:max-w-sm bg-white border border-gem-border shadow-xl overflow-hidden flex flex-col h-[88vh] sm:h-[480px]"
        >
          {/* Header */}
          <div className="p-4 bg-white border-b border-gem-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gem-pink flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-gem-ink flex items-center gap-1.5">
                  <span>Gem AI</span>
                  <Globe className="w-3 h-3 text-gem-pink" />
                </h3>
                <p className="text-xs text-gem-muted">
                  English &amp; Kiswahili
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close Gem AI assistant"
              className="text-gem-muted hover:text-gem-ink p-1 rounded-lg hover:bg-gem-dark transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-sm px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-gem-pink text-white rounded-br-none"
                      : "bg-gem-dark text-gem-ink border border-gem-border rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gem-muted mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="bg-white border border-gem-border rounded-bl-none px-4 py-3 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 text-gem-pink animate-spin" />
                  <span className="text-[10px] text-gem-muted">
                    Gem AI is thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp escalation bar */}
          <div className="px-4 py-2 bg-white border-t border-gem-border flex items-center justify-between text-xs">
            <span className="text-gem-muted">Need personal support?</span>
            <a
              href="https://wa.me/254718796296"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-700 font-bold flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-gem-border flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder="Uliza kitu / Ask anything in English or Swahili..."
              aria-label="Message Gem AI"
              className="min-w-0 flex-1 bg-white border border-gem-border focus:border-gem-pink px-3 py-2 text-sm text-gem-ink focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              aria-label="Send message"
              className="p-2 bg-gem-pink hover:bg-gem-magenta disabled:opacity-40 text-white transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
