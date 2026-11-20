export type UserRole = 'student' | 'organiser';

export type EventCategory =
  | 'Hackathons'
  | 'Workshops'
  | 'Technical Events'
  | 'Sports'
  | 'Cultural Programs'
  | 'Club Activities';

export type ScreenId =
  | 'landing'
  | 'student-dashboard'
  | 'explore'
  | 'event-details'
  | 'organiser-dashboard'
  | 'create-event'
  | 'ai-assistant'
  | 'auth'
  | 'my-registrations';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  venue: string;
  organiser: string;
  organiserRole: string;
  organiserEmail: string;
  maxParticipants: number;
  registeredCount: number;
  deadline: string; // YYYY-MM-DD
  bannerUrl: string;
  highlights: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  createdAt: string;
}

export interface RegistrationRecord {
  id: string;
  eventId: string;
  studentName: string;
  studentEmail: string;
  registeredAt: string;
  confirmationCode: string;
  status: 'Confirmed' | 'Attended';
}

export interface CampusNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  eventId?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  interests: string[];
}

export interface AIRecommendation {
  eventId: string;
  reason: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendedEventIds?: string[];
  timestamp: string;
}
