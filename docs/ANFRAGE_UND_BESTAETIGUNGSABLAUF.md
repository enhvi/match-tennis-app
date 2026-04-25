# Anfrage- und Bestätigungsablauf (v0.3.3)

Dieses Dokument beschreibt den aktuellen Ablauf nach Umstellung auf serverseitige Match-Notifications und Creator-Finalisierung der Zeit.

---

## 1. Statusübersicht

| Status | Bedeutung |
|-------|-----------|
| **pending** | Anfrage offen, Antworten laufen |
| **pending + readyForConfirmation=true** | Genug Zusagen vorhanden, Creator muss finale Zeit bestätigen |
| **confirmed** | Creator hat finale Zeit bestätigt (`finalStartTime`/`finalEndTime`) |
| **completed** | Match wurde gespielt/automatisch abgeschlossen |
| **expired** | Anfrage lief serverseitig ab |
| **cancelled** | Anfrage wurde storniert |

---

## 2. Erstellung (Creator)

```
Creator erstellt Anfrage
-> sendRequest()
-> status = pending
-> Cloud Function erzeugt matchRequest für Eingeladene
```

Gespeicherte Kerndaten: Datum, Start/Ende, Sport, Spieleranzahl, Freundeliste, optionale Felder.

---

## 3. Antworten (Eingeladene)

### 3.1 Ablehnen

```
declineResponse()
-> responses[user].status = declined
-> Cloud Function erzeugt matchDeclined an Creator
```

### 3.2 Zusage zurückziehen

```
withdrawFromMatch()
-> responses[user].status = withdrawn
-> wenn nicht mehr genug Zusagen: status bleibt/ wird pending
-> Cloud Function erzeugt matchWithdrawn an Creator
```

### 3.3 Akzeptieren

```
acceptTimeProposal(...) oder acceptResponse(...)
-> responses[user].status = accepted (+ acceptedStart/acceptedEnd)
-> wenn acceptedCount >= requiredAcceptances:
     readyForConfirmation = true
-> noch KEIN confirmed
```

`requiredAcceptances = max(playersNeeded - 1, 1)`.

---

## 4. Explizite Finalisierung durch Creator

```
Creator wählt einen akzeptierten Zeitvorschlag
-> confirmMatch(requestId, finalStartTime, finalEndTime)
-> status = confirmed
-> finalStartTime/finalEndTime gesetzt
-> readyForConfirmation = false
-> Cloud Function erzeugt matchConfirmed
```

Erst ab diesem Schritt gilt das Match als final bestätigt.

---

## 5. Serverseitige Automatik

### 5.1 Expire

```
scheduledMatchMaintenance (Cloud Function)
-> pending + Frist überschritten + zu wenig Zusagen
-> status = expired
-> Cloud Function erzeugt matchExpired an Creator
```

### 5.2 Complete

```
scheduledMatchMaintenance (Cloud Function)
-> confirmed + Endzeit überschritten
-> status = completed
```

Hinweis: Endzeit basiert auf `finalEndTime` bzw. abgeleitet von `finalStartTime + duration`.

---

## 6. Stornierung

```
cancelRequest(reason)
-> status = cancelled
-> cancelReason/cancelledBy gesetzt
-> Cloud Function erzeugt matchCancelled oder matchLateCancel
```

---

## 7. Anzeigen in der App

| Bereich | Sicht |
|--------|-------|
| **Meine Anfragen** | Creator sieht `pending` (inkl. ggf. `readyForConfirmation`) |
| **Anfragen von Freunden** | Eingeladene sehen offene `pending`, außer declined/withdrawn/voll |
| **Bestätigte Matches** | Nur `confirmed` (mit finaler Zeit) für Creator und akzeptierte Teilnehmer |

---

## 8. Messaging-Read-Status

Ungelesen-Badge basiert auf serverseitigem `conversations.readBy.<uid>` statt lokalem Speicher und ist dadurch geräteübergreifend konsistent.
