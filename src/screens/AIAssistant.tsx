import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bot, Send, Sparkles, Wand2 } from 'lucide-react';
import { formatDisplayDate } from '../components/EventCard';
import { WorkspaceShell } from '../components/WorkspaceShell';
import { useCampus } from '../context/CampusContext';
import { ChatMessage, EventCategory } from '../types';

const QUICK_PROMPTS = [
  'Recommend events matching my interests this week',
  'What events are happening today on campus?',
  'Summarize the Nexus 24-Hour AI & Systems Hackathon',
  'Which technical events still have open seats?',
];

export function AIAssistant() {
  const {
    events,
    user,
    aiPrefillPrompt,
    setAiPrefillPrompt,
    navigate,
  } = useCampus();

  const [activeTab, setActiveTab] = useState<'chat' | 'generator'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hi ${user.name.split(' ')[0]} — I am connected to the live Campus Pulse catalog (${events.length} active events). Ask me for tailored event recommendations, event summaries, deadlines, or category advice.`,
      recommendedEventIds: [],
      timestamp: 'Now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Event Copy & Category Generator state
  const [genTitle, setGenTitle] = useState('');
  const [genNotes, setGenNotes] = useState('');
  const [genResult, setGenResult] = useState<{
    description: string;
    suggestedCategory: EventCategory;
    highlights: string[];
  } | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');

  useEffect(() => {
    if (aiPrefillPrompt) {
      setActiveTab('chat');
      sendMessage(aiPrefillPrompt);
      setAiPrefillPrompt('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiPrefillPrompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textOverride?: string) => {
    const query = (textOverride ?? input).trim();
    if (!query || loading) return;

    setChatError('');
    if (!textOverride) setInput('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: nextHistory,
          events,
          studentInterests: user.interests,
          role: user.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI Assistant could not process your request.');
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        recommendedEventIds: Array.isArray(data.recommendedEventIds) ? data.recommendedEventIds : [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Unable to reach Campus Pulse AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenError('');
    if (!genTitle.trim()) {
      setGenError('Enter an event title to generate a description and suggested category.');
      return;
    }
    setGenLoading(true);
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: genTitle,
          roughNotes: genNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate event description.');
      }
      setGenResult(data);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to reach AI generator.');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <WorkspaceShell title="AI Campus Assistant" breadcrumb="Campus Pulse / AI Concierge">
      <div className="space-y-6">
        {/* Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Intelligent Event Concierge
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Grounded in all {events.length} live campus events, schedules, and open seat counts.
            </p>
          </div>

          <div className="inline-flex p-1 rounded-lg bg-slate-200/70">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'chat' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Discovery & Q&A Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'generator' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Description & Category Studio
            </button>
          </div>
        </div>

        {activeTab === 'chat' ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-[640px]">
            {/* Quick Prompts Bar */}
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2 overflow-x-auto">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-violet-300 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const linkedEvents = (msg.recommendedEventIds || [])
                  .map((id) => events.find((e) => e.id === id))
                  .filter((e): e is NonNullable<typeof e> => Boolean(e));

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-2xl rounded-2xl px-4 py-3.5 text-sm leading-relaxed whitespace-pre-line ${
                        isUser
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-900 border border-slate-200/70'
                      }`}
                    >
                      {!isUser && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 mb-1.5">
                          <Bot className="w-3.5 h-3.5" />
                          <span>Campus Pulse AI</span>
                        </div>
                      )}
                      {msg.text}
                    </div>

                    {/* Referenced Event Action Cards */}
                    {linkedEvents.length > 0 && (
                      <div className="mt-2.5 grid sm:grid-cols-2 gap-2.5 max-w-2xl w-full">
                        {linkedEvents.map((ev) => (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => navigate('event-details', { eventId: ev.id })}
                            className="text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-violet-300 transition-colors flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] font-medium text-violet-700">
                                {ev.category} · {formatDisplayDate(ev.date)}
                              </div>
                              <div className="text-xs font-semibold text-slate-900 truncate">
                                {ev.title}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono-tabular">
                                {Math.max(0, ev.maxParticipants - ev.registeredCount)} seats left
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start">
                  <div className="bg-slate-100 border border-slate-200/70 rounded-2xl px-4 py-3 text-xs font-medium text-slate-600 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-700 animate-spin" />
                    <span>Searching live campus schedule...</span>
                  </div>
                </div>
              )}

              {chatError && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  {chatError}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="p-4 border-t border-slate-200 bg-white flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about hackathons, open seats, event summaries, or recommendations..."
                aria-label="Message AI Campus Assistant"
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-brand-gradient bg-brand-gradient-hover disabled:opacity-50 transition-all whitespace-nowrap shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          /* Description & Category Generator Tool */
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handleGenerateCopy}
              className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-violet-700" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  Event Description & Category Generator
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Enter a rough event title and optional notes. Campus Pulse AI will write student-ready event copy and classify it into the best category.
              </p>

              <div>
                <label htmlFor="gen-title" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Working Event Title
                </label>
                <input
                  id="gen-title"
                  type="text"
                  value={genTitle}
                  onChange={(e) => setGenTitle(e.target.value)}
                  placeholder="e.g. Zero-to-One Rust Systems Bootcamp"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label htmlFor="gen-notes" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rough Notes / Audience / Perks (Optional)
                </label>
                <textarea
                  id="gen-notes"
                  rows={4}
                  value={genNotes}
                  onChange={(e) => setGenNotes(e.target.value)}
                  placeholder="e.g. 2-hour hands-on lab, pizza provided, bring laptops, beginners welcome"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {genError && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  {genError}
                </div>
              )}

              <button
                type="submit"
                disabled={genLoading}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-brand-gradient bg-brand-gradient-hover disabled:opacity-50"
              >
                {genLoading ? 'Generating Copy...' : 'Generate Description & Category'}
              </button>
            </form>

            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 min-h-[300px]">
              {!genResult ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <Bot className="w-8 h-8 text-slate-300 mb-3" />
                  <div className="text-sm font-semibold text-slate-800">Generated Copy Preview</div>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Submit an event title on the left to preview polished descriptions, key highlights, and category recommendations.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-xs text-slate-500">Suggested Category</div>
                      <div className="text-sm font-bold text-violet-700">
                        {genResult.suggestedCategory}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('create-event')}
                      className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                    >
                      Open Create Event
                    </button>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-1.5">
                      Polished Description
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {genResult.description}
                    </p>
                  </div>

                  {genResult.highlights?.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <div className="text-xs font-semibold text-slate-700 mb-2">
                        Suggested Highlights
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600 list-disc pl-4">
                        {genResult.highlights.map((hl, i) => (
                          <li key={i}>{hl}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
