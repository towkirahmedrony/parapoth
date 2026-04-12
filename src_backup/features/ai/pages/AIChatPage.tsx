import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Bot, Send, BookOpen, Loader2, 
  Sparkles, User, ChevronDown, 
  RefreshCcw, Info
} from 'lucide-react';

import { fetchAiSubjects, sendChatMessage } from '../services/aiService';
import { Subject, Message } from '../types/ai';
import { useAuth } from '../../auth/hooks/useAuth';

const AIChatPage = () => {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get dynamic user initial from auth (fallback to 'U')
  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  // --- React Query: Fetch Subjects ---
  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['aiSubjects'],
    queryFn: fetchAiSubjects,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour to prevent unnecessary refetches
  });

  // --- React Query: Chat Mutation ---
  const chatMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.sessionId) setSessionId(data.sessionId);
    },
    onError: () => {
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: "দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না।" }
      ]);
    }
  });

  // --- Auto Scroll ---
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMutation.isPending]);

  // --- Handlers ---
  const handleSendMessage = useCallback((e?: FormEvent) => {
    e?.preventDefault(); // Prevent page reload on form submit
    
    const trimmedInput = input.trim();
    if (!trimmedInput || !selectedSubject || chatMutation.isPending) return;

    // Optimistically add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: trimmedInput }]);
    setInput('');

    // Trigger API call
    chatMutation.mutate({
      message: trimmedInput,
      subjectId: selectedSubject.id,
      sessionId
    });
  }, [input, selectedSubject, chatMutation, sessionId]);

  const selectSubject = useCallback((subjectId: string) => {
    const sub = subjects.find(s => s.id === subjectId);
    if (sub) {
      setSelectedSubject(sub);
      setIsModalOpen(false);
    }
  }, [subjects]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null); // Reset session to start a fresh context
  }, []);

  return (
    <div className="relative flex flex-col h-screen bg-white overflow-hidden font-sans">
      
      {/* --- Subject Selection Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Sparkles className="text-blue-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">প্যারা সাথী AI</h2>
              <p className="text-center text-slate-500 mb-8 text-sm">চ্যাট শুরু করার আগে আপনার পড়ার বিষয়টি সিলেক্ট করুন</p>
              
              <div className="relative group">
                <select 
                  onChange={(e) => selectSubject(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-4 px-5 pr-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
                  defaultValue=""
                  disabled={isSubjectsLoading}
                >
                  <option value="" disabled>
                    {isSubjectsLoading ? 'বিষয় লোড হচ্ছে...' : 'একটি বিষয় বেছে নিন...'}
                  </option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name_bn}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" size={20} />
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 text-slate-400 font-medium hover:text-slate-600 transition-colors"
                >
                  পরে করব
                </button>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center gap-2 justify-center">
               <Info size={14} className="text-slate-400" />
               <span className="text-xs text-slate-400">আপনার সিলেক্ট করা বিষয়ের উপর ভিত্তি করে উত্তর দেওয়া হবে।</span>
            </div>
          </div>
        </div>
      )}

      {/* --- Header --- */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all border border-slate-200"
          >
            <BookOpen size={16} />
            <span className="text-sm font-medium">{selectedSubject?.name_bn || 'বিষয় নির্বাচন'}</span>
            <ChevronDown size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={handleClearChat} 
             title="চ্যাট ক্লিয়ার করুন"
             className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
           >
              <RefreshCcw size={18} />
           </button>
           <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
             {userInitial}
           </div>
        </div>
      </header>

      {/* --- Chat Area --- */}
      <main className="flex-1 overflow-y-auto px-4 md:px-0">
        <div className="max-w-3xl mx-auto py-10 space-y-8">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 mb-6 rotate-3">
                <Sparkles className="text-white w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                 হ্যালো, আমি প্যারা সাথী AI
              </h1>
              <p className="text-slate-500 text-center max-w-sm px-4 leading-relaxed">
                আপনার {selectedSubject?.name_bn || 'পছন্দের'} বিষয়ের যেকোনো জটিল প্রশ্নের সহজ সমাধান পেতে আমাকে জিজ্ঞেস করুন।
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 md:gap-6 group animate-in fade-in duration-500 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-lg shadow-blue-100' 
                  : 'text-slate-700 pt-1'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex gap-4 md:gap-6 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <Bot size={18} className="text-slate-300" />
              </div>
              <div className="space-y-2 flex-1 pt-2 max-w-[60%]">
                <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                <div className="h-2 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} className="h-24" />
        </div>
      </main>

      {/* --- Floating Bottom Input Area --- */}
      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-white via-white to-white/0 p-4 md:pb-8">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute inset-0 bg-blue-500/5 blur-xl group-focus-within:bg-blue-500/10 transition-all rounded-full" />
          <form 
            onSubmit={handleSendMessage}
            className="relative flex items-center bg-white border border-slate-200 rounded-[2rem] px-5 py-2 shadow-xl shadow-slate-200/50 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`${selectedSubject?.name_bn || 'বিষয়'} নিয়ে প্রশ্ন করুন...`}
              disabled={chatMutation.isPending}
              className="flex-1 py-3 text-slate-700 bg-transparent border-none focus:outline-none placeholder:text-slate-400 disabled:opacity-50"
              autoComplete="off"
            />
            <div className="flex items-center gap-2 pl-2">
              <button 
                type="submit"
                disabled={!input.trim() || chatMutation.isPending}
                className={`p-3 rounded-full transition-all flex items-center justify-center ${
                  input.trim() && !chatMutation.isPending 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:scale-105 active:scale-95' 
                  : 'bg-slate-100 text-slate-300'
                }`}
              >
                {chatMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-3">
             ParaPoth AI ভুল তথ্য দিতে পারে। গুরুত্বপূর্ণ তথ্য যাচাই করে নিন।
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
