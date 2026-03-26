# Database — CareerMode

Schema del database MySQL per CareerMode. Tutte le chiavi primarie sono UUID.

---

## Tabella `users`

| Colonna | Tipo | Nullable | Default | Note |
|---|---|---|---|---|
| id | uuid | NO | | PK |
| name | varchar(255) | NO | | |
| email | varchar(255) | NO | | unique |
| password | varchar(255) | NO | | hashed bcrypt |
| theme | varchar(50) | YES | midnight | tema UI preferito |
| email_verified_at | timestamp | YES | null | |
| remember_token | varchar(100) | YES | null | |
| created_at | timestamp | YES | null | |
| updated_at | timestamp | YES | null | |

---

## Tabella `applications`

| Colonna | Tipo | Nullable | Default | Note |
|---|---|---|---|---|
| id | uuid | NO | | PK |
| user_id | uuid | NO | | FK → users.id |
| company | varchar(255) | NO | | nome azienda |
| role | varchar(255) | NO | | ruolo candidato |
| offer_text | longtext | YES | null | testo completo offerta |
| url | varchar(500) | YES | null | link offerta originale |
| source | varchar(100) | YES | null | LinkedIn, Indeed, ecc. |
| contract_type | varchar(100) | YES | null | indeterminato, stage, ecc. |
| location | varchar(255) | YES | null | sede lavorativa |
| salary_range | varchar(100) | YES | null | es. "25.000 - 30.000" |
| status | enum | NO | sent | sent, interview, waiting, rejected, draft |
| interest_rating | tinyint | YES | null | 1-5 stelle interesse personale |
| match_score | tinyint | YES | null | 0-100 compatibilità stimata |
| notes | text | YES | null | note personali |
| applied_at | date | NO | | data invio candidatura |
| created_at | timestamp | YES | null | |
| updated_at | timestamp | YES | null | |

### Valori enum `status`

| Valore | Descrizione |
|---|---|
| sent | Candidatura inviata |
| interview | Colloquio ottenuto |
| waiting | In attesa di risposta |
| rejected | Candidatura rifiutata |
| draft | Bozza non ancora inviata |

---

## Tabella `attachments`

| Colonna | Tipo | Nullable | Default | Note |
|---|---|---|---|---|
| id | id | NO | | PK |
| application_id | id | NO | | FK → applications.id |
| type | enum | NO | | cv, cover_letter |
| filename | varchar(255) | NO | | nome originale del file |
| path | varchar(500) | NO | | percorso su storage |
| size | int | YES | null | dimensione in bytes |
| created_at | timestamp | YES | null | |

### Note

- Dimensione massima file: 5MB
- Formati accettati: PDF, DOCX
- I file vengono salvati in `storage/app/attachments/{user_id}/{application_id}/`
- La cancellazione di una candidatura elimina automaticamente i file allegati (cascade)

---

## Tabella `reminders`

| Colonna | Tipo | Nullable | Default | Note |
|---|---|---|---|---|
| id | id | NO | | PK |
| application_id | id | NO | | FK → applications.id |
| title | varchar(255) | NO | | es. "Colloquio Reply" |
| notes | text | YES | null | note aggiuntive |
| remind_at | datetime | NO | | data e ora del reminder |
| sent | boolean | NO | false | true se notifica già inviata |
| created_at | timestamp | YES | null | |
| updated_at | timestamp | YES | null | |

### Note

- I reminder vengono processati da un Laravel Scheduled Command che gira ogni minuto
- Una volta inviata la notifica, il campo `sent` viene impostato a `true`
- La cancellazione di una candidatura elimina i reminder associati (cascade)

---

## Tabella `tags`

| Colonna | Tipo | Nullable | Default | Note |
|---|---|---|---|---|
| id | id | NO | | PK |
| user_id | id | NO | | FK → users.id |
| name | varchar(100) | NO | | es. "ServiceNow" |
| color | varchar(7) | YES | #4a9eff | colore esadecimale |
| created_at | timestamp | YES | null | |

### Note

- I tag sono per utente, non globali
- Vincolo unique su `(user_id, name)` per evitare duplicati

---

## Tabella `application_tags` (pivot)

| Colonna | Tipo | Nullable | Note |
|---|---|---|---|
| application_id | uuid | NO | FK → applications.id |
| tag_id | uuid | NO | FK → tags.id |

Chiave primaria composta su `(application_id, tag_id)`.

---

## Relazioni

```
users
  ├── has many → applications
  └── has many → tags

applications
  ├── belongs to → users
  ├── has many → attachments
  ├── has many → reminders
  └── belongs to many → tags (via application_tags)

tags
  ├── belongs to → users
  └── belongs to many → applications (via application_tags)
```

---

## Indici consigliati

```sql
-- Ricerca candidature per utente (query più frequente)
CREATE INDEX idx_applications_user_id ON applications(user_id);

-- Filtro per stato
CREATE INDEX idx_applications_status ON applications(status);

-- Ordinamento per data
CREATE INDEX idx_applications_applied_at ON applications(applied_at);

-- Reminder non ancora inviati
CREATE INDEX idx_reminders_sent_remind_at ON reminders(sent, remind_at);

-- Tag per utente
CREATE INDEX idx_tags_user_id ON tags(user_id);
```
