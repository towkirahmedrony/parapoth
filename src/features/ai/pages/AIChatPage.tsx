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

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['aiSubjects'],
    queryFn: fetchAiSubjects,
    staleTime: 1000 * 60 * 60,
  });

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

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMutation.isPending]);

  const handleSendMessage = useCallback((e?: FormEvent) => {
    e?.preventDefault(); 
    
    const trimmedInput = input.trim();
    if (!trimmedInput || !selectedSubject || chatMutation.isPending) return;

    setMessages(prev => [...prev, { role: 'user', content: trimmedInput }]);
    setInput('');

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
    setSessionId(null);
  }, []);

  return (
    <div className="relative flex flex-col h-screen overflow-hidden font-sans bg-app text-text-primary">
      
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-surface-elevated border border-border-color">
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-primary/10 text-primary">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2 text-text-primary">প্যারা সাথী AI</h2>
              <p className="text-center mb-8 text-sm text-text-secondary">
                চ্যাট শুরু করার আগে আপনার পড়ার বিষয়টি সিলেক্ট করুন
              </p>
              
              <div className="relative group">
                <select 
                  onChange={(e) => selectSubject(e.target.value)}
                  className="w-full appearance-none py-4 px-5 pr-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-focus-ring transition-all cursor-pointer disabled:opacity-50 bg-input-bg border border-input-border text-text-primary"
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
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors text-text-secondary" size={20} />
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 font-medium transition-colors hover:opacity-80 text-text-secondary"
                >
                  পরে করব
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center gap-2 justify-center bg-surface border-t border-border-color">
               <Info size={14} className="text-text-secondary" />
               <span className="text-xs text-text-secondary">
                 আপনার সিলেক্ট করা বিষয়ের উপর ভিত্তি করে উত্তর দেওয়া হবে।
               </span>
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between px-6 py-4 backdrop-blur-md sticky top-0 z-10 bg-nav-bg/80 border-b border-border-color text-nav-text">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:opacity-80 bg-secondary border border-border-color text-text-primary"
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
             className="p-2 transition-colors hover:opacity-80 text-text-secondary"
           >
              <RefreshCcw size={18} />
           </button>
           <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-primary text-primary-foreground">
             {userInitial}
           </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 md:px-0">
        <div className="max-w-3xl mx-auto py-10 space-y-8">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl mb-6 rotate-3 bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Sparkles className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                 হ্যালো, আমি প্যারা সাথী AI
              </h1>
              <p className="text-center max-w-sm px-4 leading-relaxed text-text-secondary">
                আপনার {selectedSubject?.name_bn || 'পছন্দের'} বিষয়ের যেকোনো জটিল প্রশ্নের সহজ সমাধান পেতে আমাকে জিজ্ঞেস করুন।
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 md:gap-6 group animate-in fade-in duration-500 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-surface border border-border-color text-text-secondary'
                }`}
              >
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                    ? 'px-5 py-3 rounded-2xl rounded-tr-none shadow-lg bg-primary text-primary-foreground' 
                    : 'pt-1 text-text-primary'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex gap-4 md:gap-6 animate-pulse">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface border border-border-color text-text-secondary">
                <Bot size={18} />
              </div>
              <div className="space-y-2 flex-1 pt-2 max-w-[60%]">
                <div className="h-2 rounded w-3/4 bg-surface-elevated"></div>
                <div className="h-2 rounded w-1/2 bg-surface-elevated"></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} className="h-24" />
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 p-4 md:pb-8 bg-gradient-to-t from-app to-transparent">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute inset-0 blur-xl transition-all rounded-full opacity-50 group-focus-within:opacity-100 bg-primary/10" />
          <form 
            onSubmit={handleSendMessage}
            className="relative flex items-center rounded-[2rem] px-5 py-2 transition-all focus-within:scale-[1.01] bg-surface-elevated border border-border-color shadow-lg focus-within:ring-2 focus-within:ring-focus-ring"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`${selectedSubject?.name_bn || 'বিষয়'} নিয়ে প্রশ্ন করুন...`}
              disabled={chatMutation.isPending}
              className="flex-1 py-3 bg-transparent border-none focus:outline-none disabled:opacity-50 text-text-primary placeholder:text-text-secondary"
              autoComplete="off"
            />
            <div className="flex items-center gap-2 pl-2">
              <button 
                type="submit"
                disabled={!input.trim() || chatMutation.isPending}
                className={`p-3 rounded-full transition-all flex items-center justify-center ${
                  input.trim() && !chatMutation.isPending 
                  ? 'bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-md' 
                  : 'bg-secondary text-text-secondary'
                }`}
              >
                {chatMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
          </form>
          <p className="text-[10px] text-center mt-3 text-text-secondary">
             ParaPoth AI ভুল তথ্য দিতে পারে। গুরুত্বপূর্ণ তথ্য যাচাই করে নিন।
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
