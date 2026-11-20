import React from 'react';
import { CampusProvider, useCampus } from './context/CampusContext';
import { AIAssistant } from './screens/AIAssistant';
import { AuthScreen } from './screens/AuthScreen';
import { CreateEvent } from './screens/CreateEvent';
import { EventDetails } from './screens/EventDetails';
import { ExploreEvents } from './screens/ExploreEvents';
import { LandingPage } from './screens/LandingPage';
import { MyRegistrations } from './screens/MyRegistrations';
import { OrganiserDashboard } from './screens/OrganiserDashboard';
import { StudentDashboard } from './screens/StudentDashboard';

function ScreenRouter() {
  const { screen } = useCampus();

  switch (screen) {
    case 'landing':
      return <LandingPage />;
    case 'student-dashboard':
      return <StudentDashboard />;
    case 'explore':
      return <ExploreEvents />;
    case 'event-details':
      return <EventDetails />;
    case 'organiser-dashboard':
      return <OrganiserDashboard />;
    case 'create-event':
      return <CreateEvent />;
    case 'ai-assistant':
      return <AIAssistant />;
    case 'auth':
      return <AuthScreen />;
    case 'my-registrations':
      return <MyRegistrations />;
    default:
      return <LandingPage />;
  }
}

export default function App() {
  return (
    <CampusProvider>
      <ScreenRouter />
    </CampusProvider>
  );
}
