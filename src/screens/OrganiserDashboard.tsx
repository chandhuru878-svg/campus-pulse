import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  CalendarPlus,
  Eye,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { formatDisplayDate } from '../components/EventCard';
import { WorkspaceShell } from '../components/WorkspaceShell';
import { useCampus } from '../context/CampusContext';
import { EVENT_CATEGORIES, TODAY_DATE } from '../data/mockData';

export function OrganiserDashboard() {
  const { events, registrations, deleteEvent, navigate } = useCampus();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalRegistrations = events.reduce((sum, ev) => sum + ev.registeredCount, 0);
    const totalCapacity = events.reduce((sum, ev) => sum + ev.maxParticipants, 0);
    const upcomingCount = events.filter((ev) => ev.date >= TODAY_DATE).length;
    const avgFill = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;
    return { totalEvents, totalRegistrations, upcomingCount, avgFill };
  }, [events]);

  const categoryBreakdown = useMemo(() => {
    return EVENT_CATEGORIES.map((cat) => {
      const catEvents = events.filter((e) => e.category === cat);
      const regs = catEvents.reduce((sum, e) => sum + e.registeredCount, 0);
      return { category: cat, count: catEvents.length, registrations: regs };
    }).sort((a, b) => b.registrations - a.registrations);
  }, [events]);

  const maxCategoryRegs = Math.max(1, ...categoryBreakdown.map((c) => c.registrations));

  const recentFeed = useMemo(() => {
    const studentRegs = registrations.map((r) => {
      const ev = events.find((e) => e.id === r.eventId);
      return {
        id: r.id,
        student: r.studentName,
        email: r.studentEmail,
        eventTitle: ev?.title || 'Campus Event',
        eventId: r.eventId,
        code: r.confirmationCode,
        time: new Date(r.registeredAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      };
    });
    return studentRegs.slice(0, 6);
  }, [registrations, events]);

  const topChartEvents = useMemo(
    () =>
      [...events]
        .sort((a, b) => b.registeredCount - a.registeredCount)
        .slice(0, 6),
    [events]
  );

  return (
    <WorkspaceShell title="Organiser Dashboard" breadcrumb="Campus Pulse / Organiser Hub">
      <div className="space-y-8">
        {/* Top Banner + Create Action */}
        <div className="bg-[#080D1A] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Event Operations & Registration Analytics
            </h2>
            <p className="text-sm text-slate-300 mt-1.5">
              Publish new campus experiences in under 60 seconds and monitor live seat demand.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('create-event')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-brand-gradient bg-brand-gradient-hover transition-all whitespace-nowrap shrink-0"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        </div>

        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Published Events</span>
              <Calendar className="w-4 h-4 text-violet-700" />
            </div>
            <div className="font-display text-3xl font-bold text-slate-900 tabular-nums">
              {stats.totalEvents}
            </div>
            <div className="text-xs text-slate-500 mt-1">Active across campus</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Total Registrations</span>
              <Users className="w-4 h-4 text-blue-700" />
            </div>
            <div className="font-display text-3xl font-bold text-slate-900 tabular-nums">
              {stats.totalRegistrations.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-700 font-medium mt-1">Live seat count</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Upcoming Events</span>
              <TrendingUp className="w-4 h-4 text-violet-700" />
            </div>
            <div className="font-display text-3xl font-bold text-slate-900 tabular-nums">
              {stats.upcomingCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Scheduled from Nov 20</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Average Seat Fill</span>
              <BarChart3 className="w-4 h-4 text-blue-700" />
            </div>
            <div className="font-display text-3xl font-bold text-slate-900 tabular-nums">
              {stats.avgFill}%
            </div>
            <div className="text-xs text-slate-500 mt-1">Across all open capacity</div>
          </div>
        </div>

        {/* Analytics & Performance Charts */}
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Event Performance & Seat Fill
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirmed registrations compared to maximum venue capacity
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {topChartEvents.map((ev) => {
                const pct = Math.min(100, Math.round((ev.registeredCount / ev.maxParticipants) * 100));
                return (
                  <div key={ev.id}>
                    <div className="flex items-center justify-between gap-4 text-xs mb-1.5">
                      <button
                        type="button"
                        onClick={() => navigate('event-details', { eventId: ev.id })}
                        className="font-semibold text-slate-800 hover:text-violet-700 truncate text-left"
                      >
                        {ev.title}
                      </button>
                      <span className="font-mono-tabular text-slate-600 shrink-0">
                        <strong className="text-slate-900">{ev.registeredCount}</strong> / {ev.maxParticipants} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-brand-gradient rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Registration Analytics by Category
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-5">
                Student participation distributed across campus tracks
              </p>

              <div className="space-y-3.5">
                {categoryBreakdown.map((item) => {
                  const widthPct = Math.round((item.registrations / maxCategoryRegs) * 100);
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">
                          {item.category} ({item.count})
                        </span>
                        <span className="font-mono-tabular font-semibold text-slate-900">
                          {item.registrations} regs
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-slate-900 rounded-full"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Registrations & Manage Events */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Manage Events Table */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Manage Published Events
                </h3>
                <p className="text-xs text-slate-500">
                  Live registration counters update immediately as students register.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('create-event')}
                className="text-xs font-semibold text-violet-700 hover:text-violet-900 whitespace-nowrap"
              >
                + Add Event
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                    <th className="py-3 px-5">Event</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Registrations</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {events.map((ev) => {
                    const isConfirming = confirmDeleteId === ev.id;
                    return (
                      <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 max-w-[260px]">
                          <div className="font-semibold text-slate-900 truncate">{ev.title}</div>
                          <div className="text-xs text-slate-500 truncate">
                            {ev.category} · {ev.venue}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular text-xs text-slate-700 whitespace-nowrap">
                          {formatDisplayDate(ev.date)} · {ev.time}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-tabular text-xs whitespace-nowrap">
                          <span className="font-semibold text-slate-900">{ev.registeredCount}</span>
                          <span className="text-slate-400"> / {ev.maxParticipants}</span>
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          {isConfirming ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  deleteEvent(ev.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2.5 py-1 rounded bg-rose-700 text-white text-xs font-semibold"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 rounded border border-slate-200 text-xs text-slate-600"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => navigate('event-details', { eventId: ev.id })}
                                aria-label={`View ${ev.title}`}
                                className="p-1.5 rounded-md text-slate-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(ev.id)}
                                aria-label={`Delete ${ev.title}`}
                                className="p-1.5 rounded-md text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Registrations Feed */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="font-display text-base font-bold text-slate-900">
                Recent Student Signups
              </h3>
              <p className="text-xs text-slate-500">Latest confirmed passes</p>
            </div>

            {recentFeed.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No recent registrations recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentFeed.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate('event-details', { eventId: item.eventId })}
                    className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {item.student}
                      </span>
                      <span className="font-mono-tabular text-[11px] text-emerald-700 font-medium shrink-0">
                        {item.code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 truncate">{item.eventTitle}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
