import React, { useState } from 'react';
import { Calendar, CheckCircle2, Compass, MapPin, TicketCheck } from 'lucide-react';
import { EventBanner } from '../components/EventBanner';
import { formatDisplayDate } from '../components/EventCard';
import { WorkspaceShell } from '../components/WorkspaceShell';
import { useCampus } from '../context/CampusContext';
import { TODAY_DATE } from '../data/mockData';

export function MyRegistrations() {
  const { registrations, events, cancelRegistration, navigate } = useCampus();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const items = registrations
    .map((record) => ({
      record,
      event: events.find((e) => e.id === record.eventId),
    }))
    .filter(
      (item): item is { record: typeof item.record; event: NonNullable<typeof item.event> } =>
        Boolean(item.event)
    );

  return (
    <WorkspaceShell title="My Registrations" breadcrumb="Campus Pulse / Registered Passes">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Confirmed Event Passes
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Show your confirmation code at check-in or release seats you can no longer attend.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('explore')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-brand-gradient bg-brand-gradient-hover whitespace-nowrap shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>Discover More Events</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <TicketCheck className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
              No active registrations yet
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Browse upcoming hackathons, workshops, sports matches, and cultural nights to reserve your first campus pass.
            </p>
            <button
              type="button"
              onClick={() => navigate('explore')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-violet-700 transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Events</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(({ record, event }) => {
              const isToday = event.date === TODAY_DATE;
              const isConfirming = confirmingId === event.id;

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                    <div className="w-full sm:w-32 aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-slate-900">
                      <EventBanner
                        src={event.bannerUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-violet-700 mb-1">
                        {event.category} · {isToday ? 'Happening Today' : 'Upcoming'}
                      </div>
                      <h3 className="font-display text-lg font-bold text-slate-900 truncate">
                        {event.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1.5 font-mono-tabular">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDisplayDate(event.date)} · {event.time}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {event.venue}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="sm:text-right">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{record.status}</span>
                      </div>
                      <div className="font-mono-tabular text-sm font-bold text-slate-900 mt-0.5">
                        {record.confirmationCode}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('event-details', { eventId: event.id })}
                        className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        View Event
                      </button>

                      {!isConfirming ? (
                        <button
                          type="button"
                          onClick={() => setConfirmingId(event.id)}
                          className="px-3.5 py-2 rounded-lg border border-slate-200 hover:border-rose-300 text-xs font-medium text-slate-700 hover:text-rose-700 transition-colors whitespace-nowrap"
                        >
                          Cancel Registration
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              cancelRegistration(event.id);
                              setConfirmingId(null);
                            }}
                            className="px-3 py-2 rounded-lg bg-rose-700 text-white text-xs font-semibold whitespace-nowrap"
                          >
                            Confirm Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            className="px-2.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-600"
                          >
                            Keep
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
