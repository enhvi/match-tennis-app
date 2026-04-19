# Firebase Firestore – Permission Error beheben

Der Fehler **"Missing or insufficient permissions"** kommt von den Firestore-Sicherheitsregeln oder App Check. Diese müssen in der Firebase Console angepasst werden.

## Schritt-für-Schritt Checkliste

### 1. Firestore-Datenbank existiert?
- Öffne: https://console.firebase.google.com/project/match-tennis-app-c65eb/firestore  
- Siehst du eine Datenbank? **Wenn nein:** auf „Datenbank erstellen“ klicken → **Native-Modus** wählen (nicht Datastore-Modus).

### 2. Firestore-Regeln setzen
- Öffne: https://console.firebase.google.com/project/match-tennis-app-c65eb/firestore/rules  
- Oben: Datenbank **(default)** auswählen  
- Gesamten Inhalt ersetzen durch:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
- Auf **„Veröffentlichen“** klicken

### 3. App Check prüfen (häufige Ursache!)
- Öffne: https://console.firebase.google.com/project/match-tennis-app-c65eb/appcheck  
- Wenn Firestore dort **„Erzwingen“** aktiv ist → für Tests deaktivieren oder Debug-Token einrichten

### 4. Verbindung in der App testen
- Auf dem **Login-Screen** unten auf „Firestore-Verbindung testen“ tippen  
- Wenn „Firestore OK“ erscheint: Regeln und Verbindung sind in Ordnung  
- Wenn ein Fehler erscheint: die angezeigte Checkliste durchgehen

---

## Über Firebase CLI deployen (optional)

```bash
npx firebase-tools login
npm run deploy:rules
```

---

## Wichtige Hinweise

- Ohne gültige Regeln blockiert Firestore alle Zugriffe  
- App Check mit Erzwingung blockiert Anfragen ohne gültigen Token (z.B. Expo Go)  
- Regeln können 1–2 Minuten zum Übernehmen brauchen
