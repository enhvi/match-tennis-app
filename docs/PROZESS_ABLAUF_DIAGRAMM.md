# Prozessablauf – Visuelle Darstellung (v0.3.3)

Aktualisiert auf Basis des derzeitigen Codes nach Server-Umstellung (April 2026).

---

## 1. Gesamtfluss (End-to-End)

```
┌──────────────────────────────────────────────────────────────┐
│ Creator erstellt Anfrage                                    │
│ (Datum, Start/Ende, Sport, Spielerzahl, Freunde, optional) │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ status: pending  │
                  └────────┬─────────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     │                     │                     │
     ▼                     ▼                     ▼
┌──────────────┐   ┌────────────────────────┐   ┌──────────────────┐
│ invited user │   │ invited user            │   │ Zeitfenster/Start│
│ decline      │   │ accept (mit Zeit/Slot)  │   │ vorbei, zu wenig │
└──────┬───────┘   └────────────┬───────────┘   │ Zusagen          │
       │                        │               └─────────┬────────┘
       ▼                        ▼                         ▼
responses[user]=       if enough accepts:          expired (CF)
declined/withdrawn     readyForConfirmation=true
                                │
                                ▼
                       Creator wählt finale Zeit
                                │
                                ▼
                            confirmed
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
          cancelled         withdraw         completed (CF/Creator)
          (Creator)      (Teilnehmer)
```

---

## 2. Entscheidungslogik "Match voll"

```
requiredAcceptances = max(playersNeeded - 1, 1)

Wenn:
  acceptedCount >= requiredAcceptances
  UND declinedCount === 0
Dann:
  readyForConfirmation = true
  (Creator muss final bestätigen)

Folge:
  - Creator sieht Finalisierungs-UI
  - Weitere Zusagen werden serverseitig mit MATCH_FULL abgewiesen
  - Nach Creator-Bestätigung: status = confirmed + finale Zeit
```

Hinweis: Bei `playersNeeded = 2` reicht genau eine Zusage.  
Damit ist die Anfrage danach für alle anderen effektiv geschlossen.

---

## 3. Perspektive Creator

```
Anfrage erstellen
   │
   ▼
pending ("Meine Anfragen")
   │
   ├─ wartet auf Antworten
   ├─ wenn genug Zusagen: readyForConfirmation
   │        └─ Creator bestätigt finalen Slot
   ├─ storniert selbst -> cancelled (mit Grund)
   ├─ läuft ab -> expired
   └─ wird confirmed -> "Bestätigte Matches"
                         │
                         ├─ als gespielt markieren -> completed
                         └─ absagen -> cancelled / late-cancel Benachrichtigung
```

---

## 4. Perspektive Eingeladene

```
Benachrichtigung "matchRequest"
   │
   ▼
"Anfragen von Freunden"
   │
   ├─ ablehnen -> responses[user].status = declined
   ├─ annehmen (Zeit/Slot) -> responses[user].status = accepted
   └─ nichts tun -> bleibt pending bis confirmed/expired/cancelled

Bei confirmed:
   - bestätigte Teilnehmer sehen Match
   - nicht benötigte/übrige Teilnehmer können nicht mehr zusagen
```

---

## 5. Statusübergänge

```
pending
  ├─ enough accepts ---------------------> pending + readyForConfirmation
  │                                         └-> creator confirm -> confirmed
  ├─ creator cancel ---------------------> cancelled
  ├─ auto-expire (Scheduler) ------------> expired
  └─ decline/withdraw einzelner Nutzer --> pending (bleibt)

confirmed
  ├─ creator complete -------------------> completed
  ├─ creator cancel ---------------------> cancelled
  └─ participant withdraw ---------------> pending (wenn nicht mehr genug Zusagen)
```

---

## 6. Benachrichtigungen im Ablauf

```
sendRequest                      -> matchRequest
declineResponse                  -> matchDeclined
withdrawFromMatch                -> matchWithdrawn
creator confirmMatch(final time) -> matchConfirmed
auto-expire                      -> matchExpired
cancelRequest                    -> matchCancelled / matchLateCancel
```

---

## 7. Wichtige aktuelle Regeln

- Keine "wöchentlich wiederholen"-Option im Anfrageformular.
- Beim Ändern der Startzeit wird Endzeit im Formular auf mindestens Startzeit gehoben.
- Kalenderlink (Google) nur für bestätigte Matches.
- Reminder: lokal ca. 1 Stunde vor confirmed Match (wenn Präferenz aktiv).
- Chat-Badge-Ungelesen basiert serverseitig auf `readBy`.
