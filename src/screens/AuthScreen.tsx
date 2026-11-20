import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, GraduationCap, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { EventBanner } from '../components/EventBanner';
import { useCampus } from '../context/CampusContext';
import { UserRole } from '../types';

const INTEREST_OPTIONS = [
  'AI & Machine Learning',
  'Hackathons',
  'Robotics & Hardware',
  'Product Design',
  'Cybersecurity',
  'Athletics & Sports',
  'Indie Music & Arts',
  'Entrepreneurship',
];

export function AuthScreen() {
  const { signIn, navigate } = useCampus();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [interests, setInterests] = useState<string[]>([
    'AI & Machine Learning',
    'Hackathons',
    'Product Design',
  ]);
  const [error, setError] = useState('');

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid campus email address.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    const derivedName =
      name.trim() ||
      trimmedEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    signIn({
      name: derivedName,
      email: trimmedEmail,
      role,
      department: department.trim() || undefined,
      interests,
    });
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    if (demoRole === 'student') {
      signIn({
        name: 'Aarav Mehta',
        email: 'aarav.mehta@campus.edu',
        role: 'student',
        department: 'Computer Science & Engineering · Junior',
        interests: ['AI & Machine Learning', 'Hackathons', 'Product Design', 'Indie Music & Arts'],
      });
    } else {
      signIn({
        name: 'Maya Lin',
        email: 'maya.lin@campus.edu',
        role: 'organiser',
        department: 'ACM Student Chapter · Lead Organiser',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 grid lg:grid-cols-12">
      {/* Left Brand Showcase */}
      <div className="lg:col-span-5 bg-[#080D1A] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <BrandLogo variant="light" onClick={() => navigate('landing')} />
          <button
            type="button"
            onClick={() => navigate('landing')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="relative z-10 my-12">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
            One campus identity for discovery and organising.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            Switch seamlessly between discovering events as a Student or publishing and tracking seats as a verified Club Organiser.
          </p>

          <div className="rounded-xl overflow-hidden border border-white/15 aspect-[16/9]">
            <EventBanner
              src="/src/assets/images/hero_campus_pulse_1795211557744.jpg"
              alt="Campus Pulse student auditorium at dusk"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          Feel the Campus. Discover the Moment.
        </div>
      </div>

      {/* Right Auth Form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                {mode === 'signin' ? 'Sign in to Campus Pulse' : 'Create your campus account'}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Choose your role to launch the tailored workspace.
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                mode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  role === 'student'
                    ? 'border-violet-600 bg-violet-50/60 ring-1 ring-violet-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <GraduationCap
                    className={`w-5 h-5 ${role === 'student' ? 'text-violet-700' : 'text-slate-500'}`}
                  />
                  {role === 'student' && <Check className="w-4 h-4 text-violet-700" />}
                </div>
                <div className="text-sm font-semibold text-slate-900">Student</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Discover events, AI picks & tickets
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('organiser')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  role === 'organiser'
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <ShieldCheck
                    className={`w-5 h-5 ${role === 'organiser' ? 'text-blue-700' : 'text-slate-500'}`}
                  />
                  {role === 'organiser' && <Check className="w-4 h-4 text-blue-700" />}
                </div>
                <div className="text-sm font-semibold text-slate-900">Organiser</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Publish events & track analytics
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="auth-name" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Mehta"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label htmlFor="auth-dept" className="block text-xs font-medium text-slate-700 mb-1.5">
                    {role === 'organiser' ? 'Club / Society Name' : 'Department & Year'}
                  </label>
                  <input
                    id="auth-dept"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder={role === 'organiser' ? 'e.g. ACM Chapter' : 'e.g. CS Junior'}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                University Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'organiser' ? 'maya.lin@campus.edu' : 'aarav.mehta@campus.edu'}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {mode === 'register' && role === 'student' && (
              <div>
                <div className="text-xs font-medium text-slate-700 mb-2">
                  Interests (used for AI event recommendations)
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((tag) => {
                    const selected = interests.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          selected
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-brand-gradient bg-brand-gradient-hover transition-all"
            >
              <span>
                {mode === 'signin'
                  ? `Sign In as ${role === 'organiser' ? 'Organiser' : 'Student'}`
                  : `Create ${role === 'organiser' ? 'Organiser' : 'Student'} Account`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant Demo Access for Presentation */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-xs font-medium text-slate-500 mb-3">
              Instant Demo Access
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
              >
                Enter as Demo Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('organiser')}
                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
              >
                Enter as Demo Organiser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
