import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';
import MascotCup from './MascotCup';
import { useAuntie } from '../context/AuntieContext';

const CHAT_STARTERS = [
  { text: "Auntie, I am feeling too lazy to study...", type: "excuse" as const },
  { text: "Everyone is doing better than me. I feel overwhelmed.", type: "vent" as const },
  { text: "My successful cousin bought a brand new sports car. Auntie, save me!", type: "vent" as const },
  { text: "Auntie! I completed all my high-priority tasks today!", type: "brag" as const }
];

function TypewriterText({ text, speed = 12 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span className="whitespace-pre-line">{displayed}</span>;
}

export default function ChatVent() {
  const { chatMessages: messages, sendMessage, clearChat, spiceLevel, loading } = useAuntie();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend: string, type?: 'vent' | 'excuse' | 'brag') => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    setInputText('');
    await sendMessage(trimmed, type || 'vent');
  };

  return (
    <div id="chat-section" className="bg-white rounded-3xl border-2 border-dark-brown/15 shadow-sm overflow-hidden flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="bg-warm-beige px-6 py-4 border-b border-dark-brown/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MascotCup size={36} className="bg-accent-terracotta/10 rounded-full p-0.5 border border-dark-brown/10 shadow-xs" />
          <div>
            <h3 className="font-display font-bold text-dark-brown text-sm leading-tight">Auntie's Vent Lounge</h3>
            <span className="text-[10px] text-accent-green font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-ping inline-block" />
              AUNTIE IS ONLINE & JUDGING (SPICE: {spiceLevel.toUpperCase()})
            </span>
          </div>
        </div>
        
        {messages.length > 1 && (
          <button
            id="clear-chat-btn"
            onClick={clearChat}
            className="text-stone-400 hover:text-accent-terracotta p-1.5 rounded-lg hover:bg-rose-100/40 transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Message Screen */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-cream/35">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          const isLatest = idx === messages.length - 1;
          return (
            <div
              key={msg.id || idx}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex gap-2 items-start ${isUser ? 'flex-row-reverse' : ''}`}>
                {/* Micro avatar for Auntie */}
                {!isUser && (
                  <div className="bg-warm-beige p-1 rounded-xl border border-dark-brown/5 flex-shrink-0">
                    <MascotCup size={28} />
                  </div>
                )}
                
                <div>
                  <div
                    className={`rounded-2xl p-4 text-sm font-sans leading-relaxed ${
                      isUser
                        ? 'bg-accent-terracotta text-white rounded-tr-none shadow-xs'
                        : 'bg-white border border-dark-brown/10 text-dark-brown rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p className={isUser ? 'font-medium' : 'italic font-medium'}>
                      {!isUser && isLatest ? (
                        <TypewriterText text={msg.text} />
                      ) : (
                        msg.text
                      )}
                    </p>
                  </div>
                  <span className={`text-[9px] font-mono text-stone-400 block mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] flex gap-2 items-start">
              <div className="bg-warm-beige p-1 rounded-xl border border-dark-brown/5 animate-bounce flex-shrink-0">
                <MascotCup size={28} />
              </div>
              <div className="bg-white border border-dark-brown/10 rounded-2xl p-4 rounded-tl-none text-xs text-light-brown flex items-center gap-2 font-medium font-sans italic shadow-xs">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-terracotta animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-terracotta animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-terracotta animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span>Auntie is brewing a response...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Starters */}
      {messages.length <= 1 && !loading && (
        <div className="px-6 py-3 bg-warm-beige/35 border-t border-dark-brown/10">
          <p className="text-[10px] font-mono font-bold text-light-brown mb-2 uppercase tracking-wide">
            Tell Auntie what's cooking:
          </p>
          <div className="flex gap-2 flex-wrap">
            {CHAT_STARTERS.map((starter, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(starter.text, starter.type)}
                className="text-xs bg-white hover:bg-accent-terracotta/5 border border-dark-brown/10 hover:border-accent-terracotta/30 text-dark-brown hover:text-accent-terracotta px-3 py-1.5 rounded-full transition-colors font-medium text-left shadow-xs cursor-pointer"
              >
                {starter.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text Input Footer */}
      <div className="p-4 bg-warm-beige border-t border-dark-brown/10 flex gap-2.5 items-center">
        <input
          id="chat-input-field"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
          placeholder="Vent, complain, or make an excuse..."
          disabled={loading}
          className="flex-1 bg-white border border-dark-brown/15 focus:border-accent-terracotta rounded-2xl px-4 py-3 text-sm text-dark-brown focus:outline-hidden placeholder-stone-400 font-sans shadow-inner"
        />
        <button
          id="chat-send-btn"
          onClick={() => handleSend(inputText)}
          disabled={!inputText.trim() || loading}
          className="bg-accent-terracotta hover:bg-accent-terracotta/90 disabled:opacity-40 text-white p-3 rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4 fill-white text-white" />
        </button>
      </div>
    </div>
  );
}
