"use client";
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionValue, useTransform, animate } from 'framer-motion';

export default function GeminiChatUI() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Floating animation for send button
  const y = useMotionValue(0);
  useEffect(() => {
    const sequence = async () => {
      while (true) {
        await animate(y, -3, { duration: 1.5, ease: "easeInOut" });
        await animate(y, 3, { duration: 1.5, ease: "easeInOut" });
      }
    };
    sequence();
  }, [y]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = { text: message, sender: 'user', id: Date.now() };
    setConversation(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const aiMessage = { text: data.reply, sender: 'ai', id: Date.now() + 1 };
      setConversation(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      setConversation(prev => [...prev, { 
        text: 'Sorry, there was an error processing your request.', 
        sender: 'ai',
        id: Date.now() + 1
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const bubbleVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 10 },
    visible: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const typingVariants = {
    hidden: { y: 0, opacity: 0 },
    visible: (i) => ({
      y: [-4, 0],
      opacity: [0, 1],
      transition: {
        y: {
          repeat: 3,
          repeatType: "reverse",
          duration: 0.6,
          delay: i * 0.2
        },
        opacity: {
          repeat: 3,
          repeatType: "reverse",
          duration: 0.6,
          delay: i * 0.2
        }
      }
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4 flex flex-col max-w-4xl mx-auto">
      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="flex justify-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
          Gemini AI
        </h1>
      </motion.div>

      <motion.div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-6 p-6 rounded-2xl bg-slate-800/50 backdrop-blur-md border border-slate-700/50 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {conversation.length === 0 ? (
          <motion.div 
            className="h-full flex flex-col items-center justify-center text-center p-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div className="mb-8" variants={itemVariants}>
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-semibold mb-2 text-slate-100">How can I help you today?</h2>
              <p className="text-slate-300 max-w-md">Ask me anything about technology, science, or creative ideas.</p>
            </motion.div>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg"
              variants={containerVariants}
            >
              {[
                "Explain quantum computing in simple terms",
                "Suggest a productivity tip for developers",
                "How does blockchain technology work?",
                "Give me a creative project idea"
              ].map((suggestion, i) => (
                <motion.button
                  key={i}
                  className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700/70 transition-all text-sm text-left"
                  onClick={() => {
                    setMessage(suggestion);
                    inputRef.current?.focus();
                  }}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {conversation.map((msg) => (
                <motion.div 
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                  transition={{ type: "spring", stiffness: 150 }}
                >
                  <motion.div 
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 rounded-br-none' 
                      : 'bg-slate-700/80 rounded-bl-none'}`}
                    variants={bubbleVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <p className="whitespace-pre-wrap text-slate-50">{msg.text}</p>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {isLoading && (
          <motion.div 
            className="flex justify-start mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-slate-700/50 rounded-2xl rounded-bl-none p-3">
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-teal-400 rounded-full"
                    custom={i}
                    variants={typingVariants}
                    initial="hidden"
                    animate="visible"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </motion.div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <motion.div
          className="flex-1 relative"
          whileFocusWithin={{ scale: 1.01 }}
        >
          <motion.input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-4 pr-16 rounded-xl bg-slate-800/70 backdrop-blur-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
            placeholder="Type your message..."
          />
          {message && (
            <motion.button
              type="button"
              onClick={() => setMessage('')}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </motion.button>
          )}
        </motion.div>
        <motion.button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="p-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg"
          style={{ y }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </motion.button>
      </form>
    </div>
  );
}