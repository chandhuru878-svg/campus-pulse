import React, { useMemo, useState } from 'react';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { WorkspaceShell } from '../components/WorkspaceShell';
import { useCampus } from '../context/CampusContext';
import { EVENT_CATEGORIES, TODAY_DATE } from '../data/mockData';
import { EventCategory } from '../types';

type SortOption = 'soonest' | 'popular' | 'newest' | 'seats';
type AvailabilityFilter = 'all' | 'open' | 'today';

export function ExploreEvents() {
  const {
    events,
    exploreCategory,
    setExploreCategory,
    isRegistered,
    savedEventIds,
    toggleSaveEvent,
    navigate,
  } = useCampus();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('soonest');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = events.filter((ev) => {
      const catOk = exploreCategory === 'All' || ev.category === exploreCategory;
      const searchOk =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.organiser.toLowerCase().includes(q);
      const seatsLeft = ev.maxParticipants - ev.registeredCount;
      const availOk =
        availability === 'all'
          ? true
          : availability === 'open'
          ? seatsLeft > 0
          : ev.date === TODAY_DATE;
      return catOk && searchOk && availOk;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'soonest') {
        return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
      }
      if (sortBy === 'popular') {
        return b.registeredCount - a.registeredCount;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return (
        b.maxParticipants -
        b.registeredCount -
        (a.maxParticipants - a.registeredCount)
      );
    });
  }, [events, exploreCategory, searchQuery, sortBy, availability]);

  const resetFilters = () => {
    setExploreCategory('All');
    setSearchQuery('');
    setAvailability('all');
    setSortBy('soonest');
  };

  return (
    <WorkspaceShell title="Explore Events" breadcrumb="Campus Pulse / Discovery Catalog">
      <div className="space-y-6">
        {/* Search, Filter & Sort Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="grid md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event name, venue, club, or keyword..."
                aria-label="Search events"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="md:col-span-3">
              <label htmlFor="availability-filter" className="sr-only">
                Filter by availability
              </label>
              <select
                id="availability-filter"
                value={availability}
                onChange={(e) => setAvailability(e.target.value as AvailabilityFilter)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">All Dates & Seats</option>
                <option value="open">Open Seats Only</option>
                <option value="today">Happening Today</option>
              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <label htmlFor="sort-events" className="sr-only">
                Sort events
              </label>
              <select
                id="sort-events"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="soonest">Sort: Soonest Date</option>
                <option value="popular">Sort: Most Popular</option>
                <option value="newest">Sort: Recently Added</option>
                <option value="seats">Sort: Most Seats Left</option>
              </select>
            </div>
          </div>

          {/* Interactive Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(['All', ...EVENT_CATEGORIES] as const).map((cat) => {
              const active = exploreCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setExploreCategory(cat as EventCategory | 'All')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'All Events' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result Count */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-mono-tabular">
            Showing <strong className="text-slate-900">{filteredEvents.length}</strong> of{' '}
            {events.length} campus events
          </span>
          {(exploreCategory !== 'All' || searchQuery || availability !== 'all') && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 font-semibold text-violet-700 hover:text-violet-900"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* Events Grid or Empty State */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
              No matching events found
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Try clearing your search keyword or switching to another campus category.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-brand-gradient bg-brand-gradient-hover"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All Events</span>
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => (
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
      </div>
    </WorkspaceShell>
  );
}
