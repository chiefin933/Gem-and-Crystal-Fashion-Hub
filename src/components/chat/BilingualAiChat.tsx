import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, MessageCircle, Globe, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const API_URL = (import.meta.env.VITE_API_URL ?? '') + '/api/ai/chat';

export const BilingualAiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Habari! Welcome to Gem & Crystal Fashion Hub 💖. Natumai upo salama. Ungependa kusaidiwa na nini leo? / How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Build history for the API — last 20 messages excluding the welcome message
    const history = messages
      .filter(m => m.id !== 'welcome')
      .slice(-20)
      .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history }),
      });

      const data = await res.json();
      const reply = data.success
        ? data.reply
        : data.error?.message ?? 'Something went wrong. Please try again or contact us on WhatsApp. 💬';

      setMessages(prev => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: 'bot-err-' + Date.now(),
          sender: 'bot',
          text: "I'm having trouble connecting right now. Please try again in a moment, or reach us on WhatsApp. 💬",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button — left side, z-50 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white p-3.5 rounded-full shadow-2xl shadow-rose-600/40 flex items-center gap-2 border border-rose-400/30 transition-all transform hover:scale-105 active:scale-95 group"
        >
          <Bot className="w-5 h-5 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider pr-1 hidden sm:inline">
            Gem AI (EN / KISWAHILI)
          </span>
        </button>
      )}

      {/* Chat Window — full-width bottom sheet on mobile, popup on sm+ */}
      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-6 sm:right-auto z-50 w-full sm:w-[92vw] sm:max-w-sm bg-[#09090b] border border-rose-500/40 sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col h-[88vh] sm:h-[480px]">

          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-rose-950 via-zinc-900 to-zinc-900 border-b border-rose-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>Gem AI</span>
                  <Globe className="w-3 h-3 text-rose-400" />
                </h3>
                <p className="text-[10px] text-rose-300 font-medium">Gem AI • English & Kiswahili</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#09090b]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-rose-600 text-white rounded-br-none shadow-md'
                      : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-zinc-600 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 text-rose-400 animate-spin" />
                  <span className="text-[10px] text-zinc-400">Gem AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp escalation bar */}
          <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
            <span className="text-zinc-400">Need personal support?</span>
            <a
              href="https://wa.me/254718796296"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isTyping}
              placeholder="Uliza kitu / Ask anything in English or Swahili..."
              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="p-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl shadow-md transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
