import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Home Screen
    'app.title': 'Find A Match',
    'app.subtitle': 'Find your next match!',
    'app.pendingRequests': 'Pending Requests',
    'app.confirmedMatches': 'Confirmed Matches',
    'app.noRequests': 'No requests yet',
    'app.noRequestsSubtext': 'Tap the + button to create one!',
    
    // Request Screen
    'request.title': 'New Tennis Request',
    'request.date': 'Date',
    'request.startTime': 'Start Time',
    'request.endTime': 'End Time',
    'request.selectFriends': 'Select Friends',
    'request.selected': 'selected',
    'request.noFriends': 'No friends yet',
    'request.noFriendsSubtext': 'Add friends to your list to send tennis requests',
    'request.send': 'Send Request',
    'request.errorNoFriends': 'Please select at least one friend',
    'request.errorTime': 'End time must be after start time',
    'request.success': 'Success',
    'request.sent': 'Request sent to {count} friend(s)!',
    
    // Request Details
    'details.title': 'Tennis Request',
    'details.confirmed': '✓ Confirmed',
    'details.date': 'Date:',
    'details.timeRange': 'Time Range:',
    'details.friendsInvited': 'Friends Invited:',
    'details.you': '(You)',
    'details.accepted': '✓ Accepted:',
    'details.acceptTime': 'Accept Time',
    'details.waiting': 'Waiting for response...',
    'details.confirmMatch': 'Confirm Match',
    'details.errorNoAcceptances': 'No friends have accepted a time yet',
    'details.matchConfirmed': 'Match confirmed!',
    'details.notFound': 'Request not found',
    
    // Menu
    'menu.title': 'Menu',
    'menu.friends': 'Friends',
    'menu.matchHistory': 'Match History',
    'menu.share': 'Share App',
    'menu.settings': 'Settings',
    'menu.about': 'About',
    
    // Share
    'share.title': 'Find A Match',
    'share.message': 'Check out Find A Match - an app to find tennis partners and schedule matches! Download it now!',
    'share.error': 'Unable to share the app',
    
    // Settings
    'settings.title': 'Settings',
    'settings.languages': 'Languages',
    'settings.selectLanguages': 'Select Languages',
    'settings.language.german': 'German',
    'settings.language.english': 'English',
    
    // Friends
    'friends.title': 'Friends',
    'friends.addFriend': 'Add Friend',
    'friends.addByCode': 'Add Friend by Code',
    'friends.enterCode': 'Enter friend code',
    'friends.sendRequest': 'Send Request',
    'friends.or': 'OR',
    'friends.inviteViaShare': 'Invite via WhatsApp/Email',
    'friends.requests': 'Friend Requests',
    'friends.wantsToAdd': 'wants to add you as a friend',
    'friends.accept': 'Accept',
    'friends.myFriends': 'My Friends',
    'friends.noFriends': 'No friends yet',
    'friends.addFirstFriend': 'Add your first friend to get started!',
    'friends.pending': 'Pending',
    'friends.inviteTitle': 'Join me on Find A Match!',
    'friends.inviteMessage': 'Hey! Join me on Find A Match - an app to find tennis partners! Use my invite code: {code}',
    'friends.success': 'Success',
    'friends.error': 'Error',
    'friends.inviteSent': 'Invite sent successfully!',
    'friends.inviteError': 'Unable to send invite',
    'friends.emptyCode': 'Please enter a friend code',
    'friends.requestSent': 'Friend request sent!',
    'friends.requestAccepted': 'Friend request accepted!',
    
    // Common
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
  },
  de: {
    // Home Screen
    'app.title': 'Find A Match',
    'app.subtitle': 'Finde dein nächstes Match!',
    'app.pendingRequests': 'Ausstehende Anfragen',
    'app.confirmedMatches': 'Bestätigte Matches',
    'app.noRequests': 'Noch keine Anfragen',
    'app.noRequestsSubtext': 'Tippe auf die + Schaltfläche, um eine zu erstellen!',
    
    // Request Screen
    'request.title': 'Neue Tennis-Anfrage',
    'request.date': 'Datum',
    'request.startTime': 'Startzeit',
    'request.endTime': 'Endzeit',
    'request.selectFriends': 'Freunde auswählen',
    'request.selected': 'ausgewählt',
    'request.noFriends': 'Noch keine Freunde',
    'request.noFriendsSubtext': 'Füge Freunde zu deiner Liste hinzu, um Tennis-Anfragen zu senden',
    'request.send': 'Anfrage senden',
    'request.errorNoFriends': 'Bitte wähle mindestens einen Freund aus',
    'request.errorTime': 'Endzeit muss nach der Startzeit liegen',
    'request.success': 'Erfolg',
    'request.sent': 'Anfrage an {count} Freund(e) gesendet!',
    
    // Request Details
    'details.title': 'Tennis-Anfrage',
    'details.confirmed': '✓ Bestätigt',
    'details.date': 'Datum:',
    'details.timeRange': 'Zeitraum:',
    'details.friendsInvited': 'Eingeladene Freunde:',
    'details.you': '(Du)',
    'details.accepted': '✓ Akzeptiert:',
    'details.acceptTime': 'Zeit akzeptieren',
    'details.waiting': 'Warte auf Antwort...',
    'details.confirmMatch': 'Match bestätigen',
    'details.errorNoAcceptances': 'Noch kein Freund hat eine Zeit akzeptiert',
    'details.matchConfirmed': 'Match bestätigt!',
    'details.notFound': 'Anfrage nicht gefunden',
    
    // Menu
    'menu.title': 'Menü',
    'menu.friends': 'Freunde',
    'menu.matchHistory': 'Match-Verlauf',
    'menu.share': 'App teilen',
    'menu.settings': 'Einstellungen',
    'menu.about': 'Über',
    
    // Share
    'share.title': 'Find A Match',
    'share.message': 'Schau dir Find A Match an - eine App, um Tennispartner zu finden und Matches zu planen! Jetzt herunterladen!',
    'share.error': 'App konnte nicht geteilt werden',
    
    // Settings
    'settings.title': 'Einstellungen',
    'settings.languages': 'Sprachen',
    'settings.selectLanguages': 'Sprachen auswählen',
    'settings.language.german': 'Deutsch',
    'settings.language.english': 'Englisch',
    
    // Friends
    'friends.title': 'Freunde',
    'friends.addFriend': 'Freund hinzufügen',
    'friends.addByCode': 'Freund per Code hinzufügen',
    'friends.enterCode': 'Freundescode eingeben',
    'friends.sendRequest': 'Anfrage senden',
    'friends.or': 'ODER',
    'friends.inviteViaShare': 'Via WhatsApp/E-Mail einladen',
    'friends.requests': 'Freundesanfragen',
    'friends.wantsToAdd': 'möchte dich als Freund hinzufügen',
    'friends.accept': 'Akzeptieren',
    'friends.myFriends': 'Meine Freunde',
    'friends.noFriends': 'Noch keine Freunde',
    'friends.addFirstFriend': 'Füge deinen ersten Freund hinzu, um loszulegen!',
    'friends.pending': 'Ausstehend',
    'friends.inviteTitle': 'Tritt mir bei Find A Match bei!',
    'friends.inviteMessage': 'Hey! Tritt mir bei Find A Match bei - einer App, um Tennispartner zu finden! Verwende meinen Einladungscode: {code}',
    'friends.success': 'Erfolg',
    'friends.error': 'Fehler',
    'friends.inviteSent': 'Einladung erfolgreich gesendet!',
    'friends.inviteError': 'Einladung konnte nicht gesendet werden',
    'friends.emptyCode': 'Bitte gib einen Freundescode ein',
    'friends.requestSent': 'Freundesanfrage gesendet!',
    'friends.requestAccepted': 'Freundesanfrage akzeptiert!',
    
    // Common
    'common.ok': 'OK',
    'common.cancel': 'Abbrechen',
  },
};

export const LanguageProvider = ({ children }) => {
  const [selectedLanguages, setSelectedLanguages] = useState(['en']); // Default to English
  const [primaryLanguage, setPrimaryLanguage] = useState('en');

  // Load saved languages on mount
  React.useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedLanguages');
      const primary = await AsyncStorage.getItem('primaryLanguage');
      if (saved) {
        const languages = JSON.parse(saved);
        setSelectedLanguages(languages);
      }
      if (primary) {
        setPrimaryLanguage(primary);
      }
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const saveLanguages = async (languages, primary) => {
    try {
      await AsyncStorage.setItem('selectedLanguages', JSON.stringify(languages));
      await AsyncStorage.setItem('primaryLanguage', primary);
      setSelectedLanguages(languages);
      setPrimaryLanguage(primary);
    } catch (error) {
      console.error('Error saving languages:', error);
    }
  };

  const t = (key, params = {}) => {
    let text = translations[primaryLanguage]?.[key] || translations['en'][key] || key;
    
    // Replace parameters
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguages,
        primaryLanguage,
        setLanguages: saveLanguages,
        t,
        availableLanguages: [
          { code: 'en', name: 'English', nativeName: 'English' },
          { code: 'de', name: 'German', nativeName: 'Deutsch' },
        ],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
