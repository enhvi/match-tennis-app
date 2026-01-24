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
    'app.myRequests': 'My Requests',
    'app.myPendingRequests': 'My Pending Requests',
    'app.incomingRequests': 'Requests From Friends',
    'app.confirmedMatches': 'Confirmed Matches',
    'app.cancelledRequests': 'Cancelled Requests',
    'app.noRequests': 'No requests yet',
    'app.noRequestsSubtext': 'Tap the + button to create one!',
    'app.cancelled': 'Cancelled',
    'app.acceptedCount': '{count}/{total} accepted',
    'app.accepted': 'Accepted',
    'app.declined': 'Declined',
    'app.declinedBy': 'Declined by',
    'app.allDeclined': 'All declined',
    'app.actionRequired': 'Action required',
    'app.waitingForFriends': 'Waiting for friends',
    'app.incomingResponded': 'You already responded',
    'app.creator': 'Creator',
    
    // Request Screen
    'request.title': 'New Tennis Request',
    'request.date': 'Date',
    'request.startTime': 'Start Time',
    'request.endTime': 'End Time',
    'request.selectSport': 'Select Sport',
    'request.selectFriends': 'Select Friends',
    'request.selected': 'selected',
    'request.noFriends': 'No friends yet',
    'request.noFriendsSubtext': 'Add friends to your list to send tennis requests',
    'request.noFriendsForSport': 'No friends with this sport yet',
    'request.send': 'Send Request',
    'request.errorNoFriends': 'Please select at least one friend',
    'request.errorNoSport': 'Please select a sport',
    'request.errorTime': 'End time must be after start time',
    'request.players': 'Players',
    'request.inviteAll': 'Invite all',
    'request.inviteSome': 'Select friends',
    'request.errorPlayers': 'Please enter a valid number of players',
    'request.errorPlayersTooMany': 'Not enough friends for this number of players',
    'request.durationOptional': 'Duration (optional, minutes)',
    'request.durationPlaceholder': 'e.g. 120',
    'request.errorDuration': 'Please enter a valid duration',
    'request.update': 'Update Request',
    'request.success': 'Success',
    'request.sent': 'Request sent to {count} friend(s)!',
    
    // Request Details
    'details.title': 'Tennis Request',
    'details.confirmed': '✓ Confirmed',
    'details.date': 'Date:',
    'details.timeRange': 'Time Range:',
    'details.sport': 'Sport:',
    'details.friendsInvited': 'Friends Invited:',
    'details.you': '(You)',
    'details.accepted': '✓ Accepted:',
    'details.acceptTime': 'Accept Time',
    'details.startTime': 'Start',
    'details.endTime': 'End',
    'details.waiting': 'Waiting for response...',
    'details.proposed': 'Proposed:',
    'details.accept': 'Accept',
    'details.decline': 'Decline',
    'details.declined': 'Declined',
    'details.durationOutOfRange': 'Selected time does not match the requested duration',
    'details.duration': 'Duration:',
    'details.suggestedTimes': 'Suggested times',
    'details.deleteRequest': 'Delete request',
    'details.deleteConfirm': 'Do you want to delete this request?',
    'details.editRequest': 'Edit request',
    'details.editRequestPrompt': 'Do you want to edit this request?',
    'details.acceptedBy': 'Accepted by',
    'details.declinedBy': 'Declined by',
    'details.hasDeclines': 'Cannot confirm while someone has declined',
    'details.confirmMatch': 'Confirm Match',
    'details.errorNoAcceptances': 'No friends have accepted a time yet',
    'details.matchConfirmed': 'Match confirmed!',
    'details.onlyCreatorConfirm': 'Only the creator can confirm the match.',
    'details.completed': 'Completed',
    'details.completeMatch': 'Mark as Played',
    'details.completeMatchConfirm': 'Mark this match as played?',
    'details.matchCompleted': 'Match marked as played!',
    'details.cancelRequest': 'Cancel Request',
    'details.cancelConfirm': 'Do you want to cancel this request?',
    'details.cancelled': 'Cancelled',
    'details.notFound': 'Request not found',
    
    // Menu
    'menu.title': 'Menu',
    'menu.profile': 'Profile',
    'menu.friends': 'Friends',
    'menu.matchHistory': 'Match History',
    'menu.share': 'Share App',
    'menu.language': 'Language',
    'menu.account': 'Account',
    'menu.about': 'About',

    // Match History
    'matchHistory.title': 'Match History',
    'matchHistory.noMatches': 'No matches yet',
    
    // Share
    'share.title': 'Find A Match',
    'share.message': 'Check out Find A Match - an app to find tennis partners and schedule matches! Download it now!',
    'share.error': 'Unable to share the app',
    
    // Settings
    'settings.title': 'Language',
    'settings.languages': 'Languages',
    'settings.selectLanguages': 'Select Languages',
    'settings.appLanguage': 'App Language',
    'settings.language.german': 'German',
    'settings.language.english': 'English',
    'settings.account': 'Account',
    'settings.accountSubtitle': 'Update your email and password',
    'settings.email': 'Email',
    'settings.currentPassword': 'Current Password',
    'settings.newPassword': 'New Password',
    'settings.updateEmail': 'Update Email',
    'settings.emailUpdated': 'Email updated',
    'settings.emailError': 'Unable to update email',
    'settings.passwordRequired': 'Please enter your current password',
    'settings.newPasswordRequired': 'Please enter a new password',
    'settings.updatePassword': 'Update Password',
    'settings.passwordUpdated': 'Password updated',
    'settings.passwordError': 'Unable to update password',
    'settings.resetPassword': 'Send password reset email',
    'settings.resetSent': 'Password reset email sent',
    'settings.resetError': 'Unable to send reset email',
    'settings.deleteAccount': 'Delete account',
    'settings.deleteWarning': 'This will permanently delete your account. This action cannot be undone.',
    'settings.deleteConfirm': 'Delete',
    'settings.deleteError': 'Unable to delete account',
    
    // Friends
    'friends.title': 'Friends',
    'friends.addFriend': 'Add Friend',
    'friends.addByUsername': 'Add Friend by Username',
    'friends.enterUsername': 'Enter username',
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
    'friends.inviteMessage': 'Hey! Join me on Find A Match - an app to find tennis partners! Add me with my username: {username}',
    'friends.success': 'Success',
    'friends.error': 'Error',
    'friends.inviteSent': 'Invite sent successfully!',
    'friends.inviteError': 'Unable to send invite',
    'friends.emptyUsername': 'Please enter a username',
    'friends.requestSent': 'Friend request sent!',
    'friends.requestAccepted': 'Friend request accepted!',
    'friends.requestError': 'Unable to send friend request',
    'friends.filterBySport': 'Filter by sport',
    'friends.allSports': 'All',
    'friends.filterBySport': 'Filter by sport',
    'friends.allSports': 'All',

    // Friend Profile
    'friendProfile.title': 'Friend Profile',
    'friendProfile.sports': 'Sports',
    'friendProfile.friends': 'Friends',
    'friendProfile.matches': 'Matches',
    'friendProfile.noSports': 'No sports selected',
    'friendProfile.noFriends': 'No friends to show',
    'friendProfile.loadError': 'Unable to load profile',
    'friendProfile.notFound': 'Friend not found',
    
    // Profile
    'profile.title': 'Profile',
    'profile.photo': 'Profile Photo',
    'profile.username': 'Username',
    'profile.displayName': 'Name',
    'profile.email': 'Email',
    'profile.save': 'Save',
    'profile.saving': 'Saving...',
    'profile.saved': 'Profile updated',
    'profile.saveError': 'Unable to update profile',
    'profile.changePhoto': 'Change Photo',
    'profile.uploading': 'Uploading...',
    'profile.photoUpdated': 'Profile photo updated',
    'profile.uploadError': 'Unable to upload photo',
    'profile.permissionError': 'Permission to access photos is required',
    'profile.currentPassword': 'Current Password',
    'profile.updateEmail': 'Update Email',
    'profile.emailUpdated': 'Email updated',
    'profile.emailError': 'Unable to update email',
    'profile.passwordRequired': 'Please enter your current password',
    'profile.logout': 'Log out',
    'profile.namePlaceholder': 'Your name',
    'profile.bioPlaceholder': 'Write a short bio',
    'profile.sportsTitle': 'Sports',

    // Auth
    'auth.loginTitle': 'Sign In',
    'auth.signupTitle': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.username': 'Username',
    'auth.login': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.noAccount': "Don't have an account? Sign up",
    'auth.haveAccount': 'Already have an account? Sign in',
    'auth.errorRequired': 'Please fill in all fields',
    'auth.errorPassword': 'Password must be at least 6 characters',
    'auth.errorGeneric': 'Something went wrong',

    // Common
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
  },
  de: {
    // Home Screen
    'app.title': 'Find A Match',
    'app.subtitle': 'Finde dein nächstes Match!',
    'app.pendingRequests': 'Ausstehende Anfragen',
    'app.myRequests': 'Meine Anfragen',
    'app.myPendingRequests': 'Meine ausstehenden Anfragen',
    'app.incomingRequests': 'Anfragen von Freunden',
    'app.confirmedMatches': 'Bestätigte Matches',
    'app.cancelledRequests': 'Stornierte Anfragen',
    'app.noRequests': 'Noch keine Anfragen',
    'app.noRequestsSubtext': 'Tippe auf die + Schaltfläche, um eine zu erstellen!',
    'app.cancelled': 'Storniert',
    'app.acceptedCount': '{count}/{total} akzeptiert',
    'app.accepted': 'Akzeptiert',
    'app.declined': 'Abgelehnt',
    'app.declinedBy': 'Abgelehnt von',
    'app.allDeclined': 'Alle haben abgelehnt',
    'app.actionRequired': 'Aktion erforderlich',
    'app.waitingForFriends': 'Warte auf Freunde',
    'app.incomingResponded': 'Du hast bereits geantwortet',
    'app.creator': 'Ersteller',
    
    // Request Screen
    'request.title': 'Neue Tennis-Anfrage',
    'request.date': 'Datum',
    'request.startTime': 'Startzeit',
    'request.endTime': 'Endzeit',
    'request.selectSport': 'Sportart auswählen',
    'request.selectFriends': 'Freunde auswählen',
    'request.selected': 'ausgewählt',
    'request.noFriends': 'Noch keine Freunde',
    'request.noFriendsSubtext': 'Füge Freunde zu deiner Liste hinzu, um Tennis-Anfragen zu senden',
    'request.noFriendsForSport': 'Keine Freunde mit dieser Sportart',
    'request.send': 'Anfrage senden',
    'request.errorNoFriends': 'Bitte wähle mindestens einen Freund aus',
    'request.errorNoSport': 'Bitte wähle eine Sportart aus',
    'request.errorTime': 'Endzeit muss nach der Startzeit liegen',
    'request.players': 'Spieleranzahl',
    'request.inviteAll': 'Alle einladen',
    'request.inviteSome': 'Freunde auswählen',
    'request.errorPlayers': 'Bitte gültige Spieleranzahl eingeben',
    'request.errorPlayersTooMany': 'Nicht genug Freunde für diese Spieleranzahl',
    'request.durationOptional': 'Dauer (optional, Minuten)',
    'request.durationPlaceholder': 'z. B. 120',
    'request.errorDuration': 'Bitte gültige Dauer eingeben',
    'request.update': 'Anfrage aktualisieren',
    'request.success': 'Erfolg',
    'request.sent': 'Anfrage an {count} Freund(e) gesendet!',
    
    // Request Details
    'details.title': 'Tennis-Anfrage',
    'details.confirmed': '✓ Bestätigt',
    'details.date': 'Datum:',
    'details.timeRange': 'Zeitraum:',
    'details.sport': 'Sport:',
    'details.friendsInvited': 'Eingeladene Freunde:',
    'details.you': '(Du)',
    'details.accepted': '✓ Akzeptiert:',
    'details.acceptTime': 'Zeit akzeptieren',
    'details.startTime': 'Start',
    'details.endTime': 'Ende',
    'details.waiting': 'Warte auf Antwort...',
    'details.proposed': 'Vorschlag:',
    'details.accept': 'Akzeptieren',
    'details.decline': 'Ablehnen',
    'details.declined': 'Abgelehnt',
    'details.durationOutOfRange': 'Ausgewählte Zeit passt nicht zur Dauer',
    'details.duration': 'Dauer:',
    'details.suggestedTimes': 'Zeitvorschläge',
    'details.deleteRequest': 'Anfrage löschen',
    'details.deleteConfirm': 'Möchtest du diese Anfrage löschen?',
    'details.editRequest': 'Anfrage bearbeiten',
    'details.editRequestPrompt': 'Möchtest du diese Anfrage bearbeiten?',
    'details.acceptedBy': 'Akzeptiert von',
    'details.declinedBy': 'Abgelehnt von',
    'details.hasDeclines': 'Nicht bestätigbar, solange jemand abgelehnt hat',
    'details.confirmMatch': 'Match bestätigen',
    'details.errorNoAcceptances': 'Noch kein Freund hat eine Zeit akzeptiert',
    'details.matchConfirmed': 'Match bestätigt!',
    'details.onlyCreatorConfirm': 'Nur der Ersteller kann das Match bestätigen.',
    'details.completed': 'Gespielt',
    'details.completeMatch': 'Als gespielt markieren',
    'details.completeMatchConfirm': 'Dieses Match als gespielt markieren?',
    'details.matchCompleted': 'Match als gespielt markiert!',
    'details.cancelRequest': 'Anfrage stornieren',
    'details.cancelConfirm': 'Möchtest du diese Anfrage stornieren?',
    'details.cancelled': 'Storniert',
    'details.notFound': 'Anfrage nicht gefunden',
    
    // Menu
    'menu.title': 'Menü',
    'menu.profile': 'Profil',
    'menu.friends': 'Freunde',
    'menu.matchHistory': 'Match-Verlauf',
    'menu.share': 'App teilen',
    'menu.language': 'Sprache',
    'menu.account': 'Konto',
    'menu.about': 'Über',

    // Match History
    'matchHistory.title': 'Match-Verlauf',
    'matchHistory.noMatches': 'Noch keine Matches',
    
    // Share
    'share.title': 'Find A Match',
    'share.message': 'Schau dir Find A Match an - eine App, um Tennispartner zu finden und Matches zu planen! Jetzt herunterladen!',
    'share.error': 'App konnte nicht geteilt werden',
    
    // Settings
    'settings.title': 'Sprache',
    'settings.languages': 'Sprachen',
    'settings.selectLanguages': 'Sprachen auswählen',
    'settings.appLanguage': 'App-Sprache',
    'settings.language.german': 'Deutsch',
    'settings.language.english': 'Englisch',
    'settings.account': 'Konto',
    'settings.accountSubtitle': 'E-Mail und Passwort aktualisieren',
    'settings.email': 'E-Mail',
    'settings.currentPassword': 'Aktuelles Passwort',
    'settings.newPassword': 'Neues Passwort',
    'settings.updateEmail': 'E-Mail aktualisieren',
    'settings.emailUpdated': 'E-Mail aktualisiert',
    'settings.emailError': 'E-Mail konnte nicht aktualisiert werden',
    'settings.passwordRequired': 'Bitte aktuelles Passwort eingeben',
    'settings.newPasswordRequired': 'Bitte neues Passwort eingeben',
    'settings.updatePassword': 'Passwort aktualisieren',
    'settings.passwordUpdated': 'Passwort aktualisiert',
    'settings.passwordError': 'Passwort konnte nicht aktualisiert werden',
    'settings.resetPassword': 'Passwort-Reset E-Mail senden',
    'settings.resetSent': 'Passwort-Reset E-Mail gesendet',
    'settings.resetError': 'Reset E-Mail konnte nicht gesendet werden',
    'settings.deleteAccount': 'Konto löschen',
    'settings.deleteWarning': 'Dies löscht dein Konto dauerhaft. Diese Aktion kann nicht rückgängig gemacht werden.',
    'settings.deleteConfirm': 'Löschen',
    'settings.deleteError': 'Konto konnte nicht gelöscht werden',
    
    // Friends
    'friends.title': 'Freunde',
    'friends.addFriend': 'Freund hinzufügen',
    'friends.addByUsername': 'Freund per Benutzername hinzufügen',
    'friends.enterUsername': 'Benutzername eingeben',
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
    'friends.inviteMessage': 'Hey! Tritt mir bei Find A Match bei - einer App, um Tennispartner zu finden! Füge mich mit meinem Benutzernamen hinzu: {username}',
    'friends.success': 'Erfolg',
    'friends.error': 'Fehler',
    'friends.inviteSent': 'Einladung erfolgreich gesendet!',
    'friends.inviteError': 'Einladung konnte nicht gesendet werden',
    'friends.emptyUsername': 'Bitte gib einen Benutzernamen ein',
    'friends.requestSent': 'Freundesanfrage gesendet!',
    'friends.requestAccepted': 'Freundesanfrage akzeptiert!',
    'friends.requestError': 'Freundesanfrage konnte nicht gesendet werden',
    'friends.filterBySport': 'Nach Sportart filtern',
    'friends.allSports': 'Alle',
    'friends.filterBySport': 'Nach Sportart filtern',
    'friends.allSports': 'Alle',

    // Friend Profile
    'friendProfile.title': 'Freundesprofil',
    'friendProfile.sports': 'Sportarten',
    'friendProfile.friends': 'Freunde',
    'friendProfile.matches': 'Matches',
    'friendProfile.noSports': 'Keine Sportarten ausgewählt',
    'friendProfile.noFriends': 'Keine Freunde vorhanden',
    'friendProfile.loadError': 'Profil konnte nicht geladen werden',
    'friendProfile.notFound': 'Freund nicht gefunden',
    
    // Profile
    'profile.title': 'Profil',
    'profile.photo': 'Profilbild',
    'profile.username': 'Benutzername',
    'profile.displayName': 'Name',
    'profile.email': 'E-Mail',
    'profile.save': 'Speichern',
    'profile.saving': 'Speichern...',
    'profile.saved': 'Profil aktualisiert',
    'profile.saveError': 'Profil konnte nicht aktualisiert werden',
    'profile.changePhoto': 'Foto ändern',
    'profile.uploading': 'Hochladen...',
    'profile.photoUpdated': 'Profilbild aktualisiert',
    'profile.uploadError': 'Profilbild konnte nicht hochgeladen werden',
    'profile.permissionError': 'Zugriff auf Fotos erforderlich',
    'profile.currentPassword': 'Aktuelles Passwort',
    'profile.updateEmail': 'E-Mail aktualisieren',
    'profile.emailUpdated': 'E-Mail aktualisiert',
    'profile.emailError': 'E-Mail konnte nicht aktualisiert werden',
    'profile.passwordRequired': 'Bitte aktuelles Passwort eingeben',
    'profile.logout': 'Abmelden',
    'profile.namePlaceholder': 'Dein Name',
    'profile.bioPlaceholder': 'Kurze Bio schreiben',
    'profile.sportsTitle': 'Sportarten',

    // Auth
    'auth.loginTitle': 'Anmelden',
    'auth.signupTitle': 'Konto erstellen',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.username': 'Benutzername',
    'auth.login': 'Anmelden',
    'auth.signup': 'Registrieren',
    'auth.noAccount': 'Noch kein Konto? Registrieren',
    'auth.haveAccount': 'Schon ein Konto? Anmelden',
    'auth.errorRequired': 'Bitte alle Felder ausfüllen',
    'auth.errorPassword': 'Passwort muss mindestens 6 Zeichen haben',
    'auth.errorGeneric': 'Etwas ist schiefgelaufen',

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
