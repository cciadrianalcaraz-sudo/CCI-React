import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { chatWithFinances } from '../../lib/gemini';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface AICopilotProps {
  records: any[];
  goals: any[];
}

export default function AICopilot({ records, goals }: AICopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy tu Copilot Financiero. ¿En qué puedo ayudarte hoy con tus finanzas?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatWithFinances(records, userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu consulta.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-28 w-16 h-16 bg-accent rounded-full shadow-[0_10px_40px_rgba(239,163,100,0.4)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-[1000] group"
      >
        <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-primary-dark">AI</div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-10 right-28 z-[1000] transition-all duration-500 flex flex-col ${isMinimized ? 'h-16 w-64' : 'h-[600px] w-96 max-w-[calc(100vw-2rem)]'} bg-[var(--bg-card)]/80 dark:bg-primary-dark/40 backdrop-blur-2xl rounded-[2.5rem] border border-[var(--border-color)] dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden animate-scale-in`}>
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-color)] dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">Copilot AI</h4>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">En línea</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-neutral-400">
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-neutral-400">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'assistant' ? 'bg-accent text-white' : 'bg-[var(--bg-main)] dark:bg-white/10 text-[var(--text-primary)]'}`}>
                  {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${msg.role === 'assistant' ? 'bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10' : 'bg-accent text-white shadow-lg shadow-accent/20'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center shrink-0">
                  <Bot size={16} className="animate-spin" />
                </div>
                <div className="bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 p-4 rounded-2xl flex gap-1 items-center">
                  <div className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div className="p-5 bg-[var(--bg-main)]/50 dark:bg-black/20 border-t border-[var(--border-color)] dark:border-white/5">
            <div className="flex items-center gap-2 bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-4 py-2 shadow-inner">
              <input
                type="text"
                placeholder="Pregunta sobre tus gastos..."
                className="flex-1 bg-transparent border-none outline-none text-xs py-2 text-[var(--text-primary)] placeholder:opacity-30"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
