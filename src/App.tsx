import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import NSSLandingPage from './components/NSSLandingPage';
import NSSRegistrationForm from './components/NSSRegistrationForm';
import NSSPortfolioPage from './components/NSSPortfolioPage';
import NSSLoginPage from './components/NSSLoginPage';
import NSSAdminPanel from './components/NSSAdminPanel';
import NSSEventsPage from './components/NSSEventsPage';
import NSSPortfolioDisplay from './components/NSSPortfolioDisplay';
import NSSForgotPasswordPage from './components/NSSForgotPasswordPage';

export interface NSSUser {
  id: string;
  fullName: string;
  rollNumber: string;
  branch: string;
  password: string;
  profilePhoto: string;
  eventPhotos: EventPhoto[];
  qrCode: string;
  timestamp: number;
  isApproved: boolean;
  isRejected?: boolean;
  approvedBy?: string;
  approvedAt?: number;
  rejectedBy?: string;
  rejectedAt?: number;
  rejectionReason?: string;
  // New fields for volunteer tracking
  joinDate: string;
  endDate?: string;
  achievements: Achievement[];
  certificates: Certificate[];
  eventHistory: EventHistory[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  level: 'national' | 'district' | 'state';
  date: string;
  photo: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: number;
}

export interface Certificate {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  uploadDate: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: number;
}

export interface EventHistory {
  eventId: string;
  eventTitle: string;
  startDate: string;
  endDate: string;
  status: 'registered' | 'attended' | 'completed';
  registrationDate: string;
  attendanceDate?: string;
  completionDate?: string;
}

export interface Suggestion {
  id: string;
  userId: string;
  userName: string;
  userRollNumber: string;
  title: string;
  description: string;
  category: 'general' | 'event' | 'system' | 'achievement';
  status: 'pending' | 'reviewed' | 'implemented' | 'rejected';
  timestamp: number;
  reviewedBy?: string;
  reviewedAt?: number;
  response?: string;
}

export interface EventPhoto {
  id: string;
  photo: string;
  title: string;
  description: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startDate: string;
  endDate: string;
  registrations: EventRegistration[];
  timestamp: number;
}

export interface EventRegistration {
  userId: string;
  userRollNumber: string;
  userName: string;
  registeredAt: number;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: number;
}

export interface Registration {
  id: string;
  name: string;
  email: string;
  mobile: string;
  branch: string;
  section: string;
  year: string;
  familyMembers: number;
  timestamp: number;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'registration' | 'portfolio' | 'login' | 'admin' | 'events' | 'display' | 'forgot-password'>('landing');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['landing']);
  const [users, setUsers] = useState<NSSUser[]>([]);
  const [adminEvents, setAdminEvents] = useState<AdminEvent[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentUser, setCurrentUser] = useState<NSSUser | null>(null);
  const [displayUser, setDisplayUser] = useState<NSSUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Load existing data from localStorage
    const savedUsers = localStorage.getItem('nss-users');
    const savedEvents = localStorage.getItem('nss-admin-events');
    const savedSuggestions = localStorage.getItem('nss-suggestions');
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    if (savedEvents) {
      setAdminEvents(JSON.parse(savedEvents));
    }
    if (savedSuggestions) {
      setSuggestions(JSON.parse(savedSuggestions));
    }
  }, []);

  const navigateToPage = (page: typeof currentPage) => {
    setNavigationHistory(prev => [...prev, currentPage]);
    setCurrentPage(page);
  };

  const navigateBack = () => {
    if (navigationHistory.length > 0) {
      const previousPage = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentPage(previousPage as typeof currentPage);
    } else {
      setCurrentPage('landing');
    }
  };

  const saveUser = (user: NSSUser) => {
    const userWithDefaults = { 
      ...user, 
      isApproved: false, 
      isRejected: false,
      joinDate: user.joinDate || new Date().toISOString().split('T')[0],
      achievements: user.achievements || [],
      certificates: user.certificates || [],
      eventHistory: user.eventHistory || []
    };
    const updated = [...users, userWithDefaults];
    setUsers(updated);
    localStorage.setItem('nss-users', JSON.stringify(updated));
    setCurrentUser(userWithDefaults);
    navigateToPage('portfolio');
  };

  const updateUser = (updatedUser: NSSUser) => {
    const updated = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updated);
    localStorage.setItem('nss-users', JSON.stringify(updated));
    setCurrentUser(updatedUser);
  };

  const approveUser = (userId: string) => {
    const updated = users.map(u => 
      u.id === userId 
        ? { ...u, isApproved: true, isRejected: false, approvedBy: 'admin', approvedAt: Date.now() }
        : u
    );
    setUsers(updated);
    localStorage.setItem('nss-users', JSON.stringify(updated));
  };

  const rejectUser = (userId: string, reason?: string) => {
    const updated = users.map(u => 
      u.id === userId 
        ? { 
            ...u, 
            isApproved: false, 
            isRejected: true, 
            rejectedBy: 'admin', 
            rejectedAt: Date.now(),
            rejectionReason: reason || 'No reason provided'
          }
        : u
    );
    setUsers(updated);
    localStorage.setItem('nss-users', JSON.stringify(updated));
  };

  const approveEventRegistration = (eventId: string, userId: string) => {
    const updated = adminEvents.map(event => 
      event.id === eventId 
        ? {
            ...event,
            registrations: event.registrations.map(reg =>
              reg.userId === userId
                ? { ...reg, isApproved: true, approvedBy: 'admin', approvedAt: Date.now() }
                : reg
            )
          }
        : event
    );
    setAdminEvents(updated);
    localStorage.setItem('nss-admin-events', JSON.stringify(updated));
  };

  const saveAdminEvent = (event: AdminEvent) => {
    const eventWithDefaults = {
      ...event,
      startDate: event.startDate || event.date,
      endDate: event.endDate || event.date
    };
    const updated = [...adminEvents, eventWithDefaults];
    setAdminEvents(updated);
    localStorage.setItem('nss-admin-events', JSON.stringify(updated));
  };

  const saveSuggestion = (suggestion: Suggestion) => {
    const updated = [...suggestions, suggestion];
    setSuggestions(updated);
    localStorage.setItem('nss-suggestions', JSON.stringify(updated));
  };

  const updateSuggestion = (updatedSuggestion: Suggestion) => {
    const updated = suggestions.map(s => s.id === updatedSuggestion.id ? updatedSuggestion : s);
    setSuggestions(updated);
    localStorage.setItem('nss-suggestions', JSON.stringify(updated));
  };

  const addAchievement = (userId: string, achievement: Achievement) => {
    const updated = users.map(u => 
      u.id === userId 
        ? { ...u, achievements: [...u.achievements, achievement] }
        : u
    );
    setUsers(updated);
    localStorage.setItem('nss-users', JSON.stringify(updated));
  };

  const updateAchievement = (userId: string, achievementId: string, updatedAchievement: Achievement) => {
    const updated = users.map(u => 
      u.id === userId 
        ? { 
            ...u, 
            achievements: u.achievements.map(a => 
              a.id === achievementId ? updatedAchievement : a
            )
          }
        : u
    );
    setUsers(updated);
    localStorage.setItem('nss-users', JSON.stringify(updated));
  };

  const registerForEvent = (eventId: string, user: NSSUser) => {
    const registration: EventRegistration = {
      userId: user.id,
      userRollNumber: user.rollNumber,
      userName: user.fullName,
      registeredAt: Date.now(),
      isApproved: false
    };

    const event = adminEvents.find(e => e.id === eventId);
    if (event) {
      const eventHistory: EventHistory = {
        eventId: event.id,
        eventTitle: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        status: 'registered',
        registrationDate: new Date().toISOString().split('T')[0]
      };

      // Update event registrations
      const updatedEvents = adminEvents.map(event =>
        event.id === eventId
          ? { ...event, registrations: [...event.registrations, registration] }
          : event
      );
      setAdminEvents(updatedEvents);
      localStorage.setItem('nss-admin-events', JSON.stringify(updatedEvents));

      // Update user's event history
      const updatedUsers = users.map(u => 
        u.id === user.id 
          ? { ...u, eventHistory: [...u.eventHistory, eventHistory] }
          : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('nss-users', JSON.stringify(updatedUsers));
    }
  };

  const handleLogin = (user: NSSUser) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    navigateToPage('portfolio');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setNavigationHistory(['landing']);
    setCurrentPage('landing');
  };

  const goToRegistration = () => {
    navigateToPage('registration');
  };

  const goToLogin = () => {
    navigateToPage('login');
  };

  const goToAdmin = () => {
    navigateToPage('admin');
  };

  const goToEvents = () => {
    navigateToPage('events');
  };

  const goToLanding = () => {
    setCurrentPage('landing');
    setNavigationHistory(['landing']);
    setCurrentUser(null);
    setDisplayUser(null);
  };

  const goToForgotPassword = () => {
    navigateToPage('forgot-password');
  };

  const displayPortfolio = (user: NSSUser) => {
    setDisplayUser(user);
    navigateToPage('display');
  };

  return (
    <>
      <div className="min-h-screen w-full overflow-x-hidden">
        {currentPage === 'landing' && (
          <NSSLandingPage 
            onRegister={goToRegistration}
            onLogin={goToLogin}
            onAdmin={goToAdmin}
            userCount={users.length}
            users={users}
            onSaveSuggestion={saveSuggestion}
          />
        )}
        {currentPage === 'registration' && (
          <NSSRegistrationForm 
            onSubmit={saveUser}
            existingRollNumbers={users.map(u => u.rollNumber)}
            onBack={navigateBack}
          />
        )}
        {currentPage === 'portfolio' && currentUser && (
          <NSSPortfolioPage 
            user={currentUser}
            onBack={navigateBack}
            onUpdate={updateUser}
            onDisplayPortfolio={displayPortfolio}
            onGoToEvents={goToEvents}
            onLogout={handleLogout}
            onSaveSuggestion={saveSuggestion}
          />
        )}
        {currentPage === 'login' && (
          <NSSLoginPage 
            users={users}
            onLogin={handleLogin}
            onBack={navigateBack}
            onForgotPassword={goToForgotPassword}
          />
        )}
        {currentPage === 'admin' && (
          <NSSAdminPanel 
            onSaveEvent={saveAdminEvent}
            events={adminEvents}
            users={users}
            suggestions={suggestions}
            onBack={navigateBack}
            onApproveUser={approveUser}
            onRejectUser={rejectUser}
            onApproveEventRegistration={approveEventRegistration}
            onUpdateSuggestion={updateSuggestion}
            onAddAchievement={addAchievement}
            onUpdateAchievement={updateAchievement}
          />
        )}
        {currentPage === 'events' && currentUser && (
          <NSSEventsPage 
            user={currentUser}
            events={adminEvents}
            onBack={navigateBack}
            onUpdateProfile={updateUser}
            onLogout={handleLogout}
            onRegisterForEvent={registerForEvent}
            onSaveSuggestion={saveSuggestion}
          />
        )}
        {currentPage === 'forgot-password' && (
          <NSSForgotPasswordPage 
            users={users}
            onBack={navigateBack}
          />
        )}
        {currentPage === 'display' && displayUser && (
          <NSSPortfolioDisplay 
            user={displayUser}
            onBack={navigateBack}
          />
        )}
      </div>
      <Toaster />
    </>
  );
}