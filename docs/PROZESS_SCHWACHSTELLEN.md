# Schwachstellen im Anfrage- und Bestätigungsprozess

Analyse der aktuellen Schwachstellen aus technischer und prozesstechnischer Sicht.

---

## 1. Sicherheit

### 1.1 Firestore-Regeln (kritisch)

**Problem:** Die Firestore-Regeln sind maximal permissiv (`allow read, write: if true`). Jeder authentifizierte Nutzer kann alle Daten lesen und schreiben.

**Risiko:** Datenmanipulation, unbefugter Zugriff auf fremde Anfragen, Löschung von Daten.

**Empfehlung:** Vor Produktion sichere Regeln implementieren, z.B.:
- `matchRequests`: Lesen nur für Creator oder eingeladene Freunde
- Schreiben nur für Creator (bei eigenen Anfragen) oder eingeladene Freunde (bei eigenen Responses)
- `notifications`: Nur eigener Nutzer-Pfad lesbar/schreibbar

### 1.2 Keine Berechtigungsprüfung bei Aktionen

**Problem:** `cancelRequest`, `completeMatch`, `deleteRequest` prüfen nicht, ob der Aufrufer berechtigt ist.

- **cancelRequest:** Jeder könnte theoretisch jede Anfrage stornieren (UI zeigt es nur dem Creator, aber API prüft nicht)
- **completeMatch:** Jeder könnte ein Match als gespielt markieren
- **deleteRequest:** Keine Prüfung auf Creator-Rolle

**Empfehlung:** Server-seitige Prüfung (Firestore Rules oder Cloud Functions) oder zumindest Client-Check vor dem Aufruf.

---

## 2. Client-seitige Logik statt Server

### 2.1 Ablaufen (expired) und Auto-Complete

**Problem:** Beide laufen nur im Client (useEffect), wenn die App geöffnet ist.

- **Expire:** Wenn der Creator die App tagelang nicht öffnet, laufen Anfragen nicht ab
- **Complete:** Bestätigte Matches werden erst bei App-Öffnung automatisch auf "gespielt" gesetzt

**Folge:** Inkonsistenter Zustand, veraltete Anzeige für andere Nutzer.

**Empfehlung:** Cloud Functions mit geplanten Triggern (z.B. täglich) oder Firestore-Trigger bei Änderungen, die expire/complete serverseitig ausführen.

### 2.2 Benachrichtigungen

**Problem:** Benachrichtigungen werden client-seitig erstellt. Wenn der Nutzer offline ist oder die App geschlossen hat, können Benachrichtigungen fehlen oder verzögert sein.

**Empfehlung:** Cloud Functions, die bei Firestore-Änderungen (onCreate, onUpdate) Benachrichtigungen schreiben und ggf. Push versenden.

---

## 3. Prozess und UX

### 3.1 Mehrere Akzeptanzen mit unterschiedlichen Zeiten

**Problem:** Bei 2+ Akzeptanzen wird die Zeit von `accepted[0]` genommen. Wenn zwei Personen unterschiedliche Zeiten wählen (z.B. 10:00 vs. 14:00), wird nur die erste angezeigt. Die anderen Teilnehmer sehen ggf. eine andere Zeit als die, die sie gewählt haben.

**Empfehlung:** Entweder eine gemeinsame Zeit erzwingen (z.B. Creator bestätigt Zeit) oder klar anzeigen, welche Zeit gewählt wurde und von wem.

### 3.2 Keine Erinnerung vor dem Match

**Problem:** Es gibt keine Erinnerung (z.B. 1 Tag oder 1 Stunde vorher) an ein bestätigtes Match. Nutzer könnten Termine vergessen.

**Empfehlung:** Push-Benachrichtigungen oder lokale Erinnerungen vor dem Termin.

### 3.3 "Alle haben abgelehnt" – keine einfache Neu-Einladung

**Problem:** Wenn alle abgelehnt haben, muss der Creator die Anfrage stornieren und neu erstellen. Es gibt keinen "Erneut einladen"-Flow mit denselben Parametern.

**Empfehlung:** Option "Erneut einladen" mit vorausgefüllten Daten (Datum, Sport, Freunde etc.).

### 3.4 acceptResponse ungenutzt

**Problem:** `acceptResponse` existiert im Backend (Akzeptanz ohne Zeitvorschlag), wird aber in der UI nicht verwendet. Alle Akzeptanzen laufen über `acceptTimeProposal`. Bei Anfragen ohne Dauer könnte ein einfaches "Zusagen" ohne Zeitwahl sinnvoll sein.

**Empfehlung:** Entweder nutzen (z.B. bei festem Zeitfenster) oder entfernen.

---

## 4. Datenkonsistenz

### 4.1 Notifications vs. Präferenzen

**Problem:** Die meisten Benachrichtigungstypen prüfen die Nutzerpräferenzen nicht vor dem Senden. Nur `matchExpired` und `matchWithdrawn` berücksichtigen `notificationPrefs`. matchDeclined, matchCancelled, matchConfirmed etc. werden immer erstellt.

**Empfehlung:** Vor jedem `addNotification` die entsprechende Präferenz prüfen.

### 4.2 Race Conditions bei gleichzeitiger Akzeptanz

**Problem:** Zwei Nutzer akzeptieren fast gleichzeitig bei einem 2-Personen-Match. Durch die Transaktion sollte nur einer durchkommen (MATCH_FULL für den zweiten). Die Fehlermeldung "Match voll" könnte für den zweiten Nutzer verwirrend sein, wenn er nicht weiß, dass der andere gerade akzeptiert hat.

**Empfehlung:** Klarere Fehlermeldung, z.B. "Ein anderer hat gerade zugesagt – das Match ist jetzt voll."

---

## 5. Fehlende Funktionen

| Funktion | Beschreibung |
|----------|--------------|
| **Nachrichtenaustausch** | Messages-Tab ist Placeholder; keine Kommunikation zu konkreten Matches |
| **Kalender-Export** | Kein Export bestätigter Matches in Kalender-Apps |
| **Wiederholende Anfragen** | Keine Option für wöchentliche/regelmäßige Termine |
| **Spät-Absagen** | Keine explizite Behandlung von Absagen kurz vor dem Termin (z.B. extra Benachrichtigung) |
| **Feedback nach Match** | Kein "Hat stattgefunden?" oder Rating nach dem Match |

---

## 6. Priorisierung

| Priorität | Schwachstelle | Aufwand |
|-----------|---------------|---------|
| **Hoch** | Firestore-Regeln absichern | Mittel |
| **Hoch** | Expire/Complete serverseitig | Mittel (Cloud Functions) |
| **Mittel** | Berechtigungsprüfung bei cancel/complete/delete | Gering |
| **Mittel** | Notification-Präferenzen überall prüfen | Gering |
| **Mittel** | Erinnerung vor Match | Mittel |
| **Niedrig** | acceptResponse nutzen oder entfernen | Gering |
| **Niedrig** | Erneut einladen bei "alle abgelehnt" | Mittel |
