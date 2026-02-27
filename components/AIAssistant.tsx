
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { askRTAssistant } from '../services/geminiService';
import { UserNotification, UserRole, Warga } from '../types';

interface AIAssistantProps {
  wargaList: Warga[];
  onSendNotification?: (notif: UserNotification) => void;
  currentUser?: Warga;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ wargaList, onSendNotification, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Halo Pak/Bu! Saya Asisten Virtual RT 06. Ada yang bisa saya bantu terkait informasi warga atau administrasi?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Cara membuat KTP baru?",
    "Jadwal pengambilan sampah?",
    "Syarat surat pindah?",
    "Buatkan pengumuman kerja bakti"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Prepare context safely without exposing too much private info, just aggregates
    const totalWarga = wargaList.length;
    const totalKK = new Set(wargaList.map(w => w.noKK)).size;
    const context = `RT 06 RW 19. Total Warga: ${totalWarga}, Total KK: ${totalKK}.`;

    const response = await askRTAssistant(textToSend, context);
    
    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    setLoading(false);

    // Notify Admins about AI usage (Simulate "Tanya Pak RT")
    if (onSendNotification && currentUser) {
        const admins = wargaList.filter(w => [UserRole.KETUA_RT].includes(w.role));
        admins.forEach(admin => {
            onSendNotification({
                id: `NOTIF-AI-${Date.now()}-${admin.id}`,
                userId: admin.id,
                pesan: `Pertanyaan Warga (${currentUser.namaLengkap}): "${userMsg.content.substring(0, 30)}..."`,
                tipe: 'SYSTEM',
                isRead: false,
                tanggal: new Date().toISOString().split('T')[0]
            });
        });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
      {/* Header */}
      <div className="bg-emerald-600 p-4 text-white flex items-center justify-between shadow-md z-10">
        <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
                <Bot size={24} />
            </div>
            <div>
            <h2 className="font-bold text-lg">Asisten Pak RT</h2>
            <p className="text-xs text-emerald-100 flex items-center gap-1">
                <Sparkles size={10} /> Powered by Gemini AI
            </p>
            </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''} space-x-3`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-bl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2 ml-11">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        {/* Quick Chips */}
        {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-1 hide-scrollbar">
                {quickPrompts.map((prompt, i) => (
                    <button 
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition whitespace-nowrap"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        )}

        <div className="flex space-x-2 relative">
          <input
            type="text"
            className="flex-1 p-3 pl-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors"
            placeholder="Tulis pertanyaan..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1.5 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-300 dark:disabled:bg-gray-600 shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 mt-2">
            AI dapat melakukan kesalahan. Selalu verifikasi informasi penting dengan pengurus RT.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
