import React, { useState } from 'react';
import {
  Bell,
  Bot,
  CalendarPlus,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  TicketCheck,
  X,
  ArrowLeftRight,
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import { ScreenId } from '../types';
import { BrandLogo } from './BrandLogo';

interface WorkspaceShellProps {
  title: string;
  breadcrumb: string;
  children: React.ReactNode;
}

export function WorkspaceShell({ title, breadcrumb, children }: WorkspaceShellProps) {
  const {
    screen,
    navigate,
    user,
    switchRole,
    signOut,
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    registrations,
  } = useCampus();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const studentNav: { id: ScreenId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'student-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'explore', label: 'Explore Events', icon: <Compass className="w-4 h-4" /> },
    {
      id: 'my-registrations',
      label: 'My Registrations',
      icon: <TicketCheck className="w-4 h-4" />,
      badge: registrations.length,
    },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <Bot className="w-4 h-4" /> },
  ];

  const organiserNav: { id: ScreenId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'organiser-dashboard', label: 'Organiser Hub', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'create-event', label: 'Create Event', icon: <CalendarPlus className="w-4 h-4" /> },
    { id: 'explore', label: 'Live Catalog', icon: <Compass className="w-4 h-4" /> },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <Bot className="w-4 h-4" /> },
  ];

  const navItems = user.role === 'organiser' ? organiserNav : studentNav;

  const handleNavClick = (id: ScreenId) => {
    navigate(id);
    setMobileMenuOpen(false);
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#080D1A] text-slate-200 border-r border-slate-800/80">
      <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
        <BrandLogo variant="light" onClick={() => handleNavClick('landing')} />
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation menu"
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-5 flex-1 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <div className="px-3 pb-2 text-xs font-medium text-slate-400">
            {user.role === 'organiser' ? 'Organiser Workspace' : 'Student Workspace'}
          </div>
          {navItems.map((item) => {
            const active = screen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  active
                    ? 'bg-brand-gradient text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`font-mono-tabular text-xs font-semibold ${
                      active ? 'text-white/90' : 'text-violet-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <div className="px-3 pb-2 text-xs font-medium text-slate-400">Switch Role View</div>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                switchRole('student');
                setMobileMenuOpen(false);
              }}
              className={`px-2.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                user.role === 'student'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                switchRole('organiser');
                setMobileMenuOpen(false);
              }}
              className={`px-2.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                user.role === 'organiser'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Organiser
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="px-2">
          <div className="text-sm font-semibold text-white truncate">{user.name}</div>
          <div className="text-xs text-slate-400 truncate">{user.department}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleNavClick('auth')}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors whitespace-nowrap"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Account</span>
          </button>
          <button
            type="button"
            onClick={signOut}
            aria-label="Sign out to home"
            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">{SidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="text-xs text-slate-500 truncate">{breadcrumb}</div>
              <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 truncate">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative">
            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              aria-label={`Notifications (${unreadCount} unread)`}
              className="relative w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-violet-600 text-white text-[10px] font-mono-tabular font-semibold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {user.role === 'organiser' ? (
              <button
                type="button"
                onClick={() => navigate('create-event')}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-brand-gradient bg-brand-gradient-hover transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Create Event</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('explore')}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-brand-gradient bg-brand-gradient-hover transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Events</span>
              </button>
            )}

            {/* Notification Popover */}
            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-xl z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-display text-sm font-semibold text-slate-900">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-xs font-medium text-violet-700 hover:text-violet-900"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">
                        You are all caught up.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            markNotificationRead(n.id);
                            setNotifOpen(false);
                            if (n.eventId) {
                              navigate('event-details', { eventId: n.eventId });
                            }
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                            n.read ? 'bg-white' : 'bg-violet-50/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                            <span className="text-[11px] text-slate-400 shrink-0">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
