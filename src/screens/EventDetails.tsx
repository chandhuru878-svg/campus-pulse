import React, { useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Share2,
  Users,
} from 'lucide-react';
import { EventBanner } from '../components/EventBanner';
import { formatDisplayDate } from '../components/EventCard';
import { WorkspaceShell } from '../components/WorkspaceShell';
import { useCampus } from '../context/CampusContext';

export function EventDetails() {
  const {
    events,
    selectedEventId,
    navigate,
    isRegistered,
    getRegistration,
    registerForEvent,
    cancelRegistration,
    savedEventIds,
    toggleSaveEvent,
  } = useCampus();

  const [registering, setRegistering] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const event = events.find((e) => e.id === selectedEventId) || events[0];
  if (!event) {
    return (
      <WorkspaceShell title="Event Details" breadcrumb="Campus Pulse / Event Details">
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-sm text-slate-600 mb-4">This event could not be found.</p>
          <button
            type="button"
            onClick={() => navigate('explore')}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
          >
            Back to Explore Events
          </button>
        </div>
      </WorkspaceShell>
    );
  }

  const registered = isRegistered(event.id);
  const registrationRecord = getRegistration(event.id);
  const saved = savedEventIds.includes(event.id);
  const seatsLeft = Math.max(0, event.maxParticipants - event.registeredCount);
  const fillPct = Math.min(100, Math.round((event.registeredCount / event.maxParticipants) * 100));

  const handleRegister = () => {
    setFeedbackError('');
    setRegistering(true);
    setTimeout(() => {
      const result = registerForEvent(event.id);
      if (!result.ok && result.error) {
        setFeedbackError(result.error);
      }
      setRegistering(false);
    }, 280);
  };

  const handleShare = async () => {
    const shareText = `${event.title} — ${formatDisplayDate(event.date)} at ${event.time} (${event.venue}) on Campus Pulse`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      }
    } catch {
      // Clipboard fallback silently handled
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2600);
  };

  return (
    <WorkspaceShell title="Event Details" breadcrumb={`Explore Events / ${event.category}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('explore')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleSaveEvent(event.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                saved
                  ? 'border-violet-300 bg-violet-50 text-violet-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-violet-600' : ''}`} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shareCopied ? 'Invite Copied' : 'Share Event'}</span>
            </button>
          </div>
        </div>

        {/* Cover Image Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[16/7] min-h-[240px]">
          <EventBanner
            src={event.bannerUrl}
            alt={event.title}
            title={event.title}
            category={event.category}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="text-xs font-medium text-violet-300 mb-2">
              {event.category} · Hosted by {event.organiser}
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight max-w-3xl">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Description & Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <h3 className="font-display text-lg font-bold text-slate-900 mb-3">
                About This Event
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>

              {event.highlights.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h4 className="font-display text-sm font-bold text-slate-900 mb-3">
                    Key Highlights
                  </h4>
                  <ul className="space-y-2">
                    {event.highlights.map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Organiser Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Event Organiser</div>
                <div className="font-display text-base font-bold text-slate-900">
                  {event.organiser}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">{event.organiserRole}</div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-mono-tabular">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{event.organiserEmail}</span>
              </div>
            </div>
          </div>

          {/* Right Registration & Logistics Sidebar */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Date & Time</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 font-mono-tabular">
                    {formatDisplayDate(event.date)} · {event.time}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Reg. Deadline</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 font-mono-tabular">
                    {formatDisplayDate(event.deadline)}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Campus Venue</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{event.venue}</div>
                </div>
              </div>

              {/* Capacity Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                    <Users className="w-3.5 h-3.5" />
                    <span>Seat Availability</span>
                  </span>
                  <span className="font-mono-tabular font-semibold text-slate-900">
                    {seatsLeft} of {event.maxParticipants} left
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-brand-gradient transition-all duration-300"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 font-mono-tabular mt-1.5">
                  {event.registeredCount} students currently registered
                </div>
              </div>

              {feedbackError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                  {feedbackError}
                </div>
              )}

              {/* Registration State Machine */}
              {registered && registrationRecord ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Seat Confirmed</span>
                    </div>
                    <p className="text-xs text-emerald-700">
                      Pass Code:{' '}
                      <strong className="font-mono-tabular">{registrationRecord.confirmationCode}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('my-registrations')}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                  >
                    View My Registrations
                  </button>

                  {!confirmCancel ? (
                    <button
                      type="button"
                      onClick={() => setConfirmCancel(true)}
                      className="w-full py-2 px-4 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-rose-700 hover:border-rose-200 transition-colors"
                    >
                      Cancel Registration
                    </button>
                  ) : (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 space-y-2">
                      <p className="text-xs text-rose-800 font-medium">
                        Release your reserved seat for this event?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            cancelRegistration(event.id);
                            setConfirmCancel(false);
                          }}
                          className="flex-1 py-1.5 rounded-md bg-rose-700 text-white text-xs font-semibold"
                        >
                          Confirm Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCancel(false)}
                          className="flex-1 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700"
                        >
                          Keep Seat
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  disabled={seatsLeft === 0 || registering}
                  onClick={handleRegister}
                  className="w-full py-3 px-5 rounded-lg text-sm font-semibold text-white bg-brand-gradient bg-brand-gradient-hover disabled:opacity-50 transition-all shadow-md shadow-violet-950/15"
                >
                  {registering
                    ? 'Confirming Seat...'
                    : seatsLeft === 0
                    ? 'Event Full'
                    : 'Register Now'}
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  navigate('ai-assistant', {
                    aiPrompt: `Summarize "${event.title}" and tell me who should attend and what to prepare.`,
                  })
                }
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
              >
                <Bot className="w-4 h-4 text-violet-700" />
                <span>Ask AI Assistant About This Event</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
