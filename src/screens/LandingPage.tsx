import React from 'react';
import {
  ArrowRight,
  Calendar,
  Code2,
  Cpu,
  Dumbbell,
  Music,
  Users,
  Wrench,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { EventBanner } from '../components/EventBanner';
import { EventCard, formatDisplayDate } from '../components/EventCard';
import { useCampus } from '../context/CampusContext';
import { EventCategory } from '../types';

const CATEGORY_CARDS: {
  name: EventCategory;
  summary: string;
  icon: React.ReactNode;
}[] = [
  {
    name: 'Hackathons',
    summary: '24-hour product sprints, team matching, and live demo judging.',
    icon: <Code2 className="w-5 h-5 text-violet-700" />,
  },
  {
    name: 'Workshops',
    summary: 'Hands-on robotics, design systems, and practical engineering labs.',
    icon: <Wrench className="w-5 h-5 text-blue-700" />,
  },
  {
    name: 'Technical Events',
    summary: 'Systems symposiums, cybersecurity CTFs, and research colloquia.',
    icon: <Cpu className="w-5 h-5 text-violet-700" />,
  },
  {
    name: 'Sports',
    summary: 'Varsity floodlight finals, intramural leagues, and track meets.',
    icon: <Dumbbell className="w-5 h-5 text-blue-700" />,
  },
  {
    name: 'Cultural Programs',
    summary: 'Acoustic amphitheater nights, theatre showcases, and arts festivals.',
    icon: <Music className="w-5 h-5 text-violet-700" />,
  },
  {
    name: 'Club Activities',
    summary: 'Founder mixers, prototype critiques, and student union assemblies.',
    icon: <Users className="w-5 h-5 text-blue-700" />,
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Before Campus Pulse, half our robotics workshop seats went unfilled because flyers were buried in dorm chats. Now we hit 45/45 capacity in two days.',
    name: 'Elena Rostova',
    role: 'Graduate Fellow · Robotics & Automation Society',
    outcome: 'Full lab capacity in 48 hours',
  },
  {
    quote:
      'I used to miss intramural signups every semester. Having hackathons, acoustic nights, and basketball finals in one searchable schedule changed my junior year.',
    name: 'Devon Cole',
    role: 'Junior, Computer Science · InfoSec Union',
    outcome: '9 campus events attended this fall',
  },
  {
    quote:
      'Publishing an event takes less than a minute, and watching live registration counts update in real time lets our club order the exact catering and hardware kits.',
    name: 'Maya Lin',
    role: 'Tech Lead · ACM Student Chapter',
    outcome: '148 confirmed hackathon builders',
  },
];

export function LandingPage() {
  const {
    events,
    navigate,
    isRegistered,
    savedEventIds,
    toggleSaveEvent,
    isAuthenticated,
    user,
  } = useCampus();

  const featuredEvents = events.slice(0, 3);
  const upcomingEvents = events.slice(0, 5);

  const countByCategory = (cat: EventCategory) =>
    events.filter((e) => e.category === cat).length;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top Bar Contract: Brand wordmark — 4 concise links — Primary Action */}
      <header className="sticky top-0 z-40 bg-[#080D1A]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          <BrandLogo variant="light" onClick={() => navigate('landing')} />

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a
              href="#home"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Home
            </a>
            <button
              type="button"
              onClick={() => navigate('explore')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Discover Events
            </button>
            <a
              href="#categories"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Categories
            </a>
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() =>
                navigate(isAuthenticated ? (user.role === 'organiser' ? 'organiser-dashboard' : 'student-dashboard') : 'auth')
              }
              className="text-sm font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {isAuthenticated ? 'Dashboard' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => navigate('auth')}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-brand-gradient bg-brand-gradient-hover transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-[#080D1A] text-white pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-medium text-violet-300 mb-4">
                Feel the Campus. Discover the Moment.
              </p>
              <h1
                className="font-display font-extrabold tracking-tight text-white leading-[1.08] mb-6"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.75rem)', textWrap: 'balance' }}
              >
                Your Campus. Your Events. Your Moment.
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mb-8">
                Discover workshops, hackathons, sports and campus experiences — all in one place.
                Built for students tired of scattered flyers and organisers ready to fill every seat.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('explore')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold text-white bg-brand-gradient bg-brand-gradient-hover shadow-lg shadow-violet-950/50 transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('auth')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold text-white border border-white/20 bg-white/5 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  <span>Join Campus</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-900 aspect-[16/10] lg:aspect-auto lg:h-full min-h-[300px]">
                <EventBanner
                  src="/src/assets/images/hero_campus_pulse_1795211557744.jpg"
                  alt="University innovation quadrangle illuminated at twilight with students collaborating"
                  title="Campus Pulse Innovation Quadrangle"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#080D1A]/85 via-transparent to-transparent pointer-events-none"
                  aria-hidden="true"
                />
                <div className="absolute bottom-5 left-5 right-5 glass-panel rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs text-violet-300 font-medium">Happening Today · Nov 20</div>
                    <div className="text-sm font-semibold text-white truncate">
                      Robotics & Vision Lab + Twilight Acoustic Sessions
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('student-dashboard')}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-white/15 hover:bg-white/25 transition-colors whitespace-nowrap shrink-0"
                  >
                    Open Feed
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Statistics Strip */}
          <div className="mt-14 pt-10 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">
                42+
              </div>
              <div className="text-sm text-slate-400 mt-1">Active student clubs & societies</div>
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">
                180+
              </div>
              <div className="text-sm text-slate-400 mt-1">Campus events hosted this semester</div>
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">
                6,400+
              </div>
              <div className="text-sm text-slate-400 mt-1">Verified student seat confirmations</div>
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">
                &lt; 60s
              </div>
              <div className="text-sm text-slate-400 mt-1">Average time to publish an event</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Featured Campus Events
              </h2>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Curated hackathons, technical labs, and live performances filling seats this week.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('explore')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:text-violet-900 whitespace-nowrap shrink-0"
            >
              <span>View all events</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isRegistered={isRegistered(event.id)}
                isSaved={savedEventIds.includes(event.id)}
                onViewDetails={(id) => navigate('event-details', { eventId: id })}
                onToggleSave={toggleSaveEvent}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section id="categories" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Explore by Category
            </h2>
            <p className="text-slate-600 mt-2">
              Jump directly into the communities, competitions, and workshops happening across campus.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORY_CARDS.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => navigate('explore', { category: cat.name })}
                className="text-left p-6 rounded-xl border border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50/70 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-violet-50 flex items-center justify-center transition-colors">
                    {cat.icon}
                  </div>
                  <span className="font-mono-tabular text-xs font-medium text-slate-500">
                    {countByCategory(cat.name)} open
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900 mb-1.5">
                  {cat.name}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{cat.summary}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Schedule */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Upcoming Campus Schedule
              </h2>
              <p className="text-slate-600 mt-2">
                Real-time seat counts across every department and student organisation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('ai-assistant')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-900 bg-white border border-slate-200 hover:border-violet-300 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Ask AI Event Concierge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {upcomingEvents.map((ev) => {
              const openSeats = Math.max(0, ev.maxParticipants - ev.registeredCount);
              return (
                <div
                  key={ev.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                      <EventBanner
                        src={ev.bannerUrl}
                        alt={ev.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="font-medium text-violet-700">{ev.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">
                          {formatDisplayDate(ev.date)} at {ev.time}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{ev.venue}</span>
                      </div>
                      <h3 className="font-display text-base font-semibold text-slate-900 truncate">
                        {ev.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-5 shrink-0">
                    <div className="text-right">
                      <div className="font-mono-tabular text-sm font-semibold text-slate-900">
                        {openSeats} seats left
                      </div>
                      <div className="text-xs text-slate-500">{ev.organiser}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('event-details', { eventId: ev.id })}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-violet-700 transition-colors whitespace-nowrap shrink-0"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-[#080D1A] text-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              How Campus Pulse Works
            </h2>
            <p className="text-slate-300 mt-2">
              One connected loop replacing scattered group messages, paper posters, and manual spreadsheets.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-7 rounded-xl bg-slate-900/70 border border-white/10">
              <div className="font-mono-tabular text-sm font-semibold text-violet-400 mb-3">
                01. Discover
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">
                Centralized Event Feed
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Browse verified hackathons, lab workshops, sports finals, and cultural nights filtered by date, category, or AI-matched to your major and interests.
              </p>
            </div>

            <div className="p-7 rounded-xl bg-slate-900/70 border border-white/10">
              <div className="font-mono-tabular text-sm font-semibold text-blue-400 mb-3">
                02. Register
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">
                Two-Click Seat Confirmation
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Claim your spot instantly with live capacity tracking, receive a digital confirmation code, and manage or cancel registrations anytime.
              </p>
            </div>

            <div className="p-7 rounded-xl bg-slate-900/70 border border-white/10">
              <div className="font-mono-tabular text-sm font-semibold text-violet-400 mb-3">
                03. Organise
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">
                Publish Under One Minute
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Student clubs generate polished event descriptions with AI, publish directly to the live campus catalog, and monitor registration velocity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Trusted Across Student Organisations
            </h2>
            <p className="text-slate-600 mt-2">
              Real outcomes from club leads and students running events on Campus Pulse.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.name}
                className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <p className="text-sm text-slate-700 leading-relaxed mb-6">“{item.quote}”</p>
                <div className="pt-4 border-t border-slate-200/80">
                  <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.role}</div>
                  <div className="text-xs font-medium text-violet-700 mt-2">{item.outcome}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#080D1A] text-slate-300 py-14">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            <div className="sm:col-span-2 lg:col-span-1">
              <BrandLogo variant="light" onClick={() => navigate('landing')} />
              <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                Feel the Campus. Discover the Moment. Centralized AI-powered event discovery for modern universities.
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-white mb-4">Platform</div>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button type="button" onClick={() => navigate('explore')} className="hover:text-white transition-colors">
                    Explore Events
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('student-dashboard')} className="hover:text-white transition-colors">
                    Student Dashboard
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('ai-assistant')} className="hover:text-white transition-colors">
                    AI Campus Assistant
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold text-white mb-4">Organisers</div>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button type="button" onClick={() => navigate('organiser-dashboard')} className="hover:text-white transition-colors">
                    Organiser Hub
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('create-event')} className="hover:text-white transition-colors">
                    Publish New Event
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('auth')} className="hover:text-white transition-colors">
                    Club Onboarding
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold text-white mb-4">Quick Access</div>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate('auth')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-brand-gradient bg-brand-gradient-hover transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Join Campus Pulse</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>© 2026 Campus Pulse. Built for university communities.</div>
            <div>hello@campuspulse.edu</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
