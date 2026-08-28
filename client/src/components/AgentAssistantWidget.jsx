import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Bot, Sparkles, Send, X, Cpu, CheckCircle2, RefreshCw, Radar, Orbit, Mic, MicOff } from 'lucide-react';

const AgentAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your **Autonomous Transit Agent**. You can type or use your voice to book seats, track live GPS, and trigger alerts. Where are we heading?', reasoning: [] }
  ]);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, loading]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(transcript);
        setIsListening(false);
        // Auto-send after voice input is captured
        handleSend(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [messages]);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setPrompt('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (customPrompt) => {
    const userText = customPrompt || prompt;
    if (!userText.trim()) return;

    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setPrompt('');
    setLoading(true);

    try {
      const res = await api.post('/agent/query', { prompt: userText });
      const { agentResponse, reasoningSteps, toolExecuted, toolOutput } = res.data;
      setMessages([...newMessages, { role: 'assistant', text: agentResponse, reasoning: reasoningSteps || [], toolExecuted, toolOutput }]);
    } catch (err) {
      const errorText = err.response?.data?.message || err.message;
      setMessages([...newMessages, { role: 'assistant', text: `⚠️ Agent Node Disconnected: ${errorText}. Make sure your backend server is running and API keys are valid.`, reasoning: [] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* UNIQUE AGENT LOGO */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[99999] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 transform hover:scale-110 ${isOpen ? 'bg-rose-600 rotate-90' : 'bg-slate-900 border-2 border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]'}`}
      >
        {isOpen ? <X className="w-7 h-7 text-white" /> : (
          <div className="relative flex items-center justify-center w-full h-full">
            <div className="absolute inset-1 rounded-full border border-dashed border-emerald-400/60 animate-[spin_4s_linear_infinite]"></div>
            <div className="absolute inset-3 bg-emerald-500/20 rounded-full animate-ping"></div>
            <Cpu className="w-7 h-7 text-emerald-400 relative z-10" />
            <Sparkles className="w-3 h-3 text-lime-300 absolute top-3 right-3 animate-pulse" />
          </div>
        )}
      </button>

      {/* Interactive Agent Window */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-[99999] w-[90vw] sm:w-[420px] h-[550px] max-h-[75vh] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden text-white animate-in fade-in slide-in-from-bottom-8 isolate">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center w-10 h-10 bg-emerald-950 border border-emerald-500/50 rounded-full">
                <Radar className="w-5 h-5 text-emerald-400 animate-[spin_3s_linear_infinite]" />
              </div>
              <div>
                <h3 className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 tracking-wide">AGENTIC AI CORE</h3>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Status: Voice & Text Active</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white p-2 rounded-full transition-colors border border-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scroll-smooth bg-slate-900/50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
                <div className={`p-3.5 rounded-2xl max-w-[90%] shadow-lg ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                </div>
                {m.reasoning && m.reasoning.length > 0 && (
                  <div className="w-[92%] bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 text-[10px] font-mono text-slate-300 shadow-inner">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Autonomy Trace:</span>
                    {m.reasoning.map((r, rIdx) => (
                      <div key={rIdx} className={`pl-2.5 border-l-2 space-y-0.5 ${r.phase === 'ERROR' ? 'border-rose-500/50' : 'border-emerald-500/40'}`}>
                        <span className={`font-semibold uppercase tracking-wider ${r.phase === 'ERROR' ? 'text-rose-400' : 'text-sky-400'}`}>[{r.phase}]</span>
                        <p className="text-slate-400 leading-snug">{r.thought}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {(loading || isListening) && (
              <div className="flex items-center space-x-2 text-emerald-400 text-[11px] font-mono p-2.5 bg-emerald-950/40 rounded-xl w-fit border border-emerald-900">
                <Orbit className="w-4 h-4 animate-spin" />
                <span>{isListening ? 'Listening to your voice...' : 'Processing intelligence...'}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2.5 bg-slate-950 border-t border-slate-800 flex gap-2 overflow-x-auto text-[10px] no-scrollbar">
            {['Book a ticket to Pokhara', 'Where is the Sajha Bus?', 'Cancel my ticket'].map((sp, idx) => (
              <button key={idx} onClick={() => handleSend(sp)} className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-emerald-900/50 text-slate-300 hover:text-emerald-400 border border-slate-700 whitespace-nowrap transition-colors flex-shrink-0">{sp}</button>
            ))}
          </div>

          {/* Input Bar with Voice Toggle */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2 items-center">
            
            {/* Voice Input Button */}
            <button 
              type="button" 
              onClick={toggleVoiceInput}
              title="Speak to Agent"
              className={`p-3 rounded-xl transition-all shadow-md ${isListening ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/40' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isListening ? "Listening..." : "Type or speak your command..."}
              disabled={isListening}
              className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner disabled:opacity-50"
            />
            
            <button type="submit" disabled={loading || !prompt.trim()} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-3 rounded-xl transition-colors shadow-lg">
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};

export default AgentAssistantWidget;
