import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  BANNER_PRESETS,
  INITIAL_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REGISTRATIONS,
  INITIAL_USER,
} from '../data/mockData';
import {
  CampusEvent,
  CampusNotification,
  EventCategory,
  RegistrationRecord,
  ScreenId,
  UserProfile,
  UserRole,
} from '../types';

interface CreateEventInput {
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  maxParticipants: number;
  deadline: string;
  bannerUrl: string;
  highlights?: string[];
}

interface CampusContextValue {
  screen: ScreenId;
  navigate: (screen: ScreenId, options?: { eventId?: string; category?: EventCategory | 'All'; aiPrompt?: string }) => void;
  selectedEventId: string;
  exploreCategory: EventCategory | 'All';
  setExploreCategory: (cat: EventCategory | 'All') => void;
  aiPrefillPrompt: string;
  setAiPrefillPrompt: (prompt: string) => void;
  user: UserProfile;
  isAuthenticated: boolean;
  signIn: (payload: { name: string; email: string; role: UserRole; department?: string; interests?: string[] }) => void;
  switchRole: (role: UserRole) => void;
  signOut: () => void;
  events: CampusEvent[];
  registrations: RegistrationRecord[];
  savedEventIds: string[];
  notifications: CampusNotification[];
  registerForEvent: (eventId: string) => { ok: boolean; record?: RegistrationRecord; error?: string };
  cancelRegistration: (eventId: string) => void;
  toggleSaveEvent: (eventId: string) => void;
  createEvent: (input: CreateEventInput) => CampusEvent;
  deleteEvent: (eventId: string) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  isRegistered: (eventId: string) => boolean;
  getRegistration: (eventId: string) => RegistrationRecord | undefined;
}

const STORAGE_KEY = 'campus_pulse_state_v1';

interface StoredState {
  events: CampusEvent[];
  registrations: RegistrationRecord[];
  savedEventIds: string[];
  notifications: CampusNotification[];
  user: UserProfile;
  isAuthenticated: boolean;
}

const CampusContext = createContext<CampusContextValue | null>(null);

