import React from 'react';
import { Bookmark, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { CampusEvent } from '../types';
import { EventBanner } from './EventBanner';

interface EventCardProps {
  event: CampusEvent;
  isRegistered: boolean;
  isSaved: boolean;
  onViewDetails: (eventId: string) => void;
  onToggleSave: (eventId: string) => void;
}

export function formatDisplayDate(dateStr: string): string {
  const parsed = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function EventCard({
  event,
  isRegistered,
  isSaved,
  onViewDetails,
  onToggleSave,
}: EventCardProps) {
  const seatsLeft = Math.max(0, event.maxParticipants - event.registeredCount);
  const isFull = seatsLeft === 0;

  return (
    <article className="group bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-200 hover:border-violet-300 hover:shadow-lg hover:shadow-slate-900/5 flex flex-col">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
        <EventBanner
          src={event.bannerUrl}
          alt={event.title}
          title={event.title}
          category={event.category}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(event.id);
          }}
          aria-label={isSaved ? `Remove ${event.title} from saved events` : `Save ${event.title}`}
          className="absolute top-3 right-3 w-10 h-10 rounded-lg bg-slate-950/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <Bookmark
            className={`w-4 h-4 ${isSaved ? 'fill-violet-400 text-violet-400' : 'text-white'}`}
          />
        </button>

        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-medium text-white/95">
          <span>{event.category}</span>
          <span className="font-mono-tabular">
            {formatDisplayDate(event.date)} · {event.time}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-2 truncate">
          <span className="truncate">{event.venue}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{event.organiser}</span>
        </div>

        <h3 className="font-display text-lg font-semibold text-slate-900 leading-snug mb-2 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-2 mb-5 flex-1">
          {event.description}
        </p>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {isRegistered ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Registered</span>
              </div>
            ) : isFull ? (
              <span className="text-xs font-semibold text-rose-700">Waitlist / Full</span>
            ) : (
              <span className="text-xs text-slate-600 font-mono-tabular">
                <strong className="text-slate-900 font-semibold">{seatsLeft}</strong> seats open
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onViewDetails(event.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-violet-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
