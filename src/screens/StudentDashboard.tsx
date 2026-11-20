import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  Bot,
  Calendar,
  Flame,
  RefreshCw,
  Search,
  TicketCheck,
} from 'lucide-react';
import { EventBanner } from '../components/EventBanner';
import { EventCard, formatDisplayDate } from '../components/EventCard';
import { WorkspaceShell } from '../components/WorkspaceShell';
import { useCampus } from '../context/CampusContext';
import { EVENT_CATEGORIES, TODAY_DATE } from '../data/mockData';
import { AIRecommendation, EventCategory } from '../types';

export function StudentDashboard() {
  const {
    user,
    events,
    registrations,
    savedEventIds,
    isRegistered,
    toggleSaveEvent,
    navigate,
  } = useCampus();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'All'>('All');
  const [aiPicks, setAiPicks] = useState<AIRecommendation[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const registeredIds = useMemo(
    () => registrations.map((r) => r.eventId),
    [registrations]
  );

  const fetchAiRecommendations = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events,
          interests: user.interests,
          registeredEventIds: registeredIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not load AI recommendations.');
      }
      setAiPicks(Array.isArray(data.recommendations) ? data.recommendations : []);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unable to reach AI recommendations service.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAiRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesCat = activeCategory === 'All' || ev.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.organiser.toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [events, activeCategory, searchQuery]);

  const happeningToday = useMemo(
    () => filteredEvents.filter((e) => e.date === TODAY_DATE),
    [filteredEvents]
  );

  const trendingEvents = useMemo(
    () => filteredEvents.filter((e) => e.isTrending).slice(0, 3),
    [filteredEvents]
  );

  const recentlyAdded = useMemo(
    () =>
      [...filteredEvents]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [filteredEvents]
  );

  const savedEvents = useMemo(
    () => events.filter((e) => savedEventIds.includes(e.id)),
    [events, savedEventIds]
  );

  const myRegisteredEvents = useMemo(
    () =>
      registrations
        .map((r) => ({ record: r, event: events.find((e) => e.id === r.eventId) }))
        .filter((item): item is { record: typeof item.record; event: NonNullable<typeof item.event> } => Boolean(item.event)),
    [registrations, events]
  );

  return (
    <WorkspaceShell title="Student Dashboard" breadcrumb="Campus Pulse / Student Hub">
      <div className="space-y-8">
        {/* Welcome & Search Header */}
        <section className="bg-[#080D1A] text-white rounded-2xl p-6 sm:p-8 border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {user.name.split(' ')[0]}
              </h2>
              <p className="text-sm text-slate-300 mt-1.5">
                {user.department} · {happeningToday.length} events happening today on campus
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:w-[460px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hackathons, labs, venues..."
                  aria-label="Search campus events"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <button
                type="button"
                onClick={() => navigate('ai-assistant')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-brand-gradient bg-brand-gradient-hover transition-all whitespace-nowrap shrink-0"
              >
                <Bot className="w-4 h-4" />
                <span>Ask AI</span>
              </button>
            </div>
          </div>

          {/* Category Filter Strip */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1">
            {(['All', ...EVENT_CATEGORIES] as const).map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-slate-900'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat === 'All' ? 'All Categories' : cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Quick Summary Strip: My Registrations & Saved Events */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <TicketCheck className="w-5 h-5 text-violet-700" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  My Registrations
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('my-registrations')}
                className="text-xs font-semibold text-violet-700 hover:text-violet-900 inline-flex items-center gap-1"
              >
                <span>Manage all ({registrations.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {myRegisteredEvents.length === 0 ? (
              <p className="text-sm text-slate-500">
                No upcoming registrations yet. Explore events to reserve your seat.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {myRegisteredEvents.slice(0, 2).map(({ record, event }) => (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => navigate('event-details', { eventId: event.id })}
                    className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {event.title}
                      </div>
                      <div className="text-xs text-slate-500 font-mono-tabular">
                        {formatDisplayDate(event.date)} · {event.time} · {event.venue}
                      </div>
                    </div>
                    <span className="font-mono-tabular text-xs font-medium text-emerald-700 shrink-0">
                      {record.confirmationCode}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-5 h-5 text-blue-700" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  Saved Events
                </h3>
              </div>
              <span className="font-mono-tabular text-xs text-slate-500">
                {savedEvents.length} bookmarked
              </span>
            </div>
            {savedEvents.length === 0 ? (
              <p className="text-sm text-slate-500">
                Bookmark events while browsing to compare dates and deadlines here.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {savedEvents.slice(0, 2).map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => navigate('event-details', { eventId: ev.id })}
                    className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{ev.title}</div>
                      <div className="text-xs text-slate-500">
                        {ev.category} · {formatDisplayDate(ev.date)}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-violet-700 shrink-0">View</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* AI-Powered Recommendations */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-violet-700" />
                <h3 className="font-display text-lg font-bold text-slate-900">
                  AI-Powered Recommendations
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Matched to your interests: {user.interests.join(', ')}
              </p>
            </div>
            <button
              type="button"
              onClick={fetchAiRecommendations}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
              <span>{aiLoading ? 'Refreshing...' : 'Refresh Picks'}</span>
            </button>
          </div>

          {aiLoading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-5/6" />
                  <div className="h-10 bg-slate-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : aiError ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-amber-900">{aiError}</div>
              <button
                type="button"
                onClick={fetchAiRecommendations}
                className="px-3 py-1.5 rounded-lg bg-amber-900 text-white text-xs font-semibold whitespace-nowrap shrink-0"
              >
                Retry AI Picks
              </button>
            </div>
          ) : aiPicks.length === 0 ? (
            <div className="text-sm text-slate-500 py-4">
              You have registered for all available recommendations! Browse Explore Events for more.
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {aiPicks.map((pick) => {
                const ev = events.find((item) => item.id === pick.eventId);
                if (!ev) return null;
                return (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-violet-300 bg-slate-50/50 flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs text-violet-700 font-medium mb-1">
                        {ev.category} · {formatDisplayDate(ev.date)}
                      </div>
                      <h4 className="font-display text-sm font-bold text-slate-900 mb-2">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{pick.reason}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('event-details', { eventId: ev.id })}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-violet-700"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Events Happening Today */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-700" />
              <h3 className="font-display text-xl font-bold text-slate-900">
                Happening Today (Nov 20)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('explore')}
              className="text-xs font-semibold text-violet-700 hover:text-violet-900"
            >
              Browse full catalog
            </button>
          </div>

          {happeningToday.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-600">
                No events scheduled today match your current search or category filter.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {happeningToday.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  isRegistered={isRegistered(ev.id)}
                  isSaved={savedEventIds.includes(ev.id)}
                  onViewDetails={(id) => navigate('event-details', { eventId: id })}
                  onToggleSave={toggleSaveEvent}
                />
              ))}
            </div>
          )}
        </section>

        {/* Trending & Recently Added */}
        <section className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-violet-700" />
              <h3 className="font-display text-xl font-bold text-slate-900">Trending on Campus</h3>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {trendingEvents.map((ev) => {
                const fillPct = Math.round((ev.registeredCount / ev.maxParticipants) * 100);
                return (
                  <div
                    key={ev.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                        <EventBanner
                          src={ev.bannerUrl}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-slate-500">
                          {ev.category} · {formatDisplayDate(ev.date)}
                        </div>
                        <div className="font-display text-sm font-semibold text-slate-900 truncate">
                          {ev.title}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden sm:block text-right">
                        <div className="font-mono-tabular text-xs font-semibold text-slate-900">
                          {fillPct}% filled
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono-tabular">
                          {ev.registeredCount}/{ev.maxParticipants}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('event-details', { eventId: ev.id })}
                        className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-violet-700 text-white text-xs font-semibold transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-4">
              Recently Added Events
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {recentlyAdded.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => navigate('event-details', { eventId: ev.id })}
                  className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-violet-700 font-medium mb-0.5">
                      {ev.category} · {formatDisplayDate(ev.date)}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 truncate">{ev.title}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {ev.venue} · {ev.organiser}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
