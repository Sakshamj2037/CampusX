import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

const SUGGESTIONS = ["Show me events", "Where is the library?", "Canteen menu", "My points"];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your CampusX AI assistant. Ask me about events, the canteen, or campus navigation!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e, customText = null) => {
    e?.preventDefault();
    const textToSend = customText || input.trim();
    if (!textToSend) return;

    if (!customText) setInput('');
    setMessages(prev => [...prev, { id: Date.now(), text: textToSend, sender: 'user' }]);
    setIsTyping(true);

    try {
      const res = await axios.post('http://localhost:5000/api/chatbot/ask', { message: textToSend });
      setMessages(prev => [...prev, { id: Date.now(), text: res.data.reply, sender: 'bot' }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Sorry, I'm having trouble connecting to the server.", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95, rotate: 2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-[340px] sm:w-[380px] bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-slate-700/60 z-50 h-[550px] max-h-[75vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-4 flex justify-between items-center text-white shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px', opacity: 0.2 }}></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shadow-inner">
                  <Bot size={22} className="text-white drop-shadow-md" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">CampusX AI</h3>
                  <p className="text-[10px] text-white/80 font-medium tracking-wider uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors relative z-10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gradient-to-b from-slate-900/50 to-slate-900 scroll-smooth">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg.id} 
                    className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30 shadow-inner mt-auto">
                        <Bot size={14} />
                      </div>
                    )}
                    <div className={`p-3.5 rounded-2xl max-w-[75%] text-sm shadow-md leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-br-sm' 
                        : 'bg-slate-800/80 text-slate-200 rounded-bl-sm border border-slate-700/50 backdrop-blur-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30 mt-auto">
                    <Bot size={14} />
                  </div>
                  <div className="bg-slate-800/80 p-4 rounded-2xl rounded-bl-sm border border-slate-700/50 flex items-center gap-1.5 w-fit">
                    <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-teal-400/80"></motion.span>
                    <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-teal-400/80"></motion.span>
                    <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-teal-400/80"></motion.span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-2 relative">
              
              {/* Quick Suggestions (Only show if not typing and few messages) */}
              {messages.length < 5 && !isTyping && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1 -mt-4">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleSend(e, suggestion)}
                      className="whitespace-nowrap text-xs bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700/80 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                    >
                      <Sparkles size={10} className="text-amber-400" />
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              )}

              <form onSubmit={(e) => handleSend(e)} className="flex gap-2 relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask me anything..." 
                  className="flex-1 bg-slate-800/80 border border-slate-700 rounded-2xl pl-4 pr-12 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all shadow-inner"
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-teal-500 hover:bg-teal-400 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  <Send size={16} className="ml-0.5" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        animate={!isOpen ? { y: [0, -8, 0] } : {}}
        transition={!isOpen ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" } : {}}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_10px_25px_rgba(20,184,166,0.5)] z-50 border-2 border-slate-900 group"
      >
        <MessageSquare size={24} className={`transition-transform duration-300 ${isOpen ? 'rotate-12 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
        <X size={24} className={`absolute transition-transform duration-300 ${isOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
        
        {/* Notification dot */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
        )}
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-full bg-teal-400 opacity-0 group-hover:opacity-20 blur-md transition-opacity"></div>
      </motion.button>
    </>
  );
};

export default Chatbot;
