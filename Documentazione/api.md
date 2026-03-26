# API Reference — CareerMode

API REST per CareerMode. Base URL: `http://localhost:8000/api`

Tutte le route contrassegnate con `[auth]` richiedono il Bearer Token ottenuto al login.

**Header richiesto per route autenticate:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## Autenticazione

### POST /auth/register
Registrazione di un nuovo utente.

**Body:**
```json
{
  "name": "Dome",
  "email": "dome@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

**Risposta 201:**
```json
{
  "user": { "id": "uuid", "name": "Dome", "email": "dome@example.com" },
  "token": "1|abc123..."
}
```

---

### POST /auth/login
Login utente esistente.

**Body:**
```json
{
  "email": "dome@example.com",
  "password": "password"
}
```

**Risposta 200:**
```json
{
  "user": { "id": "uuid", "name": "Dome", "email": "dome@example.com", "theme": "midnight" },
  "token": "1|abc123..."
}
```

---

### POST /auth/logout `[auth]`
Revoca il token corrente.

**Risposta 200:**
```json
{ "message": "Logged out successfully" }
```

---

### GET /auth/me `[auth]`
Restituisce i dati dell'utente autenticato.

**Risposta 200:**
```json
{
  "id": "uuid",
  "name": "Dome",
  "email": "dome@example.com",
  "theme": "midnight",
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

## Candidature

### GET /applications `[auth]`
Lista candidature dell'utente autenticato con filtri e paginazione.

**Query parameters:**

| Parametro | Tipo | Descrizione |
|---|---|---|
| search | string | Ricerca su azienda, ruolo, note |
| status | string | sent, interview, waiting, rejected, draft |
| source | string | LinkedIn, Indeed, ecc. |
| contract_type | string | Tipo contratto |
| tag | string | Nome tag |
| sort | string | applied_at, company, status, interest_rating |
| order | string | asc, desc (default: desc) |
| per_page | int | Risultati per pagina (default: 15) |
| page | int | Numero pagina |

**Risposta 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "company": "Reply S.p.A.",
      "role": "ServiceNow Developer Jr.",
      "status": "interview",
      "applied_at": "2026-03-18",
      "interest_rating": 4,
      "match_score": 80,
      "source": "LinkedIn",
      "location": "Milano",
      "tags": [{ "id": "uuid", "name": "ServiceNow", "color": "#4a9eff" }]
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 24,
    "per_page": 15,
    "last_page": 2
  }
}
```

---

### POST /applications `[auth]`
Crea una nuova candidatura.

**Body:**
```json
{
  "company": "Reply S.p.A.",
  "role": "ServiceNow Developer Jr.",
  "offer_text": "Testo completo dell'offerta...",
  "url": "https://linkedin.com/jobs/...",
  "source": "LinkedIn",
  "contract_type": "Tempo indeterminato",
  "location": "Milano",
  "salary_range": "25.000 - 30.000",
  "status": "sent",
  "interest_rating": 4,
  "match_score": 80,
  "notes": "Azienda interessante, contattare HR",
  "applied_at": "2026-03-18",
  "tags": ["uuid-tag-1", "uuid-tag-2"]
}
```

**Risposta 201:** Application resource completa.

---

### GET /applications/{id} `[auth]`
Dettaglio di una singola candidatura.

**Risposta 200:** Application resource completa con allegati e reminder.

---

### PUT /applications/{id} `[auth]`
Aggiorna una candidatura esistente. Accetta gli stessi campi del POST.

**Risposta 200:** Application resource aggiornata.

---

### DELETE /applications/{id} `[auth]`
Elimina una candidatura e tutti i dati associati (allegati, reminder).

**Risposta 204:** No content.

---

### PATCH /applications/{id}/status `[auth]`
Aggiorna solo lo stato di una candidatura.

**Body:**
```json
{ "status": "interview" }
```

**Risposta 200:** Application resource aggiornata.

---

### GET /applications/stats `[auth]`
Restituisce statistiche aggregate per i grafici della dashboard.

**Risposta 200:**
```json
{
  "totals": {
    "all": 24,
    "sent": 5,
    "interview": 5,
    "waiting": 7,
    "rejected": 12,
    "draft": 2
  },
  "by_month": [
    { "month": "2026-01", "count": 8 },
    { "month": "2026-02", "count": 10 },
    { "month": "2026-03", "count": 6 }
  ],
  "by_source": [
    { "source": "LinkedIn", "count": 14 },
    { "source": "Indeed", "count": 6 },
    { "source": "Sito aziendale", "count": 4 }
  ],
  "response_rate": 20.8
}
```

---

## Allegati

### POST /applications/{id}/attachments `[auth]`
Upload di un file allegato (CV o cover letter). Richiede `multipart/form-data`.

**Body (form-data):**

| Campo | Tipo | Descrizione |
|---|---|---|
| file | file | PDF o DOCX, max 5MB |
| type | string | cv oppure cover_letter |

**Risposta 201:**
```json
{
  "id": "uuid",
  "type": "cv",
  "filename": "CV_Dome_2026.pdf",
  "size": 102400,
  "created_at": "2026-03-23T10:00:00Z"
}
```

---

### GET /attachments/{id}/download `[auth]`
Download di un file allegato. Restituisce il file binario.

---

### DELETE /attachments/{id} `[auth]`
Elimina un allegato (file e record).

**Risposta 204:** No content.

---

## Reminder

### GET /reminders `[auth]`
Lista di tutti i reminder dell'utente, ordinati per `remind_at` crescente.

**Query parameters:**

| Parametro | Tipo | Descrizione |
|---|---|---|
| upcoming | boolean | Solo reminder futuri non ancora inviati |

**Risposta 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "application_id": "uuid",
      "title": "Colloquio Reply S.p.A.",
      "notes": null,
      "remind_at": "2026-03-23T15:00:00Z",
      "sent": false,
      "application": { "company": "Reply S.p.A.", "role": "ServiceNow Developer Jr." }
    }
  ]
}
```