function loadInitialState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      if (Array.isArray(parsed.events) && parsed.events.length > 0) {
        return {
          events: parsed.events,
          registrations: Array.isArray(parsed.registrations) ? parsed.registrations : INITIAL_REGISTRATIONS,
          savedEventIds: Array.isArray(parsed.savedEventIds) ? parsed.savedEventIds : ['evt-nexus-hack', 'evt-product-mixer'],
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : INITIAL_NOTIFICATIONS,
          user: parsed.user || INITIAL_USER,
          isAuthenticated: Boolean(parsed.isAuthenticated),
        };
      }
    }
  } catch {
    // Ignore corrupt localStorage and fall back to seed data
  }
  return {
    events: INITIAL_EVENTS,
    registrations: INITIAL_REGISTRATIONS,
    savedEventIds: ['evt-nexus-hack', 'evt-product-mixer'],
    notifications: INITIAL_NOTIFICATIONS,
    user: INITIAL_USER,
    isAuthenticated: false,
  };
}

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState<StoredState>(() => loadInitialState());
  const [screen, setScreen] = useState<ScreenId>('landing');
  const [selectedEventId, setSelectedEventId] = useState<string>(initial.events[0]?.id || 'evt-nexus-hack');
  const [exploreCategory, setExploreCategory] = useState<EventCategory | 'All'>('All');
  const [aiPrefillPrompt, setAiPrefillPrompt] = useState<string>('');

  const [events, setEvents] = useState<CampusEvent[]>(initial.events);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>(initial.registrations);
  const [savedEventIds, setSavedEventIds] = useState<string[]>(initial.savedEventIds);
  const [notifications, setNotifications] = useState<CampusNotification[]>(initial.notifications);
  const [user, setUser] = useState<UserProfile>(initial.user);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initial.isAuthenticated);

  useEffect(() => {
    try {
      const payload: StoredState = {
        events,
        registrations,
        savedEventIds,
        notifications,
        user,
        isAuthenticated,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota errors
    }
  }, [events, registrations, savedEventIds, notifications, user, isAuthenticated]);

  const navigate = (
    target: ScreenId,
    options?: { eventId?: string; category?: EventCategory | 'All'; aiPrompt?: string }
  ) => {
    if (options?.eventId) {
      setSelectedEventId(options.eventId);
    }
    if (options?.category !== undefined) {
      setExploreCategory(options.category);
    }
    if (options?.aiPrompt !== undefined) {
      setAiPrefillPrompt(options.aiPrompt);
    }
    setScreen(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const signIn = (payload: {
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    interests?: string[];
  }) => {
    const nextUser: UserProfile = {
      name: payload.name.trim() || (payload.role === 'organiser' ? 'Maya Lin' : 'Aarav Mehta'),
      email: payload.email.trim() || (payload.role === 'organiser' ? 'maya.lin@campus.edu' : 'aarav.mehta@campus.edu'),
      role: payload.role,
      department:
        payload.department?.trim() ||
        (payload.role === 'organiser' ? 'ACM Student Chapter · Lead Organiser' : 'Computer Science · Junior'),
      interests:
        payload.interests && payload.interests.length > 0
          ? payload.interests
          : ['AI & Machine Learning', 'Hackathons', 'Product Design'],
    };
    setUser(nextUser);
    setIsAuthenticated(true);
    setScreen(payload.role === 'organiser' ? 'organiser-dashboard' : 'student-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchRole = (role: UserRole) => {
    setUser((prev) => ({
      ...prev,
      role,
      name: role === 'organiser' && prev.name === 'Aarav Mehta' ? 'Maya Lin' : role === 'student' && prev.name === 'Maya Lin' ? 'Aarav Mehta' : prev.name,
      email:
        role === 'organiser' && prev.email === 'aarav.mehta@campus.edu'
          ? 'maya.lin@campus.edu'
          : role === 'student' && prev.email === 'maya.lin@campus.edu'
          ? 'aarav.mehta@campus.edu'
          : prev.email,
      department:
        role === 'organiser' ? 'Campus Club Coordinator' : 'Computer Science & Engineering · Junior',
    }));
    setIsAuthenticated(true);
    setScreen(role === 'organiser' ? 'organiser-dashboard' : 'student-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setScreen('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isRegistered = (eventId: string) => registrations.some((r) => r.eventId === eventId);

  const getRegistration = (eventId: string) => registrations.find((r) => r.eventId === eventId);

  const registerForEvent = (eventId: string) => {
    const target = events.find((e) => e.id === eventId);
    if (!target) {
      return { ok: false, error: 'Event not found.' };
    }
    if (isRegistered(eventId)) {
      return { ok: false, error: 'You are already registered for this event.' };
    }
    if (target.registeredCount >= target.maxParticipants) {
      return { ok: false, error: 'This event has reached maximum capacity.' };
    }

    const code = `CP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: RegistrationRecord = {
      id: `reg-${Date.now()}`,
      eventId,
      studentName: user.name,
      studentEmail: user.email,
      registeredAt: new Date().toISOString(),
      confirmationCode: code,
      status: 'Confirmed',
    };

    setRegistrations((prev) => [record, ...prev]);
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, registeredCount: ev.registeredCount + 1 } : ev))
    );
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Registration Confirmed',
        message: `Seat reserved for ${target.title} (${code}). Venue: ${target.venue}.`,
        timestamp: 'Just now',
        read: false,
        eventId,
      },
      ...prev,
    ]);

    return { ok: true, record };
  };

  const cancelRegistration = (eventId: string) => {
    const target = events.find((e) => e.id === eventId);
    setRegistrations((prev) => prev.filter((r) => r.eventId !== eventId));
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId ? { ...ev, registeredCount: Math.max(0, ev.registeredCount - 1) } : ev
      )
    );
    if (target) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Registration Cancelled',
          message: `Your seat for ${target.title} has been released.`,
          timestamp: 'Just now',
          read: false,
          eventId,
        },
        ...prev,
      ]);
    }
  };

  const toggleSaveEvent = (eventId: string) => {
    setSavedEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [eventId, ...prev]
    );
  };

  const createEvent = (input: CreateEventInput): CampusEvent => {
    const fallbackBanner =
      BANNER_PRESETS.find((b) => b.category === input.category)?.url || BANNER_PRESETS[0].url;
    const newEvent: CampusEvent = {
      id: `evt-${Date.now()}`,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      date: input.date,
      time: input.time,
      venue: input.venue.trim(),
      organiser: user.role === 'organiser' ? `${user.name} (${user.department.split('·')[0].trim()})` : user.name,
      organiserRole: 'Verified Campus Organiser',
      organiserEmail: user.email,
      maxParticipants: Number(input.maxParticipants) || 50,
      registeredCount: 0,
      deadline: input.deadline || input.date,
      bannerUrl: input.bannerUrl || fallbackBanner,
      highlights:
        input.highlights && input.highlights.length > 0
          ? input.highlights
          : [
              `Hosted at ${input.venue.trim()}`,
              `Open to all campus students (${input.maxParticipants} seats)`,
              'Instant pass confirmation via Campus Pulse',
            ],
      isFeatured: true,
      isTrending: true,
      createdAt: new Date().toISOString(),
    };

    setEvents((prev) => [newEvent, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Campus Event Published',
        message: `${newEvent.title} is now open for registration on ${newEvent.date} at ${newEvent.venue}.`,
        timestamp: 'Just now',
        read: false,
        eventId: newEvent.id,
      },
      ...prev,
    ]);
    return newEvent;
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setRegistrations((prev) => prev.filter((r) => r.eventId !== eventId));
    setSavedEventIds((prev) => prev.filter((id) => id !== eventId));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <CampusContext.Provider
      value={{
        screen,
        navigate,
        selectedEventId,
        exploreCategory,
        setExploreCategory,
        aiPrefillPrompt,
        setAiPrefillPrompt,
        user,
        isAuthenticated,
        signIn,
        switchRole,
        signOut,
        events,
        registrations,
        savedEventIds,
        notifications,
        registerForEvent,
        cancelRegistration,
        toggleSaveEvent,
        createEvent,
        deleteEvent,
        markAllNotificationsRead,
        markNotificationRead,
        isRegistered,
        getRegistration,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const ctx = useContext(CampusContext);
  if (!ctx) {
    throw new Error('useCampus must be used inside CampusProvider');
  }
  return ctx;
}
