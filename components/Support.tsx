import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { audioService } from '../services/audioService';

export const Support: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Salem! I am the Keeper of the Steppe. Ask me anything about Crypto Aul, managing your herd, or earning AMANAT tokens.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Gemini Chat
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: `You are the helpful AI Support Agent for the game "Crypto Aul: Amanat Legends". 
            The game is a P2E economic simulator set in the Kazakh steppe.
            
            Game Assets:
            - Sheep: Price 10, Income every 5s.
            - Cow: Price 50, Income every 7s.
            - Horse: Price 80, Income every 8s.
            - Camel: Price 100, Income every 10s.
            - Solar Panel: Price 200.
            - Yurt: Price 1000.
            
            Currency: AMANAT (symbol ₳).
            
            Mechanics:
            - Buy animals in the Shop.
            - Click/Tap animals on the Game Field when they say "READY" to collect income.
            - Daily Quests give bonus rewards.
            - P2P Market allows buying from other players.
            
            Tone: Friendly, helpful, slightly thematic (using terms like "Aul", "Steppe", "Nomad").
            Keep answers concise (under 50 words usually).`,
        },
        });
    } catch (error) {
        console.error("Failed to init AI", error);
        setMessages(prev => [...prev, { role: 'model', text: 'System Error: Connection to the Steppe Satellites failed. Please try again later.' }]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    audioService.play('coin'); // Reusing coin sound for 'sent' effect

    try {
      const responseStream = await chatSessionRef.current.sendMessageStream({ message: userMsg });
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]); // Placeholder

      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            fullResponse += c.text;
            setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1] = { role: 'model', text: fullResponse };
                return newArr;
            });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "The wind is too strong, I couldn't hear you. (API Error)" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex flex-col h-full bg-emerald-950/70 backdrop-blur-sm text-lime-500">
      {/* Header */}
      <div className="p-4 border-b border-lime-600/30 bg-emerald-950/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-lime-600 flex items-center justify-center text-emerald-950 font-bold text-xl border-2 border-white/20">
            🤖
        </div>
        <div>
            <h2 className="font-bold text-white">Tech Support</h2>
            <p className="text-xs text-emerald-400">Powered by Gemini AI</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-md
                ${msg.role === 'user' 
                  ? 'bg-lime-600 text-emerald-950 rounded-tr-none font-medium' 
                  : 'bg-emerald-800 text-emerald-100 rounded-tl-none border border-emerald-700'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
             <div className="flex justify-start">
                <div className="bg-emerald-800 text-emerald-400 px-4 py-2 rounded-2xl rounded-tl-none text-xs italic animate-pulse">
                    Consulting the stars...
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-emerald-900/90 border-t border-lime-600/20 backdrop-blur-md flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask about the game..."
          disabled={loading}
          className="flex-1 bg-emerald-950/50 border border-emerald-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-lime-500 placeholder-emerald-600"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
            ${loading || !input.trim() 
                ? 'bg-emerald-800 text-emerald-600' 
                : 'bg-lime-500 text-emerald-950 hover:bg-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.5)]'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
};