---

### POST /applications/{id}/reminders `[auth]`
Crea un reminder per una candidatura.

**Body:**
```json
{
  "title": "Colloquio Reply S.p.A.",
  "notes": "Preparare domande sul team",
  "remind_at": "2026-03-23T15:00:00Z"
}
```

**Risposta 201:** Reminder resource.

---

### PUT /reminders/{id} `[auth]`
Aggiorna un reminder esistente.

**Risposta 200:** Reminder resource aggiornata.

---

### DELETE /reminders/{id} `[auth]`
Elimina un reminder.

**Risposta 204:** No content.

---

## Tag

### GET /tags `[auth]`
Lista tag dell'utente autenticato.

**Risposta 200:**
```json
{
  "data": [
    { "id": "uuid", "name": "ServiceNow", "color": "#4a9eff", "applications_count": 5 },
    { "id": "uuid", "name": "Laravel", "color": "#4a9eff", "applications_count": 3 }
  ]
}
```

---

### POST /tags `[auth]`
Crea un nuovo tag.

**Body:**
```json
{ "name": "ServiceNow", "color": "#4a9eff" }
```

**Risposta 201:** Tag resource.

---

### DELETE /tags/{id} `[auth]`
Elimina un tag e lo dissocia da tutte le candidature.

**Risposta 204:** No content.

---

## Utente

### PUT /user/theme `[auth]`
Salva la preferenza tema dell'utente.

**Body:**
```json
{ "theme": "forest" }
```

**Valori accettati:** midnight, forest, ember, steel, crimson, violet

**Risposta 200:**
```json
{ "theme": "forest" }
```

---

### PUT /user/password `[auth]`
Cambia la password dell'utente.

**Body:**
```json
{
  "current_password": "vecchiapassword",
  "password": "nuovapassword",
  "password_confirmation": "nuovapassword"
}
```

**Risposta 200:**
```json
{ "message": "Password updated successfully" }
```

---

### DELETE /user `[auth]`
Elimina l'account e tutti i dati associati (candidature, allegati, tag, reminder).

**Risposta 204:** No content.

---

## Errori

| Codice | Significato |
|---|---|
| 400 | Bad Request — parametri mancanti o non validi |
| 401 | Unauthorized — token mancante o scaduto |
| 403 | Forbidden — risorsa non appartenente all'utente |
| 404 | Not Found — risorsa non trovata |
| 422 | Unprocessable Entity — errori di validazione |
| 500 | Internal Server Error |

**Formato errori di validazione (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "company": ["The company field is required."],
    "applied_at": ["The applied at field must be a valid date."]
  }
}
```
