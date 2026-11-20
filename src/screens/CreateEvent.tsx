import React, { useState } from 'react';
import { ArrowRight, Bot, CheckCircle2, ImagePlus, Upload } from 'lucide-react';
import { EventBanner } from '../components/EventBanner';
import { formatDisplayDate } from '../components/EventCard';
import { WorkspaceShell } from '../components/WorkspaceShell';
import { useCampus } from '../context/CampusContext';
import { BANNER_PRESETS, EVENT_CATEGORIES } from '../data/mockData';
import { EventCategory } from '../types';

export function CreateEvent() {
  const { createEvent, navigate, user } = useCampus();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Workshops');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-11-26');
  const [time, setTime] = useState('17:00');
  const [venue, setVenue] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('80');
  const [deadline, setDeadline] = useState('2026-11-25');
  const [bannerUrl, setBannerUrl] = useState(BANNER_PRESETS[1].url);
  const [highlights, setHighlights] = useState<string[]>([]);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [formError, setFormError] = useState('');
  const [publishedEventId, setPublishedEventId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBannerUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateWithAI = async () => {
    setAiError('');
    if (!title.trim()) {
      setAiError('Enter an event title first so the AI can write a tailored description.');
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          venue,
          date,
          roughNotes: description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not draft event description.');
      }
      if (typeof data.description === 'string' && data.description.trim()) {
        setDescription(data.description.trim());
      }
      if (
        typeof data.suggestedCategory === 'string' &&
        EVENT_CATEGORIES.includes(data.suggestedCategory as EventCategory)
      ) {
        const nextCat = data.suggestedCategory as EventCategory;
        setCategory(nextCat);
        const matchingPreset = BANNER_PRESETS.find((p) => p.category === nextCat);
        if (matchingPreset && BANNER_PRESETS.some((p) => p.url === bannerUrl)) {
          setBannerUrl(matchingPreset.url);
        }
      }
      if (Array.isArray(data.highlights)) {
        setHighlights(data.highlights.slice(0, 3));
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter an event title.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please write a description or generate one with AI.');
      return;
    }
    if (!venue.trim()) {
      setFormError('Please specify a campus venue.');
      return;
    }
    const maxNum = Number(maxParticipants);
    if (!Number.isFinite(maxNum) || maxNum < 5) {
      setFormError('Maximum participants must be at least 5.');
      return;
    }

    const created = createEvent({
      title,
      description,
      category,
      date,
      time,
      venue,
      maxParticipants: maxNum,
      deadline,
      bannerUrl,
      highlights,
    });

    setPublishedEventId(created.id);
  };

  if (publishedEventId) {
    return (
      <WorkspaceShell title="Event Published" breadcrumb="Organiser Hub / Publish Confirmation">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-6 h-6 text-emerald-700" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
            Your event is live on Campus Pulse
          </h2>
          <p className="text-sm text-slate-600 mb-8">
            <strong className="text-slate-900">{title}</strong> is now discoverable by all students across Explore Events, Student Dashboard, and the AI Campus Assistant.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('event-details', { eventId: publishedEventId })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-brand-gradient bg-brand-gradient-hover"
            >
              <span>View Live Event Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => navigate('organiser-dashboard')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Back to Organiser Hub
            </button>
          </div>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell title="Create New Event" breadcrumb="Organiser Hub / Quick Publish">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5"
        >
          <div className="pb-4 border-b border-slate-100">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Publish in Under One Minute
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill out the core logistics and let AI draft your description if you are in a hurry.
            </p>
          </div>

          <div>
            <label htmlFor="evt-title" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Title
            </label>
            <input
              id="evt-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Generative AI Agents Builder Bootcamp"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="evt-category" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Category
              </label>
              <select
                id="evt-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="evt-venue" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Campus Venue
              </label>
              <input
                id="evt-venue"
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Innovation Lab 202"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label htmlFor="evt-desc" className="block text-xs font-semibold text-slate-700">
                Event Description
              </label>
              <button
                type="button"
                onClick={handleGenerateWithAI}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-violet-50 hover:bg-violet-100 text-violet-800 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{aiLoading ? 'Drafting with AI...' : 'Draft & Suggest Category with AI'}</span>
              </button>
            </div>
            <textarea
              id="evt-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what students will experience, prerequisite skills, and what is provided..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {aiError && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                {aiError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="evt-date" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Date
              </label>
              <input
                id="evt-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-mono-tabular focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="evt-time" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Time
              </label>
              <input
                id="evt-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-mono-tabular focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="evt-max" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Max Seats
              </label>
              <input
                id="evt-max"
                type="number"
                min={5}
                max={2000}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono-tabular focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="evt-deadline" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reg. Deadline
              </label>
              <input
                id="evt-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-mono-tabular focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Event Banner Upload + Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Event Banner Image</span>
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {BANNER_PRESETS.map((preset) => {
                const selected = bannerUrl === preset.url;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBannerUrl(preset.url)}
                    className={`rounded-lg overflow-hidden border-2 transition-all text-left ${
                      selected ? 'border-violet-600 ring-1 ring-violet-600' : 'border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="aspect-[4/3] bg-slate-900">
                      <EventBanner
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {formError}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('organiser-dashboard')}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-gradient bg-brand-gradient-hover transition-all"
            >
              <span>Publish Event</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Live Student Card Preview */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-violet-700" />
            <span>Live Student Card Preview</span>
          </div>

          <article className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="relative aspect-[4/3] w-full bg-slate-900">
              <EventBanner
                src={bannerUrl}
                alt={title || 'Event banner preview'}
                title={title || 'Event Preview'}
                category={category}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-medium text-white/95">
                <span>{category}</span>
                <span className="font-mono-tabular">
                  {formatDisplayDate(date)} · {time}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="text-xs text-slate-500 mb-1.5 truncate">
                {venue.trim() || 'Campus Venue'} · {user.name}
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-2">
                {title.trim() || 'Your Event Title'}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                {description.trim() ||
                  'Your event summary will appear here as students browse the campus discovery feed.'}
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-mono-tabular">
                  <strong className="text-slate-900">{maxParticipants || 0}</strong> seats open
                </span>
                <span className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900">
                  View Details
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </WorkspaceShell>
  );
}
