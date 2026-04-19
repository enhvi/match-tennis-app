# Anfrage- und Bestätigungsablauf

Dieses Dokument beschreibt den prozesstechnischen Ablauf von Match-Anfragen von der Erstellung bis zur Bestätigung, Ablehnung oder Stornierung.

---

## 1. Übersicht der Status

| Status | Bedeutung |
|-------|-----------|
| **pending** | Anfrage offen, wartet auf Antworten |
| **confirmed** | Match bestätigt (genug Akzeptanzen) |
| **completed** | Match wurde gespielt |
| **expired** | Zeitfenster abgelaufen, zu wenig Akzeptanzen |
| **cancelled** | Von Creator oder Teilnehmer abgesagt |

---

## 2. Erstellung einer Anfrage (Creator)

```
Creator wählt:
├── Datum
├── Zeitfenster (Start–Ende) oder feste Dauer
├── Sport
├── Optional: Ort, Kommentar
├── Anzahl Spieler (z.B. 2 = 1v1)
└── Freunde (alle mit Sport oder ausgewählte)

→ sendRequest()
→ Status: pending
→ Benachrichtigung "Match-Anfrage" an alle eingeladenen Freunde
```

**Ergebnis:** Request in Firestore mit `status: pending`, `responses: {}`  
**Anzeige:** Creator sieht in „Meine Anfragen“, Eingeladene in „Anfragen von Freunden“

---

## 3. Hauptablauf: Antworten auf eine Anfrage

### 3.1 Eingeladener sieht die Anfrage

- **Wo:** Tab „Anfragen von Freunden“ (incoming)
- **Filter:** Nicht angezeigt, wenn:
  - bereits abgelehnt (`declined`)
  - bereits zurückgezogen (`withdrawn`)
  - Match bereits voll (`isMatchFull`)
  - Anfrage abgelaufen (`expired`)

### 3.2 Eingeladener kann: **Ablehnen** (ohne vorher zu akzeptieren)

```
Eingeladener → "Ablehnen" → Bestätigungsdialog
→ declineResponse()
→ responses[friendId].status = 'declined'
→ Benachrichtigung "Match abgelehnt" an Creator
→ Anfrage verschwindet für Eingeladenen aus "Anfragen von Freunden"
```

**Anzeige:** Creator sieht in „Meine Anfragen“ weiterhin die Anfrage (mit „abgelehnt“ bei der Person)

### 3.3 Eingeladener kann: **Ablehnen** (nach vorheriger Akzeptanz)

```
Eingeladener hatte akzeptiert → "Zusage zurückziehen"
→ withdrawFromMatch()
→ responses[friendId].status = 'withdrawn'
→ Wenn genug Akzeptanzen übrig: Status bleibt confirmed
→ Wenn zu wenig: Status = pending
→ Benachrichtigung "Teilnehmer hat abgesagt" an Creator
→ Anfrage verschwindet für Eingeladenen aus "Anfragen von Freunden"
```

**Anzeige:** Creator sieht in „Meine Anfragen“ die Anfrage wieder (falls pending)

### 3.4 Eingeladener kann: **Akzeptieren**

```
Eingeladener wählt Startzeit (optional Endzeit bei Dauer)
→ acceptTimeProposal(requestId, friendId, acceptedStart, acceptedEnd)
→ responses[friendId] = { status: 'accepted', acceptedStart, acceptedEnd, ... }
→ Prüfung: Genug Akzeptanzen? (acceptedCount >= requiredAcceptances)
   → Ja: status = 'confirmed'
   → Benachrichtigung "Match bestätigt" an Creator + alle Akzeptierten
   → Nein: bleibt pending
```

**Logik:** `requiredAcceptances = max(playersNeeded - 1, 1)`  
→ Bei 2 Spielern: 1 Akzeptanz reicht  
→ Bei 3 Spielern: 2 Akzeptanzen nötig

---

## 4. Bestätigung (confirmed)

- **Bedingung:** `acceptedCount >= requiredAcceptances` **und** `declinedCount === 0`
- **Benachrichtigungen:** Creator, alle Akzeptierten
- **Anzeige:** Tab „Bestätigte Matches“  
- **Teilnehmerliste:** Nur Creator + Akzeptierte (keine weiteren Eingeladenen)

---

## 5. Ablauf: Ablaufen (expired)

```
Automatisch (wenn Zeitfenster vorbei):
→ startDateTime < jetzt
→ acceptedCount < requiredAcceptances
→ expireRequest()
→ status = 'expired'
→ Benachrichtigung "Anfrage abgelaufen" an Creator
```

---

## 6. Ablauf: Stornierung (cancelled)

### 6.1 Creator storniert

```
Creator → "Anfrage stornieren" → Pflicht: Begründung
→ cancelRequest(requestId, reason)
→ status = 'cancelled'
→ cancelReason, cancelledBy
→ Benachrichtigung "Match abgesagt" an alle Akzeptierten

Anzeige: Nur Creator + Akzeptierte in Teilnehmerliste
Begründung + "Storniert" nur bei der Person, die abgesagt hat (cancelledBy)
```

### 6.2 Teilnehmer storniert (zurückziehen)

- Siehe Abschnitt 3.3 (withdrawFromMatch)

---

## 7. Ablauf-Diagramm (vereinfacht)

```
                    [Creator erstellt Anfrage]
                              │
                              ▼
                    ┌─────────────────┐
                    │   status:       │
                    │   pending       │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   [Eingeladener        [Eingeladener        [Zeit abgelaufen
    lehnt ab]           akzeptiert]         + zu wenig]
        │                    │                    │
        ▼                    ▼                    ▼
   declined            acceptedCount         expired
   (bleibt pending)    >= required?
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
              confirmed             pending
              (Match bestätigt)      (wartet weiter)
                    │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
   [Creator    [Teilnehmer  [Match wird
    storniert]  zieht zurück] gespielt]
        │          │          │
        ▼          ▼          ▼
   cancelled   pending oder  completed
               confirmed
```

---

## 8. Zusammenfassung der Aktionen

| Rolle | Aktion | Ergebnis |
|-------|--------|----------|
| Creator | Anfrage erstellen | pending, Benachrichtigung an Eingeladene |
| Creator | Ablaufen lassen | expired (automatisch) |
| Creator | Stornieren | cancelled | 
| Eingeladener | Ablehnen | declined, Benachrichtigung an Creator |
| Eingeladener | Akzeptieren | accepted, ggf. confirmed |
| Eingeladener | Zusage zurückziehen | withdrawn, ggf. pending, Benachrichtigung an Creator |
| Creator | Als gespielt markieren | completed |

---

## 9. Anzeige-Regeln (UI)

| Tab | Sicht für |
|-----|-----------|
| Meine Anfragen | Creator, pending, nicht expired |
| Anfragen von Freunden | Eingeladener, pending, nicht declined/withdrawn, nicht voll |
| Bestätigte Matches | Creator + Akzeptierte, confirmed |
