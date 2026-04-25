# Schwachstellen im Anfrage- und Bestätigungsprozess

Aktualisierte Bewertung nach Umsetzung und Deploy der neuen Server-Logik (April 2026).

---

## 1. Umgesetzte Kernpunkte (abgeschlossen)

| Thema | Ergebnis |
|-------|----------|
| **Notifications serverseitig** | Match-bezogene Notifications laufen über Cloud Function `onMatchRequestWrite`. |
| **Server Ownership für Status** | `expired/completed` werden serverseitig gepflegt (`scheduledMatchMaintenance`), keine doppelte Client-Automatik mehr. |
| **Finale Zeit durch Creator** | Bei ausreichenden Zusagen wird erst `readyForConfirmation` gesetzt; Creator bestätigt anschließend explizit `finalStartTime/finalEndTime`. |
| **Read-Status serverseitig** | Chat-Read-Status über `conversations.readBy.<uid>` statt lokalem Storage; Badge geräteübergreifend konsistent. |
| **Firestore Rules / Rollenchecks** | Regeln und zentrale Client-Checks weiterhin aktiv. |
| **Weitere Features** | Kalender-Link, Late-Cancel-Typ, Feedback-Rating, Messages-Tab, Entfernung `repeatWeekly` aus Anfrage-UI. |

---

## 2. Verbleibende Schwachstellen

### 2.1 Reminder weiterhin lokal pro Gerät

**Status:** Offen (bewusst).  
**Problem:** Match-Reminder (`expo-notifications`) sind lokal geplant, nicht zentral synchronisiert.  
**Risiko:** Bei Gerätewechsel/Neuinstallation fehlen Reminder.  
**Empfehlung:** Optionale serverseitige Push-Pipeline ergänzen (FCM/APNs).

### 2.2 Firestore Rules noch breit bei Notification-Create

**Status:** Mittel.  
**Problem:** `users/{userId}/notifications` erlaubt weiterhin Create ohne harte Sender-Einschränkung.  
**Risiko:** Missbrauch durch legitime Clients ist nicht vollständig ausgeschlossen.  
**Empfehlung:** Writes für Notifications mittelfristig auf trusted backend (Functions/Admin SDK) begrenzen oder Sender-Felder strikt validieren.

### 2.3 Fehlende harte Slot-Validierung bei Finalisierung

**Status:** Mittel.  
**Problem:** Finale Zeit wird vom Creator gewählt; derzeit keine zusätzliche serverseitige Validierung, dass sie exakt einem akzeptierten Vorschlag entspricht.  
**Risiko:** Inkonsistenz zwischen ausgewählter und bestätigter Zeit in Grenzfällen/manipulierten Requests.  
**Empfehlung:** In der Confirm-Transaktion prüfen, dass `finalStartTime/finalEndTime` aus vorhandenen `accepted`-Einträgen stammen.

### 2.4 UX-Hinweise für Zeitlogik (Mitternacht)

**Status:** Niedrig.  
**Problem:** Endzeit <= Startzeit bedeutet Folgetag, ist nicht überall explizit kommuniziert.  
**Risiko:** Verwirrung bei Zeitfenstern über Mitternacht.  
**Empfehlung:** Klarer UI-Hinweis im Formular und in Detailansicht.

---

## 3. Priorisierung (neu)

| Priorität | Thema | Aufwand |
|-----------|------|---------|
| **Mittel** | Notification-Create-Regeln weiter verhärten | Mittel |
| **Mittel** | Serverseitige Slot-Validierung bei `confirmMatch` | Gering-Mittel |
| **Niedrig** | Reminder als echte Push-Pipeline | Mittel-Hoch |
| **Niedrig** | UX-Texte für Overnight-Fälle | Gering |

---

## 4. Kurzfazit

Die zuvor wichtigsten Architekturpunkte sind jetzt umgesetzt und deployed: serverseitige Match-Notifications, klare Server-Zuständigkeit für Statuswechsel, explizite Finalzeit-Bestätigung durch den Creator und serverseitiger Chat-Read-Status.  
Offen sind vor allem Härtungen und Komfortthemen, nicht mehr der Kernprozess.
